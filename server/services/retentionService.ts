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
  HERMES_ENDED_DAYS: 90,
} as const;

export type RetentionRuleKey = keyof typeof RETENTION_RULES;

const PURGEABLE_TABLES = new Set([
  'cdes_analytics_events_stream',
  'ai_conversations',
  'activity_events',
  'learning_events',
  'game_events',
  'game_telemetry_events',
  'ai_interaction_analytics_events',
  'cdes_feature_store_online',
  'cdes_feature_store_offline_snapshots',
]);

function getRetentionDate(days: number): string {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff.toISOString();
}

function tableExists(tableName: string): boolean {
  const db = getDatabase();
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
    .get(tableName) as { name?: string } | undefined;
  return Boolean(row?.name);
}

function getTableColumns(tableName: string): Set<string> {
  if (!tableExists(tableName)) return new Set();
  const db = getDatabase();
  const rows = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  return new Set(rows.map((r) => r.name));
}

/**
 * Purges soft-deleted or age-expired records older than the retention period.
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
  if (cols.size === 0) {
    return 0;
  }

  const db = getDatabase();
  const cutoff = getRetentionDate(retentionDays);

  if (!cols.has('deleted_at')) {
    if (tableName === 'ai_conversations' && cols.has('timestamp')) {
      const aged = db
        .prepare(
          `DELETE FROM ai_conversations
           WHERE rowid IN (
             SELECT rowid FROM ai_conversations
             WHERE timestamp IS NOT NULL AND timestamp < ?
             LIMIT 10000
           )`
        )
        .run(cutoff);
      return Number(aged.changes);
    }
    return 0;
  }

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
    game_telemetry_purged: await purgeExpiredSoftDeleted(
      'game_telemetry_events',
      RETENTION_RULES.ACTIVITY_EVENTS_DAYS
    ),
    ai_interaction_analytics_purged: await purgeExpiredSoftDeleted(
      'ai_interaction_analytics_events',
      RETENTION_RULES.ANALYTICS_STREAM_DAYS
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

export async function cleanupHermesMemory(): Promise<Record<string, number>> {
  if (!tableExists('hermes_memory_facts')) {
    return { ended_facts_purged: 0, withdrawn_docs_purged: 0, withdrawn_facts_purged: 0 };
  }
  const db = getDatabase();
  const cutoff = getRetentionDate(RETENTION_RULES.HERMES_ENDED_DAYS);

  const endedFacts = db
    .prepare(
      `DELETE FROM hermes_memory_facts
       WHERE status IN ('ended', 'reverted')
       AND updated_at < ?`
    )
    .run(cutoff);

  const withdrawnUserFilter = `
    user_id IN (
      SELECT id FROM users WHERE is_deleted = 1
      UNION
      SELECT student_id FROM student_privacy_consents WHERE consent_status = 'withdrawn'
    )
  `;
  const withdrawnFacts = db
    .prepare(`DELETE FROM hermes_memory_facts WHERE ${withdrawnUserFilter}`)
    .run();
  const withdrawnDocs = tableExists('hermes_student_memory_docs')
    ? db.prepare(`DELETE FROM hermes_student_memory_docs WHERE ${withdrawnUserFilter}`).run()
    : { changes: 0 };

  return {
    ended_facts_purged: Number(endedFacts.changes),
    withdrawn_facts_purged: Number(withdrawnFacts.changes),
    withdrawn_docs_purged: Number(withdrawnDocs.changes),
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
       AND role != 'admin'
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
  hermes: Record<string, number>;
  users: Record<string, number>;
}> {
  const analytics = await cleanupAnalyticsEvents();
  const feature_store = await cleanupFeatureStore();
  const hermes = await cleanupHermesMemory();
  const users = await cleanupInactiveUsers();
  return { analytics, feature_store, hermes, users };
}
