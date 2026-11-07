import { Router, Response } from 'express';
import { ResearchService } from '../services/researchService';
import { authenticateToken, optionalAuth, requireRole, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();
const researchService = new ResearchService();

/**
 * @route GET /api/research/experiments
 * @desc Get all research experiments with participant counts and metrics
 */
router.get('/experiments', (_req, res: Response): void => {
  try {
    const experiments = researchService.listExperiments();
    res.json({
      success: true,
      data: experiments
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route GET /api/research/experiments/:id
 * @desc Get detailed experiment report including cohort evaluation (Group A vs Group B)
 */
router.get('/experiments/:id', (req, res: Response): void => {
  try {
    const report = researchService.getExperimentReport(req.params.id);
    if (!report) {
      res.status(404).json({ success: false, error: 'Experiment not found.' });
      return;
    }
    res.json({
      success: true,
      data: report
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route POST /api/research/experiments
 * @desc Create a new pedagogical A/B research experiment (admin/researcher)
 */
router.post('/experiments', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { name, hypothesis, description, targetMetrics, startDate, endDate } = req.body;
    if (!name || !hypothesis) {
      res.status(400).json({ success: false, error: 'Name and hypothesis are required for research experiments.' });
      return;
    }

    const exp = researchService.createExperiment({
      name,
      hypothesis,
      description,
      targetMetrics,
      startDate,
      endDate
    });

    res.status(201).json({ success: true, data: exp });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * @route POST /api/research/experiments/:id/join
 * @desc Enroll student in experiment with deterministic A/B cohort group allocation
 */
router.post('/experiments/:id/join', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const studentId = req.body.studentId || req.user?.userId || 'usr-student-01';
    const participant = researchService.enrollStudent(studentId, req.params.id, req.body.groupName);

    res.json({
      success: true,
      message: `Enrolled student in ${participant.groupName}`,
      data: participant
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * @route GET /api/research/anonymized-dataset
 * @desc Export completely anonymized research dataset (PII-stripped, Child Safety compliant)
 */
router.get('/anonymized-dataset', (_req, res: Response): void => {
  try {
    const dataset = researchService.generateAnonymizedResearchDataset();
    res.json({
      success: true,
      metadata: {
        totalRecords: dataset.length,
        anonymizationMethod: 'HMAC-SHA256 Salted Pseudonymization',
        piiStripped: true,
        complianceStandard: 'CDES Ethical Child Safety & Open Education Research Protocol'
      },
      data: dataset
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
