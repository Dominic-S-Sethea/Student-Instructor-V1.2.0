import { getDatabase, withTransaction } from '../db/connection';
import crypto from 'node:crypto';
import { parseUsdMonthlyStipend } from '../services/scholarshipFormatter';

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
  monthly_allowance_text?: string | null;
  monthly_allowance_text_km?: string | null;
  accommodation_text?: string | null;
  accommodation_text_km?: string | null;
  insurance_text?: string | null;
  insurance_text_km?: string | null;
  flight_support_text?: string | null;
  flight_support_text_km?: string | null;
  verified_at?: string | null;
  verified_by?: string | null;
  estimated_value_usd?: number | null;
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
  monthly_stipend_usd: number | null;
  covers_flights: number | null;
  covers_visa: number | null;
  covers_health_insurance: number | null;
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
  published_scholarship_id?: string | null;
  reviewed_by_user_id?: string | null;
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

export interface FormattedChangeHistoryItem {
  id: string;
  date: string;
  field: string;
  oldValue: string;
  newValue: string;
  detectedBy: string;
  verified: boolean;
}

export type HydratedScholarshipRow = ScholarshipRow & {
  requirements?: ScholarshipRequirementsRow | null;
  funding?: ScholarshipFundingRow | null;
  changeHistory?: FormattedChangeHistoryItem[];
};

export type ScholarshipWriteInput = Record<string, unknown>;

export class ScholarshipRepository {
  private get db() {
    return getDatabase();
  }

  public getAll(filters: {
    q?: string;
    region?: string;
    degree?: string;
    funding?: string;
    field?: string;
    studentCategory?: string;
    onlyVerified?: boolean;
    sortBy?: string;
  }): HydratedScholarshipRow[] {
    let sql = 'SELECT * FROM scholarships WHERE 1=1';
    const params: Array<string | number | null> = [];

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

    sql += ' AND is_deleted = 0 ORDER BY deadline ASC LIMIT 500';
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

    if (filtered.length === 0) {
      return [];
    }

    const ids = filtered.map((r) => r.id);
    const placeholders = ids.map(() => '?').join(', ');

    const reqRows = this.db
      .prepare(`SELECT * FROM scholarship_requirements WHERE scholarship_id IN (${placeholders}) AND is_deleted = 0`)
      .all(...ids) as unknown as ScholarshipRequirementsRow[];
    const reqMap = new Map(reqRows.map((r) => [r.scholarship_id, r]));

    const fundRows = this.db
      .prepare(`SELECT * FROM scholarship_funding WHERE scholarship_id IN (${placeholders}) AND is_deleted = 0`)
      .all(...ids) as unknown as ScholarshipFundingRow[];
    const fundMap = new Map(fundRows.map((f) => [f.scholarship_id, f]));

    const changeRows = this.db
      .prepare(`SELECT * FROM change_history WHERE entity_id IN (${placeholders}) ORDER BY created_at DESC`)
      .all(...ids) as unknown as ChangeHistoryRow[];
    const changeMap = new Map<string, FormattedChangeHistoryItem[]>();
    for (const c of changeRows) {
      const list = changeMap.get(c.entity_id) || [];
      if (list.length < 10) {
        list.push(this.formatChangeItem(c));
        changeMap.set(c.entity_id, list);
      }
    }

    return filtered.map((row) => ({
      ...row,
      requirements: reqMap.get(row.id) || null,
      funding: fundMap.get(row.id) || null,
      changeHistory: changeMap.get(row.id) || [],
    }));
  }

  private formatChangeItem(r: ChangeHistoryRow): FormattedChangeHistoryItem {
    return {
      id: r.id,
      date: r.created_at.split('T')[0],
      field: r.action,
      oldValue: r.previous_state ? 'Previous version' : 'None',
      newValue: r.change_summary || r.action,
      detectedBy: r.changed_by_user_id ? `User ${r.changed_by_user_id}` : 'System / Admin Audit',
      verified: true,
    };
  }

  public getById(id: string): HydratedScholarshipRow | null {
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

  public getChangeHistory(scholarshipId: string): FormattedChangeHistoryItem[] {
    const rows = this.db.prepare(`
      SELECT * FROM change_history WHERE entity_id = ? ORDER BY created_at DESC LIMIT 10
    `).all(scholarshipId) as unknown as ChangeHistoryRow[];

    return rows.map((r) => this.formatChangeItem(r));
  }

  public create(data: ScholarshipWriteInput, changedByUserId?: string): HydratedScholarshipRow {
    return withTransaction(() => {
      const now = new Date().toISOString();
      const id = typeof data.id === 'string' && data.id ? data.id : `sch-${crypto.randomUUID()}`;
    const fundingTypeStr = typeof data.fundingType === 'string'
      ? data.fundingType
      : typeof data.funding_type === 'string'
        ? data.funding_type
        : 'Partial funding';
    const isFull = fundingTypeStr.toLowerCase().includes('full');
    const isTuitionOnly = fundingTypeStr.toLowerCase() === 'tuition only';

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
        verification_tier, tags, monthly_allowance_text, monthly_allowance_text_km,
        accommodation_text, accommodation_text_km, insurance_text, insurance_text_km,
        flight_support_text, flight_support_text_km, verified_at, verified_by,
        estimated_value_usd, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      String(data.legacy_code || id),
      String(data.name || ''),
      String(data.nameKm || data.name_km || data.name || ''),
      String(data.provider || ''),
      String(data.providerKm || data.provider_km || data.provider || ''),
      String(data.country || 'Cambodia'),
      String(data.countryKm || data.country_km || data.country || 'កម្ពុជា'),
      String(data.region || 'Cambodia'),
      degree_levels,
      field_of_study,
      fundingTypeStr,
      String(data.fundingDetails || data.funding_details || data.tuitionCoverage || ''),
      String(data.fundingDetailsKm || data.funding_details_km || data.tuitionCoverageKm || ''),
      String(data.eligibilitySummary || data.eligibility_summary || ''),
      String(data.eligibilitySummaryKm || data.eligibility_summary_km || ''),
      String(data.overview || ''),
      String(data.overviewKm || data.overview_km || ''),
      target_demographic,
      String(data.applicationLink || data.application_link || '#'),
      String(data.officialSourceUrl || data.official_source_url || '#'),
      String(data.deadline || ''),
      data.is_deadline_rolling ? 1 : 0,
      data.is_verified !== undefined ? (data.is_verified ? 1 : 0) : 0,
      String(data.verification_tier || (data.is_verified ? 'official' : 'pending')),
      tags,
      (data.monthlyAllowance ?? data.monthly_allowance_text ?? null) as string | null,
      (data.monthlyAllowanceKm ?? data.monthly_allowance_text_km ?? null) as string | null,
      (data.accommodation ?? data.accommodation_text ?? null) as string | null,
      (data.accommodationKm ?? data.accommodation_text_km ?? null) as string | null,
      (data.insurance ?? data.insurance_text ?? null) as string | null,
      (data.insuranceKm ?? data.insurance_text_km ?? null) as string | null,
      (data.flightSupport ?? data.flight_support_text ?? null) as string | null,
      (data.flightSupportKm ?? data.flight_support_text_km ?? null) as string | null,
      (data.verifiedAt ?? data.verified_at ?? (data.is_verified ? now : null)) as string | null,
      (data.verifiedBy ?? data.verified_by ?? null) as string | null,
      typeof data.totalEstimatedValueUSD === 'number'
        ? data.totalEstimatedValueUSD
        : (typeof data.estimated_value_usd === 'number' ? data.estimated_value_usd : null),
      now,
      now
    );

    const reqId = `req-${id}`;
    this.db.prepare(`
      INSERT INTO scholarship_requirements (
        id, scholarship_id, gpa_minimum, ielts_minimum, toefl_minimum, age_limit, nationalities, work_experience_years, required_documents, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      reqId,
      id,
      (data.minGpa !== undefined ? data.minGpa : (data.gpa_minimum ?? null)) as number | null,
      (data.ieltsMinimum ?? null) as number | null,
      (data.toeflMinimum ?? null) as number | null,
      (data.maxAge ?? data.age_limit ?? null) as number | null,
      String(data.nationalityRequirement || 'Not specified'),
      (data.workExpYears ?? data.work_experience_years ?? null) as number | null,
      JSON.stringify(data.requiredDocuments || []),
      (data.notes as string | undefined) || null
    );

    const parsedStipend =
      typeof data.monthlyStipendUsd === 'number'
        ? data.monthlyStipendUsd
        : parseUsdMonthlyStipend(
            typeof data.monthlyAllowance === 'string'
              ? data.monthlyAllowance
              : typeof data.monthly_allowance_text === 'string'
                ? data.monthly_allowance_text
                : null
          );
    const flightText = String(data.flightSupport ?? data.flight_support_text ?? '').trim().toLowerCase();
    const coversFlights =
      typeof data.coversFlights === 'boolean'
        ? (data.coversFlights ? 1 : 0)
        : flightText
          ? (flightText.includes('not included') || flightText.includes('not applicable') || /^none\b/.test(flightText) ? 0 : 1)
          : null;
    const insText = String(data.insurance ?? data.insurance_text ?? '').trim().toLowerCase();
    const coversInsurance =
      typeof data.coversHealthInsurance === 'boolean'
        ? (data.coversHealthInsurance ? 1 : 0)
        : insText
          ? (insText.includes('not included') || insText.includes('not applicable') || /^none\b/.test(insText) ? 0 : 1)
          : null;

    const fundId = `fund-${id}`;
    this.db.prepare(`
      INSERT INTO scholarship_funding (
        id, scholarship_id, covers_tuition, tuition_coverage_percentage, monthly_stipend_usd, covers_flights, covers_visa, covers_health_insurance, funding_currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      fundId,
      id,
      isFull || isTuitionOnly ? 1 : 0,
      isFull || isTuitionOnly ? 100 : null,
      parsedStipend,
      coversFlights,
      null,
      coversInsurance,
      'USD'
    );

    this.recordChangeHistory({
      entity_type: 'scholarship',
      entity_id: id,
      changed_by_user_id: changedByUserId || null,
      action: 'CREATION',
      previous_state: null,
      new_state: JSON.stringify(data),
      change_summary: `Created new scholarship ${String(data.name || id)}`
    });

    return this.getById(id)!;
    });
  }

  public update(id: string, updates: ScholarshipWriteInput, changedByUserId?: string): HydratedScholarshipRow | null {
    return withTransaction(() => {
      const existing = this.getById(id);
      if (!existing) return null;

      const now = new Date().toISOString();
      const pick = <T>(camel: unknown, snake: unknown, fallback: T): T =>
        (camel !== undefined ? camel : snake !== undefined ? snake : fallback) as T;

      const name = updates.name !== undefined ? String(updates.name) : existing.name;
      const name_km = pick(updates.nameKm, updates.name_km, existing.name_km ?? null);
      const provider = updates.provider !== undefined ? String(updates.provider) : existing.provider;
      const provider_km = pick(updates.providerKm, updates.provider_km, existing.provider_km ?? null);
      const country = updates.country !== undefined ? String(updates.country) : existing.country;
      const country_km = pick(updates.countryKm, updates.country_km, existing.country_km ?? null);
      const region = updates.region !== undefined ? String(updates.region) : existing.region;
      const funding_type = pick(updates.fundingType, updates.funding_type, existing.funding_type);
      const funding_details = pick(updates.fundingDetails, updates.funding_details, existing.funding_details ?? null);
      const funding_details_km = pick(updates.fundingDetailsKm, updates.funding_details_km, existing.funding_details_km ?? null);
      const eligibility_summary = pick(updates.eligibilitySummary, updates.eligibility_summary, existing.eligibility_summary ?? null);
      const eligibility_summary_km = pick(updates.eligibilitySummaryKm, updates.eligibility_summary_km, existing.eligibility_summary_km ?? null);
      const overview = updates.overview !== undefined ? (updates.overview as string | null) : (existing.overview ?? null);
      const overview_km = pick(updates.overviewKm, updates.overview_km, existing.overview_km ?? null);
      const deadline = updates.deadline !== undefined ? String(updates.deadline) : existing.deadline;
      const application_link = pick(updates.applicationLink, updates.application_link, existing.application_link);
      const official_source_url = pick(updates.officialSourceUrl, updates.official_source_url, existing.official_source_url);
      const is_verified = updates.isVerified !== undefined ? (updates.isVerified ? 1 : 0) : (updates.is_verified !== undefined ? (updates.is_verified ? 1 : 0) : existing.is_verified);
      const verification_tier = pick(updates.verificationTier, updates.verification_tier, existing.verification_tier);
      const monthly_allowance_text = pick(updates.monthlyAllowance, updates.monthly_allowance_text, existing.monthly_allowance_text ?? null);
      const accommodation_text = pick(updates.accommodation, updates.accommodation_text, existing.accommodation_text ?? null);
      const insurance_text = pick(updates.insurance, updates.insurance_text, existing.insurance_text ?? null);
      const flight_support_text = pick(updates.flightSupport, updates.flight_support_text, existing.flight_support_text ?? null);
      const verified_at = pick(updates.verifiedAt, updates.verified_at, existing.verified_at ?? null);
      const verified_by = pick(updates.verifiedBy, updates.verified_by, existing.verified_by ?? null);
      const estimated_value_usd = pick(updates.totalEstimatedValueUSD, updates.estimated_value_usd, existing.estimated_value_usd ?? null);

      this.db.prepare(`
        UPDATE scholarships SET
          name = ?, name_km = ?, provider = ?, provider_km = ?, country = ?, country_km = ?, region = ?,
          funding_type = ?, funding_details = ?, funding_details_km = ?,
          eligibility_summary = ?, eligibility_summary_km = ?, overview = ?, overview_km = ?,
          deadline = ?, application_link = ?, official_source_url = ?, is_verified = ?, verification_tier = ?,
          monthly_allowance_text = ?, accommodation_text = ?, insurance_text = ?, flight_support_text = ?,
          verified_at = ?, verified_by = ?, estimated_value_usd = ?, updated_at = ?
        WHERE id = ? AND is_deleted = 0
      `).run(
        name, name_km, provider, provider_km, country, country_km, region,
        funding_type, funding_details, funding_details_km,
        eligibility_summary, eligibility_summary_km, overview, overview_km,
        deadline, application_link, official_source_url, is_verified, verification_tier,
        monthly_allowance_text, accommodation_text, insurance_text, flight_support_text,
        verified_at, verified_by, estimated_value_usd, now, id
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
    });
  }

  public delete(id: string, changedByUserId?: string): boolean {
    return withTransaction(() => {
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
    });
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
    withTransaction(() => {
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

      this.db
        .prepare('UPDATE scholarships SET is_verified = 1, verified_at = ?, verified_by = ?, updated_at = ? WHERE id = ?')
        .run(now, data.verifier_name, now, data.scholarship_id);

      this.recordChangeHistory({
        entity_type: 'scholarship',
        entity_id: data.scholarship_id,
        changed_by_user_id: data.verified_by_user_id || null,
        action: 'VERIFY',
        change_summary: `Verified by ${data.verifier_name}`
      });
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
  public submitOrganizationOpportunity(submission: ScholarshipWriteInput): OrganizationSubmissionRow {
    const now = new Date().toISOString();
    const id = typeof submission.id === 'string' && submission.id ? submission.id : `sub-${crypto.randomUUID()}`;

    this.db.prepare(`
      INSERT INTO organization_submissions (
        id, organization_name, contact_person, contact_email, official_website, scholarship_name,
        scholarship_name_km, country, region, degree_level, field_of_study, funding_type,
        funding_details, eligibility_summary, deadline, application_link, official_source_url,
        status, submitted_by_user_id, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Admin Review', ?, ?)
    `).run(
      id,
      String(submission.organizationName || submission.organization_name || ''),
      String(submission.contactPerson || submission.contact_person || 'Admissions Desk'),
      String(submission.contactEmail || submission.contact_email || ''),
      String(submission.officialWebsite || submission.official_website || ''),
      String(submission.scholarshipName || submission.scholarship_name || ''),
      String(submission.scholarshipNameKm || submission.scholarship_name_km || submission.scholarshipName || ''),
      String(submission.country || 'Cambodia'),
      String(submission.region || 'Cambodia'),
      typeof submission.degreeLevel === 'string' ? submission.degreeLevel : JSON.stringify(submission.degreeLevel || ['Bachelor']),
      typeof submission.fieldOfStudy === 'string' ? submission.fieldOfStudy : JSON.stringify(submission.fieldOfStudy || ['Other']),
      String(submission.fundingType || submission.funding_type || 'Fully funded'),
      String(submission.fundingDetails || submission.funding_details || ''),
      String(submission.eligibilitySummary || submission.eligibility_summary || ''),
      String(submission.deadline || ''),
      String(submission.applicationLink || submission.application_link || '#'),
      String(submission.officialSourceUrl || submission.official_source_url || '#'),
      (submission.submitted_by_user_id as string | null | undefined) || null,
      now
    );

    return this.getSubmissionById(id)!;
  }

  public getPendingCounts(): { pendingSubmissions: number; pendingReports: number } {
    const subRow = this.db
      .prepare("SELECT COUNT(*) AS c FROM organization_submissions WHERE status = 'Pending Admin Review'")
      .get() as { c: number };
    const repRow = this.db
      .prepare("SELECT COUNT(*) AS c FROM user_error_reports WHERE status = 'Pending Review'")
      .get() as { c: number };
    return {
      pendingSubmissions: Number(subRow?.c || 0),
      pendingReports: Number(repRow?.c || 0),
    };
  }

  public getSubmissions(submittedByUserId?: string): OrganizationSubmissionRow[] {
    if (submittedByUserId) {
      return this.db
        .prepare('SELECT * FROM organization_submissions WHERE submitted_by_user_id = ? ORDER BY submitted_at DESC LIMIT 200')
        .all(submittedByUserId) as unknown as OrganizationSubmissionRow[];
    }
    return this.db.prepare('SELECT * FROM organization_submissions ORDER BY submitted_at DESC LIMIT 500').all() as unknown as OrganizationSubmissionRow[];
  }

  public getSubmissionById(id: string): OrganizationSubmissionRow | null {
    const row = this.db.prepare('SELECT * FROM organization_submissions WHERE id = ?').get(id) as unknown as OrganizationSubmissionRow | undefined;
    return row || null;
  }

  public runInTransaction<T>(fn: () => T): T {
    this.db.exec('BEGIN IMMEDIATE;');
    try {
      const result = fn();
      this.db.exec('COMMIT;');
      return result;
    } catch (err) {
      try {
        this.db.exec('ROLLBACK;');
      } catch {
        // ignore rollback error
      }
      throw err;
    }
  }

  public updateSubmissionStatus(
    id: string,
    status: string,
    reviewerName: string,
    reviewNotes?: string,
    reviewerUserId?: string | null,
    publishedScholarshipId?: string | null
  ): OrganizationSubmissionRow | null {
    const now = new Date().toISOString();
    const dbStatus = (status === 'Approved & Published' || status === 'Approved')
      ? 'Approved & Published'
      : (status === 'Rejected' ? 'Rejected' : 'Pending Admin Review');
    this.db.prepare(`
      UPDATE organization_submissions SET
        status = ?, reviewed_at = ?, reviewed_by = ?, review_notes = ?,
        reviewed_by_user_id = COALESCE(?, reviewed_by_user_id),
        published_scholarship_id = COALESCE(?, published_scholarship_id)
      WHERE id = ?
    `).run(dbStatus, now, reviewerName, reviewNotes || null, reviewerUserId || null, publishedScholarshipId || null, id);
    return this.getSubmissionById(id);
  }

  // --- User Error Reports ---
  public submitErrorReport(report: ScholarshipWriteInput): UserErrorReportRow {
    const now = new Date().toISOString();
    const id = typeof report.id === 'string' && report.id ? report.id : `rep-${crypto.randomUUID()}`;

    this.db.prepare(`
      INSERT INTO user_error_reports (
        id, scholarship_id, scholarship_name, reported_field, description, suggested_correction,
        official_source_url, reporter_email, status, submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending Review', ?)
    `).run(
      id,
      String(report.scholarshipId || report.scholarship_id || ''),
      String(report.scholarshipName || report.scholarship_name || 'Scholarship'),
      String(report.reportedField || report.reported_field || 'other'),
      String(report.description || ''),
      (report.suggestedCorrection || report.suggested_correction || null) as string | null,
      (report.officialSourceUrl || report.official_source_url || null) as string | null,
      String(report.reporterEmail || report.reporter_email || 'anonymous@cdes.edu.kh'),
      now
    );

    return this.getErrorReportById(id)!;
  }

  public getErrorReports(): UserErrorReportRow[] {
    return this.db.prepare('SELECT * FROM user_error_reports ORDER BY submitted_at DESC LIMIT 500').all() as unknown as UserErrorReportRow[];
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
