import { Router, Response } from 'express';
import { LearningAnalyticsEngine } from '../services/learningAnalyticsEngine';
import { AIPipelineService } from '../services/aiPipelineService';
import {
  authenticateToken,
  resolveAuthorizedStudentId,
  AuthenticatedRequest,
} from '../middleware/authMiddleware';
import { safeErrorMessage } from '../utils/httpErrors';

const router = Router();
const engine = new LearningAnalyticsEngine();
const aiPipeline = new AIPipelineService(engine);

/** GET /api/student/profile/intelligence */
router.get('/intelligence', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const studentId = resolveAuthorizedStudentId(req, res);
    if (!studentId) return;
    const analytics = engine.evaluateStudentIntelligence(studentId);

    res.json({
      success: true,
      data: {
        studentId: analytics.profile.studentId,
        learningStyle: analytics.profile.learningPreferences,
        progress: analytics.learning,
        strengths: analytics.profile.subjectStrengths,
        weaknesses: analytics.profile.subjectWeaknesses,
        interestPatterns: analytics.profile.interestPatterns,
        scores: {
          engagement: analytics.profile.engagementScore,
          persistence: analytics.profile.persistenceScore,
          problemSolving: analytics.profile.problemSolvingScore,
        },
        recommendations: analytics.recommendations,
        engagementMetrics: analytics.engagement,
        behaviorMetrics: analytics.behavior,
        updatedAt: analytics.profile.updatedAt,
      },
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: safeErrorMessage(err, 'Failed to compute student intelligence profile.', 500),
    });
  }
});

/** GET /api/student/profile/intelligence/:studentId */
router.get('/intelligence/:studentId', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const targetStudentId = resolveAuthorizedStudentId(req, res, req.params.studentId);
    if (!targetStudentId) return;
    const analytics = engine.evaluateStudentIntelligence(targetStudentId);

    res.json({
      success: true,
      data: {
        studentId: analytics.profile.studentId,
        learningStyle: analytics.profile.learningPreferences,
        progress: analytics.learning,
        strengths: analytics.profile.subjectStrengths,
        weaknesses: analytics.profile.subjectWeaknesses,
        interestPatterns: analytics.profile.interestPatterns,
        scores: {
          engagement: analytics.profile.engagementScore,
          persistence: analytics.profile.persistenceScore,
          problemSolving: analytics.profile.problemSolvingScore,
        },
        recommendations: analytics.recommendations,
        engagementMetrics: analytics.engagement,
        behaviorMetrics: analytics.behavior,
        updatedAt: analytics.profile.updatedAt,
      },
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: safeErrorMessage(err, 'Failed to load student intelligence profile.', 500),
    });
  }
});

/** POST /api/student/profile/recalculate */
router.post('/recalculate', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const requested = typeof req.body?.studentId === 'string' ? req.body.studentId : undefined;
    const studentId = resolveAuthorizedStudentId(req, res, requested);
    if (!studentId) return;
    const analytics = engine.evaluateStudentIntelligence(studentId);

    res.json({
      success: true,
      message: 'Student intelligence profile dynamically re-evaluated from behavioral event stream.',
      data: analytics,
    });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: safeErrorMessage(err, 'Failed to recalculate intelligence profile.', 500),
    });
  }
});

/** GET /api/student/profile/ai-context */
router.get('/ai-context', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const requested = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
    const studentId = resolveAuthorizedStudentId(req, res, requested);
    if (!studentId) return;
    const context = aiPipeline.generateAIContext(studentId);

    res.json({ success: true, data: context });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: safeErrorMessage(err, 'Failed to fetch AI context.', 500),
    });
  }
});

export default router;
