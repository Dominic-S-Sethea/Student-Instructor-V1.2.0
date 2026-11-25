/**
 * CDES DATA PLATFORM & EDUCATION INTELLIGENCE API ROUTES (Phase 14)
 */

import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole, resolveAuthorizedStudentId, AuthenticatedRequest } from '../middleware/authMiddleware';
import { dataPlatformService } from '../services/dataPlatformService';
import { rateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validationMiddleware';
import { safeErrorMessage } from '../utils/httpErrors';
import { z } from 'zod';

const router = Router();

function sendPlatformError(res: Response, err: unknown, fallback: string): void {
  res.status(500).json({ success: false, error: safeErrorMessage(err, fallback, 500) });
}

// 1. Data Architecture Overview (Task 1)
router.get('/overview', rateLimiter(60000, 50), (_req: Request, res: Response) => {
  try {
    const overview = dataPlatformService.getDataArchitectureOverview();
    res.json({ success: true, data: overview });
  } catch (err: unknown) {
    sendPlatformError(res, err, 'Failed to load overview');
  }
});

// 2. Education Knowledge Database (Task 2)
router.get('/knowledge-hub', rateLimiter(60000, 50), (_req: Request, res: Response) => {
  try {
    const hub = dataPlatformService.getEducationKnowledgeHub();
    res.json({ success: true, data: hub });
  } catch (err: unknown) {
    sendPlatformError(res, err, 'Failed to load knowledge hub');
  }
});

router.get('/knowledge-hub/search', rateLimiter(60000, 50), (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || '');
    const domain = req.query.domain ? String(req.query.domain) : undefined;
    const results = dataPlatformService.searchKnowledgeLake(query, domain);
    res.json({ success: true, data: results });
  } catch (err: unknown) {
    sendPlatformError(res, err, 'Search failed');
  }
});

// 3. Student Intelligence Database (Task 3)
router.get('/student-dossier/:studentId?', authenticateToken, rateLimiter(60000, 30), (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = resolveAuthorizedStudentId(req, res, req.params.studentId);
    if (!studentId) return;
    const dossier = dataPlatformService.getStudentIntelligenceDossier(studentId);
    res.json({ success: true, data: dossier });
  } catch (err: unknown) {
    sendPlatformError(res, err, 'Failed to load dossier');
  }
});

// 4. Data Collection System (Task 4)
router.get('/collection-matrix', authenticateToken, requireRole('admin'), rateLimiter(60000, 50), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const matrix = dataPlatformService.getDataCollectionMatrix();
    res.json({ success: true, data: matrix });
  } catch (err: unknown) {
    sendPlatformError(res, err, 'Failed to load matrix');
  }
});

// 5. AI Data Pipeline (Task 5)
router.get('/ai-pipeline/status', authenticateToken, requireRole('admin'), rateLimiter(60000, 30), (_req: AuthenticatedRequest, res: Response) => {
  try {
    const status = dataPlatformService.getAIDataPipelineStatus();
    res.json({ success: true, data: status });
  } catch (err: unknown) {
    sendPlatformError(res, err, 'Failed to load pipeline status');
  }
});

router.post(
  '/ai-pipeline/test',
  authenticateToken,
  requireRole('admin'),
  rateLimiter(60000, 10),
  validate(z.object({
    test_type: z.enum(['dry_run', 'integration']),
    mock: z.boolean().optional(),
  }), 'body'),
  (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = dataPlatformService.runDataPipelineTest(req.body || {});
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    sendPlatformError(res, err, 'Pipeline test failed');
  }
});

// 6. Closed-Loop AI Improvement Flywheel (Task 6)
router.get('/improvement-flywheel', rateLimiter(60000, 30), (_req: Request, res: Response) => {
  try {
    const flywheel = dataPlatformService.getImprovementFlywheelMetrics();
    res.json({ success: true, data: flywheel });
  } catch (err: unknown) {
    sendPlatformError(res, err, 'Failed to load flywheel metrics');
  }
});

router.post(
  '/improvement-flywheel/record',
  authenticateToken,
  rateLimiter(60000, 20),
  validate(z.object({
    recommendation_type: z.enum(['university_program', 'scholarship_application', 'learning_drill', 'career_pathway']),
    candidate_id: z.string().min(1).max(120),
    candidate_title: z.string().min(1).max(200),
    confidence_score: z.number().min(0).max(100).default(75),
    action_taken: z.enum(['viewed', 'saved', 'applied', 'drilled', 'completed', 'dismissed']),
    outcome_metric_name: z.string().min(1).max(120).default('engagement_score'),
    baseline_metric_value: z.number().default(0),
    post_outcome_metric_value: z.number().default(0),
  }), 'body'),
  (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = dataPlatformService.recordImprovementLoopEvent({
      ...(req.body as Record<string, unknown>),
      student_id: req.user!.userId,
    } as Parameters<typeof dataPlatformService.recordImprovementLoopEvent>[0]);
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    sendPlatformError(res, err, 'Failed to record flywheel event');
  }
});

// 7. Data Governance & Sovereign Privacy (Task 7)
router.get('/governance/export/:studentId?', authenticateToken, rateLimiter(60000, 10), (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = resolveAuthorizedStudentId(req, res, req.params.studentId);
    if (!studentId) return;
    const exportData = dataPlatformService.exportSovereignStudentData(studentId);
    res.json({ success: true, data: exportData });
  } catch (err: unknown) {
    sendPlatformError(res, err, 'Export failed');
  }
});

router.get('/governance/:studentId?', authenticateToken, rateLimiter(60000, 30), (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = resolveAuthorizedStudentId(req, res, req.params.studentId);
    if (!studentId) return;
    const status = dataPlatformService.getDataGovernanceStatus(studentId);
    res.json({ success: true, data: status });
  } catch (err: unknown) {
    sendPlatformError(res, err, 'Governance lookup failed');
  }
});

// 8 & 9. Future Machine Learning (Tasks 8, 9)
router.get('/ml/registry', rateLimiter(60000, 30), (_req: Request, res: Response) => {
  try {
    const registry = dataPlatformService.getMLModelsRegistry();
    res.json({ success: true, data: registry });
  } catch (err: unknown) {
    sendPlatformError(res, err, 'Failed to fetch ML registry');
  }
});

router.post(
  '/ml/predict-bac2',
  authenticateToken,
  rateLimiter(60000, 10),
  validate(z.object({
    student_id: z.string().min(1).max(100).optional(),
    mock_scores: z.record(z.string(), z.number()).optional(),
  }), 'body'),
  (req: AuthenticatedRequest, res: Response) => {
  try {
    const { student_id: providedStudentId, mock_scores } = req.body || {};
    const targetStudentId = resolveAuthorizedStudentId(req, res, providedStudentId);
    if (!targetStudentId) return;
    const prediction = dataPlatformService.predictBacIIGrade(targetStudentId, mock_scores);
    res.json({ success: true, data: prediction });
  } catch (err: unknown) {
    sendPlatformError(res, err, 'Prediction failed');
  }
});

router.post(
  '/ml/recommend-university',
  authenticateToken,
  rateLimiter(60000, 10),
  validate(z.object({
    student_id: z.string().min(1).max(100).optional(),
    criteria: z.record(z.string(), z.unknown()).optional(),
  }), 'body'),
  (req: AuthenticatedRequest, res: Response) => {
  try {
    const { student_id: providedStudentId, criteria } = req.body || {};
    const targetStudentId = resolveAuthorizedStudentId(req, res, providedStudentId);
    if (!targetStudentId) return;
    const recommendations = dataPlatformService.recommendUniversityMajor(targetStudentId, criteria);
    res.json({ success: true, data: recommendations });
  } catch (err: unknown) {
    sendPlatformError(res, err, 'Recommendation failed');
  }
});

router.post(
  '/ml/spaced-repetition',
  authenticateToken,
  rateLimiter(60000, 20),
  validate(z.object({
    concept_id: z.string().min(1).max(100),
    repetition_count: z.number().int().min(1).max(20),
  }), 'body'),
  (req: AuthenticatedRequest, res: Response) => {
  try {
    const { concept_id, repetition_count } = req.body || {};
    const schedule = dataPlatformService.calculateSpacedRepetitionSchedule(concept_id, repetition_count);
    res.json({ success: true, data: schedule });
  } catch (err: unknown) {
    sendPlatformError(res, err, 'Schedule failed');
  }
});

router.post(
  '/ml/career-gap',
  authenticateToken,
  rateLimiter(60000, 10),
  validate(z.object({
    student_id: z.string().min(1).max(100).optional(),
    career_id: z.string().min(1).max(100),
  }), 'body'),
  (req: AuthenticatedRequest, res: Response) => {
  try {
    const { student_id: providedStudentId, career_id } = req.body || {};
    const targetStudentId = resolveAuthorizedStudentId(req, res, providedStudentId);
    if (!targetStudentId) return;
    const gap = dataPlatformService.calculateCareerSkillGap(targetStudentId, career_id);
    res.json({ success: true, data: gap });
  } catch (err: unknown) {
    sendPlatformError(res, err, 'Career gap failed');
  }
});

export default router;
