import { Router, Request, Response } from 'express';
import { LearningScienceEngine } from '../services/learningScienceEngine';
import { TeachingMethodService } from '../services/teachingMethodService';
import { KnowledgeMapService } from '../services/knowledgeMapService';
import { TeacherIntelligenceService } from '../services/teacherIntelligenceService';
import { ResearchRepository } from '../repositories/researchRepository';
import { PrivacyService } from '../services/privacyService';
import {
  authenticateToken,
  requireRole,
  resolveAuthorizedStudentId,
  AuthenticatedRequest,
} from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { RetentionForecastSchema } from '../validators/apiSchemas';
import { MasteryUpdateSchema, MisconceptionLogSchema } from '../validators/domainSchemas';
import { safeErrorMessage } from '../utils/httpErrors';

const router = Router();
const learningEngine = new LearningScienceEngine();
const teachingMethodService = new TeachingMethodService();
const knowledgeMapService = new KnowledgeMapService();
const teacherIntelligenceService = new TeacherIntelligenceService();
const researchRepo = new ResearchRepository();
const privacyService = new PrivacyService();

/** GET /api/learning-science/mastery/:studentId */
router.get('/mastery/:studentId', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const studentId = resolveAuthorizedStudentId(req, res, req.params.studentId);
    if (!studentId) return;
    const result = learningEngine.getStudentMasteryOverview(studentId);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: safeErrorMessage(err, 'Mastery lookup failed', 500) });
  }
});

/** POST /api/learning-science/mastery/update */
router.post('/mastery/update', authenticateToken, validate(MasteryUpdateSchema, 'body'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const body = req.body as Record<string, unknown>;
    const studentId = resolveAuthorizedStudentId(
      req,
      res,
      typeof body.studentId === 'string' ? body.studentId : undefined
    );
    if (!studentId) return;

    const conceptId = String(body.conceptId);
    const isCorrect = Boolean(body.isCorrect);

    const result = learningEngine.updateStudentMastery(studentId, conceptId, isCorrect, {
      name: typeof body.conceptName === 'string' ? body.conceptName : undefined,
      subject: typeof body.subject === 'string' ? body.subject : undefined,
    });

    if (privacyService.canCollectAnalytics(studentId)) {
      researchRepo.logResearchTelemetry({
        eventName: isCorrect ? 'learning_improvement' : 'student_progress_change',
        studentId,
        teachingMethod: typeof body.teachingMethod === 'string' ? body.teachingMethod : 'interactive',
        metricValue: result.updatedMastery,
        metadata: { conceptId, isCorrect, status: result.masteryStatus },
      });
    }

    res.json({ success: true, data: result });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: safeErrorMessage(err, 'Mastery update failed', 500) });
  }
});

/** GET /api/learning-science/zpd/:studentId */
router.get('/zpd/:studentId', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const studentId = resolveAuthorizedStudentId(req, res, req.params.studentId);
    if (!studentId) return;
    const subject = typeof req.query.subject === 'string' ? req.query.subject : undefined;
    const zpd = learningEngine.evaluateZPD(studentId, subject);
    res.json({ success: true, data: zpd });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: safeErrorMessage(err, 'ZPD lookup failed', 500) });
  }
});

/** POST /api/learning-science/retention-forecast */
router.post('/retention-forecast', validate(RetentionForecastSchema, 'body'), (req: Request, res: Response): void => {
  try {
    const { daysElapsed, reviewCount } = req.body as { daysElapsed: number; reviewCount: number };
    const forecast = learningEngine.forecastRetention(daysElapsed, reviewCount);
    res.json({ success: true, data: forecast });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: safeErrorMessage(err, 'Forecast failed', 500) });
  }
});

/** POST /api/learning-science/misconceptions/log */
router.post('/misconceptions/log', authenticateToken, validate(MisconceptionLogSchema, 'body'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const body = req.body as Record<string, unknown>;
    const studentId = resolveAuthorizedStudentId(
      req,
      res,
      typeof body.studentId === 'string' ? body.studentId : undefined
    );
    if (!studentId) return;

    const subject = String(body.subject);
    const misconceptionTitle = String(body.misconceptionTitle);

    const taxonomy:
      | 'conceptual_flaw'
      | 'calculation_slip'
      | 'careless_oversight'
      | 'missing_prerequisite'
      | 'language_comprehension' =
      body.errorTaxonomy === 'calculation_slip' ||
      body.errorTaxonomy === 'careless_oversight' ||
      body.errorTaxonomy === 'missing_prerequisite' ||
      body.errorTaxonomy === 'language_comprehension'
        ? body.errorTaxonomy
        : 'conceptual_flaw';
    const result = learningEngine.logMisconception({
      studentId,
      subject,
      topic: typeof body.topic === 'string' ? body.topic : 'General',
      misconceptionCode: typeof body.misconceptionCode === 'string' ? body.misconceptionCode : 'MISC-GEN-01',
      misconceptionTitle,
      errorTaxonomy: taxonomy,
      contextDetails: typeof body.contextDetails === 'string' ? body.contextDetails : '',
      suggestedIntervention:
        typeof body.suggestedIntervention === 'string'
          ? body.suggestedIntervention
          : 'Provide step-by-step Socratic scaffolding.',
    });

    res.json({ success: true, data: result });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: safeErrorMessage(err, 'Misconception log failed', 500) });
  }
});

/** GET /api/learning-science/teaching-methods */
router.get('/teaching-methods', (_req: Request, res: Response): void => {
  try {
    const summary = teachingMethodService.getComparisonSummary();
    res.json({ success: true, data: summary });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: safeErrorMessage(err, 'Failed to load teaching methods', 500) });
  }
});

/** GET /api/learning-science/knowledge-map */
router.get('/knowledge-map', (_req: Request, res: Response): void => {
  try {
    const aggregates = knowledgeMapService.getAggregates();
    res.json({ success: true, data: aggregates });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: safeErrorMessage(err, 'Failed to load knowledge map', 500) });
  }
});

/** GET /api/learning-science/education-report (admin only) */
router.get('/education-report', authenticateToken, requireRole('admin'), (_req: AuthenticatedRequest, res: Response): void => {
  try {
    const report = knowledgeMapService.generateEducationReport();
    res.json({ success: true, data: report });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: safeErrorMessage(err, 'Failed to generate report', 500) });
  }
});

/** GET /api/learning-science/teacher-intelligence (admin only) */
router.get('/teacher-intelligence', authenticateToken, requireRole('admin'), (_req: AuthenticatedRequest, res: Response): void => {
  try {
    const cohorts = teacherIntelligenceService.getClassCohorts();
    res.json({ success: true, data: cohorts });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: safeErrorMessage(err, 'Failed to load teacher cohorts', 500) });
  }
});

/** GET /api/learning-science/teacher-intelligence/:classId/plan (admin only) */
router.get('/teacher-intelligence/:classId/plan', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const plan = teacherIntelligenceService.generateInterventionPlan(req.params.classId);
    if (!plan) {
      res.status(404).json({ success: false, error: 'Class cohort not found.' });
      return;
    }
    res.json({ success: true, data: plan });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: safeErrorMessage(err, 'Failed to generate plan', 500) });
  }
});

/** GET /api/learning-science/telemetry (admin only) */
router.get('/telemetry', authenticateToken, requireRole('admin'), (_req: AuthenticatedRequest, res: Response): void => {
  try {
    const stats = researchRepo.getTelemetryStats();
    res.json({ success: true, data: stats });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: safeErrorMessage(err, 'Failed to load telemetry stats', 500) });
  }
});

export default router;
