import { Router, Request, Response } from 'express';
import { ScholarshipService } from '../services/scholarshipService';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();
const scholarshipService = new ScholarshipService();

const aiLimiter = rateLimiter(60000, 20, 'AI processing rate limit reached. Please wait before analyzing more documents.');

/**
 * 1. GET /api/scholarships (with filters, search, and sorting)
 */
router.get('/', (req: Request, res: Response): void => {
  try {
    const {
      q,
      region,
      degree,
      field,
      funding,
      studentCategory,
      onlyVerified,
      sortBy
    } = req.query;

    const result = scholarshipService.getScholarships({
      q: q as string,
      region: region as string,
      degree: degree as string,
      field: field as string,
      funding: funding as string,
      studentCategory: studentCategory as string,
      onlyVerified: onlyVerified === 'true',
      sortBy: sortBy as string
    });

    res.json({
      success: true,
      totalCount: result.totalCount,
      scholarships: result.scholarships,
      metrics: result.metrics
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

/**
 * 2. GET /api/scholarships/stats
 */
router.get('/stats', (_req: Request, res: Response): void => {
  try {
    const stats = scholarshipService.getStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 3. GET /api/scholarships/analytics/popular-searches & /search-terms
 */
router.get('/analytics/popular-searches', (_req: Request, res: Response): void => {
  try {
    const terms = scholarshipService.getTopSearchKeywords(10);
    res.json({
      success: true,
      searches: terms.map(t => ({ query: t.query, count: t.count, lastSearched: new Date().toISOString() }))
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/search-terms', (_req: Request, res: Response): void => {
  try {
    const terms = scholarshipService.getTopSearchKeywords(10);
    res.json({ success: true, data: terms });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 4. POST /api/scholarships/match
 */
router.post('/match', (req: Request, res: Response): void => {
  try {
    const matches = scholarshipService.matchScholarships(req.body);
    res.json({ success: true, data: matches });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * 5. GET /api/scholarships/submissions/all & /admin/submissions
 */
router.get('/submissions/all', (_req: Request, res: Response): void => {
  try {
    const submissions = scholarshipService.getSubmissions();
    res.json({ success: true, submissions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/admin/submissions', (_req: Request, res: Response): void => {
  try {
    const submissions = scholarshipService.getSubmissions();
    res.json({ success: true, data: submissions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 6. PUT /api/scholarships/submissions/:id & POST /admin/submissions/:id/review
 */
router.put('/submissions/:id', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { action, reviewNotes } = req.body;
    const result = scholarshipService.reviewSubmission(req.params.id, action || 'approve', reviewNotes, req.user?.userId);
    if (!result) {
      res.status(404).json({ success: false, error: 'Submission not found' });
      return;
    }
    res.json({
      success: true,
      submission: result.submission,
      publishedScholarship: result.publishedScholarship
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/admin/submissions/:id/review', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { decision, notes } = req.body;
    const action = decision === 'Approved' ? 'approve' : 'reject';
    const result = scholarshipService.reviewSubmission(req.params.id, action, notes, req.user?.userId);
    if (!result) {
      res.status(404).json({ success: false, error: 'Submission not found' });
      return;
    }
    res.json({ success: true, data: result.submission, publishedScholarship: result.publishedScholarship });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * 7. GET /api/scholarships/reports/all & /admin/reports
 */
router.get('/reports/all', (_req: Request, res: Response): void => {
  try {
    const reports = scholarshipService.getErrorReports();
    res.json({ success: true, reports });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/admin/reports', (_req: Request, res: Response): void => {
  try {
    const reports = scholarshipService.getErrorReports();
    res.json({ success: true, data: reports });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 8. PUT /api/scholarships/reports/:id & POST /admin/reports/:id/resolve
 */
router.put('/reports/:id', (req: Request, res: Response): void => {
  try {
    const { status, adminNotes, applyCorrectionToScholarship } = req.body;
    const report = scholarshipService.resolveErrorReport(req.params.id, status || 'Verified & Fixed', adminNotes, applyCorrectionToScholarship);
    if (!report) {
      res.status(404).json({ success: false, error: 'Report not found' });
      return;
    }
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/admin/reports/:id/resolve', (req: Request, res: Response): void => {
  try {
    const { status, notes, applyCorrection } = req.body;
    const report = scholarshipService.resolveErrorReport(req.params.id, status === 'Dismissed' ? 'Dismissed' : 'Verified & Fixed', notes, applyCorrection);
    if (!report) {
      res.status(404).json({ success: false, error: 'Report not found' });
      return;
    }
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * 9. POST /api/scholarships/submit
 */
router.post('/submit', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const result = scholarshipService.submitOpportunity(req.body, req.user?.userId);
    res.json({
      success: true,
      message: result.message,
      submission: result.submission
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * 10. POST /api/scholarships/report & /report-error
 */
router.post('/report', (req: Request, res: Response): void => {
  try {
    const result = scholarshipService.reportError(req.body);
    res.json({
      success: true,
      message: result.message,
      report: result.report
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/report-error', (req: Request, res: Response): void => {
  try {
    const result = scholarshipService.reportError(req.body);
    res.status(201).json({ success: true, data: result.report });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * 11. POST /api/scholarships/check-updates
 */
router.post('/check-updates', (req: Request, res: Response): void => {
  try {
    const { scholarshipId } = req.body;
    const result = scholarshipService.checkUpdates(scholarshipId || 'sch-chevening-uk');
    if (!result) {
      res.status(404).json({ success: false, error: 'Scholarship not found' });
      return;
    }
    res.json({
      success: true,
      message: result.message,
      changeRecord: result.changeRecord,
      scholarship: result.scholarship
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 12. POST /api/scholarships/ai-extract & /extract
 */
router.post('/ai-extract', aiLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { rawText, sourceUrl } = req.body;
    if (!rawText || rawText.trim().length < 20) {
      res.status(400).json({
        success: false,
        error: 'Please provide raw scholarship text or announcement text (minimum 20 characters).'
      });
      return;
    }
    const data = await scholarshipService.extractWithAI(rawText, sourceUrl);
    res.json({ success: true, extractedData: data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'AI extraction failed' });
  }
});

router.post('/extract', aiLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { rawText, sourceUrl } = req.body;
    const data = await scholarshipService.extractWithAI(rawText, sourceUrl);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 13. GET /api/scholarships/:id
 */
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const item = scholarshipService.getScholarshipById(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, error: 'Scholarship not found' });
      return;
    }
    res.json({ success: true, scholarship: item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 14. POST /api/scholarships/:id/verify
 */
router.post('/:id/verify', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const updated = scholarshipService.verifyScholarship({
      scholarshipId: req.params.id,
      userId: req.user?.userId,
      verifierName: req.body?.verifierName || (req.user ? req.user.email : 'CSIP Senior Verification Desk'),
      notes: req.body?.notes
    });
    if (!updated) {
      res.status(404).json({ success: false, error: 'Scholarship not found' });
      return;
    }
    res.json({ success: true, scholarship: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * 15. POST /api/scholarships (Create)
 */
router.post('/', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const created = scholarshipService.createScholarship(req.body, req.user?.userId);
    res.json({ success: true, scholarship: created });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to create' });
  }
});

/**
 * 16. PUT /api/scholarships/:id (Edit)
 */
router.put('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const updated = scholarshipService.updateScholarship(req.params.id, req.body, req.user?.userId);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Scholarship not found' });
      return;
    }
    res.json({ success: true, scholarship: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * 17. DELETE /api/scholarships/:id (Delete)
 */
router.delete('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const success = scholarshipService.deleteScholarship(req.params.id, req.user?.userId);
    if (!success) {
      res.status(404).json({ success: false, error: 'Scholarship not found' });
      return;
    }
    res.json({ success: true, message: 'Scholarship deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
