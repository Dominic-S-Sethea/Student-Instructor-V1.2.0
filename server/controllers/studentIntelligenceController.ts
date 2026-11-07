import { Router, Response } from 'express';
import { LearningAnalyticsEngine } from '../services/learningAnalyticsEngine';
import { AIPipelineService } from '../services/aiPipelineService';
import { authenticateToken, optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();
const engine = new LearningAnalyticsEngine();
const aiPipeline = new AIPipelineService(engine);

/**
 * @route GET /api/student/profile/intelligence
 * @desc Get dynamic intelligence profile for the logged in student (or default student)
 * Returns: learning style, progress, strengths, recommendations
 */
router.get('/intelligence', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const studentId = req.user?.userId || 'usr-student-01';
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
          problemSolving: analytics.profile.problemSolvingScore
        },
        recommendations: analytics.recommendations,
        engagementMetrics: analytics.engagement,
        behaviorMetrics: analytics.behavior,
        updatedAt: analytics.profile.updatedAt
      }
    });
  } catch (err: any) {
    console.error('Failed to load student intelligence profile:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to compute student intelligence profile.' });
  }
});

/**
 * @route GET /api/student/profile/intelligence/:studentId
 * @desc Get dynamic intelligence profile for a specific student
 */
router.get('/intelligence/:studentId', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const targetStudentId = req.params.studentId || 'usr-student-01';
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
          problemSolving: analytics.profile.problemSolvingScore
        },
        recommendations: analytics.recommendations,
        engagementMetrics: analytics.engagement,
        behaviorMetrics: analytics.behavior,
        updatedAt: analytics.profile.updatedAt
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route POST /api/student/profile/recalculate
 * @desc Force dynamic recalculation from behavior events
 */
router.post('/recalculate', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const studentId = req.body.studentId || req.user?.userId || 'usr-student-01';
    const analytics = engine.evaluateStudentIntelligence(studentId);

    res.json({
      success: true,
      message: 'Student intelligence profile dynamically re-evaluated from behavioral event stream.',
      data: analytics
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route GET /api/student/profile/ai-context
 * @desc Retrieve 4-part unified context payload for future AI Education Agent
 */
router.get('/ai-context', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const studentId = req.query.studentId as string || req.user?.userId || 'usr-student-01';
    const context = aiPipeline.generateAIContext(studentId);

    res.json({
      success: true,
      data: context
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
