import { Router, Request, Response } from 'express';
import { ScholarshipService, ConflictError } from '../services/scholarshipService';
import {
  authenticateToken,
  optionalAuth,
  requireRole,
  AuthenticatedRequest,
} from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { asyncHandler, HttpError, safeErrorMessage } from '../utils/httpErrors';

const router = Router();
const scholarshipService = new ScholarshipService();
const aiLimiter = rateLimiter(60000, 20, 'AI processing rate limit reached. Please wait before analyzing more documents.');
const submissionLimiter = rateLimiter(60000, 15, 'Too many scholarship submissions or reports. Please try again shortly.');

function markDeprecated(res: Response): void {
  res.setHeader('Deprecation', 'true');
}

function sendError(res: Response, status: number, err: unknown, fallback: string): void {
  res.status(status).json({ success: false, error: safeErrorMessage(err, fallback, status) });
}

function sendReviewError(res: Response, err: unknown): void {
  if (err instanceof ConflictError) {
    res.status(409).json({ success: false, code: 'CONFLICT', error: err.message });
    return;
  }
  sendError(res, 400, err, 'Review failed');
}

function handleCatalogList(req: Request, res: Response): void {
  try {
    const { q, region, degree, field, funding, studentCategory, onlyVerified, sortBy } = req.query;
    const result = scholarshipService.getScholarships({
      q: q as string | undefined,
      region: region as string | undefined,
      degree: degree as string | undefined,
      field: field as string | undefined,
      funding: funding as string | undefined,
      studentCategory: studentCategory as string | undefined,
      onlyVerified: onlyVerified === 'true',
      sortBy: sortBy as string | undefined,
    });
    res.json({ success: true, totalCount: result.totalCount, scholarships: result.scholarships, metrics: result.metrics });
  } catch (err: unknown) {
    sendError(res, 500, err, 'Server error');
  }
}

function handleSubmissionReview(req: AuthenticatedRequest, res: Response, forcedAction?: 'approve' | 'reject'): void {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const rawDecision = (
      typeof body.decision === 'string'
        ? body.decision
        : typeof body.action === 'string'
        ? body.action
        : ''
    )
      .trim()
      .toLowerCase();

    let action: 'approve' | 'reject';
    if (forcedAction) {
      action = forcedAction;
    } else if (rawDecision === 'approve' || rawDecision === 'approved') {
      action = 'approve';
    } else if (rawDecision === 'reject' || rawDecision === 'rejected') {
      action = 'reject';
    } else {
      res.status(400).json({
        success: false,
        error: 'Explicit decision/action ("approve" or "reject") is required.',
      });
      return;
    }
    const notes = typeof body.reviewNotes === 'string' ? body.reviewNotes : typeof body.notes === 'string' ? body.notes : undefined;
    const result = scholarshipService.reviewSubmission(req.params.id, action, notes, req.user!.userId, req.user!.email);
    if (!result) {
      res.status(404).json({ success: false, error: 'Submission not found' });
      return;
    }
    res.json({
      success: true,
      alreadyProcessed: result.alreadyProcessed,
      submission: result.submission,
      data: result.submission,
      publishedScholarship: result.publishedScholarship,
    });
  } catch (err: unknown) {
    sendReviewError(res, err);
  }
}

function handleReportSubmit(req: AuthenticatedRequest, res: Response, statusCode: number): void {
  try {
    const result = scholarshipService.reportError({
      ...((req.body || {}) as Record<string, unknown>),
      reporterEmail: req.user!.email,
    });
    if (statusCode === 201) {
      res.status(201).json({ success: true, data: result.report });
      return;
    }
    res.json({ success: true, message: result.message, report: result.report });
  } catch (err: unknown) {
    sendError(res, 400, err, 'Report failed');
  }
}

function handleReportResolve(req: AuthenticatedRequest, res: Response, mode: 'put' | 'patch' | 'admin'): void {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const statusRaw = typeof body.status === 'string' ? body.status : 'Verified & Fixed';
    const resolvedStatus = mode === 'admin' && statusRaw !== 'Dismissed' ? 'Verified & Fixed' : statusRaw;
    const notes = typeof body.adminNotes === 'string' ? body.adminNotes : typeof body.notes === 'string' ? body.notes : undefined;
    const apply = typeof body.applyCorrectionToScholarship === 'boolean'
      ? body.applyCorrectionToScholarship
      : Boolean(body.applyCorrection);
    const report = scholarshipService.resolveErrorReport(req.params.id, resolvedStatus, notes, apply, req.user!.email);
    if (!report) {
      res.status(404).json({ success: false, error: 'Report not found' });
      return;
    }
    if (mode === 'admin') {
      res.json({ success: true, data: report });
      return;
    }
    res.json(mode === 'patch' ? { success: true, report, data: report } : { success: true, report });
  } catch (err: unknown) {
    sendError(res, 400, err, 'Failed to resolve');
  }
}

function handleCheckUpdates(req: AuthenticatedRequest, res: Response, idFromParams: boolean): void {
  try {
    const targetId = idFromParams
      ? req.params.id
      : (typeof req.body?.scholarshipId === 'string' && req.body.scholarshipId) || 'sch-chevening-uk';
    const result = scholarshipService.checkUpdates(targetId);
    if (!result) {
      res.status(404).json({ success: false, error: 'Scholarship not found' });
      return;
    }
    res.json({ success: true, ...result });
  } catch (err: unknown) {
    sendError(res, 500, err, 'Server error');
  }
}

async function handleAiExtract(req: AuthenticatedRequest, res: Response, key: 'extractedData' | 'data'): Promise<void> {
  try {
    const { rawText, sourceUrl } = (req.body || {}) as { rawText?: unknown; sourceUrl?: unknown };
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 20) {
      res.status(400).json({ success: false, error: 'Please provide raw scholarship text (minimum 20 characters).' });
      return;
    }
    const extracted = await scholarshipService.extractWithAI(rawText, typeof sourceUrl === 'string' ? sourceUrl : undefined);
    res.json(key === 'extractedData' ? { success: true, extractedData: extracted } : { success: true, data: extracted });
  } catch (err: unknown) {
    const status = err instanceof HttpError ? err.status : 500;
    sendError(res, status, err, 'AI extraction failed');
  }
}

// 1. PUBLIC CATALOG ROUTES
router.get('/', handleCatalogList);
router.get('/search', handleCatalogList);
router.get('/featured', (_req: Request, res: Response): void => {
  try {
    const result = scholarshipService.getScholarships({ onlyVerified: true, sortBy: 'fully_funded' });
    res.json({ success: true, scholarships: result.scholarships.slice(0, 6), totalCount: result.totalCount });
  } catch (err: unknown) {
    sendError(res, 500, err, 'Server error');
  }
});
router.get('/metrics', (_req, res) => res.json({ success: true, data: scholarshipService.getStats() }));
router.get('/stats', (_req, res) => res.json({ success: true, data: scholarshipService.getStats() }));
router.post('/match', optionalAuth, (req: AuthenticatedRequest, res: Response): void => {
  try {
    res.json({ success: true, data: scholarshipService.matchScholarships(req.body || {}) });
  } catch (err: unknown) {
    sendError(res, 400, err, 'Match failed');
  }
});

// 2. ADMIN SEARCH TELEMETRY
router.get('/analytics/popular-searches', authenticateToken, requireRole('admin'), (_req, res): void => {
  try {
    const terms = scholarshipService.getTopSearchKeywords(10);
    res.json({ success: true, searches: terms.map((t) => ({ query: t.query, count: t.count, lastSearched: null })) });
  } catch (err: unknown) {
    sendError(res, 500, err, 'Server error');
  }
});
router.get('/search-terms', authenticateToken, requireRole('admin'), (_req, res) => {
  markDeprecated(res);
  res.json({ success: true, data: scholarshipService.getTopSearchKeywords(10) });
});
router.get('/admin/search-terms', authenticateToken, requireRole('admin'), (_req, res) => {
  markDeprecated(res);
  res.json({ success: true, data: scholarshipService.getTopSearchKeywords(10) });
});

// 3. ORGANIZATION SUBMISSION & EDITORIAL QUEUE
router.post('/submit', authenticateToken, requireRole('organization', 'admin'), submissionLimiter, (req: AuthenticatedRequest, res): void => {
  try {
    const result = scholarshipService.submitOpportunity((req.body || {}) as Record<string, unknown>, req.user!.userId);
    res.status(201).json({ success: true, message: result.message, submission: result.submission });
  } catch (err: unknown) {
    sendError(res, 400, err, 'Submission failed');
  }
});
router.get('/submissions/mine', authenticateToken, requireRole('organization', 'admin'), (req: AuthenticatedRequest, res) =>
  res.json({ success: true, submissions: scholarshipService.getSubmissions(req.user!.userId) })
);
router.get('/submissions/all', authenticateToken, requireRole('admin'), (_req, res) => {
  markDeprecated(res);
  res.json({ success: true, submissions: scholarshipService.getSubmissions() });
});
router.get('/submissions', authenticateToken, requireRole('admin'), (_req, res) => {
  const submissions = scholarshipService.getSubmissions();
  res.json({ success: true, submissions, data: submissions });
});
router.get('/admin/submissions', authenticateToken, requireRole('admin'), (_req, res) => {
  markDeprecated(res);
  res.json({ success: true, data: scholarshipService.getSubmissions() });
});
router.put('/submissions/:id', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => handleSubmissionReview(req, res));
router.post('/submissions/:id/review', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => handleSubmissionReview(req, res));
router.put('/admin/submissions/:id/review', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  markDeprecated(res);
  handleSubmissionReview(req, res);
});
router.post('/admin/submissions/:id/review', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  markDeprecated(res);
  handleSubmissionReview(req, res);
});
router.post('/admin/submissions/:id/approve', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => handleSubmissionReview(req, res, 'approve'));
router.post('/admin/submissions/:id/reject', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => handleSubmissionReview(req, res, 'reject'));

// 4. ERROR REPORTS
router.post('/report', authenticateToken, submissionLimiter, (req: AuthenticatedRequest, res) => handleReportSubmit(req, res, 200));
router.post('/report-error', authenticateToken, submissionLimiter, (req: AuthenticatedRequest, res) => {
  markDeprecated(res);
  handleReportSubmit(req, res, 201);
});
router.get('/reports/all', authenticateToken, requireRole('admin'), (_req, res) => {
  markDeprecated(res);
  res.json({ success: true, reports: scholarshipService.getErrorReports() });
});
router.get('/reports', authenticateToken, requireRole('admin'), (_req, res) => {
  const reports = scholarshipService.getErrorReports();
  res.json({ success: true, reports, data: reports });
});
router.get('/admin/reports', authenticateToken, requireRole('admin'), (_req, res) => {
  markDeprecated(res);
  res.json({ success: true, data: scholarshipService.getErrorReports() });
});
router.put('/reports/:id', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => handleReportResolve(req, res, 'put'));
router.patch('/reports/:id', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => handleReportResolve(req, res, 'patch'));
router.post('/admin/reports/:id/resolve', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => handleReportResolve(req, res, 'admin'));

// 5. ADMIN MAINTENANCE, UPDATE CHECK, EXTRACT, CRUD
router.post('/check-updates', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => handleCheckUpdates(req, res, false));
router.post('/admin/check-updates', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => {
  markDeprecated(res);
  handleCheckUpdates(req, res, false);
});
router.post('/:id/check-updates', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res) => handleCheckUpdates(req, res, true));
router.post('/ai-extract', authenticateToken, requireRole('admin'), aiLimiter, asyncHandler(async (req: AuthenticatedRequest, res) => {
  markDeprecated(res);
  await handleAiExtract(req, res, 'extractedData');
}));
router.post('/extract', authenticateToken, requireRole('admin'), aiLimiter, asyncHandler(async (req: AuthenticatedRequest, res) => {
  await handleAiExtract(req, res, 'data');
}));
router.post('/admin/extract', authenticateToken, requireRole('admin'), aiLimiter, asyncHandler(async (req: AuthenticatedRequest, res) => {
  markDeprecated(res);
  await handleAiExtract(req, res, 'data');
}));

router.get('/:id', (req: Request, res: Response): void => {
  try {
    const item = scholarshipService.getScholarshipById(req.params.id);
    if (!item) { res.status(404).json({ success: false, error: 'Scholarship not found' }); return; }
    res.json({ success: true, scholarship: item });
  } catch (err: unknown) {
    sendError(res, 500, err, 'Server error');
  }
});

router.post('/:id/verify', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const updated = scholarshipService.verifyScholarship({
      scholarshipId: req.params.id,
      userId: req.user!.userId,
      verifierName: req.body?.verifierName || req.user!.email,
      notes: req.body?.notes,
    });
    if (!updated) { res.status(404).json({ success: false, error: 'Scholarship not found' }); return; }
    res.json({ success: true, scholarship: updated });
  } catch (err: unknown) {
    sendError(res, 400, err, 'Verification failed');
  }
});

router.post('/', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const created = scholarshipService.createScholarship((req.body || {}) as Record<string, unknown>, req.user!.userId);
    res.status(201).json({ success: true, scholarship: created });
  } catch (err: unknown) {
    sendError(res, 400, err, 'Failed to create');
  }
});

router.put('/:id', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const updated = scholarshipService.updateScholarship(req.params.id, (req.body || {}) as Record<string, unknown>, req.user!.userId);
    if (!updated) { res.status(404).json({ success: false, error: 'Scholarship not found' }); return; }
    res.json({ success: true, scholarship: updated });
  } catch (err: unknown) {
    sendError(res, 400, err, 'Update failed');
  }
});

router.delete('/:id', authenticateToken, requireRole('admin'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const success = scholarshipService.deleteScholarship(req.params.id, req.user!.userId);
    if (!success) { res.status(404).json({ success: false, error: 'Scholarship not found' }); return; }
    res.json({ success: true, message: 'Scholarship deleted successfully' });
  } catch (err: unknown) {
    sendError(res, 500, err, 'Delete failed');
  }
});

export default router;
