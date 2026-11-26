import { getDatabase, withTransaction } from '../db/connection';
import { PrivacyService } from './privacyService';
import type { AnonymizedResearchDataPoint, IngestionEventPayload } from '../types/analytics';

const CAMBODIA_PHONE_RE = /(?:\+855|0)(?:[\s.-]?\d){8,9}\b/g;
const TELEGRAM_RE = /(?:https?:\/\/)?(?:t\.me|telegram\.me)\/[A-Za-z0-9_]{3,}|(?<![A-Za-z0-9._%+-])@[A-Za-z0-9_]{4,}\b/gi;
const PERSONAL_EMAIL_RE = /\b[A-Za-z0-9._%+-]+@(?!([A-Za-z0-9-]+\.)*(?:edu\.kh|gov\.kh|org\.kh)\b)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;
const BLOCKED_META_KEYS = new Set(['password', 'password_hash', 'token', 'jwt', 'cookie', 'authorization', 'secret']);

export function scrubPipelineText(input: string): string {
  return input
    .replace(CAMBODIA_PHONE_RE, '[REDACTED_PHONE]')
    .replace(TELEGRAM_RE, '[REDACTED_HANDLE]')
    .replace(PERSONAL_EMAIL_RE, '[REDACTED_EMAIL]');
}

export function scrubPipelineMetadata(
  meta: Record<string, unknown> | undefined,
  depth = 0
): Record<string, unknown> {
  if (!meta || typeof meta !== 'object' || depth > 4) return {};
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta).slice(0, 40)) {
    if (BLOCKED_META_KEYS.has(key.toLowerCase())) continue;
    if (typeof value === 'string') {
      cleaned[key] = scrubPipelineText(value).slice(0, 500);
    } else if (typeof value === 'number' && Number.isFinite(value)) {
      cleaned[key] = value;
    } else if (typeof value === 'boolean' || value === null) {
      cleaned[key] = value;
    } else if (Array.isArray(value)) {
      cleaned[key] = value.slice(0, 20).map((item) =>
        typeof item === 'string' ? scrubPipelineText(item).slice(0, 200) : item
      );
    } else if (typeof value === 'object') {
      cleaned[key] = scrubPipelineMetadata(value as Record<string, unknown>, depth + 1);
    }
  }
  return cleaned;
}

export function validateAndScrubAnalyticsPayload(payload: IngestionEventPayload): IngestionEventPayload {
  const eventType = typeof payload.eventType === 'string' ? payload.eventType.trim().slice(0, 80) : '';
  if (!eventType) {
    throw new Error('Analytics eventType must be a non-empty string.');
  }
  const clamp = (val: number | undefined, min: number, max: number): number | undefined => {
    if (typeof val !== 'number' || !Number.isFinite(val)) return undefined;
    return Math.min(max, Math.max(min, val));
  };

  return {
    ...payload,
    eventType,
    duration: clamp(payload.duration, 0, 86400),
    score: clamp(payload.score, 0, 100),
    timeSpent: clamp(payload.timeSpent, 0, 86400),
    timeTaken: clamp(payload.timeTaken, 0, 86400),
    failureReason:
      typeof payload.failureReason === 'string'
        ? scrubPipelineText(payload.failureReason).slice(0, 200)
        : payload.failureReason,
    metadata: scrubPipelineMetadata(payload.metadata as Record<string, unknown> | undefined),
  };
}

export interface ExportAuditResult {
  valid: boolean;
  violations: string[];
  checkedRows: number;
}

export function verifyAnonymizedExportIntegrity(rows: AnonymizedResearchDataPoint[]): ExportAuditResult {
  const violations: string[] = [];
  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx] as unknown as Record<string, unknown>;
    for (const forbidden of ['email', 'userId', 'user_id', 'studentId', 'student_id', 'name', 'password_hash']) {
      if (forbidden in row && row[forbidden] !== undefined) {
        violations.push(`Row ${idx} exposes forbidden raw PII key "${forbidden}"`);
      }
    }
    const anonId = String(row.anonymizedId ?? '');
    if (!anonId.startsWith('anon-std-')) {
      violations.push(`Row ${idx} has invalid pseudonym "${anonId}"`);
    }
    const serialized = JSON.stringify(row);
    if (CAMBODIA_PHONE_RE.test(serialized) || PERSONAL_EMAIL_RE.test(serialized)) {
      violations.push(`Row ${idx} contains unscrubbed phone or personal email pattern`);
    }
    CAMBODIA_PHONE_RE.lastIndex = 0;
    PERSONAL_EMAIL_RE.lastIndex = 0;
  }
  return { valid: violations.length === 0, violations, checkedRows: rows.length };
}

function tableExists(tableName: string): boolean {
  const row = getDatabase()
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
    .get(tableName) as { name?: string } | undefined;
  return Boolean(row?.name);
}

function columnExists(tableName: string, columnName: string): boolean {
  if (!tableExists(tableName)) return false;
  const cols = getDatabase().prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  return cols.some((c) => c.name === columnName);
}

export const ERASURE_SPECS: ReadonlyArray<{ table: string; column: 'student_id' | 'user_id' | 'entity_id' }> = [
  { table: 'activity_events', column: 'student_id' },
  { table: 'activity_events', column: 'user_id' },
  { table: 'learning_events', column: 'student_id' },
  { table: 'learning_events', column: 'user_id' },
  { table: 'game_events', column: 'student_id' },
  { table: 'game_events', column: 'user_id' },
  { table: 'game_telemetry_events', column: 'student_id' },
  { table: 'ai_interaction_analytics_events', column: 'student_id' },
  { table: 'cdes_analytics_events_stream', column: 'student_id' },
  { table: 'cdes_student_behavioral_telemetry', column: 'student_id' },
  { table: 'research_telemetry_events', column: 'student_id' },
  { table: 'content_filter_logs', column: 'user_id' },
  { table: 'cdes_feature_store_online', column: 'entity_id' },
  { table: 'cdes_feature_store_offline_snapshots', column: 'entity_id' },
  { table: 'cdes_ml_prediction_logs', column: 'student_id' },
  { table: 'cdes_recommendation_improvement_loop', column: 'student_id' },
  { table: 'cdes_student_learning_patterns', column: 'student_id' },
  { table: 'cdes_student_interest_vectors', column: 'student_id' },
  { table: 'cdes_student_goals', column: 'student_id' },
  { table: 'cdes_student_achievements', column: 'student_id' },
  { table: 'cdes_student_projects', column: 'student_id' },
  { table: 'cdes_student_identities', column: 'student_id' },
  { table: 'student_intelligence_profile', column: 'student_id' },
  { table: 'ai_conversations', column: 'user_id' },
  { table: 'ai_recommendation_events', column: 'student_id' },
  { table: 'ai_action_plans', column: 'student_id' },
  { table: 'ai_memory', column: 'student_id' },
  { table: 'ai_companion_states', column: 'student_id' },
  { table: 'ai_safety_guardrail_audits', column: 'student_id' },
  { table: 'adaptive_tutor_sessions', column: 'student_id' },
  { table: 'student_ai_memory', column: 'student_id' },
  { table: 'student_longterm_memory_profiles', column: 'student_id' },
  { table: 'student_memory_audit_logs', column: 'student_id' },
  { table: 'hermes_fact_history', column: 'user_id' },
  { table: 'hermes_memory_facts', column: 'user_id' },
  { table: 'hermes_student_memory_docs', column: 'user_id' },
  { table: 'experiment_participants', column: 'student_id' },
  { table: 'experiment_participants_v2', column: 'student_id' },
  { table: 'student_mastery_states', column: 'student_id' },
  { table: 'misconception_logs', column: 'student_id' },
  { table: 'student_learning_history', column: 'student_id' },
  { table: 'student_activity_progress', column: 'student_id' },
  { table: 'student_learning_paths', column: 'student_id' },
  { table: 'lab_experiment_results', column: 'student_id' },
  { table: 'learning_progress', column: 'student_id' },
  { table: 'content_feedback', column: 'student_id' },
  { table: 'user_saved_scholarships', column: 'user_id' },
  { table: 'user_notifications', column: 'user_id' },
  { table: 'student_achievements', column: 'student_id' },
  { table: 'student_inventory', column: 'student_id' },
  { table: 'virtual_rooms', column: 'student_id' },
  { table: 'avatar_profiles', column: 'student_id' },
  { table: 'campus_avatar_entities', column: 'student_id' },
];

/**
 * Tables carrying student_id/user_id that are intentionally preserved during optional-data erasure
 * (core identity, legal consent-withdrawal audit records, and contractual/public attribution).
 */
export const ERASURE_EXEMPT_TABLES: ReadonlySet<string> = new Set([
  'student_profiles',
  'education_history',
  'student_privacy_consents',
  'cdes_data_governance_consents',
  'community_members',
  'community_votes',
  'event_registrations',
  'project_members',
  'mentorship_sessions',
  'mentor_profiles',
  'content_authors',
  'revoked_jwt_tokens',
]);

/**
 * Transactional Right-to-Erasure across all optional analytics, AI memory, feature store,
 * learning records, saved bookmarks, notifications, and research participation tables
 * while withdrawing all consent flags.
 */
export function executeStudentRightToErasure(userId: string): {
  erasedCounts: Record<string, number>;
  totalRowsErased: number;
} {
  const privacy = new PrivacyService();
  const erasedCounts: Record<string, number> = {};
  let totalRowsErased = 0;

  // Withdraw consent first (uses its own transaction) so concurrent optional writes stop immediately
  privacy.updateConsent(userId, { withdrawAll: true }, 'student');

  withTransaction(() => {
    const db = getDatabase();
    for (const spec of ERASURE_SPECS) {
      if (!columnExists(spec.table, spec.column)) continue;
      const info = db.prepare(`DELETE FROM ${spec.table} WHERE ${spec.column} = ?`).run(userId);
      const count = Number(info.changes);
      erasedCounts[spec.table] = (erasedCounts[spec.table] || 0) + count;
      totalRowsErased += count;
    }
  });

  return { erasedCounts, totalRowsErased };
}

