import { Router, Request, Response } from 'express';
import { LearningService } from '../services/learningService';
import { PrivacyService } from '../services/privacyService';
import {
  authenticateToken,
  optionalAuth,
  resolveAuthorizedStudentId,
  AuthenticatedRequest,
} from '../middleware/authMiddleware';
import { HttpError, safeErrorMessage } from '../utils/httpErrors';

function sendLearningError(res: Response, err: unknown, fallback: string): void {
  const status = err instanceof HttpError ? err.status : 500;
  res.status(status).json({ success: false, error: safeErrorMessage(err, fallback, status) });
}

const router = Router();
const learningService = new LearningService();
const privacyService = new PrivacyService();

// 1. SUBJECTS & CATEGORIES (Public catalog)
router.get('/subjects', (_req: Request, res: Response) => {
  try {
    const subjects = learningService.getSubjectsWithCategories();
    res.json({ success: true, data: subjects });
  } catch (err: unknown) {
    sendLearningError(res, err, 'Failed to fetch subjects');
  }
});

// 2. DIGITAL LIBRARY CONTENT (Public catalog; logs history only if authenticated & consented)
router.get('/content', (req: Request, res: Response) => {
  try {
    const { subject_id, category_id, content_type, difficulty, search } = req.query;
    const contents = learningService.getContentCatalog({
      subject_id: subject_id as string | undefined,
      category_id: category_id as string | undefined,
      content_type: content_type as string | undefined,
      difficulty: difficulty as string | undefined,
      search: search as string | undefined,
    });
    res.json({ success: true, count: contents.length, data: contents });
  } catch (err: unknown) {
    sendLearningError(res, err, 'Failed to load catalog');
  }
});

router.get('/content/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const consentedId =
      req.user && privacyService.canCollectAnalytics(req.user.userId)
        ? req.user.userId
        : undefined;
    const content = learningService.getContentDetail(req.params.id, consentedId);
    if (!content) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }
    return res.json({ success: true, data: content });
  } catch (err: unknown) {
    sendLearningError(res, err, 'Failed to fetch content');
    return;
  }
});

// 3. VIRTUAL LABORATORY EXPERIMENTS (Authenticated student progress)
router.get('/experiments', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = resolveAuthorizedStudentId(
      req,
      res,
      typeof req.query.studentId === 'string' ? req.query.studentId : undefined
    );
    if (!studentId) return;
    const subjectId = typeof req.query.subject_id === 'string' ? req.query.subject_id : undefined;
    const experiments = learningService.getLaboratoryCatalog(studentId, subjectId);
    res.json({ success: true, count: experiments.length, data: experiments });
  } catch (err: unknown) {
    sendLearningError(res, err, 'Failed to load experiments');
  }
});

router.get('/experiments/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = resolveAuthorizedStudentId(
      req,
      res,
      typeof req.query.studentId === 'string' ? req.query.studentId : undefined
    );
    if (!studentId) return;
    const data = learningService.getExperimentDetail(req.params.id, studentId);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Experiment not found' });
    }
    return res.json({ success: true, data });
  } catch (err: unknown) {
    sendLearningError(res, err, 'Failed to load experiment');
    return;
  }
});

router.post('/experiments/:id/action', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { actionName, parameters, observationNotes } = (req.body || {}) as Record<string, unknown>;
    const result = learningService.recordLabAction({
      studentId,
      experimentId: req.params.id,
      actionName: typeof actionName === 'string' ? actionName : 'parameter_adjusted',
      parameters,
      observationNotes: typeof observationNotes === 'string' ? observationNotes : undefined,
    });
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    sendLearningError(res, err, 'Failed to record lab action');
  }
});

router.post('/experiments/:id/complete', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { parametersUsed, outcomeData, score, observationNotes } = (req.body || {}) as Record<string, unknown>;
    if (score !== undefined && (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100)) {
      res.status(400).json({ success: false, error: 'score must be a finite number between 0 and 100.' });
      return;
    }
    const finalResult = learningService.completeLabExperiment({
      studentId,
      experimentId: req.params.id,
      parametersUsed: parametersUsed || {},
      outcomeData: outcomeData || {},
      score: typeof score === 'number' ? score : 90,
      observationNotes: typeof observationNotes === 'string' ? observationNotes : undefined,
    });
    res.json({ success: true, message: 'Experiment submitted and verified.', data: finalResult });
  } catch (err: unknown) {
    sendLearningError(res, err, 'Failed to complete experiment');
  }
});

// 4. STEM LEARNING ACTIVITIES (Authenticated student progress)
router.get('/activities', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = resolveAuthorizedStudentId(
      req,
      res,
      typeof req.query.studentId === 'string' ? req.query.studentId : undefined
    );
    if (!studentId) return;
    const subjectId = typeof req.query.subject_id === 'string' ? req.query.subject_id : undefined;
    const type = typeof req.query.type === 'string' ? req.query.type : undefined;
    const activities = learningService.getActivitiesCatalog(studentId, subjectId, type);
    res.json({ success: true, count: activities.length, data: activities });
  } catch (err: unknown) {
    sendLearningError(res, err, 'Failed to load activities');
  }
});

router.post('/activities/:id/action', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { action, responseData, score } = (req.body || {}) as Record<string, unknown>;
    if (score !== undefined && (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 100)) {
      res.status(400).json({ success: false, error: 'score must be a finite number between 0 and 100.' });
      return;
    }
    const actType: 'started' | 'completed' | 'hint_used' =
      action === 'completed' || action === 'hint_used' ? action : 'started';
    const result = learningService.recordActivityInteraction({
      studentId,
      activityId: req.params.id,
      action: actType,
      responseData,
      score: typeof score === 'number' ? score : undefined,
    });
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    sendLearningError(res, err, 'Failed to record activity');
  }
});

// 5. LEARNING PATHS (Authenticated student progress)
router.get('/paths', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = resolveAuthorizedStudentId(
      req,
      res,
      typeof req.query.studentId === 'string' ? req.query.studentId : undefined
    );
    if (!studentId) return;
    const roadmaps = learningService.getLearningRoadmaps(studentId);
    res.json({ success: true, data: roadmaps });
  } catch (err: unknown) {
    sendLearningError(res, err, 'Failed to load learning paths');
  }
});

router.post('/paths/:id/enroll', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const path = learningService.enrollInRoadmap(studentId, req.params.id);
    res.json({ success: true, message: 'Enrolled in learning roadmap', data: path });
  } catch (err: unknown) {
    sendLearningError(res, err, 'Failed to enroll in path');
  }
});

router.post('/paths/:id/advance', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { stepOrder } = (req.body || {}) as Record<string, unknown>;
    const resolvedStep = stepOrder === undefined ? 1 : Number(stepOrder);
    if (!Number.isInteger(resolvedStep) || resolvedStep < 1) {
      res.status(400).json({ success: false, error: 'stepOrder must be a positive integer >= 1.' });
      return;
    }
    const path = learningService.advanceRoadmap(studentId, req.params.id, resolvedStep);
    res.json({ success: true, message: 'Roadmap step advanced', data: path });
  } catch (err: unknown) {
    sendLearningError(res, err, 'Failed to advance path');
  }
});

// 6. AI COGNITIVE PREPARATION PROFILE
router.get('/student-ai-profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = resolveAuthorizedStudentId(
      req,
      res,
      typeof req.query.studentId === 'string' ? req.query.studentId : undefined
    );
    if (!studentId) return;
    const aiProfile = learningService.getStudentAIProfile(studentId);
    res.json({ success: true, data: aiProfile });
  } catch (err: unknown) {
    sendLearningError(res, err, 'Failed to fetch AI profile');
  }
});

// 7. ANALYTICS EVENT INGESTION (Authenticated + consented)
router.post('/analytics/event', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    if (!privacyService.canCollectAnalytics(studentId)) {
      res.json({ success: true, persisted: false, reason: 'consent_disabled' });
      return;
    }
    const { eventType, metadata } = (req.body || {}) as Record<string, unknown>;
    learningService.logLearningEvent(
      studentId,
      typeof eventType === 'string' ? eventType : 'GENERIC_LEARNING_EVENT',
      metadata || {}
    );
    res.json({ success: true, persisted: true, message: 'Learning event recorded' });
  } catch (err: unknown) {
    sendLearningError(res, err, 'Failed to log learning event');
  }
});

export default router;
