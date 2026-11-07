/**
 * CDES DATA PLATFORM & EDUCATION INTELLIGENCE API ROUTES (Phase 14)
 */

import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { dataPlatformService } from '../services/dataPlatformService';
import { rateLimiter } from '../middleware/rateLimiter';
import { validate, validateField } from '../middleware/validationMiddleware';
import { z } from 'zod';
import { sanitizeForPublic } from '../services/privacyService';

const router = Router();

// 1. Data Architecture Overview (Task 1)
router.get('/overview', rateLimiter(60000, 50), (_req: Request, res: Response) => {
  try {
    const overview = dataPlatformService.getDataArchitectureOverview();
    res.json({ success: true, data: overview });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Education Knowledge Database (Task 2)
router.get('/knowledge-hub', rateLimiter(60000, 50), (_req: Request, res: Response) => {
  try {
    const hub = dataPlatformService.getEducationKnowledgeHub();
    res.json({ success: true, data: hub });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/knowledge-hub/search', rateLimiter(60000, 50), (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || '');
    const domain = req.query.domain ? String(req.query.domain) : undefined;
    const results = dataPlatformService.searchKnowledgeLake(query, domain);
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Student Intelligence Database (Task 3)
router.get('/student-dossier/:studentId?', authenticateToken, rateLimiter(60000, 30), (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.params.studentId;
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }
    // Ownership: student sees own dossier only; admin may view any
    if (req.user.role !== 'admin' && studentId !== req.user.userId) {
      res.status(403).json({ success: false, error: 'Forbidden: you can only view your own dossier.' });
      return;
    }
    const dossier = dataPlatformService.getStudentIntelligenceDossier(studentId);
    res.json({ success: true, data: dossier });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Data Collection System (Task 4)
router.get('/collection-matrix', rateLimiter(60000, 50), (_req: Request, res: Response) => {
  try {
    const matrix = dataPlatformService.getDataCollectionMatrix();
    res.json({ success: true, data: matrix });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. AI Data Pipeline (Task 5)
router.get('/ai-pipeline/status', rateLimiter(60000, 30), (_req: Request, res: Response) => {
  try {
    const status = dataPlatformService.getAIDataPipelineStatus();
    res.json({ success: true, data: status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post(
  '/ai-pipeline/test',
  rateLimiter(60000, 10),
  validate(z.object({
    test_type: z.enum(['dry_run', 'integration']),
    mock: z.boolean().optional(),
  }), 'body'),
  (req: Request, res: Response) => {
  try {
    const result = dataPlatformService.runDataPipelineTest(req.body || {});
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Closed-Loop AI Improvement Flywheel (Task 6)
router.get('/improvement-flywheel', rateLimiter(60000, 30), (_req: Request, res: Response) => {
  try {
    const flywheel = dataPlatformService.getImprovementFlywheelMetrics();
    res.json({ success: true, data: flywheel });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post(
  '/improvement-flywheel/record',
  authenticateToken,
  rateLimiter(60000, 20),
  validate(z.object({
    event_type: z.string().min(1).max(100),
    metadata: z.record(z.string(), z.any()).optional(),
  }), 'body'),
  (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = dataPlatformService.recordImprovementLoopEvent(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Data Governance & Sovereign Privacy (Task 7)
router.get('/governance/:studentId?', authenticateToken, rateLimiter(60000, 30), (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.params.studentId;
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }
    // Ownership: student sees own governance status only; admin may view any
    if (req.user.role !== 'admin' && studentId !== req.user.userId) {
      res.status(403).json({ success: false, error: 'Forbidden: you can only view your own governance status.' });
      return;
    }
    const status = dataPlatformService.getDataGovernanceStatus(studentId);
    res.json({ success: true, data: status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/governance/export/:studentId?', authenticateToken, rateLimiter(60000, 10), (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.params.studentId;
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }
    // Ownership: student sees own export only; admin may export any
    if (req.user.role !== 'admin' && studentId !== req.user.userId) {
      res.status(403).json({ success: false, error: 'Forbidden: you can only export your own data.' });
      return;
    }
    const exportData = dataPlatformService.exportSovereignStudentData(studentId);
    res.json({ success: true, data: exportData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8 & 9. Future Machine Learning (Tasks 8, 9)
router.get('/ml/registry', rateLimiter(60000, 30), (_req: Request, res: Response) => {
  try {
    const registry = dataPlatformService.getMLModelsRegistry();
    res.json({ success: true, data: registry });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post(
  '/ml/predict-bac2',
  authenticateToken,
  rateLimiter(60000, 10),
  validate(z.object({
    student_id: z.string().min(1).max(100),
    mock_scores: z.record(z.string(), z.number()).optional(),
  }), 'body'),
  (req: AuthenticatedRequest, res: Response) => {
  try {
    const { student_id: providedStudentId, mock_scores } = req.body || {};
    let targetStudentId = providedStudentId;
    if (!targetStudentId) {
      // Default to the authenticated user's own student ID
      targetStudentId = req.user?.userId;
    } else if (req.user && req.user.role !== 'admin' && targetStudentId !== req.user.userId) {
      res.status(403).json({ success: false, error: 'Forbidden: you can only predict your own Bac II grade.' });
      return;
    }
    const prediction = dataPlatformService.predictBacIIGrade(targetStudentId, mock_scores);
    res.json({ success: true, data: prediction });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post(
  '/ml/recommend-university',
  authenticateToken,
  rateLimiter(60000, 10),
  validate(z.object({
    student_id: z.string().min(1).max(100),
    criteria: z.record(z.string(), z.any()).optional(),
  }), 'body'),
  (req: AuthenticatedRequest, res: Response) => {
  try {
    const { student_id: providedStudentId, criteria } = req.body || {};
    let targetStudentId = providedStudentId;
    if (!targetStudentId) {
      targetStudentId = req.user?.userId;
    } else if (req.user && req.user.role !== 'admin' && targetStudentId !== req.user.userId) {
      res.status(403).json({ success: false, error: 'Forbidden: you can only get recommendations for your own profile.' });
      return;
    }
    const recommendations = dataPlatformService.recommendUniversityMajor(targetStudentId, criteria);
    res.json({ success: true, data: recommendations });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
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
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post(
  '/ml/career-gap',
  authenticateToken,
  rateLimiter(60000, 10),
  validate(z.object({
    student_id: z.string().min(1).max(100),
    career_id: z.string().min(1).max(100),
  }), 'body'),
  (req: AuthenticatedRequest, res: Response) => {
  try {
    const { student_id: providedStudentId, career_id } = req.body || {};
    let targetStudentId = providedStudentId;
    if (!targetStudentId) {
      targetStudentId = req.user?.userId;
    } else if (req.user && req.user.role !== 'admin' && targetStudentId !== req.user.userId) {
      res.status(403).json({ success: false, error: 'Forbidden: you can only check your own career gap.' });
      return;
    }
    const gap = dataPlatformService.calculateCareerSkillGap(targetStudentId, career_id);
    res.json({ success: true, data: gap });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
