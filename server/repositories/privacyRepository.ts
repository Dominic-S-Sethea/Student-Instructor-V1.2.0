import crypto from 'node:crypto';
import { getDatabase, withTransaction } from '../db/connection';
import { getResearchSalt } from '../config';
import {
  StudentPrivacyConsent,
  ConsentStatus,
  ParentVerificationStatus,
} from '../types/analytics';

interface ConsentDbRow {
  student_id: string;
  is_minor: number;
  parental_consent_verified: number;
  parent_email: string | null;
  allow_analytics_tracking: number;
  allow_research_inclusion: number;
  allow_ai_memory?: number;
  consent_status?: string;
  parent_verification_status?: string;
  anonymized_research_id: string;
  consent_date: string;
  updated_at: string;
  withdrawn_at?: string | null;
}

export interface UpsertConsentData {
  studentId: string;
  isMinor?: boolean;
  parentalConsentVerified?: boolean;
  parentVerificationStatus?: ParentVerificationStatus;
  parentEmail?: string | null;
  allowAnalyticsTracking?: boolean;
  allowResearchInclusion?: boolean;
  allowAiMemory?: boolean;
  consentStatus?: ConsentStatus;
  withdrawnAt?: string | null;
}

export class PrivacyRepository {
  private get db() {
    return getDatabase();
  }

  public generateAnonymizedId(studentId: string): string {
    const hash = crypto.createHmac('sha256', getResearchSalt()).update(studentId).digest('hex');
    return `anon-std-${hash.slice(0, 12)}`;
  }

  private mapRow(row: ConsentDbRow): StudentPrivacyConsent {
    const pStatus = (row.parent_verification_status as ParentVerificationStatus) ||
      (row.parental_consent_verified ? 'verified' : 'unverified');
    const cStatus = (row.consent_status as ConsentStatus) || 'pending';
    return {
      studentId: row.student_id,
      isMinor: Boolean(row.is_minor),
      parentalConsentVerified: Boolean(row.parental_consent_verified),
      parentVerificationStatus: pStatus,
      parentEmail: row.parent_email || null,
      allowAnalyticsTracking: Boolean(row.allow_analytics_tracking),
      allowResearchInclusion: Boolean(row.allow_research_inclusion),
      allowAiMemory: Boolean(row.allow_ai_memory),
      consentStatus: cStatus,
      anonymizedResearchId: row.anonymized_research_id,
      consentDate: row.consent_date,
      updatedAt: row.updated_at,
      withdrawnAt: row.withdrawn_at || null,
    };
  }

  public getConsent(studentId: string): StudentPrivacyConsent | null {
    const row = this.db
      .prepare('SELECT * FROM student_privacy_consents WHERE student_id = ?')
      .get(studentId) as ConsentDbRow | undefined;
    return row ? this.mapRow(row) : null;
  }

  public upsertConsent(data: UpsertConsentData): StudentPrivacyConsent {
    const now = new Date().toISOString();
    const existing = this.getConsent(data.studentId);
    const anonId = existing?.anonymizedResearchId || this.generateAnonymizedId(data.studentId);

    const isMinor = data.isMinor !== undefined ? data.isMinor : (existing ? existing.isMinor : true);
    const parentVerified = data.parentalConsentVerified !== undefined
      ? data.parentalConsentVerified
      : (existing ? existing.parentalConsentVerified : false);
    const parentStatus: ParentVerificationStatus = data.parentVerificationStatus
      ?? (parentVerified ? 'verified' : (existing?.parentVerificationStatus || 'unverified'));
    const parentEmail = data.parentEmail !== undefined ? data.parentEmail : (existing?.parentEmail || null);
    const allowAnalytics = data.allowAnalyticsTracking !== undefined
      ? data.allowAnalyticsTracking
      : (existing ? existing.allowAnalyticsTracking : false);
    const allowResearch = data.allowResearchInclusion !== undefined
      ? data.allowResearchInclusion
      : (existing ? existing.allowResearchInclusion : false);
    const allowAiMemory = data.allowAiMemory !== undefined
      ? data.allowAiMemory
      : (existing ? existing.allowAiMemory : false);
    const consentStatus: ConsentStatus = data.consentStatus ?? (existing?.consentStatus || 'pending');
    const withdrawnAt = data.withdrawnAt !== undefined ? data.withdrawnAt : (existing?.withdrawnAt || null);

    withTransaction(() => {
      this.db
        .prepare(
          `INSERT INTO student_privacy_consents (
            student_id, is_minor, parental_consent_verified, parent_email,
            allow_analytics_tracking, allow_research_inclusion, allow_ai_memory,
            consent_status, parent_verification_status, withdrawn_at,
            anonymized_research_id, consent_date, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(student_id) DO UPDATE SET
            is_minor = excluded.is_minor,
            parental_consent_verified = excluded.parental_consent_verified,
            parent_email = excluded.parent_email,
            allow_analytics_tracking = excluded.allow_analytics_tracking,
            allow_research_inclusion = excluded.allow_research_inclusion,
            allow_ai_memory = excluded.allow_ai_memory,
            consent_status = excluded.consent_status,
            parent_verification_status = excluded.parent_verification_status,
            withdrawn_at = excluded.withdrawn_at,
            updated_at = excluded.updated_at`
        )
        .run(
          data.studentId,
          isMinor ? 1 : 0,
          parentVerified ? 1 : 0,
          parentEmail,
          allowAnalytics ? 1 : 0,
          allowResearch ? 1 : 0,
          allowAiMemory ? 1 : 0,
          consentStatus,
          parentStatus,
          withdrawnAt,
          anonId,
          existing?.consentDate || now,
          now
        );

      const userExists = this.db
        .prepare('SELECT id FROM users WHERE id = ? AND is_deleted = 0')
        .get(data.studentId) as { id?: string } | undefined;

      if (userExists?.id) {
        const govExisting = this.db
          .prepare('SELECT consent_id FROM cdes_data_governance_consents WHERE student_id = ? LIMIT 1')
          .get(data.studentId) as { consent_id?: string } | undefined;

        const personalizationAllowed = allowAiMemory || allowAnalytics ? 1 : 0;
        const researchAllowed = allowResearch ? 1 : 0;
        const revoked = consentStatus === 'withdrawn' ? now : null;

        if (govExisting?.consent_id) {
          this.db
            .prepare(
              `UPDATE cdes_data_governance_consents SET
                is_minor = ?,
                parent_guardian_approved = ?,
                allowed_for_personalization = ?,
                allowed_for_research_aggregates = ?,
                revoked_at = ?
               WHERE student_id = ?`
            )
            .run(isMinor ? 1 : 0, parentVerified ? 1 : 0, personalizationAllowed, researchAllowed, revoked, data.studentId);
        } else {
          this.db
            .prepare(
              `INSERT INTO cdes_data_governance_consents (
                consent_id, student_id, consent_scope, is_minor, parent_guardian_approved,
                school_administrator_approved, allowed_for_personalization, allowed_for_research_aggregates,
                granted_at, expires_at, revoked_at
              ) VALUES (?, ?, 'pilot_consent', ?, ?, 0, ?, ?, ?, ?, ?)`
            )
            .run(
              `cons-${crypto.randomUUID()}`,
              data.studentId,
              isMinor ? 1 : 0,
              parentVerified ? 1 : 0,
              personalizationAllowed,
              researchAllowed,
              now,
              new Date(Date.now() + 365 * 86400 * 1000).toISOString(),
              revoked
            );
        }
      }
    });

    return this.getConsent(data.studentId)!;
  }

  public getAllConsents(): StudentPrivacyConsent[] {
    const rows = this.db.prepare('SELECT * FROM student_privacy_consents').all() as unknown as ConsentDbRow[];
    return rows.map((r) => this.mapRow(r));
  }

  public getResearchEligibleStudentIds(): Array<{ studentId: string; anonymizedResearchId: string }> {
    const rows = this.db
      .prepare(
        `SELECT student_id, anonymized_research_id
         FROM student_privacy_consents
         WHERE allow_research_inclusion = 1
           AND consent_status IN ('granted', 'partial')
           AND (is_minor = 0 OR parental_consent_verified = 1)`
      )
      .all() as Array<{ student_id: string; anonymized_research_id: string }>;
    return rows.map((r) => ({
      studentId: r.student_id,
      anonymizedResearchId: r.anonymized_research_id,
    }));
  }
}
