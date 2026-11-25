import { Router, Response } from 'express';
import { PrivacyService } from '../services/privacyService';
import { hermesMemoryService } from '../services/hermesMemoryService';
import {
  authenticateToken,
  requireRole,
  resolveAuthorizedStudentId,
  AuthenticatedRequest,
} from '../middleware/authMiddleware';
import { safeErrorMessage } from '../utils/httpErrors';

const router = Router();
const privacyService = new PrivacyService();

/** GET /api/privacy/consent — get authenticated user's own consent configuration. */
router.get('/consent', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const consent = privacyService.getConsent(req.user!.userId);
    res.json({ success: true, data: consent });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: safeErrorMessage(err, 'Failed to load consent.', 500),
    });
  }
});

/** POST /api/privacy/consent — update or withdraw authenticated user's own consent flags. */
router.post('/consent', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const updated = privacyService.updateConsent(
      req.user!.userId,
      {
        isMinor: typeof body.isMinor === 'boolean' ? body.isMinor : undefined,
        parentEmail: body.parentEmail === null ? null : typeof body.parentEmail === 'string' ? body.parentEmail : undefined,
        parentalConsentVerified:
          typeof body.parentalConsentVerified === 'boolean' ? body.parentalConsentVerified : undefined,
        allowAnalyticsTracking:
          typeof body.allowAnalyticsTracking === 'boolean' ? body.allowAnalyticsTracking : undefined,
        allowResearchInclusion:
          typeof body.allowResearchInclusion === 'boolean' ? body.allowResearchInclusion : undefined,
        allowAiMemory: typeof body.allowAiMemory === 'boolean' ? body.allowAiMemory : undefined,
        withdrawAll: body.withdrawAll === true,
      },
      req.user!.role
    );

    if (body.withdrawAll === true || body.allowAiMemory === false) {
      hermesMemoryService.clearAllMemory(req.user!.userId);
    }

    res.json({
      success: true,
      message:
        updated.blockedReasons && updated.blockedReasons.length > 0
          ? 'Consent saved; optional collection remains disabled pending guardian verification.'
          : 'Privacy and data tracking preferences updated.',
      data: updated,
    });
  } catch (err: unknown) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update consent.',
    });
  }
});

/** POST /api/privacy/parent-verify — record guardian email pending owner verification (does not auto-verify). */
router.post('/parent-verify', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const parentEmail = typeof req.body?.parentEmail === 'string' ? req.body.parentEmail.trim() : '';
    if (!parentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
      res.status(400).json({
        success: false,
        error: 'A valid parental email is required for verification.',
      });
      return;
    }

    const pending = privacyService.requestParentalVerification(req.user!.userId, parentEmail);
    res.json({
      success: true,
      message:
        'Parental email recorded. Dependent collection remains disabled until owner-approved guardian verification completes.',
      data: pending,
    });
  } catch (err: unknown) {
    res.status(400).json({
      success: false,
      error: err instanceof Error ? err.message : 'Failed to record guardian verification request.',
    });
  }
});

/** POST /api/privacy/parent-verify/:studentId/approve — admin-only completion of guardian verification. */
router.post(
  '/parent-verify/:studentId/approve',
  authenticateToken,
  requireRole('admin'),
  (req: AuthenticatedRequest, res: Response): void => {
    const targetId = resolveAuthorizedStudentId(req, res, req.params.studentId);
    if (!targetId) return;
    const verified = privacyService.adminVerifyParentalConsent(targetId);
    res.json({
      success: true,
      message: 'Parental consent marked verified by administrator.',
      data: verified,
    });
  }
);

export default router;
