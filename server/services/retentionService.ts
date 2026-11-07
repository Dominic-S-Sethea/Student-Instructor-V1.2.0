// CDES Platform - Data Retention Cleanup Service
// Enforces retention policies defined in the data platform requirements.
// Run periodically (e.g., as a cron job) to purge old, unneeded data.

import { getDatabase } from "../db/connection";

// Database instance singleton
let dbInstance: any = null;

// Retention policies (in days)
export const RETENTION_RULES = {
  // Analytics events stream: 90 days raw, then anonymize
  ANALYTICS_STREAM_DAYS: 90,
  // Feature store: 180 days
  FEATURE_STORE_DAYS: 180,
  // AI conversation logs: 30 days
  AI_CONVERSATIONS_DAYS: 30,
  // Activity events: 365 days
  ACTIVITY_EVENTS_DAYS: 365,
  // User accounts: keep account data but mark as inactive after 90 days
  USER_ACCOUNT_DAYS: 90,
  // Student profiles: 365 days after last activity
  PROFILE_DAYS: 365,
  // Scholarship applications: 730 days
  SCHOLARSHIP_DAYS: 730,
  // University data: keep indefinitely (reference data, but soft-delete orphaned)
  UNIVERSITY_DAYS: 1095,
} as const;

export type RetentionRuleKey = keyof typeof RETENTION_RULES;

/**
 * Builds a retention timestamp (ISO 8601)
 */
function getRetentionDate(days: number): string {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff.toISOString();
}

/**
 * Purges soft-deleted records older than the retention period.
 * Only deletes records that are already soft-deleted (is_deleted = 1).
 */
export async function purgeExpiredSoftDeleted(
  tableName: string,
  retentionDays: number,
  whereClause = "is_deleted = 1"
): Promise<number> {
  if (!dbInstance) {
    dbInstance = getDatabase();
  }
  const db = dbInstance;
  const cutoff = getRetentionDate(retentionDays);

  const result = await db
    .prepare(`DELETE FROM ${tableName}
      WHERE ${whereClause}
      AND (deleted_at IS NULL OR deleted_at < @cutoff)
      LIMIT 10000`)
    .run({ cutoff });

  return result.changes;
}

/**
 * Retention cleanup job for analytics events stream (F-006).
 * - Purges analytics events older than 90 days
 * - Purges AI conversations older than 30 days
 * - Purges activity events older than 365 days
 */
export async function cleanupAnalyticsEvents(): Promise<{ [key: string]: number }> {
  const results: { [key: string]: number } = {};

  // Analytics events stream
  results.analytics_events_purged = await purgeExpiredSoftDeleted(
    "cdes_analytics_events_stream",
    RETENTION_RULES.ANALYTICS_STREAM_DAYS
  );

  // AI conversations (use base repository's delete for compatibility)
  results.ai_conversations_purged = await purgeExpiredSoftDeleted(
    "ai_conversations",
    RETENTION_RULES.AI_CONVERSATIONS_DAYS
  );

  // Activity events
  results.activity_events_purged = await purgeExpiredSoftDeleted(
    "activity_events",
    RETENTION_RULES.ACTIVITY_EVENTS_DAYS
  );

  return results;
}

/**
 * Retention cleanup job for feature store (180 days).
 */
export async function cleanupFeatureStore(): Promise<{ [key: string]: number }> {
  const results: { [key: string]: number } = {};

  // Feature store online
  results.feature_store_online_purged = await purgeExpiredSoftDeleted(
    "cdes_feature_store_online",
    RETENTION_RULES.FEATURE_STORE_DAYS,
    "is_deleted = 1"
  );

  // Feature store offline snapshots
  results.feature_store_offline_purged = await purgeExpiredSoftDeleted(
    "cdes_feature_store_offline_snapshots",
    RETENTION_RULES.FEATURE_STORE_DAYS,
    "is_deleted = 1"
  );

  return results;
}

/**
 * Retention cleanup job for user accounts.
 * Marks users as inactive if they haven't logged in for 90+ days.
 */
export async function cleanupInactiveUsers(): Promise<{ [key: string]: number }> {
  const db = await dbInstance!;
  const cutoff = getRetentionDate(RETENTION_RULES.USER_ACCOUNT_DAYS);

  const result = await db
    .prepare(`UPDATE users
      SET is_deleted = 1, deleted_at = @cutoff, deleted_by = 'retention_service'
      WHERE status = 'active'
      AND last_login_at < @cutoff
      AND is_deleted = 0`)
    .run({ cutoff });

  return { inactive_users_marked: result.changes };
}

/**
 * Full retention cleanup job (run as cron task)
 */
export async function runRetentionCleanup(): Promise<{
  analytics: { [key: string]: number };
  feature_store: { [key: string]: number };
  users: { [key: string]: number };
}> {
  const analytics = await cleanupAnalyticsEvents();
  const featureStore = await cleanupFeatureStore();
  const users = await cleanupInactiveUsers();

  return { analytics, feature_store: featureStore, users };
}
