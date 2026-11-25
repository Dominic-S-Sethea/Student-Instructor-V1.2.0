import { PrivacyRepository } from '../repositories/privacyRepository';
import { UserRepository } from '../repositories/userRepository';
import { ConsentStatus, StudentPrivacyConsent } from '../types/analytics';

export interface ConsentUpdateInput {
  isMinor?: boolean;
  parentEmail?: string | null;
  parentalConsentVerified?: boolean;
  allowAnalyticsTracking?: boolean;
  allowResearchInclusion?: boolean;
  allowAiMemory?: boolean;
  withdrawAll?: boolean;
}

export class PrivacyService {
  private repo: PrivacyRepository;
  private userRepo: UserRepository;

  constructor(repo?: PrivacyRepository, userRepo?: UserRepository) {
    this.repo = repo || new PrivacyRepository();
    this.userRepo = userRepo || new UserRepository();
  }

  private resolveUserId(studentOrProfileId: string): string {
    return this.userRepo.findUserIdByProfileId(studentOrProfileId) || studentOrProfileId;
  }

  /**
   * Returns student privacy consent record.
   * When missing, initializes a privacy-first pending record with optional collection disabled.
   */
  public getConsent(studentId: string): StudentPrivacyConsent {
    const resolvedId = this.resolveUserId(studentId);
    const existing = this.repo.getConsent(resolvedId);
    if (existing) {
      return existing;
    }

    return this.repo.upsertConsent({
      studentId: resolvedId,
      isMinor: true,
      parentalConsentVerified: false,
      parentVerificationStatus: 'unverified',
      allowAnalyticsTracking: false,
      allowResearchInclusion: false,
      allowAiMemory: false,
      consentStatus: 'pending',
    });
  }

  private isMinorByDateOfBirth(userId: string): boolean {
    const profile = this.userRepo.getProfileByUserId(userId);
    const dob = profile?.date_of_birth?.trim();
    if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      return false;
    }
    const birthDate = new Date(`${dob}T00:00:00Z`);
    if (Number.isNaN(birthDate.getTime())) {
      return false;
    }
    const now = new Date();
    let age = now.getUTCFullYear() - birthDate.getUTCFullYear();
    const monthDiff = now.getUTCMonth() - birthDate.getUTCMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < birthDate.getUTCDate())) {
      age -= 1;
    }
    return age < 18;
  }

  /**
   * Updates privacy preferences with enforceable guardian-verification and withdrawal rules.
   * Non-admin callers can never self-verify parental consent or bypass minor locks.
   */
  public updateConsent(
    studentId: string,
    updates: ConsentUpdateInput,
    actorRole: 'student' | 'admin' | 'organization' | 'mentor' = 'student'
  ): StudentPrivacyConsent {
    const resolvedId = this.resolveUserId(studentId);
    const current = this.getConsent(resolvedId);
    const blockedReasons: string[] = [];

    if (updates.withdrawAll) {
      return this.repo.upsertConsent({
        studentId: resolvedId,
        allowAnalyticsTracking: false,
        allowResearchInclusion: false,
        allowAiMemory: false,
        consentStatus: 'withdrawn',
        withdrawnAt: new Date().toISOString(),
      });
    }

    let nextIsMinor = updates.isMinor !== undefined ? updates.isMinor : current.isMinor;
    if (actorRole !== 'admin' && nextIsMinor === false) {
      if (current.parentVerificationStatus === 'pending_owner_verification') {
        nextIsMinor = true;
        blockedReasons.push('minor_status_locked_pending_verification');
      } else if (this.isMinorByDateOfBirth(resolvedId)) {
        nextIsMinor = true;
        blockedReasons.push('minor_status_locked_by_date_of_birth');
      }
    }

    const nextParentVerified =
      actorRole === 'admin' && updates.parentalConsentVerified !== undefined
        ? updates.parentalConsentVerified
        : current.parentalConsentVerified;

    if (actorRole !== 'admin' && updates.parentalConsentVerified === true && !current.parentalConsentVerified) {
      blockedReasons.push('guardian_verification_requires_owner_process');
    }

    let wantAnalytics = updates.allowAnalyticsTracking !== undefined
      ? updates.allowAnalyticsTracking
      : current.allowAnalyticsTracking;
    let wantResearch = updates.allowResearchInclusion !== undefined
      ? updates.allowResearchInclusion
      : current.allowResearchInclusion;
    let wantAiMemory = updates.allowAiMemory !== undefined
      ? updates.allowAiMemory
      : current.allowAiMemory;

    if (nextIsMinor && !nextParentVerified) {
      if (wantAnalytics || wantResearch || wantAiMemory) {
        blockedReasons.push('guardian_verification_required_for_minor');
      }
      wantAnalytics = false;
      wantResearch = false;
      wantAiMemory = false;
    }

    const hadAnyGrant = current.allowAnalyticsTracking || current.allowResearchInclusion || current.allowAiMemory;
    const hasAnyGrant = wantAnalytics || wantResearch || wantAiMemory;
    const explicitWithdrawal =
      updates.allowAnalyticsTracking === false ||
      updates.allowResearchInclusion === false ||
      updates.allowAiMemory === false;

    let consentStatus: ConsentStatus = current.consentStatus;
    let withdrawnAt = current.withdrawnAt ?? null;

    if (wantAnalytics && wantResearch && wantAiMemory) {
      consentStatus = 'granted';
      withdrawnAt = null;
    } else if (hasAnyGrant) {
      consentStatus = 'partial';
      withdrawnAt = null;
    } else if ((hadAnyGrant && !hasAnyGrant) || (explicitWithdrawal && !hasAnyGrant)) {
      consentStatus = 'withdrawn';
      withdrawnAt = new Date().toISOString();
    } else {
      consentStatus = 'pending';
    }

    const saved = this.repo.upsertConsent({
      studentId: resolvedId,
      isMinor: nextIsMinor,
      parentEmail: updates.parentEmail !== undefined ? updates.parentEmail : current.parentEmail,
      parentalConsentVerified: nextParentVerified,
      parentVerificationStatus: nextParentVerified ? 'verified' : current.parentVerificationStatus,
      allowAnalyticsTracking: wantAnalytics,
      allowResearchInclusion: wantResearch,
      allowAiMemory: wantAiMemory,
      consentStatus,
      withdrawnAt,
    });

    return blockedReasons.length > 0 ? { ...saved, blockedReasons } : saved;
  }

  /**
   * Records a guardian email for verification without falsely marking consent verified.
   * Dependent data collection stays disabled until owner-approved verification completes.
   */
  public requestParentalVerification(studentId: string, parentEmail: string): StudentPrivacyConsent {
    const resolvedId = this.resolveUserId(studentId);
    const current = this.getConsent(resolvedId);
    return this.repo.upsertConsent({
      studentId: resolvedId,
      isMinor: true,
      parentEmail: parentEmail.trim().toLowerCase(),
      parentalConsentVerified: false,
      parentVerificationStatus: 'pending_owner_verification',
      allowAnalyticsTracking: false,
      allowResearchInclusion: false,
      allowAiMemory: false,
      consentStatus: current.consentStatus === 'withdrawn' ? 'withdrawn' : 'pending',
    });
  }

  /** Admin-only completion of owner-defined parental verification. */
  public adminVerifyParentalConsent(studentId: string): StudentPrivacyConsent {
    const resolvedId = this.resolveUserId(studentId);
    return this.repo.upsertConsent({
      studentId: resolvedId,
      isMinor: true,
      parentalConsentVerified: true,
      parentVerificationStatus: 'verified',
    });
  }

  public canCollectAnalytics(studentId?: string | null): boolean {
    if (!studentId) return false;
    const consent = this.repo.getConsent(this.resolveUserId(studentId));
    if (!consent) return false;
    if (consent.isMinor && !consent.parentalConsentVerified) return false;
    return consent.allowAnalyticsTracking && consent.consentStatus !== 'withdrawn';
  }

  public canIncludeInResearch(studentId?: string | null): boolean {
    if (!studentId) return false;
    const consent = this.repo.getConsent(this.resolveUserId(studentId));
    if (!consent) return false;
    if (consent.isMinor && !consent.parentalConsentVerified) return false;
    return consent.allowResearchInclusion && consent.consentStatus !== 'withdrawn';
  }

  public canUseAIMemory(studentId?: string | null): boolean {
    if (!studentId) return false;
    const consent = this.repo.getConsent(this.resolveUserId(studentId));
    if (!consent) return false;
    if (consent.isMinor && !consent.parentalConsentVerified) return false;
    return consent.allowAiMemory && consent.consentStatus !== 'withdrawn';
  }

  public getResearchEligibleStudents(): Array<{ studentId: string; anonymizedResearchId: string }> {
    return this.repo.getResearchEligibleStudentIds();
  }

  public sanitizeForPublic(obj: Record<string, unknown>): Record<string, unknown> {
    return sanitizeForPublic(obj);
  }
}

export function sanitizeForPublic(obj: Record<string, unknown>): Record<string, unknown> {
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
    'sessionId',
  ];

  const sanitized: Record<string, unknown> = { ...obj };
  for (const key of piiKeys) {
    delete sanitized[key];
  }
  return sanitized;
}
