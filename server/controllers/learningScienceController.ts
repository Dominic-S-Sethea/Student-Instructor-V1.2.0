/**
 * CDES Learning Science & Research API Controller
 * Exposes endpoints for:
 * 1. Bayesian Knowledge Tracing (BKT) student mastery state & updates
 * 2. Dynamic Zone of Proximal Development (ZPD) difficulty adjustment
 * 3. Ebbinghaus Spaced Memory Decay modeling
 * 4. Diagnostic Misconception Logging
 * 5. Teaching Method Comparative Analysis
 * 6. Education Knowledge Map & Provincial Readiness
 * 7. Teacher Intelligence Cohort Analytics & Interventions
 * 8. Exportable National Education Reports
 */

import { Router, Request, Response } from 'express';
import { LearningScienceEngine } from '../services/learningScienceEngine';
import { TeachingMethodService } from '../services/teachingMethodService';
import { KnowledgeMapService } from '../services/knowledgeMapService';
import { TeacherIntelligenceService } from '../services/teacherIntelligenceService';
import { ResearchRepository } from '../repositories/researchRepository';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();
const learningEngine = new LearningScienceEngine();
const teachingMethodService = new TeachingMethodService();
const knowledgeMapService = new KnowledgeMapService();
const teacherIntelligenceService = new TeacherIntelligenceService();
const researchRepo = new ResearchRepository();

/**
 * @route GET /api/learning-science/mastery/:studentId
 * @desc Get student BKT mastery states across STEM concepts
 */
router.get('/mastery/:studentId', (req: Request, res: Response): void => {
  try {
    const studentId = req.params.studentId || 'usr-student-01';
    const result = learningEngine.getStudentMasteryOverview(studentId);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route POST /api/learning-science/mastery/update
 * @desc Update student BKT mastery probability given question attempt
 */
router.post('/mastery/update', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const studentId = req.body.studentId || req.user?.userId || 'usr-student-01';
    const { conceptId, isCorrect, conceptName, subject } = req.body;

    if (!conceptId || typeof isCorrect !== 'boolean') {
      res.status(400).json({ success: false, error: 'conceptId and boolean isCorrect are required.' });
      return;
    }

    const result = learningEngine.updateStudentMastery(studentId, conceptId, isCorrect, {
      name: conceptName,
      subject,
    });

    // Track telemetry event (Task 9)
    researchRepo.logResearchTelemetry({
      eventName: isCorrect ? 'learning_improvement' : 'student_progress_change',
      studentId,
      teachingMethod: req.body.teachingMethod || 'interactive',
      metricValue: result.updatedMastery,
      metadata: { conceptId, isCorrect, status: result.masteryStatus },
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route GET /api/learning-science/zpd/:studentId
 * @desc Evaluate Zone of Proximal Development (ZPD) and dynamic difficulty
 */
router.get('/zpd/:studentId', (req: Request, res: Response): void => {
  try {
    const studentId = req.params.studentId || 'usr-student-01';
    const subject = req.query.subject as string | undefined;
    const zpd = learningEngine.evaluateZPD(studentId, subject);
    res.json({ success: true, data: zpd });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route POST /api/learning-science/retention-forecast
 * @desc Calculate Ebbinghaus memory decay retention forecast
 */
router.post('/retention-forecast', (req: Request, res: Response): void => {
  try {
    const { daysElapsed, reviewCount } = req.body;
    const days = typeof daysElapsed === 'number' ? daysElapsed : 7;
    const reviews = typeof reviewCount === 'number' ? reviewCount : 1;
    const forecast = learningEngine.forecastRetention(days, reviews);
    res.json({ success: true, data: forecast });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route POST /api/learning-science/misconceptions/log
 * @desc Log student diagnostic misconception with error taxonomy
 */
router.post('/misconceptions/log', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const studentId = req.body.studentId || req.user?.userId || 'usr-student-01';
    const {
      subject,
      topic,
      misconceptionCode,
      misconceptionTitle,
      errorTaxonomy,
      contextDetails,
      suggestedIntervention,
    } = req.body;

    if (!subject || !misconceptionTitle) {
      res.status(400).json({ success: false, error: 'subject and misconceptionTitle are required.' });
      return;
    }

    const result = learningEngine.logMisconception({
      studentId,
      subject: subject || 'STEM Foundations',
      topic: topic || 'General',
      misconceptionCode: misconceptionCode || 'MISC-GEN-01',
      misconceptionTitle,
      errorTaxonomy: errorTaxonomy || 'conceptual_flaw',
      contextDetails: contextDetails || '',
      suggestedIntervention: suggestedIntervention || 'Provide step-by-step Socratic scaffolding.',
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route GET /api/learning-science/teaching-methods
 * @desc Compare Traditional vs Interactive vs AI-Assisted vs Game-Based methods
 */
router.get('/teaching-methods', (_req: Request, res: Response): void => {
  try {
    const summary = teachingMethodService.getComparisonSummary();
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route GET /api/learning-science/knowledge-map
 * @desc Aggregated Cambodia education knowledge aggregates & provincial readiness
 */
router.get('/knowledge-map', (_req: Request, res: Response): void => {
  try {
    const aggregates = knowledgeMapService.getAggregates();
    res.json({ success: true, data: aggregates });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route GET /api/learning-science/education-report
 * @desc Generate exportable national education research report
 */
router.get('/education-report', (_req: Request, res: Response): void => {
  try {
    const report = knowledgeMapService.generateEducationReport();
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route GET /api/learning-science/teacher-intelligence
 * @desc Get class cohort analytics and difficulty patterns for teachers
 */
router.get('/teacher-intelligence', (_req: Request, res: Response): void => {
  try {
    const cohorts = teacherIntelligenceService.getClassCohorts();
    res.json({ success: true, data: cohorts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route GET /api/learning-science/teacher-intelligence/:classId/plan
 * @desc Get targeted pedagogical intervention plan for a specific class
 */
router.get('/teacher-intelligence/:classId/plan', (req: Request, res: Response): void => {
  try {
    const plan = teacherIntelligenceService.generateInterventionPlan(req.params.classId);
    if (!plan) {
      res.status(404).json({ success: false, error: 'Class cohort not found.' });
      return;
    }
    res.json({ success: true, data: plan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route GET /api/learning-science/telemetry
 * @desc Get research telemetry stats (Task 9)
 */
router.get('/telemetry', (_req: Request, res: Response): void => {
  try {
    const stats = researchRepo.getTelemetryStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
