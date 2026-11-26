import type { ComprehensiveUniversityProfile } from '../types';
import type { LiveUniversityRecord } from '../services/universityClient';
import { resolvePublicAssetUrl } from './assetUrl';

export function normalizeUniversityMedia(
  list: ComprehensiveUniversityProfile[],
): ComprehensiveUniversityProfile[] {
  return list.map((u) => ({
    ...u,
    logo: resolvePublicAssetUrl(u.logo),
    coverImage: resolvePublicAssetUrl(u.coverImage),
    photos: u.photos?.map((photo) => resolvePublicAssetUrl(photo)),
    gallery: u.gallery?.map((item) => ({
      ...item,
      url: resolvePublicAssetUrl(item.url),
    })),
  }));
}

function mapAccreditationStatus(
  rawStatus: string | undefined,
  isKnown: boolean | undefined,
  fallbackStatus: ComprehensiveUniversityProfile['accreditation']['status']
): ComprehensiveUniversityProfile['accreditation']['status'] {
  if (isKnown === false || !rawStatus || rawStatus === 'Not specified') {
    return 'Not specified';
  }
  if (
    rawStatus === 'Fully Accredited' ||
    rawStatus === 'Provisional' ||
    rawStatus === 'Internationally Certified'
  ) {
    return rawStatus;
  }
  return fallbackStatus;
}

function buildFallbackUniversity(live: LiveUniversityRecord): ComprehensiveUniversityProfile {
  const isKnown = Boolean(live.accreditation?.isKnown);
  const accreditationStatus = mapAccreditationStatus(live.accreditation?.status, isKnown, 'Not specified');

  return {
    id: live.id,
    name: live.name,
    khmerName: live.khmerName || '',
    abbr: live.abbr,
    location: live.location,
    type: live.type,
    foundedYear: live.foundedYear || 2000,
    website: live.website || '',
    logo: resolvePublicAssetUrl(live.logo || ''),
    coverImage: resolvePublicAssetUrl(live.coverImage || ''),
    profileScore: live.profileScore,
    accreditation: {
      governmentRecognition: live.accreditation?.agency || 'Not specified',
      status: accreditationStatus,
      isKnown,
    },
    facultyCount: 1,
    majorsCount: live.majors?.length || 0,
    theoryVsPracticeRatio: 'Not specified',
    studentToFacultyRatio: 'Not specified',
    curriculumHighlight: 'Curriculum details available on official university website.',
    majors: (live.majors || []).map((m) => ({
      id: m.id,
      name: m.name,
      alternativeNames: m.alternativeNames || [],
      faculty: m.faculty || 'General Faculty',
      degreeType: m.degreeType || 'Bachelor',
      durationYears: m.durationYears || 4,
      difficultyRating: m.difficultyRating || 3,
      difficultyReason: m.difficultyReason || 'Standard undergraduate workload',
      courseStructure: m.courseStructure || [],
      technicalSkillsGained: m.technicalSkillsGained || [],
      softSkillsGained: m.softSkillsGained || [],
      careerPathways: m.careerPathways || [],
      jobMarketDemand: m.jobMarketDemand || 'Moderate',
      demandReason: m.demandReason || 'Based on local graduate demand',
      averageStartingSalary: m.averageStartingSalary || 'Not specified',
      employerRequirements: m.employerRequirements || { basic: [], competitive: [] },
      recommendedFor: m.recommendedFor || [],
      notRecommendedIf: m.notRecommendedIf || 'Not specified',
      alternativeMajorSuggestions: m.alternativeMajorSuggestions || [],
    })),
    campusDescription: live.location,
    facilities: [],
    studentClubs: [],
    environmentHighlight: 'Student academic environment',
    annualTuitionUSD: live.annualTuitionUSD || 0,
    totalDegreeCostUSD: live.totalDegreeCostUSD || 0,
    paymentSchedule: 'Annual or semester installments',
    scholarships: {
      hasFullScholarship: false,
      scholarshipNames: [],
      financialAidAvailable: false,
      requirements: 'Check official admissions portal.',
      applicationDeadline: 'Not specified',
    },
    averageGraduateSalaryMonthlyUSD: 0,
    estimatedROIPaybackMonths: 0,
    employmentRate6Months: 0,
    averageTimeToJobMonths: 0,
    topAlumniCompanies: [],
    industryPartnerships: [],
    hasGuaranteedInternship: false,
    admissionRequirements: {
      gpaRequirement: 'Check admissions portal',
      nationalExamRequirement: 'Bac II Certificate',
      entranceExamRequired: false,
      entranceExamDetails: 'Check admissions portal',
      englishRequirement: 'Not specified',
    },
    applicationDifficulty: 'Medium',
    importantDates: {
      applicationOpens: 'Not specified',
      applicationDeadline: 'Not specified',
      examDate: 'Not specified',
      announcementDate: 'Not specified',
    },
    studentFit: {
      bestFor: [],
      notRecommendedFor: [],
    },
    dataConfidence: {
      level: isKnown ? 'verified' : 'community',
      stars: isKnown ? 4 : 3,
      sourceLabel: isKnown ? 'Official Registry' : 'Needs Verification',
      lastVerifiedDate: '2026-01-01',
      verificationMethod: 'Live catalog record',
    },
  };
}

export function mergeLiveUniversities(
  baseline: ComprehensiveUniversityProfile[],
  liveRecords: LiveUniversityRecord[]
): ComprehensiveUniversityProfile[] {
  if (!Array.isArray(liveRecords) || liveRecords.length === 0) {
    return normalizeUniversityMedia(baseline);
  }

  const byId = new Map<string, ComprehensiveUniversityProfile>();
  const byAbbr = new Map<string, ComprehensiveUniversityProfile>();
  for (const item of baseline) {
    byId.set(item.id.toLowerCase(), item);
    byAbbr.set(item.abbr.toLowerCase(), item);
  }

  const mergedIds = new Set<string>();
  const merged: ComprehensiveUniversityProfile[] = [];

  for (const live of liveRecords) {
    const match =
      byId.get(live.id.toLowerCase()) || byAbbr.get(live.abbr.toLowerCase());
    if (!match) {
      const created = buildFallbackUniversity(live);
      merged.push(created);
      mergedIds.add(created.id.toLowerCase());
      continue;
    }

    const isKnown = live.accreditation?.isKnown ?? match.accreditation.isKnown ?? true;
    const status = mapAccreditationStatus(
      live.accreditation?.status,
      isKnown,
      match.accreditation.status
    );

    mergedIds.add(match.id.toLowerCase());
    merged.push({
      ...match,
      name: live.name || match.name,
      khmerName: live.khmerName || match.khmerName,
      abbr: live.abbr || match.abbr,
      location: live.location || match.location,
      type: live.type || match.type,
      foundedYear: live.foundedYear || match.foundedYear,
      website: live.website || match.website,
      profileScore: live.profileScore || match.profileScore,
      annualTuitionUSD:
        typeof live.annualTuitionUSD === 'number' ? live.annualTuitionUSD : match.annualTuitionUSD,
      totalDegreeCostUSD:
        typeof live.totalDegreeCostUSD === 'number'
          ? live.totalDegreeCostUSD
          : match.totalDegreeCostUSD,
      accreditation: {
        ...match.accreditation,
        governmentRecognition: isKnown
          ? live.accreditation?.agency || match.accreditation.governmentRecognition
          : 'Not specified',
        status,
        isKnown,
      },
    });
  }

  for (const item of baseline) {
    if (!mergedIds.has(item.id.toLowerCase())) {
      merged.push(item);
    }
  }

  return normalizeUniversityMedia(merged);
}
