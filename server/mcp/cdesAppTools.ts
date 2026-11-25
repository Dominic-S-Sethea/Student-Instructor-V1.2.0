import { ScholarshipRepository } from '../repositories/scholarshipRepository';
import { formatScholarshipRecord } from '../services/scholarshipFormatter';
import { UniversityService } from '../services/universityService';
import { LearningRepository } from '../repositories/learningRepository';
import { KnowledgeRepository } from '../repositories/knowledgeRepository';
import { CommunityRepository } from '../repositories/communityRepository';
import { UserRepository } from '../repositories/userRepository';
import { allTopUniversityPrograms } from '../../shared/data/topUniversities/index';

export interface McpSourceCitation {
  id: string;
  title: string;
  category: string;
  source: string;
  url?: string;
}

export interface McpToolExecutionResult {
  payload: unknown;
  citations: McpSourceCitation[];
}

const scholarshipRepo = new ScholarshipRepository();
const universityService = new UniversityService();
const learningRepo = new LearningRepository();
const knowledgeRepo = new KnowledgeRepository();
const communityRepo = new CommunityRepository();
const userRepo = new UserRepository();

export function runSearchScholarships(args: {
  query?: string;
  region?: string;
  degree?: string;
  field?: string;
  funding?: string;
  onlyVerified?: boolean;
  limit?: number;
}): McpToolExecutionResult {
  const rows = scholarshipRepo.getAll({
    q: args.query,
    region: args.region,
    degree: args.degree,
    field: args.field,
    funding: args.funding,
    onlyVerified: args.onlyVerified ?? true,
    sortBy: 'deadline_approaching',
  });
  const limit = Math.min(Math.max(args.limit || 8, 1), 20);
  const formatted = rows.slice(0, limit).map((row) => {
    const item = formatScholarshipRecord(row);
    return {
      id: item.id,
      name: item.name,
      nameKm: item.nameKm,
      provider: item.provider,
      country: item.country,
      region: item.region,
      degreeLevel: item.degreeLevel,
      fundingType: item.fundingType,
      monthlyAllowance: item.monthlyAllowance,
      insurance: item.insurance,
      totalEstimatedValueUSD: item.totalEstimatedValueUSD,
      deadline: item.deadline || (item.deadlineType === 'Rolling' ? 'Rolling' : 'Not specified'),
      deadlineStatus: item.deadlineStatus,
      daysRemaining: item.daysRemaining,
      verificationStatus: item.verificationStatus,
      officialSourceUrl: item.officialSourceUrl,
      applicationLink: item.applicationLink,
    };
  });

  return {
    payload: { totalMatches: rows.length, returned: formatted.length, scholarships: formatted },
    citations: formatted.slice(0, 4).map((s) => ({
      id: `sch:${s.id}`,
      title: s.name,
      category: 'Verified Scholarship',
      source: s.provider,
      url: s.officialSourceUrl || s.applicationLink,
    })),
  };
}

export function runGetScholarshipDetail(scholarshipId: string): McpToolExecutionResult {
  const row = scholarshipRepo.getById(scholarshipId);
  if (!row) {
    return { payload: { found: false, error: 'Scholarship not found.' }, citations: [] };
  }
  const item = formatScholarshipRecord(row);
  return {
    payload: { found: true, scholarship: item },
    citations: [
      {
        id: `sch:${item.id}`,
        title: item.name,
        category: 'Scholarship Dossier',
        source: item.provider,
        url: item.officialSourceUrl || item.applicationLink,
      },
    ],
  };
}

export function runSearchTopGlobalUniversities(args: {
  query?: string;
  region?: string;
  degree?: string;
  maxQsRank?: number;
  limit?: number;
}): McpToolExecutionResult {
  const q = (args.query || '').trim().toLowerCase();
  const region = (args.region || '').trim().toLowerCase();
  const degree = (args.degree || '').trim().toLowerCase();
  const maxRank = args.maxQsRank;

  const filtered = allTopUniversityPrograms.filter((prog) => {
    if (region && region !== 'all' && prog.region.toLowerCase() !== region) return false;
    if (degree && degree !== 'all' && !prog.degreeLevels.some((d) => d.toLowerCase().includes(degree))) {
      return false;
    }
    if (typeof maxRank === 'number' && typeof prog.qsWorldRank === 'number' && prog.qsWorldRank > maxRank) {
      return false;
    }
    if (q) {
      const hay = `${prog.universityName} ${prog.universityAbbr} ${prog.fellowshipName} ${prog.city} ${prog.country} ${prog.badge} ${prog.keyHighlights.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const limit = Math.min(Math.max(args.limit || 8, 1), 15);
  const items = filtered.slice(0, limit).map((p) => ({
    id: p.id,
    universityName: p.universityName,
    universityAbbr: p.universityAbbr,
    country: p.country,
    region: p.region,
    qsWorldRank: p.qsWorldRank,
    fellowshipName: p.fellowshipName,
    fellowshipType: p.fellowshipType,
    fundingCoverage: p.fundingCoverage,
    estimatedAnnualValueUSD: p.estimatedAnnualValueUSD,
    degreeLevels: p.degreeLevels,
    applicationDeadline: p.applicationDeadline,
    officialPortalUrl: p.officialPortalUrl,
  }));

  return {
    payload: { totalMatches: filtered.length, returned: items.length, programs: items },
    citations: items.slice(0, 4).map((p) => ({
      id: `topuni:${p.id}`,
      title: `${p.universityName} — ${p.fellowshipName}`,
      category: 'Top Global University Aid',
      source: `${p.country} (QS #${p.qsWorldRank})`,
      url: p.officialPortalUrl,
    })),
  };
}

export function runGetTopGlobalUniversityDetail(idOrName: string): McpToolExecutionResult {
  const needle = idOrName.trim().toLowerCase();
  const match = allTopUniversityPrograms.find(
    (p) => p.id.toLowerCase() === needle || p.universityAbbr.toLowerCase() === needle || p.universityName.toLowerCase().includes(needle)
  );
  if (!match) {
    return { payload: { found: false, error: 'Top global university program not found.' }, citations: [] };
  }
  return {
    payload: { found: true, program: match },
    citations: [{
      id: `topuni:${match.id}`,
      title: `${match.universityName} — ${match.fellowshipName}`,
      category: 'Top Global University Aid',
      source: `${match.country} (QS #${match.qsWorldRank})`,
      url: match.officialPortalUrl,
    }],
  };
}

export function runSearchCambodianUniversities(args: { query?: string; type?: string }): McpToolExecutionResult {
  const all = universityService.getUniversities();
  const q = (args.query || '').trim().toLowerCase();
  const t = (args.type || '').trim().toLowerCase();

  const filtered = all.filter((u) => {
    if (t && t !== 'all' && u.type.toLowerCase() !== t) return false;
    if (q) {
      const majorsText = u.majors.map((m) => m.name).join(' ');
      const hay = `${u.name} ${u.khmerName} ${u.abbr} ${u.location} ${majorsText}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const universities = filtered.map((u) => ({
    id: u.id,
    abbr: u.abbr,
    name: u.name,
    khmerName: u.khmerName,
    type: u.type,
    location: u.location,
    annualTuitionUSD: u.annualTuitionUSD,
    totalDegreeCostUSD: u.totalDegreeCostUSD,
    profileScore: u.profileScore,
    accreditation: u.accreditation,
    website: u.website,
    majors: u.majors.map((m) => ({
      id: m.id,
      name: m.name,
      degreeType: m.degreeType,
      durationYears: m.durationYears,
      difficultyRating: m.difficultyRating,
      jobMarketDemand: m.jobMarketDemand,
    })),
  }));

  return {
    payload: { totalMatches: universities.length, universities },
    citations: universities.slice(0, 4).map((u) => ({
      id: `uni:${u.id}`,
      title: `${u.abbr} — ${u.name}`,
      category: 'Cambodian University Catalog',
      source: `Tuition $${u.annualTuitionUSD}/yr • Accreditation: ${u.accreditation.status}`,
      url: u.website || undefined,
    })),
  };
}

export function runEvaluateMajorFit(args: {
  interests?: string[];
  mathAbility?: string;
  strengths?: string[];
  budgetTier?: string;
}): McpToolExecutionResult {
  const interests = args.interests || [];
  const strengths = args.strengths || [];
  const hatesMath = args.mathAbility === 'hates_math';
  const lovesCoding = interests.some((i) => i.toLowerCase().includes('tech')) || strengths.some((s) => s.toLowerCase().includes('logic'));
  const isBudgetLow = args.budgetTier === 'scholarship_dependent' || args.budgetTier === 'low_under_1000';

  let topMajor = 'Computer Science (Software Engineering)';
  let alternativeMajor = 'Business Information Systems';
  let suggestedSchools = ['CADT', 'ITC'];

  if (lovesCoding && hatesMath) {
    topMajor = 'UX/UI & Digital Product Design';
    alternativeMajor = 'Business Information Systems';
    suggestedSchools = ['CADT', 'Paragon'];
  } else if (lovesCoding && !hatesMath) {
    topMajor = 'Data Science & Artificial Intelligence';
    alternativeMajor = 'Software Engineering';
    suggestedSchools = ['CADT', 'ITC'];
  } else if (interests.some((i) => i.toLowerCase().includes('health'))) {
    topMajor = 'Doctor of Medicine (MD) or Pharmacy';
    alternativeMajor = 'Biomedical Laboratory Sciences';
    suggestedSchools = ['UHS'];
  } else if (interests.some((i) => i.toLowerCase().includes('business'))) {
    topMajor = 'Accounting & Finance (ACCA Track)';
    alternativeMajor = 'International Business & FinTech';
    suggestedSchools = ['CamEd', 'AUPP'];
  }

  return {
    payload: {
      isEstimate: true,
      estimateNote: 'Heuristic planning estimate — verify current tuition and admissions directly with each university.',
      topMajor,
      alternativeMajor,
      suggestedSchools,
      budgetGuidance: isBudgetLow
        ? 'Focus on MPTC Digital Skills Scholarship, state quotas at ITC/RUPP, or full international grants.'
        : 'Compare 4-year tuition ROI across public and private options.',
    },
    citations: [
      {
        id: 'decision:rule-engine',
        title: `Major Fit Planning Estimate: ${topMajor}`,
        category: 'Decision Engine',
        source: 'CDES Rule-Based Career Fit Engine (Estimate Only)',
      },
    ],
  };
}

export function runSearchLearningAndKnowledge(args: { query: string; limit?: number }): McpToolExecutionResult {
  const q = args.query.trim();
  const limit = Math.min(Math.max(args.limit || 5, 1), 10);
  const subjects = learningRepo.getSubjects();
  const contents = learningRepo.getLearningContents({ search: q }).slice(0, limit);
  const labs = learningRepo
    .getLabExperiments()
    .filter((l) => !q || `${l.title} ${l.description || ''} ${l.category || ''}`.toLowerCase().includes(q.toLowerCase()))
    .slice(0, limit);
  const knowledge = knowledgeRepo.semanticSearch(q || 'Cambodia university STEM scholarship', limit);

  return {
    payload: {
      subjectsCount: subjects.length,
      learningContents: contents.map((c) => ({
        id: c.id,
        title: c.title,
        subjectId: c.subject_id,
        contentType: c.content_type,
        difficulty: c.difficulty,
      })),
      stemLabs: labs.map((l) => ({
        id: l.id,
        title: l.title,
        category: l.category,
        description: l.description,
      })),
      knowledgeChunks: knowledge.map((k) => ({
        id: k.documentId,
        title: k.title,
        category: k.category,
        snippet: k.snippet,
        source: k.source,
      })),
    },
    citations: knowledge.slice(0, 3).map((k) => ({
      id: `know:${k.documentId}`,
      title: k.title,
      category: k.category || 'Knowledge Library',
      source: k.source || 'CDES Study Library',
    })),
  };
}

export function runSearchCommunityAndEvents(args: { category?: string; query?: string }): McpToolExecutionResult {
  const communities = communityRepo.getAllCommunities(args.category) as Array<Record<string, unknown>>;
  const posts = communityRepo.getCommunityPosts() as Array<Record<string, unknown>>;
  const q = (args.query || '').trim().toLowerCase();

  const matchingPosts = posts
    .filter((p) => !q || `${String(p.title || '')} ${String(p.content || '')} ${String(p.post_type || '')}`.toLowerCase().includes(q))
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      title: p.title,
      postType: p.post_type,
      createdAt: p.created_at,
    }));

  return {
    payload: {
      communities: communities.slice(0, 8).map((c) => ({
        id: c.id,
        name: c.name,
        category: c.category,
        memberCount: c.member_count,
      })),
      discussions: matchingPosts,
    },
    citations: [
      {
        id: 'community:directory',
        title: 'CDES Student Communities & Study Discussions',
        category: 'Community Hall',
        source: 'Published student communities (PII excluded)',
      },
    ],
  };
}

export function runGetMyStudyProfile(userId: string | null): McpToolExecutionResult {
  if (!userId) {
    return {
      payload: { authenticated: false, message: 'Guest session — sign in to access private study profile.' },
      citations: [],
    };
  }
  const profile = userRepo.getProfileByUserId(userId);
  const education = profile ? userRepo.getEducationHistory(profile.id) : [];
  return {
    payload: {
      authenticated: true,
      profile: profile ? {
        name: profile.name,
        educationLevel: profile.education_level,
        school: profile.school,
        major: profile.major,
        targetCareer: profile.target_career,
        location: profile.location,
        language: profile.language,
      } : null,
      educationHistory: education.map((e) => ({ institution: e.institution, degree: e.degree, achievements: e.achievements })),
    },
    citations: profile ? [{
      id: `profile:${profile.id}`,
      title: `Private Study Profile (${profile.education_level})`,
      category: 'Student Profile',
      source: 'Authenticated user account',
    }] : [],
  };
}
