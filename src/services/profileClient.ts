import { apiDelete, apiGet, apiPost, apiPut } from './apiClient';
import type { EducationEntry, StudentProfile } from './authClient';

export interface PrivacyConsentState {
  studentId: string;
  isMinor: boolean;
  parentalConsentVerified: boolean;
  parentVerificationStatus: 'unverified' | 'pending_owner_verification' | 'verified';
  parentEmail: string | null;
  allowAnalyticsTracking: boolean;
  allowResearchInclusion: boolean;
  allowAiMemory: boolean;
  consentStatus: 'pending' | 'granted' | 'partial' | 'withdrawn';
  anonymizedResearchId: string;
  consentDate: string;
  withdrawnAt?: string | null;
  blockedReasons?: string[];
}

export const profileClient = {
  async getProfile(): Promise<{ profile: StudentProfile | null; education: EducationEntry[] }> {
    return apiGet<{ profile: StudentProfile | null; education: EducationEntry[] }>('/api/users/profile');
  },

  async updateProfile(updates: Partial<{
    name: string;
    education_level: string;
    school: string | null;
    university: string | null;
    language: string;
    major: string | null;
    target_career: string | null;
    location: string | null;
    interests: string[];
    favorite_subjects: string[];
    goals: string | null;
  }>): Promise<{ profile: StudentProfile | null; education: EducationEntry[] }> {
    return apiPut<{ profile: StudentProfile | null; education: EducationEntry[] }>('/api/users/profile', updates);
  },

  async addEducation(entry: {
    institution: string;
    degree: string;
    start_date?: string | null;
    end_date?: string | null;
    achievements?: string | null;
  }): Promise<EducationEntry> {
    return apiPost<EducationEntry>('/api/users/education', entry);
  },

  async deleteEducation(entryId: string): Promise<{ id: string }> {
    return apiDelete<{ id: string }>(`/api/users/education/${encodeURIComponent(entryId)}`);
  },

  async getPrivacyConsent(): Promise<PrivacyConsentState> {
    return apiGet<PrivacyConsentState>('/api/privacy/consent');
  },

  async updatePrivacyConsent(updates: {
    isMinor?: boolean;
    parentEmail?: string | null;
    allowAnalyticsTracking?: boolean;
    allowResearchInclusion?: boolean;
    allowAiMemory?: boolean;
    withdrawAll?: boolean;
  }): Promise<PrivacyConsentState> {
    return apiPost<PrivacyConsentState>('/api/privacy/consent', updates);
  },

  async requestParentalVerification(parentEmail: string): Promise<PrivacyConsentState> {
    return apiPost<PrivacyConsentState>('/api/privacy/parent-verify', { parentEmail });
  },
};
