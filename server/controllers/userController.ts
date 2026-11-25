import { Router, Response } from 'express';
import { UserService } from '../services/userService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { UserEducationCreateSchema, UserProfileUpdateSchema } from '../validators/apiSchemas';
import { safeErrorMessage } from '../utils/httpErrors';
import { notificationRepository } from '../repositories/notificationRepository';

const router = Router();
const userService = new UserService();

/** GET /api/users/profile — get authenticated user's profile and education history. */
router.get('/profile', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const data = userService.getProfile(req.user!.userId);
    res.json({ success: true, data });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: safeErrorMessage(err, 'Failed to retrieve profile.', 500),
    });
  }
});

/** PUT /api/users/profile — update authenticated user's own profile (never caller-supplied user_id). */
router.put('/profile', authenticateToken, validate(UserProfileUpdateSchema, 'body'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const body = req.body as Record<string, unknown>;
    const updated = userService.updateProfile(req.user!.userId, {
      name: typeof body.name === 'string' ? body.name : undefined,
      date_of_birth: body.date_of_birth === null ? null : typeof body.date_of_birth === 'string' ? body.date_of_birth : undefined,
      education_level: typeof body.education_level === 'string' ? body.education_level : undefined,
      school: body.school === null ? null : typeof body.school === 'string' ? body.school : undefined,
      university: body.university === null ? null : typeof body.university === 'string' ? body.university : undefined,
      major: body.major === null ? null : typeof body.major === 'string' ? body.major : undefined,
      graduation_year:
        body.graduation_year === null ? null : typeof body.graduation_year === 'number' ? body.graduation_year : undefined,
      language: typeof body.language === 'string' ? body.language : undefined,
      location: body.location === null ? null : typeof body.location === 'string' ? body.location : undefined,
      target_career: body.target_career === null ? null : typeof body.target_career === 'string' ? body.target_career : undefined,
      interests: Array.isArray(body.interests) || typeof body.interests === 'string' ? (body.interests as string[] | string) : undefined,
      favorite_subjects:
        Array.isArray(body.favorite_subjects) || typeof body.favorite_subjects === 'string'
          ? (body.favorite_subjects as string[] | string)
          : undefined,
      goals: body.goals === null ? null : typeof body.goals === 'string' ? body.goals : undefined,
    });
    res.json({ success: true, data: updated });
  } catch (err: unknown) {
    res.status(400).json({
      success: false,
      error: safeErrorMessage(err, 'Failed to update profile.', 400),
    });
  }
});

/** POST /api/users/education — add an education history milestone for authenticated user. */
router.post('/education', authenticateToken, validate(UserEducationCreateSchema, 'body'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { institution, degree, start_date, end_date, achievements } = req.body;
    const record = userService.addEducation(req.user!.userId, {
      institution: String(institution),
      degree: String(degree),
      start_date: start_date ? String(start_date) : null,
      end_date: end_date ? String(end_date) : null,
      achievements: achievements ? String(achievements) : null,
    });

    res.status(201).json({ success: true, data: record });
  } catch (err: unknown) {
    res.status(400).json({
      success: false,
      error: safeErrorMessage(err, 'Failed to add education record.', 400),
    });
  }
});

/** DELETE /api/users/education/:id — delete an education history entry owned by authenticated user. */
router.delete('/education/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const removed = userService.deleteEducation(req.user!.userId, req.params.id);
  if (!removed) {
    res.status(404).json({ success: false, error: 'Education record not found.' });
    return;
  }
  res.json({ success: true });
});

/** GET /api/users/notifications — list authenticated user's persisted notifications. */
router.get('/notifications', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const rawLimit = Number(req.query.limit);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 30;
    const notifications = notificationRepository.listByUser(req.user!.userId, limit);
    const unreadCount = notificationRepository.getUnreadCount(req.user!.userId);
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (err: unknown) {
    res.status(500).json({
      success: false,
      error: safeErrorMessage(err, 'Failed to load notifications.', 500),
    });
  }
});

/** PATCH /api/users/notifications/:id/read — mark one owned notification as read. */
router.patch('/notifications/:id/read', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const updated = notificationRepository.markRead(req.user!.userId, req.params.id);
  if (!updated) {
    res.status(404).json({ success: false, error: 'Notification not found.' });
    return;
  }
  res.json({ success: true, unreadCount: notificationRepository.getUnreadCount(req.user!.userId) });
});

/** POST /api/users/notifications/read-all — mark all notifications read for authenticated user. */
router.post('/notifications/read-all', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const marked = notificationRepository.markAllRead(req.user!.userId);
  res.json({ success: true, marked, unreadCount: 0 });
});

/** DELETE /api/users/notifications/:id — delete one owned notification. */
router.delete('/notifications/:id', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const removed = notificationRepository.remove(req.user!.userId, req.params.id);
  if (!removed) {
    res.status(404).json({ success: false, error: 'Notification not found.' });
    return;
  }
  res.json({ success: true, unreadCount: notificationRepository.getUnreadCount(req.user!.userId) });
});

export default router;
