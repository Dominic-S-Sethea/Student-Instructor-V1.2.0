import { getDatabase } from '../db/connection';

export const RETENTION_RULES = {
  ANALYTICS_STREAM_DAYS: 90,
  FEATURE_STORE_DAYS: 180,
  AI_CONVERSATIONS_DAYS: 30,
  ACTIVITY_EVENTS_DAYS: 365,
  USER_ACCOUNT_DAYS: 90,
  PROFILE_DAYS: 365,
  SCHOLARSHIP_DAYS: 730,
  UNIVERSITY_DAYS: 1095,
} as const;

export type RetentionRuleKey = keyof typeof RETENTION_RULES;

const PURGEABLE_TABLES = new Set([
  'cdes_analytics_events_stream',
  'ai_conversations',
  'activity_events',
  'learning_events',
  'game_events',
  'cdes_feature_store_online',
  'cdes_feature_store_offline_snapshots',
]);

function getRetentionDate(days: number): string {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff.toISOString();
}

function getTableColumns(tableName: string): Set<string> {
  const db = getDatabase();
  const rows = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  return new Set(rows.map((r) => r.name));
}

/**
 * Purges soft-deleted or deleted_at-marked records older than the retention period.
 * Uses DATABASE_PATH lazily via getDatabase() and standard SQLite rowid batching.
 */
export async function purgeExpiredSoftDeleted(
  tableName: string,
  retentionDays: number,
  filterMode: 'soft_deleted' | 'deleted_at_only' = 'soft_deleted'
): Promise<number> {
  if (!PURGEABLE_TABLES.has(tableName)) {
    throw new Error(`Retention purge denied for non-allowlisted table: ${tableName}`);
  }

  const cols = getTableColumns(tableName);
  if (!cols.has('deleted_at')) {
    return 0;
  }

  const db = getDatabase();
  const cutoff = getRetentionDate(retentionDays);
  const softFilter =
    filterMode === 'soft_deleted' && cols.has('is_deleted') ? 'is_deleted = 1' : 'deleted_at IS NOT NULL';

  const result = db
    .prepare(
      `DELETE FROM ${tableName}
       WHERE rowid IN (
         SELECT rowid FROM ${tableName}
         WHERE ${softFilter}
         AND deleted_at IS NOT NULL
         AND deleted_at < ?
         LIMIT 10000
       )`
    )
    .run(cutoff);

  return Number(result.changes);
}

export async function cleanupAnalyticsEvents(): Promise<Record<string, number>> {
  return {
    analytics_events_purged: await purgeExpiredSoftDeleted(
      'cdes_analytics_events_stream',
      RETENTION_RULES.ANALYTICS_STREAM_DAYS
    ),
    ai_conversations_purged: await purgeExpiredSoftDeleted(
      'ai_conversations',
      RETENTION_RULES.AI_CONVERSATIONS_DAYS
    ),
    activity_events_purged: await purgeExpiredSoftDeleted(
      'activity_events',
      RETENTION_RULES.ACTIVITY_EVENTS_DAYS
    ),
  };
}

export async function cleanupFeatureStore(): Promise<Record<string, number>> {
  return {
    feature_store_online_purged: await purgeExpiredSoftDeleted(
      'cdes_feature_store_online',
      RETENTION_RULES.FEATURE_STORE_DAYS
    ),
    feature_store_offline_purged: await purgeExpiredSoftDeleted(
      'cdes_feature_store_offline_snapshots',
      RETENTION_RULES.FEATURE_STORE_DAYS
    ),
  };
}

export async function cleanupInactiveUsers(): Promise<Record<string, number>> {
  const db = getDatabase();
  const cutoff = getRetentionDate(RETENTION_RULES.USER_ACCOUNT_DAYS);
  const now = new Date().toISOString();

  const result = db
    .prepare(
      `UPDATE users
       SET is_deleted = 1, deleted_at = ?, deleted_by = 'retention_service'
       WHERE status = 'active'
       AND last_login_at IS NOT NULL
       AND last_login_at < ?
       AND is_deleted = 0`
    )
    .run(now, cutoff);

  return { inactive_users_marked: Number(result.changes) };
}

export async function runRetentionCleanup(): Promise<{
  analytics: Record<string, number>;
  feature_store: Record<string, number>;
  users: Record<string, number>;
}> {
  const analytics = await cleanupAnalyticsEvents();
  const feature_store = await cleanupFeatureStore();
  const users = await cleanupInactiveUsers();
  return { analytics, feature_store, users };
}
