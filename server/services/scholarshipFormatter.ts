import { ScholarshipRow, ScholarshipRequirementsRow, ScholarshipFundingRow } from '../repositories/scholarshipRepository';

export type BenefitKnowledgeState = 'included' | 'excluded' | 'unknown';
export type DeadlineStatus = 'open' | 'closing_soon' | 'expired' | 'rolling' | 'unknown';
export type VerificationState = 'verified' | 'unverified' | 'pending';

export interface TriStateBenefit {
  state: BenefitKnowledgeState;
  label: string;
  labelKm: string;
  isKnown: boolean;
}

export interface FormattedScholarship {
  id: string;
  name: string;
  nameKm: string;
  provider: string;
  providerKm: string;
  country: string;
  countryKm: string;
  region: string;
  degreeLevel: string[];
  fieldOfStudy: string[];
  overview: string;
  overviewKm: string;
  nationalityRequirement: string;
  nationalityRequirementKm: string;
  minGpa: number | null;
  maxAge: number | null;
  workExpYears: number | null;
  englishRequirement: {
    testType: string;
    minScore: string;
    details: string;
    detailsKm: string;
  };
  requiredDocuments: string[];
  requiredDocumentsKm: string[];
  eligibleStudentCategories: string[];
  fundingType: string;
  fundingTypeKm: string;
  totalEstimatedValueUSD: number | null;
  tuitionCoverage: string;
  tuitionCoverageKm: string;
  accommodation: string;
  accommodationKm: string;
  monthlyAllowance: string;
  monthlyAllowanceKm: string;
  flightSupport: string;
  flightSupportKm: string;
  insurance: string;
  insuranceKm: string;
  benefitStates: {
    monthlyAllowanceKnown: boolean;
    accommodation: TriStateBenefit;
    flightSupport: TriStateBenefit;
    insurance: TriStateBenefit;
  };
  otherBenefits: string[];
  otherBenefitsKm: string[];
  openingDate: string | null;
  deadline: string;
  deadlineType: 'Rolling' | 'Fixed Date' | 'Unknown';
  deadlineStatus: DeadlineStatus;
  daysRemaining: number | null;
  applicationLink: string;
  selectionStages: string[];
  selectionStagesKm: string[];
  officialSourceUrl: string;
  verificationStatus: 'Verified Official' | 'Unverified' | 'Pending Verification';
  verificationState: VerificationState;
  lastVerifiedDate: string | null;
  lastUpdatedDate: string | null;
  updateFrequency: string;
  qualityScore: number;
  verifiedBadge: boolean;
  verifierName: string | null;
  popularityCount: number;
  changeHistory: unknown[];
}

function parseJsonArray(raw: string | null | undefined, fallback: string[] = []): string[] {
  if (!raw || !raw.trim()) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((v) => String(v)) : [String(parsed)];
  } catch {
    return [raw];
  }
}

function formatBooleanBenefit(
  flag: number | null | undefined,
  textEn: string | null | undefined,
  textKm: string | null | undefined,
  includedLabelKm: string
): TriStateBenefit {
  if (textEn && textEn.trim() !== '') {
    const lower = textEn.trim().toLowerCase();
    const isExcluded = lower.includes('not included') || lower.includes('excluded') || lower === 'no' || lower === 'none';
    const isUnknown = lower === 'not specified' || lower === 'unknown';
    return {
      state: isUnknown ? 'unknown' : isExcluded ? 'excluded' : 'included',
      label: textEn.trim(),
      labelKm: textKm?.trim() || (isUnknown ? 'មិនបានបញ្ជាក់' : isExcluded ? 'មិនរួមបញ្ចូល' : includedLabelKm),
      isKnown: !isUnknown,
    };
  }
  if (flag === 1) {
    return { state: 'included', label: 'Included', labelKm: includedLabelKm, isKnown: true };
  }
  if (flag === 0) {
    return { state: 'excluded', label: 'Not included', labelKm: 'មិនរួមបញ្ចូល', isKnown: true };
  }
  return { state: 'unknown', label: 'Not specified', labelKm: 'មិនបានបញ្ជាក់', isKnown: false };
}

function computeDeadlineInfo(deadline: string | null | undefined, isRolling: number): {
  deadlineType: 'Rolling' | 'Fixed Date' | 'Unknown';
  deadlineStatus: DeadlineStatus;
  daysRemaining: number | null;
} {
  if (isRolling === 1) {
    return { deadlineType: 'Rolling', deadlineStatus: 'rolling', daysRemaining: null };
  }
  if (!deadline || !deadline.trim() || deadline.trim().toLowerCase() === 'tbd' || deadline.trim().toLowerCase() === 'unknown') {
    return { deadlineType: 'Unknown', deadlineStatus: 'unknown', daysRemaining: null };
  }
  const parsed = Date.parse(deadline);
  if (Number.isNaN(parsed)) {
    return { deadlineType: 'Unknown', deadlineStatus: 'unknown', daysRemaining: null };
  }
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diffDays = Math.ceil((parsed - todayUtc) / 86400000);
  const deadlineStatus: DeadlineStatus = diffDays < 0 ? 'expired' : diffDays <= 14 ? 'closing_soon' : 'open';
  return { deadlineType: 'Fixed Date', deadlineStatus, daysRemaining: diffDays };
}

function computeQualityScore(
  row: ScholarshipRow,
  monthlyKnown: boolean,
  insuranceKnown: boolean,
  deadlineStatus: DeadlineStatus
): number {
  let score = 15;
  if (row.official_source_url && row.official_source_url !== '#') score += 20;
  if (row.application_link && row.application_link !== '#') score += 10;
  if (deadlineStatus !== 'unknown') score += 15;
  if (row.funding_details && row.funding_details.trim() !== '') score += 10;
  if (monthlyKnown) score += 10;
  if (insuranceKnown) score += 5;
  if (row.is_verified === 1) score += 15;
  return Math.min(score, 100);
}

/** Parses single explicit USD monthly stipend text without corrupting ranges or non-USD currencies. */
export function parseUsdMonthlyStipend(text?: string | null): number | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (/^(?:none|no stipend|\$\s*0(?:\.0+)?(?:\s*usd)?(?:\s*\/\s*(?:mo|month))?)$/i.test(trimmed)) {
    return 0;
  }
  if (/(?:\d\s*(?:-|–|—|\bto\b)\s*\$?\s*\d)/i.test(trimmed)) {
    return null;
  }
  if (/\b(?:AUD|CAD|SGD|EUR|GBP|JPY|KRW)\b|[£€¥₩]/i.test(trimmed)) {
    return null;
  }
  const usdMatch = trimmed.match(/^\$\s*([0-9][0-9,]*(?:\.[0-9]+)?)\s*(?:USD)?\s*\/\s*(?:mo|month)\b/i);
  if (usdMatch) {
    const parsed = Number(usdMatch[1].replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** Formats a raw scholarship SQLite record without inventing missing funding, insurance, or verification facts. */
export function formatScholarshipRecord(
  row: ScholarshipRow & {
    requirements?: ScholarshipRequirementsRow | null;
    funding?: ScholarshipFundingRow | null;
    changeHistory?: unknown[];
  }
): FormattedScholarship {
  const degreeLevel = parseJsonArray(row.degree_levels, []);
  const fieldOfStudy = parseJsonArray(row.field_of_study, []);
  const targetDemographic = parseJsonArray(row.target_demographic, ['Students']);
  const reqDocs = parseJsonArray(row.requirements?.required_documents, []);

  const isFull = row.funding_type.toLowerCase().includes('full');
  const fundingTypeKm = isFull
    ? 'អាហារូបករណ៍ពេញលេញ'
    : row.funding_type.toLowerCase().includes('tuition')
      ? 'រ៉ាប់រងថ្លៃសិក្សា'
      : 'អាហារូបករណ៍មួយផ្នែក';

  const stipend = row.funding?.monthly_stipend_usd;
  let monthlyAllowance = 'Not specified';
  let monthlyAllowanceKm = 'មិនបានបញ្ជាក់';
  let monthlyKnown = false;
  if (row.monthly_allowance_text && row.monthly_allowance_text.trim() !== '') {
    monthlyAllowance = row.monthly_allowance_text.trim();
    monthlyAllowanceKm = row.monthly_allowance_text_km?.trim() || monthlyAllowance;
    monthlyKnown = monthlyAllowance.toLowerCase() !== 'not specified';
  } else if (typeof stipend === 'number' && !Number.isNaN(stipend)) {
    monthlyAllowance = `$${stipend}/month`;
    monthlyAllowanceKm = stipend === 0 ? '០ ដុល្លារ/ខែ' : `$${stipend}/ខែ`;
    monthlyKnown = true;
  }

  const accommodationBenefit = row.accommodation_text
    ? {
        state: (row.accommodation_text.toLowerCase() === 'not specified' ? 'unknown' : 'included') as BenefitKnowledgeState,
        label: row.accommodation_text,
        labelKm: row.accommodation_text_km || (row.accommodation_text.toLowerCase() === 'not specified' ? 'មិនបានបញ្ជាក់' : 'កន្លែងស្នាក់នៅ'),
        isKnown: row.accommodation_text.toLowerCase() !== 'not specified',
      }
    : { state: 'unknown' as BenefitKnowledgeState, label: 'Not specified', labelKm: 'មិនបានបញ្ជាក់', isKnown: false };

  const flightBenefit = formatBooleanBenefit(
    row.funding?.covers_flights,
    row.flight_support_text,
    row.flight_support_text_km,
    'រ៉ាប់រងសំបុត្រយន្តហោះ'
  );
  const insuranceBenefit = formatBooleanBenefit(
    row.funding?.covers_health_insurance,
    row.insurance_text,
    row.insurance_text_km,
    'រួមបញ្ចូលការធានារ៉ាប់រងសុខភាព'
  );

  const deadlineMeta = computeDeadlineInfo(row.deadline, row.is_deadline_rolling);
  const verificationState: VerificationState =
    row.is_verified === 1
      ? 'verified'
      : row.verification_tier === 'pending'
        ? 'pending'
        : 'unverified';
  const verificationStatus =
    verificationState === 'verified'
      ? 'Verified Official'
      : verificationState === 'pending'
        ? 'Pending Verification'
        : 'Unverified';

  const testType = row.requirements?.ielts_minimum
    ? 'IELTS'
    : row.requirements?.toefl_minimum
      ? 'TOEFL'
      : 'Not specified';
  const minScore = row.requirements?.ielts_minimum
    ? `${row.requirements.ielts_minimum}+`
    : row.requirements?.toefl_minimum
      ? `${row.requirements.toefl_minimum}+`
      : 'Not specified';

  return {
    id: row.id,
    name: row.name,
    nameKm: row.name_km || row.name,
    provider: row.provider,
    providerKm: row.provider_km || row.provider,
    country: row.country,
    countryKm: row.country_km || row.country,
    region: row.region,
    degreeLevel,
    fieldOfStudy,
    overview: row.overview || '',
    overviewKm: row.overview_km || row.overview || '',
    nationalityRequirement: row.eligibility_summary || 'Not specified',
    nationalityRequirementKm: row.eligibility_summary_km || 'មិនបានបញ្ជាក់',
    minGpa: row.requirements?.gpa_minimum ?? null,
    maxAge: row.requirements?.age_limit ?? null,
    workExpYears: row.requirements?.work_experience_years ?? null,
    englishRequirement: {
      testType,
      minScore,
      details: row.requirements?.notes || 'Not specified',
      detailsKm: row.requirements?.notes ? row.requirements.notes : 'មិនបានបញ្ជាក់',
    },
    requiredDocuments: reqDocs,
    requiredDocumentsKm: [],
    eligibleStudentCategories: targetDemographic,
    fundingType: row.funding_type,
    fundingTypeKm,
    totalEstimatedValueUSD: typeof row.estimated_value_usd === 'number' ? row.estimated_value_usd : null,
    tuitionCoverage: row.funding_details && row.funding_details.trim() !== '' ? row.funding_details : 'Not specified',
    tuitionCoverageKm: row.funding_details_km && row.funding_details_km.trim() !== '' ? row.funding_details_km : 'មិនបានបញ្ជាក់',
    accommodation: accommodationBenefit.label,
    accommodationKm: accommodationBenefit.labelKm,
    monthlyAllowance,
    monthlyAllowanceKm,
    flightSupport: flightBenefit.label,
    flightSupportKm: flightBenefit.labelKm,
    insurance: insuranceBenefit.label,
    insuranceKm: insuranceBenefit.labelKm,
    benefitStates: {
      monthlyAllowanceKnown: monthlyKnown,
      accommodation: accommodationBenefit,
      flightSupport: flightBenefit,
      insurance: insuranceBenefit,
    },
    otherBenefits: [],
    otherBenefitsKm: [],
    openingDate: row.created_at ? row.created_at.split('T')[0] : null,
    deadline: row.deadline || '',
    deadlineType: deadlineMeta.deadlineType,
    deadlineStatus: deadlineMeta.deadlineStatus,
    daysRemaining: deadlineMeta.daysRemaining,
    applicationLink: row.application_link || '#',
    selectionStages: ['Application Submission', 'Document Review'],
    selectionStagesKm: ['ការដាក់ពាក្យ', 'ការពិនិត្យឯកសារ'],
    officialSourceUrl: row.official_source_url || '#',
    verificationStatus,
    verificationState,
    lastVerifiedDate: row.verified_at ? row.verified_at.split('T')[0] : null,
    lastUpdatedDate: row.updated_at ? row.updated_at.split('T')[0] : null,
    updateFrequency: 'Annual',
    qualityScore: computeQualityScore(row, monthlyKnown, insuranceBenefit.isKnown, deadlineMeta.deadlineStatus),
    verifiedBadge: row.is_verified === 1,
    verifierName: row.verified_by || null,
    popularityCount: 45,
    changeHistory: row.changeHistory || [],
  };
}
