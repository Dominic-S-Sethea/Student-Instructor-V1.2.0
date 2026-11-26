import { Router, Request, Response } from 'express';
import { LearningService } from '../services/learningService';
import { PrivacyService } from '../services/privacyService';
import {
  authenticateToken,
  optionalAuth,
  resolveAuthorizedStudentId,
  AuthenticatedRequest,
} from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import {
  ActivityActionSchema,
  LabActionSchema,
  LabCompleteSchema,
  PathAdvanceSchema,
} from '../validators/domainSchemas';
import { HttpError, safeErrorMessage } from '../utils/httpErrors';
import { parseOptionalQueryString } from '../utils/queryParams';

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
    const contents = learningService.getContentCatalog({
      subject_id: parseOptionalQueryString(req.query.subject_id, 'subject_id', 80),
      category_id: parseOptionalQueryString(req.query.category_id, 'category_id', 80),
      content_type: parseOptionalQueryString(req.query.content_type, 'content_type', 60),
      difficulty: parseOptionalQueryString(req.query.difficulty, 'difficulty', 40),
      search: parseOptionalQueryString(req.query.search, 'search', 200),
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
      parseOptionalQueryString(req.query.studentId, 'studentId', 120)
    );
    if (!studentId) return;
    const subjectId = parseOptionalQueryString(req.query.subject_id, 'subject_id', 80);
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
      parseOptionalQueryString(req.query.studentId, 'studentId', 120)
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

router.post('/experiments/:id/action', authenticateToken, validate(LabActionSchema, 'body'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { actionName, parameters, observationNotes } = req.body as {
      actionName?: string;
      parameters?: Record<string, unknown>;
      observationNotes?: string;
    };
    const result = learningService.recordLabAction({
      studentId,
      experimentId: req.params.id,
      actionName: actionName || 'parameter_adjusted',
      parameters,
      observationNotes,
    });
    res.json({ success: true, data: result });
  } catch (err: unknown) {
    sendLearningError(res, err, 'Failed to record lab action');
  }
});

router.post('/experiments/:id/complete', authenticateToken, validate(LabCompleteSchema, 'body'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { parametersUsed, outcomeData, score, observationNotes } = req.body as {
      parametersUsed?: Record<string, unknown>;
      outcomeData?: Record<string, unknown>;
      score?: number;
      observationNotes?: string;
    };
    const finalResult = learningService.completeLabExperiment({
      studentId,
      experimentId: req.params.id,
      parametersUsed: parametersUsed || {},
      outcomeData: outcomeData || {},
      score: typeof score === 'number' ? score : 90,
      observationNotes,
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
      parseOptionalQueryString(req.query.studentId, 'studentId', 120)
    );
    if (!studentId) return;
    const subjectId = parseOptionalQueryString(req.query.subject_id, 'subject_id', 80);
    const type = parseOptionalQueryString(req.query.type, 'type', 60);
    const activities = learningService.getActivitiesCatalog(studentId, subjectId, type);
    res.json({ success: true, count: activities.length, data: activities });
  } catch (err: unknown) {
    sendLearningError(res, err, 'Failed to load activities');
  }
});

router.post('/activities/:id/action', authenticateToken, validate(ActivityActionSchema, 'body'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { action, responseData, score } = req.body as {
      action?: 'started' | 'completed' | 'hint_used';
      responseData?: Record<string, unknown>;
      score?: number;
    };
    const result = learningService.recordActivityInteraction({
      studentId,
      activityId: req.params.id,
      action: action ?? 'started',
      responseData,
      score,
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
      parseOptionalQueryString(req.query.studentId, 'studentId', 120)
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

router.post('/paths/:id/advance', authenticateToken, validate(PathAdvanceSchema, 'body'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { stepOrder } = req.body as { stepOrder?: number };
    const path = learningService.advanceRoadmap(studentId, req.params.id, stepOrder ?? 1);
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
    const safeMetadata =
      metadata && typeof metadata === 'object' && !Array.isArray(metadata)
        ? (metadata as Record<string, unknown>)
        : {};
    learningService.logLearningEvent(
      studentId,
      typeof eventType === 'string' ? eventType : 'GENERIC_LEARNING_EVENT',
      safeMetadata
    );
    res.json({ success: true, persisted: true, message: 'Learning event recorded' });
  } catch (err: unknown) {
    sendLearningError(res, err, 'Failed to log learning event');
  }
});

export default router;
