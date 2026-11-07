import { Router, Request, Response } from 'express';
import { LearningService } from '../services/learningService';

const router = Router();
const learningService = new LearningService();

// Helper to determine studentId
function getStudentId(req: Request): string {
  const queryStudent = req.query.studentId as string;
  const headerStudent = req.headers['x-student-id'] as string;
  return queryStudent || headerStudent || 'usr-student-01';
}

// ----------------------------------------------------
// 1. SUBJECTS & CATEGORIES
// ----------------------------------------------------
router.get('/subjects', (_req: Request, res: Response) => {
  try {
    const subjects = learningService.getSubjectsWithCategories();
    res.json({ success: true, data: subjects });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 2. DIGITAL LIBRARY CONTENT
// ----------------------------------------------------
router.get('/content', (req: Request, res: Response) => {
  try {
    const { subject_id, category_id, content_type, difficulty, search } = req.query;
    const contents = learningService.getContentCatalog({
      subject_id: subject_id as string,
      category_id: category_id as string,
      content_type: content_type as string,
      difficulty: difficulty as string,
      search: search as string,
    });
    res.json({ success: true, count: contents.length, data: contents });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/content/:id', (req: Request, res: Response) => {
  try {
    const studentId = getStudentId(req);
    const content = learningService.getContentDetail(req.params.id, studentId);
    if (!content) {
      return res.status(404).json({ success: false, error: 'Content not found' });
    }
    res.json({ success: true, data: content });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 3. VIRTUAL LABORATORY EXPERIMENTS
// ----------------------------------------------------
router.get('/experiments', (req: Request, res: Response) => {
  try {
    const studentId = getStudentId(req);
    const { subject_id } = req.query;
    const experiments = learningService.getLaboratoryCatalog(studentId, subject_id as string);
    res.json({ success: true, count: experiments.length, data: experiments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/experiments/:id', (req: Request, res: Response) => {
  try {
    const studentId = getStudentId(req);
    const data = learningService.getExperimentDetail(req.params.id, studentId);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Experiment not found' });
    }
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/experiments/:id/action', (req: Request, res: Response) => {
  try {
    const studentId = req.body.studentId || getStudentId(req);
    const { actionName, parameters, observationNotes } = req.body;

    const result = learningService.recordLabAction({
      studentId,
      experimentId: req.params.id,
      actionName: actionName || 'parameter_adjusted',
      parameters,
      observationNotes,
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/experiments/:id/complete', (req: Request, res: Response) => {
  try {
    const studentId = req.body.studentId || getStudentId(req);
    const { parametersUsed, outcomeData, score, observationNotes } = req.body;

    const finalResult = learningService.completeLabExperiment({
      studentId,
      experimentId: req.params.id,
      parametersUsed: parametersUsed || {},
      outcomeData: outcomeData || {},
      score: score !== undefined ? score : 90,
      observationNotes,
    });

    res.json({
      success: true,
      message: 'Experiment submitted and verified.',
      data: finalResult,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 4. STEM LEARNING ACTIVITIES
// ----------------------------------------------------
router.get('/activities', (req: Request, res: Response) => {
  try {
    const studentId = getStudentId(req);
    const { subject_id, type } = req.query;
    const activities = learningService.getActivitiesCatalog(studentId, subject_id as string, type as string);
    res.json({ success: true, count: activities.length, data: activities });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/activities/:id/action', (req: Request, res: Response) => {
  try {
    const studentId = req.body.studentId || getStudentId(req);
    const { action, responseData, score } = req.body;

    const result = learningService.recordActivityInteraction({
      studentId,
      activityId: req.params.id,
      action: action || 'started',
      responseData,
      score,
    });

    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 5. LEARNING PATHS (ROADMAPS)
// ----------------------------------------------------
router.get('/paths', (req: Request, res: Response) => {
  try {
    const studentId = getStudentId(req);
    const roadmaps = learningService.getLearningRoadmaps(studentId);
    res.json({ success: true, data: roadmaps });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/paths/:id/enroll', (req: Request, res: Response) => {
  try {
    const studentId = req.body.studentId || getStudentId(req);
    const path = learningService.enrollInRoadmap(studentId, req.params.id);
    res.json({ success: true, message: 'Enrolled in learning roadmap', data: path });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/paths/:id/advance', (req: Request, res: Response) => {
  try {
    const studentId = req.body.studentId || getStudentId(req);
    const { stepOrder } = req.body;
    const path = learningService.advanceRoadmap(studentId, req.params.id, Number(stepOrder || 1));
    res.json({ success: true, message: 'Roadmap step advanced', data: path });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 6. AI COGNITIVE PREPARATION PROFILE
// ----------------------------------------------------
router.get('/student-ai-profile', (req: Request, res: Response) => {
  try {
    const studentId = getStudentId(req);
    const aiProfile = learningService.getStudentAIProfile(studentId);
    res.json({ success: true, data: aiProfile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 7. ANALYTICS EVENT INGESTION
// ----------------------------------------------------
router.post('/analytics/event', (req: Request, res: Response) => {
  try {
    const studentId = req.body.studentId || getStudentId(req);
    const { eventType, metadata } = req.body;

    learningService.logLearningEvent(studentId, eventType || 'GENERIC_LEARNING_EVENT', metadata || {});
    res.json({ success: true, message: 'Learning event recorded' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
