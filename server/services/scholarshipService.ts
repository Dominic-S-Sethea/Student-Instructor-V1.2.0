import { withTransaction } from '../db/connection';
import { ScholarshipRepository, HydratedScholarshipRow, OrganizationSubmissionRow } from '../repositories/scholarshipRepository';
import { formatScholarshipRecord, FormattedScholarship } from './scholarshipFormatter';
import { safeJsonParse } from '../utils/safeJson';
import { assertSafeScholarshipUrls } from '../utils/safeUrl';
import {
  ConflictError,
  FormattedSubmission,
  ReviewSubmissionResult,
  extractScholarshipWithAI,
  mapSubmission,
  reviewSubmissionAtomic,
} from './scholarshipEditorialService';

export { ConflictError };

export interface FormattedErrorReport {
  id: string;
  scholarshipId: string;
  scholarshipName: string;
  reportedField: string;
  description: string;
  suggestedCorrection?: string | null;
  officialSourceUrl?: string | null;
  reporterEmail?: string | null;
  submittedAt: string;
  status: string;
  adminNotes?: string | null;
}

export interface ScholarshipStats {
  totalCount: number;
  fullyFundedCount: number;
  countriesCovered: number;
  rollingDeadlines: number;
  byRegion: Record<string, number>;
  byDegree: Record<string, number>;
  byFunding: Record<string, number>;
}

export class ScholarshipService {
  private repo: ScholarshipRepository;

  constructor(repo?: ScholarshipRepository) {
    this.repo = repo || new ScholarshipRepository();
  }

  public getScholarships(filters: {
    q?: string;
    region?: string;
    degree?: string;
    funding?: string;
    field?: string;
    studentCategory?: string;
    onlyVerified?: boolean;
    sortBy?: string;
  }): {
    scholarships: FormattedScholarship[];
    totalCount: number;
    metrics: {
      totalScholarships: number;
      verifiedScholarships: number;
      pendingSubmissions: number;
      pendingReports: number;
    };
  } {
    // Search-term logging intentionally disabled to prevent unconsented query tracking.
    const rows = this.repo.getAll(filters);
    const formatted = rows.map((r) => this.formatScholarship(r));

    if (filters.sortBy === 'deadline_approaching') {
      formatted.sort((a, b) => {
        const ta = a.deadline ? Date.parse(a.deadline) : Number.MAX_SAFE_INTEGER;
        const tb = b.deadline ? Date.parse(b.deadline) : Number.MAX_SAFE_INTEGER;
        return (Number.isNaN(ta) ? Number.MAX_SAFE_INTEGER : ta) - (Number.isNaN(tb) ? Number.MAX_SAFE_INTEGER : tb);
      });
    } else if (filters.sortBy === 'fully_funded') {
      formatted.sort((a, b) => {
        if (a.fundingType === 'Fully funded' && b.fundingType !== 'Fully funded') return -1;
        if (a.fundingType !== 'Fully funded' && b.fundingType === 'Fully funded') return 1;
        return (b.totalEstimatedValueUSD ?? 0) - (a.totalEstimatedValueUSD ?? 0);
      });
    } else if (filters.sortBy === 'most_popular') {
      formatted.sort((a, b) => b.popularityCount - a.popularityCount);
    }

    const pendingCounts = this.repo.getPendingCounts();
    return {
      scholarships: formatted,
      totalCount: formatted.length,
      metrics: {
        totalScholarships: formatted.length,
        verifiedScholarships: formatted.filter((s) => s.verifiedBadge).length,
        pendingSubmissions: pendingCounts.pendingSubmissions,
        pendingReports: pendingCounts.pendingReports,
      },
    };
  }

  public getScholarshipById(id: string): FormattedScholarship | null {
    const raw = this.repo.getById(id);
    if (!raw) return null;
    return this.formatScholarship(raw);
  }

  public getStats(): ScholarshipStats {
    const allRows = this.repo.getAll({});
    const totalCount = allRows.length;
    const fullyFundedCount = allRows.filter((s) => s.funding_type.toLowerCase().includes('full')).length;
    const countries = new Set(allRows.map((s) => s.country));
    const rollingCount = allRows.filter((s) => s.is_deadline_rolling === 1).length;
    const byRegion: Record<string, number> = {};
    const byDegree: Record<string, number> = {};
    const byFunding: Record<string, number> = {};

    for (const s of allRows) {
      byRegion[s.region] = (byRegion[s.region] || 0) + 1;
      byFunding[s.funding_type] = (byFunding[s.funding_type] || 0) + 1;
      const degrees = safeJsonParse<string[]>(s.degree_levels, []);
      if (Array.isArray(degrees)) {
        for (const d of degrees) byDegree[d] = (byDegree[d] || 0) + 1;
      }
    }

    return {
      totalCount,
      fullyFundedCount,
      countriesCovered: countries.size,
      rollingDeadlines: rollingCount,
      byRegion,
      byDegree,
      byFunding,
    };
  }

  public getTopSearchKeywords(limit: number = 10): { query: string; count: number }[] {
    return this.repo.getTopSearchTerms(limit);
  }

  public matchScholarships(profile: {
    educationLevel?: string;
    targetMajor?: string;
    interests?: string[];
    gpa?: string | number;
  }): Array<FormattedScholarship & { matchScore: number; matchReasons: string[] }> {
    const all = this.getScholarships({}).scholarships;
    const targetEdu = profile.educationLevel || 'Grade 12';
    const major = (profile.targetMajor || '').toLowerCase();
    const interests = (profile.interests || []).map((i) => i.toLowerCase());

    return all
      .map((s) => {
        let score = 50;
        const reasons: string[] = [];
        if (s.degreeLevel.some((d) => d.toLowerCase().includes('bachelor')) && (targetEdu.includes('12') || targetEdu.includes('Freshman'))) {
          score += 25;
          reasons.push('Matches high school graduate Bachelor target');
        }
        if (major && s.fieldOfStudy.some((f) => f.toLowerCase().includes(major) || major.includes(f.toLowerCase()))) {
          score += 20;
          reasons.push(`Direct alignment with target major: ${profile.targetMajor}`);
        }
        for (const interest of interests) {
          if (s.fieldOfStudy.some((f) => f.toLowerCase().includes(interest))) {
            score += 10;
            reasons.push(`Covers interest area: ${interest}`);
            break;
          }
        }
        return { ...s, matchScore: Math.min(score, 99), matchReasons: reasons };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  public verifyScholarship(data: {
    scholarshipId: string;
    userId?: string;
    verifierName?: string;
    method?: string;
    confidenceStars?: number;
    sourceUrl?: string;
    notes?: string;
  }): FormattedScholarship | null {
    if (!this.repo.getById(data.scholarshipId)) {
      return null;
    }
    this.repo.recordVerification({
      scholarship_id: data.scholarshipId,
      verified_by_user_id: data.userId || null,
      verifier_name: data.verifierName || 'CDES Editorial Admin',
      verification_method: data.method || 'Official Government Gazette / University Source Check',
      confidence_stars: data.confidenceStars || 5,
      source_url: data.sourceUrl || null,
      verification_notes: data.notes || null,
    });
    return this.getScholarshipById(data.scholarshipId);
  }

  public submitOpportunity(
    data: Record<string, unknown>,
    userId?: string
  ): { message: string; submission: OrganizationSubmissionRow } {
    assertSafeScholarshipUrls(data);
    const submission = this.repo.submitOrganizationOpportunity({
      ...data,
      submitted_by_user_id: userId || null,
    });
    return {
      message: 'Scholarship submitted successfully. Our editorial verification team will review and verify before publishing.',
      submission,
    };
  }

  public getSubmissions(submittedByUserId?: string): FormattedSubmission[] {
    return this.repo.getSubmissions(submittedByUserId).map((s) => mapSubmission(s));
  }

  /** Atomically and idempotently approves or rejects an organization submission with 409 conflict checks. */
  public reviewSubmission(
    id: string,
    action: 'approve' | 'reject',
    reviewNotes?: string,
    changedByUserId?: string,
    reviewerLabel: string = 'CDES Editorial Admin'
  ): ReviewSubmissionResult | null {
    return reviewSubmissionAtomic(this.repo, id, action, reviewNotes, changedByUserId, reviewerLabel);
  }

  public reportError(data: Record<string, unknown>): { message: string; report: FormattedErrorReport } {
    assertSafeScholarshipUrls(data);
    const report = this.repo.submitErrorReport(data);
    return {
      message: 'Thank you for reporting! Our editorial team will review and verify this information.',
      report: {
        id: report.id,
        scholarshipId: report.scholarship_id,
        scholarshipName: report.scholarship_name,
        reportedField: report.reported_field,
        description: report.description,
        suggestedCorrection: report.suggested_correction,
        officialSourceUrl: report.official_source_url,
        reporterEmail: report.reporter_email,
        submittedAt: report.submitted_at,
        status: report.status,
        adminNotes: report.resolution_notes,
      },
    };
  }

  public getErrorReports(): FormattedErrorReport[] {
    return this.repo.getErrorReports().map((r) => ({
      id: r.id,
      scholarshipId: r.scholarship_id,
      scholarshipName: r.scholarship_name,
      reportedField: r.reported_field,
      description: r.description,
      suggestedCorrection: r.suggested_correction,
      officialSourceUrl: r.official_source_url,
      reporterEmail: r.reporter_email,
      submittedAt: r.submitted_at,
      status: r.status,
      adminNotes: r.resolution_notes,
    }));
  }

  public resolveErrorReport(
    id: string,
    status: string,
    adminNotes?: string,
    applyCorrection: boolean = false,
    resolverLabel: string = 'CDES Editorial Admin',
    changedByUserId?: string
  ): FormattedErrorReport | null {
    const resolved = withTransaction(() => {
      const updatedReport = this.repo.resolveErrorReport(id, status, resolverLabel, adminNotes);
      if (!updatedReport) return null;

      if (applyCorrection && updatedReport.suggested_correction && updatedReport.suggested_correction.trim()) {
        const CORRECTABLE_SCHOLARSHIP_FIELDS: Record<string, string> = {
          deadline: 'deadline',
          officialsourceurl: 'officialSourceUrl',
          official_source_url: 'officialSourceUrl',
          applicationlink: 'applicationLink',
          application_link: 'applicationLink',
          eligibilitysummary: 'eligibilitySummary',
          eligibility_summary: 'eligibilitySummary',
          fundingdetails: 'fundingDetails',
          funding_details: 'fundingDetails',
          monthlyallowance: 'monthlyAllowance',
          monthly_allowance_text: 'monthlyAllowance',
          name: 'name',
          provider: 'provider',
        };
        const fieldKey = updatedReport.reported_field.trim().toLowerCase().replace(/\s+/g, '');
        const mappedField = CORRECTABLE_SCHOLARSHIP_FIELDS[fieldKey] ?? CORRECTABLE_SCHOLARSHIP_FIELDS[updatedReport.reported_field.trim().toLowerCase()];
        if (mappedField) {
          this.repo.update(
            updatedReport.scholarship_id,
            { [mappedField]: updatedReport.suggested_correction.trim() },
            changedByUserId
          );
        }
      }

      return updatedReport;
    });
    if (!resolved) return null;
    return {
      id: resolved.id,
      scholarshipId: resolved.scholarship_id,
      scholarshipName: resolved.scholarship_name,
      reportedField: resolved.reported_field,
      description: resolved.description,
      suggestedCorrection: resolved.suggested_correction,
      officialSourceUrl: resolved.official_source_url,
      reporterEmail: resolved.reporter_email,
      submittedAt: resolved.submitted_at,
      status: resolved.status,
      adminNotes: resolved.resolution_notes,
    };
  }

  /** Non-destructive source check status: never fabricates deadlines or fake audit history rows. */
  public checkUpdates(scholarshipId: string): {
    checkedAt: string;
    externalFetchPerformed: boolean;
    changesDetected: number;
    message: string;
    changeRecord: null;
    scholarship: FormattedScholarship;
  } | null {
    const raw = this.repo.getById(scholarshipId);
    if (!raw) return null;
    return {
      checkedAt: new Date().toISOString(),
      externalFetchPerformed: false,
      changesDetected: 0,
      message: `Source check logged without live crawler execution. Existing deadline (${raw.deadline || 'Not specified'}) and operational audit history remain unchanged for official URL [${raw.official_source_url || 'Not specified'}].`,
      changeRecord: null,
      scholarship: this.formatScholarship(raw),
    };
  }

  public createScholarship(data: Record<string, unknown>, changedByUserId?: string): FormattedScholarship {
    assertSafeScholarshipUrls(data);
    return this.formatScholarship(this.repo.create(data, changedByUserId));
  }

  public updateScholarship(id: string, data: Record<string, unknown>, changedByUserId?: string): FormattedScholarship | null {
    assertSafeScholarshipUrls(data);
    const updated = this.repo.update(id, data, changedByUserId);
    return updated ? this.formatScholarship(updated) : null;
  }

  public deleteScholarship(id: string, changedByUserId?: string): boolean {
    return this.repo.delete(id, changedByUserId);
  }

  public async extractWithAI(rawText: string, sourceUrl?: string): Promise<Record<string, unknown>> {
    return extractScholarshipWithAI(rawText, sourceUrl);
  }

  private formatScholarship(row: HydratedScholarshipRow): FormattedScholarship {
    return formatScholarshipRecord(row);
  }
}
