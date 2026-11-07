import { getDatabase } from '../db/connection';
import crypto from 'crypto';

export interface ScholarshipRow {
  id: string;
  legacy_code?: string | null;
  name: string;
  name_km?: string | null;
  provider: string;
  provider_km?: string | null;
  country: string;
  country_km?: string | null;
  region: string;
  degree_levels: string; // JSON string
  field_of_study: string; // JSON string
  funding_type: string;
  funding_details?: string | null;
  funding_details_km?: string | null;
  eligibility_summary?: string | null;
  eligibility_summary_km?: string | null;
  overview?: string | null;
  overview_km?: string | null;
  target_demographic?: string | null; // JSON string
  application_link: string;
  official_source_url: string;
  deadline: string;
  is_deadline_rolling: number;
  is_verified: number;
  verification_tier: string;
  tags?: string | null; // JSON string
  created_at: string;
  updated_at: string;
}

export interface ScholarshipRequirementsRow {
  id: string;
  scholarship_id: string;
  gpa_minimum?: number | null;
  ielts_minimum?: number | null;
  toefl_minimum?: number | null;
  age_limit?: number | null;
  nationalities?: string | null;
  work_experience_years?: number | null;
  required_documents?: string | null;
  notes?: string | null;
}

export interface ScholarshipFundingRow {
  id: string;
  scholarship_id: string;
  covers_tuition: number;
  tuition_coverage_percentage: number;
  monthly_stipend_usd: number;
  covers_flights: number;
  covers_visa: number;
  covers_health_insurance: number;
  funding_currency: string;
}

export interface OrganizationSubmissionRow {
  id: string;
  organization_name: string;
  contact_person?: string | null;
  contact_email: string;
  official_website?: string | null;
  scholarship_name: string;
  scholarship_name_km?: string | null;
  country: string;
  region: string;
  degree_level: string; // JSON string
  field_of_study: string; // JSON string
  funding_type: string;
  funding_details?: string | null;
  eligibility_summary?: string | null;
  deadline?: string | null;
  application_link?: string | null;
  official_source_url?: string | null;
  status: 'Pending Admin Review' | 'Approved & Published' | 'Rejected';
  submitted_by_user_id?: string | null;
  submitted_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  review_notes?: string | null;
}

export interface UserErrorReportRow {
  id: string;
  scholarship_id: string;
  scholarship_name: string;
  reported_field: string;
  description: string;
  suggested_correction?: string | null;
  official_source_url?: string | null;
  reporter_email?: string | null;
  status: 'Pending Review' | 'Verified & Fixed' | 'Dismissed';
  submitted_at: string;
  resolved_at?: string | null;
  resolved_by?: string | null;
  resolution_notes?: string | null;
}

export interface ChangeHistoryRow {
  id: string;
  entity_type: string;
  entity_id: string;
  changed_by_user_id?: string | null;
  action: string;
  previous_state?: string | null;
  new_state?: string | null;
  change_summary?: string | null;
  created_at: string;
}

export class ScholarshipRepository {
  private db = getDatabase();

  public getAll(filters: {
    q?: string;
    region?: string;
    degree?: string;
    funding?: string;
    field?: string;
    studentCategory?: string;
    onlyVerified?: boolean;
    sortBy?: string;
  }): Array<ScholarshipRow & { requirements?: ScholarshipRequirementsRow | null; funding?: ScholarshipFundingRow | null; changeHistory?: any[] }> {
    let sql = 'SELECT * FROM scholarships WHERE 1=1';
    const params: any[] = [];

    if (filters.region && filters.region !== 'all' && filters.region !== 'All') {
      sql += ' AND region = ? COLLATE NOCASE';
      params.push(filters.region);
    }

    if (filters.funding && filters.funding !== 'all' && filters.funding !== 'All') {
      sql += ' AND funding_type LIKE ?';
      params.push(`%${filters.funding}%`);
    }

    if (filters.onlyVerified) {
      sql += ' AND is_verified = 1';
    }

    if (filters.q && filters.q.trim()) {
      const queryStr = `%${filters.q.trim()}%`;
      sql += ` AND (
        name LIKE ? OR name_km LIKE ? OR provider LIKE ? OR country LIKE ? OR field_of_study LIKE ? OR tags LIKE ? OR overview LIKE ?
      )`;
      params.push(queryStr, queryStr, queryStr, queryStr, queryStr, queryStr, queryStr);
    }

    sql += ' AND is_deleted = 0 ORDER BY deadline ASC';
    const rows = this.db.prepare(sql).all(...params) as unknown as ScholarshipRow[];

    // In-memory post-filter for JSON array fields (degree & field & studentCategory)
    const filtered = rows.filter(row => {
      if (filters.degree && filters.degree !== 'all' && filters.degree !== 'All') {
        try {
          const degrees: string[] = JSON.parse(row.degree_levels || '[]');
          if (!degrees.some(d => d.toLowerCase().includes(filters.degree!.toLowerCase()))) {
            return false;
          }
        } catch {
          // ignore
        }
      }
      if (filters.field && filters.field !== 'all' && filters.field !== 'All') {
        try {
          const fields: string[] = JSON.parse(row.field_of_study || '[]');
          if (!fields.some(f => f.toLowerCase().includes(filters.field!.toLowerCase()))) {
            return false;
          }
        } catch {
          // ignore
        }
      }
      if (filters.studentCategory && filters.studentCategory !== 'all' && filters.studentCategory !== 'All') {
        try {
          const categories: string[] = JSON.parse(row.target_demographic || '[]');
          const target = filters.studentCategory.toLowerCase().replace('&', '/');
          if (!categories.some(c => {
            const normC = c.toLowerCase().replace('&', '/');
            return normC.includes(target) || target.includes(normC);
          })) {
            return false;
          }
        } catch {
          // ignore
        }
      }
      return true;
    });

    return filtered.map(row => {
      const requirements = this.db.prepare('SELECT * FROM scholarship_requirements WHERE scholarship_id = ? AND is_deleted = 0').get(row.id) as unknown as ScholarshipRequirementsRow | undefined;
      const funding = this.db.prepare('SELECT * FROM scholarship_funding WHERE scholarship_id = ? AND is_deleted = 0').get(row.id) as unknown as ScholarshipFundingRow | undefined;
      const changes = this.getChangeHistory(row.id);

      return {
        ...row,
        requirements: requirements || null,
        funding: funding || null,
        changeHistory: changes
      };
    });
  }

  public getById(id: string): (ScholarshipRow & { requirements?: ScholarshipRequirementsRow | null; funding?: ScholarshipFundingRow | null; changeHistory?: any[] }) | null {
    const row = this.db.prepare('SELECT * FROM scholarships WHERE id = ? AND is_deleted = 0').get(id) as unknown as ScholarshipRow | undefined;
    if (!row) return null;

    const requirements = this.db.prepare('SELECT * FROM scholarship_requirements WHERE scholarship_id = ? AND is_deleted = 0').get(id) as unknown as ScholarshipRequirementsRow | undefined;
    const funding = this.db.prepare('SELECT * FROM scholarship_funding WHERE scholarship_id = ? AND is_deleted = 0').get(id) as unknown as ScholarshipFundingRow | undefined;
    const changes = this.getChangeHistory(id);

    return {
      ...row,
      requirements: requirements || null,
      funding: funding || null,
      changeHistory: changes
    };
  }

  public getChangeHistory(scholarshipId: string): any[] {
    const rows = this.db.prepare(`
      SELECT * FROM change_history WHERE entity_id = ? ORDER BY created_at DESC LIMIT 10
    `).all(scholarshipId) as unknown as ChangeHistoryRow[];

    return rows.map(r => ({
      id: r.id,
      date: r.created_at.split('T')[0],
      field: r.action,
      oldValue: r.previous_state ? 'Previous version' : 'None',
      newValue: r.change_summary || r.action,
      detectedBy: r.changed_by_user_id ? `User ${r.changed_by_user_id}` : 'System / Admin Audit',
      verified: true
    }));
  }

  public create(data: any): ScholarshipRow {
    const now = new Date().toISOString();
    const id = data.id || `sch-${Date.now()}`;

    const degree_levels = typeof data.degreeLevel === 'string'
      ? data.degreeLevel
      : JSON.stringify(data.degreeLevel || data.degree_levels || ['Bachelor']);

    const field_of_study = typeof data.fieldOfStudy === 'string'
      ? data.fieldOfStudy
      : JSON.stringify(data.fieldOfStudy || data.field_of_study || ['Computer Science']);

    const target_demographic = typeof data.target_demographic === 'string'
      ? data.target_demographic
      : JSON.stringify(data.target_demographic || data.eligibleStudentCategories || ['High School Students', 'University Students']);

    const tags = typeof data.tags === 'string'
      ? data.tags
      : JSON.stringify(data.tags || []);

    this.db.prepare(`
      INSERT INTO scholarships (
        id, legacy_code, name, name_km, provider, provider_km, country, country_km, region,
        degree_levels, field_of_study, funding_type, funding_details, funding_details_km,
        eligibility_summary, eligibility_summary_km, overview, overview_km, target_demographic,
        application_link, official_source_url, deadline, is_deadline_rolling, is_verified,
        verification_tier, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.legacy_code || id,
      data.name,
      data.nameKm || data.name_km || data.name,
      data.provider,
      data.providerKm || data.provider_km || data.provider,
      data.country || 'Cambodia',
      data.countryKm || data.country_km || data.country || 'កម្ពុជា',
      data.region || 'Cambodia',
      degree_levels,
      field_of_study,
      data.fundingType || data.funding_type || 'Fully funded',
      data.fundingDetails || data.funding_details || data.tuitionCoverage || '',
      data.fundingDetailsKm || data.funding_details_km || data.tuitionCoverageKm || '',
      data.eligibilitySummary || data.eligibility_summary || '',
      data.eligibilitySummaryKm || data.eligibility_summary_km || '',
      data.overview || '',
      data.overviewKm || data.overview_km || '',
      target_demographic,
      data.applicationLink || data.application_link || '#',
      data.officialSourceUrl || data.official_source_url || '#',
      data.deadline,
      data.is_deadline_rolling ? 1 : 0,
      data.is_verified !== undefined ? (data.is_verified ? 1 : 0) : 1,
      data.verification_tier || 'official',
      tags,
      now,
      now
    );

    // Also add requirements record
    const reqId = `req-${id}`;
    this.db.prepare(`
      INSERT INTO scholarship_requirements (
        id, scholarship_id, gpa_minimum, ielts_minimum, toefl_minimum, age_limit, nationalities, work_experience_years, required_documents, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      reqId,
      id,
      data.minGpa !== undefined ? data.minGpa : (data.gpa_minimum || null),
      data.ieltsMinimum || 6.0,
      data.toeflMinimum || null,
      data.maxAge || data.age_limit || null,
      data.nationalityRequirement || 'Cambodian citizens',
      data.workExpYears || data.work_experience_years || 0,
      JSON.stringify(data.requiredDocuments || ['Academic Transcripts', 'Passport', 'Application Form']),
      data.notes || null
    );

    // Also add funding record
    const fundId = `fund-${id}`;
    this.db.prepare(`
      INSERT INTO scholarship_funding (
        id, scholarship_id, covers_tuition, tuition_coverage_percentage, monthly_stipend_usd, covers_flights, covers_visa, covers_health_insurance, funding_currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      fundId,
      id,
      data.fundingType?.includes('Full') ? 1 : 0,
      100,
      Number(data.monthlyAllowance?.replace(/[^0-9]/g, '')) || 0,
      data.flightSupport === 'Included' ? 1 : 0,
      1,
      data.insurance === 'Included' ? 1 : 0,
      'USD'
    );

    this.recordChangeHistory({
      entity_type: 'scholarship',
      entity_id: id,
      action: 'CREATION',
      previous_state: null,
      new_state: JSON.stringify(data),
      change_summary: `Created new scholarship ${data.name}`
    });

    return this.getById(id)!;
  }

  public update(id: string, updates: any, changedByUserId?: string): ScholarshipRow | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const now = new Date().toISOString();

    const name = updates.name !== undefined ? updates.name : existing.name;
    const name_km = updates.nameKm !== undefined ? updates.nameKm : (updates.name_km !== undefined ? updates.name_km : existing.name_km);
    const provider = updates.provider !== undefined ? updates.provider : existing.provider;
    const provider_km = updates.providerKm !== undefined ? updates.providerKm : (updates.provider_km !== undefined ? updates.provider_km : existing.provider_km);
    const country = updates.country !== undefined ? updates.country : existing.country;
    const country_km = updates.countryKm !== undefined ? updates.countryKm : (updates.country_km !== undefined ? updates.country_km : existing.country_km);
    const region = updates.region !== undefined ? updates.region : existing.region;
    const funding_type = updates.fundingType !== undefined ? updates.fundingType : (updates.funding_type !== undefined ? updates.funding_type : existing.funding_type);
    const funding_details = updates.fundingDetails !== undefined ? updates.fundingDetails : (updates.funding_details !== undefined ? updates.funding_details : existing.funding_details);
    const funding_details_km = updates.fundingDetailsKm !== undefined ? updates.fundingDetailsKm : (updates.funding_details_km !== undefined ? updates.funding_details_km : existing.funding_details_km);
    const eligibility_summary = updates.eligibilitySummary !== undefined ? updates.eligibilitySummary : (updates.eligibility_summary !== undefined ? updates.eligibility_summary : existing.eligibility_summary);
    const eligibility_summary_km = updates.eligibilitySummaryKm !== undefined ? updates.eligibilitySummaryKm : (updates.eligibility_summary_km !== undefined ? updates.eligibility_summary_km : existing.eligibility_summary_km);
    const overview = updates.overview !== undefined ? updates.overview : existing.overview;
    const overview_km = updates.overviewKm !== undefined ? updates.overviewKm : (updates.overview_km !== undefined ? updates.overview_km : existing.overview_km);
    const deadline = updates.deadline !== undefined ? updates.deadline : existing.deadline;
    const application_link = updates.applicationLink !== undefined ? updates.applicationLink : (updates.application_link !== undefined ? updates.application_link : existing.application_link);
    const official_source_url = updates.officialSourceUrl !== undefined ? updates.officialSourceUrl : (updates.official_source_url !== undefined ? updates.official_source_url : existing.official_source_url);
    const is_verified = updates.isVerified !== undefined ? (updates.isVerified ? 1 : 0) : (updates.is_verified !== undefined ? (updates.is_verified ? 1 : 0) : existing.is_verified);

    this.db.prepare(`
      UPDATE scholarships SET
        name = ?, name_km = ?, provider = ?, provider_km = ?, country = ?, country_km = ?, region = ?,
        funding_type = ?, funding_details = ?, funding_details_km = ?,
        eligibility_summary = ?, eligibility_summary_km = ?, overview = ?, overview_km = ?,
        deadline = ?, application_link = ?, official_source_url = ?, is_verified = ?, updated_at = ?
      WHERE id = ?
    `).run(
      name, name_km, provider, provider_km, country, country_km, region,
      funding_type, funding_details, funding_details_km,
      eligibility_summary, eligibility_summary_km, overview, overview_km,
      deadline, application_link, official_source_url, is_verified, now, id
    );

    this.recordChangeHistory({
      entity_type: 'scholarship',
      entity_id: id,
      changed_by_user_id: changedByUserId || null,
      action: 'UPDATE',
      previous_state: JSON.stringify(existing),
      new_state: JSON.stringify(updates),
      change_summary: `Updated scholarship fields (${Object.keys(updates).join(', ')})`
    });

    return this.getById(id);
  }

  public delete(id: string, changedByUserId?: string): boolean {
    // Soft-delete: mark as deleted instead of hard DELETE
    const existing = this.getById(id);
    if (!existing) return false;

    const now = new Date().toISOString();

    this.db.prepare('UPDATE scholarship_requirements SET is_deleted = 1, deleted_at = ?, deleted_by = ? WHERE scholarship_id = ?').run(now, changedByUserId || null, id);
    this.db.prepare('UPDATE scholarship_funding SET is_deleted = 1, deleted_at = ?, deleted_by = ? WHERE scholarship_id = ?').run(now, changedByUserId || null, id);
    this.db.prepare('UPDATE scholarships SET is_deleted = 1, deleted_at = ?, deleted_by = ?, updated_at = ? WHERE id = ?').run(now, changedByUserId || null, now, id);

    this.recordChangeHistory({
      entity_type: 'scholarship',
      entity_id: id,
      changed_by_user_id: changedByUserId || null,
      action: 'DELETE',
      previous_state: JSON.stringify(existing),
      new_state: JSON.stringify({ ...existing, is_deleted: 1, deleted_at: now }),
      change_summary: `Soft-deleted scholarship ${existing.name}`
    });
    return true;
  }

  public recordVerification(data: {
    scholarship_id: string;
    verified_by_user_id?: string | null;
    verifier_name: string;
    verification_method: string;
    confidence_stars?: number;
    source_url?: string | null;
    verification_notes?: string | null;
  }): void {
    const now = new Date().toISOString();
    const id = `ver-${crypto.randomUUID()}`;

    this.db.prepare(`
      INSERT INTO verification_records (
        id, scholarship_id, verified_by_user_id, verifier_name, verification_method,
        confidence_stars, source_url, verification_notes, verified_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.scholarship_id,
      data.verified_by_user_id || null,
      data.verifier_name,
      data.verification_method,
      data.confidence_stars || 5,
      data.source_url || null,
      data.verification_notes || null,
      now
    );

    this.db.prepare('UPDATE scholarships SET is_verified = 1, updated_at = ? WHERE id = ?').run(now, data.scholarship_id);

    this.recordChangeHistory({
      entity_type: 'scholarship',
      entity_id: data.scholarship_id,
      changed_by_user_id: data.verified_by_user_id || null,
      action: 'VERIFY',
      change_summary: `Verified by ${data.verifier_name}`
    });
  }

  public recordChangeHistory(entry: {
    entity_type: string;
    entity_id: string;
    changed_by_user_id?: string | null;
    action: string;
    previous_state?: string | null;
    new_state?: string | null;
    change_summary?: string | null;
  }): void {
    const now = new Date().toISOString();
    const id = `chg-${crypto.randomUUID()}`;
    this.db.prepare(`
      INSERT INTO change_history (
        id, entity_type, entity_id, changed_by_user_id, action, previous_state, new_state, change_summary, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      entry.entity_type,
      entry.entity_id,
      entry.changed_by_user_id || null,
      entry.action,
      entry.previous_state || null,
      entry.new_state || null,
      entry.change_summary || null,
      now
    );
  }

  // --- Submissions ---
  public submitOrganizationOpportunity(submission: any): OrganizationSubmissionRow {
    const now = new Date().toISOString();
    const id = submission.id || `sub-${Date.now()}`;

    this.db.prepare(`
      INSERT INTO organization_submissions (
        id, organization_name, contact_person, contact_email, official_website, scholarship_name,
        scholarship_name_km, country, region, degree_level, field_of_study, funding_type,
        funding_details, eligibility_summary, deadline, application_link, official_source_url,
        status, submitted_by_user_id, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Admin Review', ?, ?)
    `).run(
      id,
      submission.organizationName || submission.organization_name,
      submission.contactPerson || submission.contact_person || 'Admissions Desk',
      submission.contactEmail || submission.contact_email,
      submission.officialWebsite || submission.official_website || '',
      submission.scholarshipName || submission.scholarship_name,
      submission.scholarshipNameKm || submission.scholarship_name_km || submission.scholarshipName,
      submission.country || 'Cambodia',
      submission.region || 'Cambodia',
      typeof submission.degreeLevel === 'string' ? submission.degreeLevel : JSON.stringify(submission.degreeLevel || ['Bachelor']),
      typeof submission.fieldOfStudy === 'string' ? submission.fieldOfStudy : JSON.stringify(submission.fieldOfStudy || ['Other']),
      submission.fundingType || submission.funding_type || 'Fully funded',
      submission.fundingDetails || submission.funding_details || '',
      submission.eligibilitySummary || submission.eligibility_summary || '',
      submission.deadline || '',
      submission.applicationLink || submission.application_link || '#',
      submission.officialSourceUrl || submission.official_source_url || '#',
      submission.submitted_by_user_id || null,
      now
    );

    return this.getSubmissionById(id)!;
  }

  public getSubmissions(): OrganizationSubmissionRow[] {
    return this.db.prepare('SELECT * FROM organization_submissions ORDER BY submitted_at DESC').all() as unknown as OrganizationSubmissionRow[];
  }

  public getSubmissionById(id: string): OrganizationSubmissionRow | null {
    const row = this.db.prepare('SELECT * FROM organization_submissions WHERE id = ?').get(id) as unknown as OrganizationSubmissionRow | undefined;
    return row || null;
  }

  public updateSubmissionStatus(id: string, status: string, reviewerName: string, reviewNotes?: string): OrganizationSubmissionRow | null {
    const now = new Date().toISOString();
    const dbStatus = (status === 'Approved & Published' || status === 'Approved') ? 'Approved & Published' : (status === 'Rejected' ? 'Rejected' : 'Pending Admin Review');
    this.db.prepare(`
      UPDATE organization_submissions SET
        status = ?, reviewed_at = ?, reviewed_by = ?, review_notes = ?
      WHERE id = ?
    `).run(dbStatus, now, reviewerName, reviewNotes || null, id);
    return this.getSubmissionById(id);
  }

  // --- User Error Reports ---
  public submitErrorReport(report: any): UserErrorReportRow {
    const now = new Date().toISOString();
    const id = report.id || `rep-${Date.now()}`;

    this.db.prepare(`
      INSERT INTO user_error_reports (
        id, scholarship_id, scholarship_name, reported_field, description, suggested_correction,
        official_source_url, reporter_email, status, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending Review', ?)
    `).run(
      id,
      report.scholarshipId || report.scholarship_id,
      report.scholarshipName || report.scholarship_name || 'Scholarship',
      report.reportedField || report.reported_field || 'other',
      report.description,
      report.suggestedCorrection || report.suggested_correction || null,
      report.officialSourceUrl || report.official_source_url || null,
      report.reporterEmail || report.reporter_email || 'anonymous@cdes.edu.kh',
      now
    );

    return this.getErrorReportById(id)!;
  }

  public getErrorReports(): UserErrorReportRow[] {
    return this.db.prepare('SELECT * FROM user_error_reports ORDER BY submitted_at DESC').all() as unknown as UserErrorReportRow[];
  }

  public getErrorReportById(id: string): UserErrorReportRow | null {
    const row = this.db.prepare('SELECT * FROM user_error_reports WHERE id = ?').get(id) as unknown as UserErrorReportRow | undefined;
    return row || null;
  }

  public resolveErrorReport(id: string, status: string, resolverName: string, notes?: string): UserErrorReportRow | null {
    const now = new Date().toISOString();
    const dbStatus = (status === 'Verified & Fixed' || status === 'Resolved') ? 'Verified & Fixed' : (status === 'Dismissed' ? 'Dismissed' : 'Pending Review');
    this.db.prepare(`
      UPDATE user_error_reports SET
        status = ?, resolved_at = ?, resolved_by = ?, resolution_notes = ?
      WHERE id = ?
    `).run(dbStatus, now, resolverName, notes || null, id);
    return this.getErrorReportById(id);
  }

  // --- Search Keywords ---
  public logSearchQuery(query: string): void {
    if (!query || !query.trim()) return;
    const clean = query.trim();
    const now = new Date().toISOString();
    this.db.prepare(`
      INSERT INTO search_keywords_log (query, count, last_searched)
      VALUES (?, 1, ?)
      ON CONFLICT(query) DO UPDATE SET count = count + 1, last_searched = ?
    `).run(clean, now, now);
  }

  public getTopSearchTerms(limit: number = 10): { query: string; count: number }[] {
    return this.db.prepare('SELECT query, count FROM search_keywords_log ORDER BY count DESC LIMIT ?').all(limit) as unknown as { query: string; count: number }[];
  }
}
