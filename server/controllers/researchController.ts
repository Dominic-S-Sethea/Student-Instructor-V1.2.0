import { Router, Response } from 'express';
import { ResearchService, ConsentDeniedError } from '../services/researchService';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { ResearchExperimentCreateSchema, ResearchJoinSchema } from '../validators/domainSchemas';
import { sendRouteError } from '../utils/httpErrors';

const router = Router();
const researchService = new ResearchService();

/** GET /api/research/experiments — public list of active/completed study metadata */
router.get('/experiments', (_req, res: Response): void => {
  try {
    const experiments = researchService.listExperiments();
    res.json({ success: true, data: experiments });
  } catch (err: unknown) {
    sendRouteError(res, err, 'Failed to list experiments');
  }
});

/** GET /api/research/experiments/:id/report — admin-only detailed report */
router.get('/experiments/:id/report', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const report = researchService.getExperimentReport(req.params.id);
    if (!report) {
      res.status(404).json({ success: false, error: 'Experiment not found.' });
      return;
    }
    res.json({ success: true, data: report });
  } catch (err: unknown) {
    sendRouteError(res, err, 'Failed to load report');
  }
});

/** GET /api/research/experiments/:id — public study metadata summary */
router.get('/experiments/:id', (req, res: Response): void => {
  try {
    const experiment = researchService.getExperiment(req.params.id);
    if (!experiment) {
      res.status(404).json({ success: false, error: 'Experiment not found.' });
      return;
    }
    res.json({ success: true, data: experiment });
  } catch (err: unknown) {
    sendRouteError(res, err, 'Failed to load experiment');
  }
});

/** POST /api/research/experiments — create experiment (admin only) */
router.post(
  '/experiments',
  authenticateToken,
  requireRole('admin'),
  validate(ResearchExperimentCreateSchema, 'body'),
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const { name, hypothesis, description, targetMetrics, startDate, endDate } = req.body;
      const exp = researchService.createExperiment({
        name,
        hypothesis,
        description,
        targetMetrics,
        startDate,
        endDate,
      });

      res.status(201).json({ success: true, data: exp });
    } catch (err: unknown) {
      sendRouteError(res, err, 'Failed to create experiment');
    }
  }
);

/** POST /api/research/experiments/:id/join — authenticated + research consent required */
router.post(
  '/experiments/:id/join',
  authenticateToken,
  validate(ResearchJoinSchema, 'body'),
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const studentId = req.user!.userId;
      const participant = researchService.enrollStudent(studentId, req.params.id, req.body?.groupName);

      res.json({
        success: true,
        message: `Enrolled student in ${participant.groupName}`,
        data: participant,
      });
    } catch (err: unknown) {
      if (err instanceof ConsentDeniedError) {
        res.status(403).json({ success: false, code: 'CONSENT_REQUIRED', error: err.message });
        return;
      }
      sendRouteError(res, err, 'Failed to join experiment');
    }
  }
);

/** GET /api/research/anonymized-dataset — admin-only export restricted to consented students */
router.get('/anonymized-dataset', authenticateToken, requireRole('admin'), (_req: AuthenticatedRequest, res: Response): void => {
  try {
    const dataset = researchService.generateAnonymizedResearchDataset();
    res.json({
      success: true,
      metadata: {
        totalRecords: dataset.length,
        anonymizationMethod: 'HMAC-SHA256 Salted Pseudonymization',
        piiStripped: true,
        complianceStandard: 'CDES Ethical Child Safety & Open Education Research Protocol',
      },
      data: dataset,
    });
  } catch (err: unknown) {
    sendRouteError(res, err, 'Failed to export dataset');
  }
});

export default router;
