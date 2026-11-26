import { apiFetchRaw, apiPut, apiPost } from './apiClient';
import type { OrganizationSubmission, ScholarshipItem, UserErrorReport } from '../types/scholarship';

export interface ScholarshipCatalogResponse {
  success: boolean;
  totalCount: number;
  scholarships: ScholarshipItem[];
  metrics: {
    totalScholarships: number;
    verifiedScholarships: number;
    pendingSubmissions: number;
    pendingReports: number;
  };
}

export const scholarshipClient = {
  async list(params: {
    q?: string;
    region?: string;
    degree?: string;
    field?: string;
    funding?: string;
    studentCategory?: string;
    onlyVerified?: boolean;
    sortBy?: string;
    signal?: AbortSignal;
  } = {}): Promise<ScholarshipCatalogResponse> {
    const query = new URLSearchParams();
    if (params.q?.trim()) query.set('q', params.q.trim());
    if (params.region && params.region !== 'all') query.set('region', params.region);
    if (params.degree && params.degree !== 'all') query.set('degree', params.degree);
    if (params.field && params.field !== 'all') query.set('field', params.field);
    if (params.funding && params.funding !== 'all') query.set('funding', params.funding);
    if (params.studentCategory && params.studentCategory !== 'all') {
      query.set('studentCategory', params.studentCategory);
    }
    if (params.onlyVerified) query.set('onlyVerified', 'true');
    if (params.sortBy) query.set('sortBy', params.sortBy);

    const qs = query.toString();
    return apiFetchRaw<ScholarshipCatalogResponse>(`/api/scholarships${qs ? `?${qs}` : ''}`, {
      signal: params.signal,
    });
  },

  async getById(id: string): Promise<ScholarshipItem> {
    const res = await apiFetchRaw<{ success: boolean; scholarship: ScholarshipItem }>(
      `/api/scholarships/${encodeURIComponent(id)}`
    );
    return res.scholarship;
  },

  async submitOpportunity(payload: Record<string, unknown>): Promise<{ message: string; submission: OrganizationSubmission }> {
    return apiFetchRaw<{ success: boolean; message: string; submission: OrganizationSubmission }>(
      '/api/scholarships/submit',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async listSubmissions(): Promise<OrganizationSubmission[]> {
    const res = await apiFetchRaw<{ success: boolean; submissions?: OrganizationSubmission[]; data?: OrganizationSubmission[] }>(
      '/api/scholarships/submissions'
    );
    return res.submissions || res.data || [];
  },

  async reviewSubmission(
    id: string,
    action: 'approve' | 'reject',
    reviewNotes?: string
  ): Promise<{
    alreadyProcessed?: boolean;
    submission: OrganizationSubmission;
    publishedScholarship: ScholarshipItem | null;
  }> {
    return apiFetchRaw<{
      success: boolean;
      alreadyProcessed?: boolean;
      submission: OrganizationSubmission;
      publishedScholarship: ScholarshipItem | null;
    }>(`/api/scholarships/submissions/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ action, reviewNotes }),
    });
  },

  async reportError(payload: {
    scholarshipId: string;
    scholarshipName: string;
    reportedField: string;
    description: string;
    suggestedCorrection?: string;
    officialSourceUrl?: string;
  }): Promise<{ message: string; report: UserErrorReport }> {
    return apiFetchRaw<{ success: boolean; message: string; report: UserErrorReport }>(
      '/api/scholarships/report',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async listErrorReports(): Promise<UserErrorReport[]> {
    const res = await apiFetchRaw<{ success: boolean; reports?: UserErrorReport[]; data?: UserErrorReport[] }>(
      '/api/scholarships/reports'
    );
    return res.reports || res.data || [];
  },

  async resolveErrorReport(
    id: string,
    status: string,
    adminNotes?: string,
    applyCorrectionToScholarship: boolean = false
  ): Promise<UserErrorReport | null> {
    const res = await apiPut<{ report?: UserErrorReport } | UserErrorReport>(
      `/api/scholarships/reports/${encodeURIComponent(id)}`,
      {
        status,
        adminNotes,
        applyCorrectionToScholarship,
      }
    );
    if (res && typeof res === 'object' && 'report' in res && res.report) {
      return res.report;
    }
    return res && typeof res === 'object' && 'id' in res ? res : null;
  },

  async checkUpdates(scholarshipId: string): Promise<{ message: string; scholarship: ScholarshipItem }> {
    return apiPost<{ message: string; scholarship: ScholarshipItem }>('/api/scholarships/check-updates', {
      scholarshipId,
    });
  },

  async verifyScholarship(scholarshipId: string, notes?: string): Promise<ScholarshipItem> {
    const res = await apiFetchRaw<{ success: boolean; scholarship: ScholarshipItem }>(
      `/api/scholarships/${encodeURIComponent(scholarshipId)}/verify`,
      { method: 'POST', body: JSON.stringify({ notes }) }
    );
    return res.scholarship;
  },
};
