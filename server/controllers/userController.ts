import { Router, Response } from 'express';
import { UserService } from '../services/userService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();
const userService = new UserService();

/**
 * @route GET /api/users/profile
 * @desc Get profile and education history of the logged-in user
 */
router.get('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const data = userService.getProfile(req.user!.userId);
    res.json({
      success: true,
      data
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to retrieve profile.' });
  }
});

/**
 * @route PUT /api/users/profile
 * @desc Update or create profile information for the logged-in user
 */
router.put('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const updated = userService.updateProfile(req.user!.userId, req.body);
    res.json({
      success: true,
      data: updated
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to update profile.' });
  }
});

/**
 * @route POST /api/users/education
 * @desc Add an education history milestone
 */
router.post('/education', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { institution, degree, start_date, end_date, achievements } = req.body;

    if (!institution || !degree) {
      res.status(400).json({ success: false, error: 'Institution and degree are required.' });
      return;
    }

    const record = userService.addEducation(req.user!.userId, {
      institution,
      degree,
      start_date,
      end_date,
      achievements
    });

    res.status(201).json({
      success: true,
      data: record
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to add education record.' });
  }
});

export default router;
