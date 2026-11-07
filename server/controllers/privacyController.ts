import { Router, Response } from 'express';
import { PrivacyService } from '../services/privacyService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();
const privacyService = new PrivacyService();

/** 
 * @route GET /api/privacy/consent
 * @desc Get current student privacy and consent configuration
 * auth: requires valid Bearer token; returns only the authenticated user's own consent record
 */
router.get('/consent', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }
    const consent = privacyService.getConsent(studentId);

    res.json({
      success: true,
      data: consent
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/** 
 * @route POST /api/privacy/consent
 * @desc Update student consent flags
 * auth: requires valid Bearer token; updates only the authenticated user's own consent record
 */
router.post('/consent', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }
    const updated = privacyService.updateConsent(studentId, req.body);

    res.json({
      success: true,
      message: 'Privacy and data tracking preferences updated.',
      data: updated
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/** 
 * @route POST /api/privacy/parent-verify
 * @desc Verify parental consent for minors
 * auth: requires valid Bearer token; updates only the authenticated user's own consent record
 */
router.post('/parent-verify', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const studentId = req.user?.userId;
    if (!studentId) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }
    const { parentEmail } = req.body;

    if (!parentEmail || !parentEmail.includes('@')) {
      res.status(400).json({ success: false, error: 'A valid parental email is required for verification.' });
      return;
    }

    const verified = privacyService.verifyParentalConsent(studentId, parentEmail);

    res.json({
      success: true,
      message: 'Parental consent verified successfully.',
      data: verified
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
