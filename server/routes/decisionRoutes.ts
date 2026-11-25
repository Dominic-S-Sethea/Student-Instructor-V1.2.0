import { Router, Response } from 'express';
import { AnalyticsRepository } from '../repositories/analyticsRepository';
import { PrivacyService } from '../services/privacyService';
import { hermesMemoryService } from '../services/hermesMemoryService';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';

const decisionLimiter = rateLimiter(60_000, 30, 'Too many major-fit evaluations. Please wait a minute.');

export function createDecisionRouter(): Router {
  const router = Router();
  const analyticsRepo = new AnalyticsRepository();
  const privacyService = new PrivacyService();

  router.post('/evaluate', optionalAuth, decisionLimiter, (req: AuthenticatedRequest, res: Response): void => {
    const body = (req.body || {}) as {
      interests?: string[];
      mathAbility?: string;
      strengths?: string[];
      budgetTier?: string;
      workStyle?: string;
      careerGoal?: string;
    };

    const interests = Array.isArray(body.interests) ? body.interests : [];
    const strengths = Array.isArray(body.strengths) ? body.strengths : [];
    const mathAbility = body.mathAbility || '';
    const budgetTier = body.budgetTier || '';
    const workStyle = typeof body.workStyle === 'string' ? body.workStyle : '';
    const careerGoal = typeof body.careerGoal === 'string' ? body.careerGoal : '';

    const hatesMath = mathAbility === 'hates_math';
    const lovesCoding = interests.includes('Technology') || strengths.includes('Logic');
    const isBudgetLow = budgetTier === 'scholarship_dependent' || budgetTier === 'low_under_1000';

    let topMajor = 'Computer Science (Software Engineering)';
    let alternativeMajor = '';
    let track: 'tech_design' | 'tech_cs' | 'health' | 'business' = 'tech_cs';
    let fitReason = 'Rule-based pathway match using declared interests and problem-solving preferences.';

    if (lovesCoding && hatesMath) {
      track = 'tech_design';
      topMajor = 'UX/UI & Digital Product Design';
      alternativeMajor = 'Business Information Systems';
      fitReason =
        'Strong digital product interest paired with preference against heavy calculus points toward Product Design or Business Information Systems.';
    } else if (lovesCoding && !hatesMath) {
      track = 'tech_cs';
      topMajor = 'Data Science & Artificial Intelligence';
      alternativeMajor = 'Software Engineering';
      fitReason = 'Strong mathematics confidence paired with technology interest aligns with Data Science and Software Engineering.';
    } else if (interests.includes('Healthcare') || strengths.includes('Science')) {
      track = 'health';
      topMajor = 'Doctor of Medicine (MD) or Pharmacy';
      alternativeMajor = 'Biomedical Laboratory Sciences';
      fitReason = 'Science strength aligns with national health sciences programs.';
    } else if (interests.includes('Business') || strengths.includes('Communication')) {
      track = 'business';
      topMajor = 'Accounting & Finance (ACCA Track)';
      alternativeMajor = 'International Business & FinTech';
      fitReason = 'Business and communication strengths align with finance and management tracks.';
    }

    const styleHints: string[] = [];
    if (workStyle) styleHints.push(`study style (${workStyle.replace(/_/g, ' ')})`);
    if (careerGoal) styleHints.push(`career goal (${careerGoal.replace(/_/g, ' ')})`);
    if (styleHints.length > 0) {
      fitReason = `${fitReason} Considered ${styleHints.join(' and ')}.`;
    }

    const recommendedUniversities: Array<Record<string, unknown>> = [];
    if (track === 'tech_design') {
      recommendedUniversities.push({
        univId: 'univ-cadt',
        univName: 'Cambodia Academy of Digital Technology',
        univAbbr: 'CADT',
        profileScore: 93,
        annualTuitionUSD: 1600,
        scholarshipMatch: isBudgetLow ? 'MPTC Digital Scholarship (Verify current cycle cutoff)' : 'Digital Innovation Merit Track',
        curriculumStyle: 'Project-based digital product design & frontend engineering',
        whyFit: 'Dedicated digital product design, UI/UX prototyping, and applied software curriculum.',
      });
      recommendedUniversities.push({
        univId: 'univ-rupp',
        univName: 'Royal University of Phnom Penh',
        univAbbr: 'RUPP',
        profileScore: 89,
        annualTuitionUSD: 800,
        scholarshipMatch: isBudgetLow ? 'State Higher Education Scholarship Quota' : 'Standard Design & Computing Track',
        curriculumStyle: 'Applied information systems & multimedia studio',
        whyFit: 'Accessible tuition with interdisciplinary digital design and business systems electives.',
      });
    } else if (track === 'tech_cs') {
      recommendedUniversities.push({
        univId: 'univ-cadt',
        univName: 'Cambodia Academy of Digital Technology',
        univAbbr: 'CADT',
        profileScore: 93,
        annualTuitionUSD: 1600,
        scholarshipMatch: isBudgetLow ? 'MPTC Digital Scholarship (Verify current cycle cutoff)' : 'Merit Track',
        curriculumStyle: 'Project-based software engineering',
        whyFit: 'Published public tech curriculum focus.',
      });
      recommendedUniversities.push({
        univId: 'univ-itc',
        univName: 'Institute of Technology of Cambodia',
        univAbbr: 'ITC',
        profileScore: 95,
        annualTuitionUSD: 700,
        scholarshipMatch: isBudgetLow ? 'State Scholarship Quota' : 'Standard Engineering Track',
        curriculumStyle: '2-Year Tronc Commun engineering foundation',
        whyFit: 'Established engineering track with published low state tuition.',
      });
    } else if (track === 'business') {
      recommendedUniversities.push({
        univId: 'univ-camed',
        univName: 'CamEd Business School',
        univAbbr: 'CamEd',
        profileScore: 93,
        annualTuitionUSD: 2400,
        scholarshipMatch: 'Academic Merit (verify cycle terms)',
        curriculumStyle: 'Accounting & finance focus',
        whyFit: 'Dedicated business & accounting institution.',
      });
    } else {
      recommendedUniversities.push({
        univId: 'univ-uhs',
        univName: 'University of Health Sciences',
        univAbbr: 'UHS',
        profileScore: 96,
        annualTuitionUSD: 1800,
        scholarshipMatch: 'National Medical Quota',
        curriculumStyle: 'Clinical rotations & medical sciences',
        whyFit: 'National health sciences curriculum.',
      });
    }

    const targetTuition = Number(recommendedUniversities[0]?.annualTuitionUSD || 1200);
    const isScholarship = budgetTier === 'scholarship_dependent';
    const effectiveCost = isScholarship ? 0 : targetTuition * 4;
    const estimatedMonthlySalaryUSD = 800;
    const paybackMonths = isScholarship ? 0 : Math.round((effectiveCost / (estimatedMonthlySalaryUSD * 0.5)) * 10) / 10;

    const unavailableData: string[] = ['verified_graduate_salary_survey', 'personal_bac_ii_transcript_scores'];
    if (!req.user) {
      unavailableData.push('authenticated_student_profile');
    }

    const persisted = Boolean(req.user && privacyService.canCollectAnalytics(req.user.userId));
    if (persisted && req.user) {
      analyticsRepo.logActivityEvent({
        user_id: req.user.userId,
        student_id: req.user.userId,
        event_type: 'DECISION_EVALUATION',
        metadata: { topMajor, isBudgetLow, effectiveCost },
      });
    }

    if (req.user && privacyService.canUseAIMemory(req.user.userId)) {
      const topUniAbbrs = recommendedUniversities.map((u) => String(u.univAbbr || '')).filter(Boolean).join(', ');
      hermesMemoryService.addFact(req.user.userId, {
        category: 'milestone',
        factText: `Completed Major Fit Quiz: matched ${topMajor}${alternativeMajor ? ` (alt: ${alternativeMajor})` : ''}; target budget: ${budgetTier || 'not specified'}${topUniAbbrs ? `; suggested schools: ${topUniAbbrs}` : ''}.`,
        source: 'app_milestone',
        entities: ['user', topMajor, ...recommendedUniversities.map((u) => String(u.univAbbr || '')).filter(Boolean)],
      });
    }

    res.json({
      success: true,
      mode: 'rule_based',
      isEstimate: true,
      persisted,
      sources: ['cdes_decision_rule_table', 'published_tuition_reference'],
      unavailableData,
      recommendations: {
        topMajor,
        alternativeMajor,
        fitReason,
        recommendedUniversities,
        roiAnalysis: {
          isEstimate: true,
          estimateNote: 'Tuition and graduate salary figures are heuristic planning estimates, not guaranteed outcomes.',
          estimatedDegreeCostUSD: effectiveCost,
          projectedMonthlySalaryUSD: estimatedMonthlySalaryUSD,
          paybackMonths,
          financialVerdict: isScholarship
            ? 'Estimated zero tuition assumes full scholarship award.'
            : `Estimated 4-year tuition of $${effectiveCost} corresponds to ~${paybackMonths} months payback under benchmark assumptions.`,
        },
        actionChecklist: [
          {
            stepNumber: 1,
            title: 'Review Core Entrance Subjects',
            deadline: 'Upcoming National Exam Preparation',
            instructions: hatesMath
              ? 'Prioritize English, Logic, and Design fundamentals.'
              : 'Prioritize Calculus, Physics, and analytical problem solving.',
            completed: false,
          },
          {
            stepNumber: 2,
            title: 'Confirm University & Scholarship Cutoffs',
            deadline: 'Verify on Official Source URL',
            instructions: `Verify current tuition and application window for ${String(recommendedUniversities[0]?.univAbbr || 'your target university')}.`,
            completed: false,
          },
        ],
      },
    });
  });

  return router;
}
