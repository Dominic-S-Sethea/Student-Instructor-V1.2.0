import { getDatabase } from '../db/connection';
import crypto from 'crypto';
import { StudentPrivacyConsent } from '../types/analytics';

export class PrivacyRepository {
  private db = getDatabase();
  private get salt(): string {
    const salt = process.env.RESEARCH_SALT;
    if (!salt) {
      throw new Error('RESEARCH_SALT environment variable is not set');
    }
    return salt;
  }

  public generateAnonymizedId(studentId: string): string {
    const hash = crypto.createHmac('sha256', this.salt).update(studentId).digest('hex');
    return `anon-std-${hash.slice(0, 12)}`;
  }

  public getConsent(studentId: string): StudentPrivacyConsent | null {
    const row = this.db.prepare(`
      SELECT * FROM student_privacy_consents WHERE student_id = ?
    `).get(studentId) as any;

    if (!row) return null;

    return {
      studentId: row.student_id,
      isMinor: Boolean(row.is_minor),
      parentalConsentVerified: Boolean(row.parental_consent_verified),
      parentEmail: row.parent_email || null,
      allowAnalyticsTracking: Boolean(row.allow_analytics_tracking),
      allowResearchInclusion: Boolean(row.allow_research_inclusion),
      anonymizedResearchId: row.anonymized_research_id,
      consentDate: row.consent_date,
      updatedAt: row.updated_at
    };
  }

  public upsertConsent(data: {
    studentId: string;
    isMinor?: boolean;
    parentalConsentVerified?: boolean;
    parentEmail?: string | null;
    allowAnalyticsTracking?: boolean;
    allowResearchInclusion?: boolean;
  }): StudentPrivacyConsent {
    const now = new Date().toISOString();
    const existing = this.getConsent(data.studentId);
    const anonId = existing?.anonymizedResearchId || this.generateAnonymizedId(data.studentId);

    const isMinor = data.isMinor !== undefined ? (data.isMinor ? 1 : 0) : (existing?.isMinor ? 1 : 0);
    const parentVerified = data.parentalConsentVerified !== undefined ? (data.parentalConsentVerified ? 1 : 0) : (existing?.parentalConsentVerified ? 1 : 0);
    const parentEmail = data.parentEmail !== undefined ? data.parentEmail : (existing?.parentEmail || null);
    const allowAnalytics = data.allowAnalyticsTracking !== undefined ? (data.allowAnalyticsTracking ? 1 : 0) : (existing !== null ? (existing.allowAnalyticsTracking ? 1 : 0) : 1);
    const allowResearch = data.allowResearchInclusion !== undefined ? (data.allowResearchInclusion ? 1 : 0) : (existing !== null ? (existing.allowResearchInclusion ? 1 : 0) : 1);

    this.db.prepare(`
      INSERT INTO student_privacy_consents (
        student_id,
        is_minor,
        parental_consent_verified,
        parent_email,
        allow_analytics_tracking,
        allow_research_inclusion,
        anonymized_research_id,
        consent_date,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(student_id) DO UPDATE SET
        is_minor = excluded.is_minor,
        parental_consent_verified = excluded.parental_consent_verified,
        parent_email = excluded.parent_email,
        allow_analytics_tracking = excluded.allow_analytics_tracking,
        allow_research_inclusion = excluded.allow_research_inclusion,
        updated_at = excluded.updated_at
    `).run(
      data.studentId,
      isMinor,
      parentVerified,
      parentEmail,
      allowAnalytics,
      allowResearch,
      anonId,
      existing?.consentDate || now,
      now
    );

    return this.getConsent(data.studentId)!;
  }

  public getAllConsents(): StudentPrivacyConsent[] {
    const rows = this.db.prepare(`
      SELECT * FROM student_privacy_consents
    `).all() as any[];

    return rows.map(row => ({
      studentId: row.student_id,
      isMinor: Boolean(row.is_minor),
      parentalConsentVerified: Boolean(row.parental_consent_verified),
      parentEmail: row.parent_email || null,
      allowAnalyticsTracking: Boolean(row.allow_analytics_tracking),
      allowResearchInclusion: Boolean(row.allow_research_inclusion),
      anonymizedResearchId: row.anonymized_research_id,
      consentDate: row.consent_date,
      updatedAt: row.updated_at
    }));
  }
}
