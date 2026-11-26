import { Router, Response } from 'express';
import { PrivacyService } from '../services/privacyService';
import { hermesMemoryService } from '../services/hermesMemoryService';
import {
  authenticateToken,
  requireRole,
  resolveAuthorizedStudentId,
  AuthenticatedRequest,
} from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validationMiddleware';
import { ParentVerifySchema, PrivacyConsentUpdateSchema } from '../validators/domainSchemas';
import { sendRouteError } from '../utils/httpErrors';
import { executeStudentRightToErasure } from '../services/dataPipelineValidator';

const router = Router();
const privacyService = new PrivacyService();
const erasureLimiter = rateLimiter(
  60 * 60 * 1000,
  5,
  'Too many data erasure requests. Please wait an hour before trying again.'
);

/** GET /api/privacy/consent — get authenticated user's own consent configuration. */
router.get('/consent', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const consent = privacyService.getConsent(req.user!.userId);
    res.json({ success: true, data: consent });
  } catch (err: unknown) {
    sendRouteError(res, err, 'Failed to load consent.');
  }
});

/** POST /api/privacy/consent — update or withdraw authenticated user's own consent flags. */
router.post(
  '/consent',
  authenticateToken,
  validate(PrivacyConsentUpdateSchema, 'body'),
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const body = req.body as Record<string, unknown>;
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
      sendRouteError(res, err, 'Failed to update consent.');
    }
  }
);

/** POST /api/privacy/erasure — transactional right-to-erasure across analytics, AI memory, and research pipelines. */
router.post('/erasure', authenticateToken, erasureLimiter, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const result = executeStudentRightToErasure(req.user!.userId);
    const consent = privacyService.getConsent(req.user!.userId);
    res.json({
      success: true,
      message: 'All optional telemetry, AI memory, feature store, and research participation records erased.',
      erased: result.erasedCounts,
      totalRowsErased: result.totalRowsErased,
      data: consent,
    });
  } catch (err: unknown) {
    sendRouteError(res, err, 'Failed to erase student pipeline records.');
  }
});

/** POST /api/privacy/parent-verify — record guardian email pending owner verification (does not auto-verify). */
router.post(
  '/parent-verify',
  authenticateToken,
  validate(ParentVerifySchema, 'body'),
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const { parentEmail } = req.body as { parentEmail: string };
      const pending = privacyService.requestParentalVerification(req.user!.userId, parentEmail);
      res.json({
        success: true,
        message:
          'Parental email recorded. Dependent collection remains disabled until owner-approved guardian verification completes.',
        data: pending,
      });
    } catch (err: unknown) {
      sendRouteError(res, err, 'Failed to record guardian verification request.');
    }
  }
);

/** POST /api/privacy/parent-verify/:studentId/approve — admin-only completion of guardian verification. */
router.post(
  '/parent-verify/:studentId/approve',
  authenticateToken,
  requireRole('admin'),
  (req: AuthenticatedRequest, res: Response): void => {
    try {
      const targetId = resolveAuthorizedStudentId(req, res, req.params.studentId);
      if (!targetId) return;
      const verified = privacyService.adminVerifyParentalConsent(targetId);
      res.json({
        success: true,
        message: 'Parental consent marked verified by administrator.',
        data: verified,
      });
    } catch (err: unknown) {
      sendRouteError(res, err, 'Failed to approve guardian verification.');
    }
  }
);

export default router;
