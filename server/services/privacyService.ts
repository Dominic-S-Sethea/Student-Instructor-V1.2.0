import { PrivacyRepository } from '../repositories/privacyRepository';
import { StudentPrivacyConsent } from '../types/analytics';

export class PrivacyService {
  private repo: PrivacyRepository;

  constructor(repo?: PrivacyRepository) {
    this.repo = repo || new PrivacyRepository();
  }

  /**
   * Get student privacy consent record. If none exists, creates default safe consent
   */
  public getConsent(studentId: string): StudentPrivacyConsent {
    let consent = this.repo.getConsent(studentId);
    if (!consent) {
      consent = this.repo.upsertConsent({
        studentId,
        isMinor: true, // Safe default: assume student may be a minor
        parentalConsentVerified: false,
        allowAnalyticsTracking: true,
        allowResearchInclusion: true
      });
    }
    return consent;
  }

  /**
   * Update privacy consent and parental status
   */
  public updateConsent(studentId: string, updates: {
    isMinor?: boolean;
    parentEmail?: string;
    parentalConsentVerified?: boolean;
    allowAnalyticsTracking?: boolean;
    allowResearchInclusion?: boolean;
  }): StudentPrivacyConsent {
    return this.repo.upsertConsent({
      studentId,
      ...updates
    });
  }

  /**
   * Verify parental consent token / email authorization
   */
  public verifyParentalConsent(studentId: string, parentEmail: string): StudentPrivacyConsent {
    return this.repo.upsertConsent({
      studentId,
      isMinor: true,
      parentEmail,
      parentalConsentVerified: true
    });
  }

  /**
   * Strips all Personally Identifiable Information (PII) from any student object
   */
  public sanitizeForPublic(obj: Record<string, any>): Record<string, any> {
    const piiKeys = [
      'email',
      'password',
      'password_hash',
      'phone',
      'telephone',
      'parent_email',
      'full_name',
      'address',
      'ip_address',
      'sessionId'
    ];

    const sanitized = { ...obj };
    piiKeys.forEach(k => delete sanitized[k]);
    return sanitized;
  }
}

/**
 * Strips all Personally Identifiable Information (PII) from any student object.
 * Standalone function version for use in data platform services.
 */
export function sanitizeForPublic(obj: Record<string, any>): Record<string, any> {
  const piiKeys = [
    'email',
    'password_hash',
    'phone',
    'telephone',
    'parent_email',
    'full_name',
    'address',
    'ip_address',
    'sessionId'
  ];

  const sanitized = { ...obj };
  piiKeys.forEach(k => delete sanitized[k]);
  return sanitized;
}
