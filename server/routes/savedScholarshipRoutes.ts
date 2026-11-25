import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validationMiddleware';
import { savedScholarshipRepository, SavedChecklistItem, SavedScholarshipStatus } from '../repositories/savedScholarshipRepository';
import { notificationRepository } from '../repositories/notificationRepository';
import { ScholarshipService } from '../services/scholarshipService';
import { safeErrorMessage } from '../utils/httpErrors';

const router = Router();
const scholarshipService = new ScholarshipService();
const savedWriteLimiter = rateLimiter(60000, 60, 'Too many bookmark updates. Please slow down.');

const ChecklistItemSchema = z.object({
  id: z.string().trim().min(1).max(64),
  label: z.string().trim().min(1).max(160),
  done: z.boolean(),
});

const SaveBookmarkSchema = z.object({
  scholarshipId: z.string().trim().min(1).max(120),
  status: z.enum(['saved', 'preparing', 'submitted', 'awarded', 'archived']).optional(),
  targetNote: z.string().max(500).optional(),
  checklist: z.array(ChecklistItemSchema).max(25).optional(),
});

const PatchBookmarkSchema = z.object({
  status: z.enum(['saved', 'preparing', 'submitted', 'awarded', 'archived']).optional(),
  targetNote: z.string().max(500).optional(),
  checklist: z.array(ChecklistItemSchema).max(25).optional(),
});

const SyncBookmarksSchema = z.object({
  scholarshipIds: z.array(z.string().trim().min(1).max(120)).max(50),
});

function hydrateBookmarks(userId: string) {
  const savedRows = savedScholarshipRepository.listByUser(userId);
  return savedRows.map((entry) => ({
    ...entry,
    scholarship: scholarshipService.getScholarshipById(entry.scholarshipId),
  }));
}

function maybeNotifyClosingSoon(userId: string, scholarshipId: string): void {
  const sch = scholarshipService.getScholarshipById(scholarshipId);
  if (!sch) return;
  if (typeof sch.daysRemaining === 'number' && sch.daysRemaining > 0 && sch.daysRemaining <= 45) {
    notificationRepository.create({
      userId,
      category: 'deadline',
      title: `Deadline approaching: ${sch.name}`,
      body: `${sch.name} closes in ${sch.daysRemaining} day(s) (${sch.deadline || 'check official portal'}). Open Saved Scholarships to review your prep checklist.`,
      actionTab: 'scholarships',
      dedupeKey: `sch-deadline:${scholarshipId}`,
    });
  }
}

/** GET /api/scholarships/saved — list authenticated user's persisted bookmarks & checklists. */
router.get('/', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const saved = hydrateBookmarks(req.user!.userId);
    res.json({ success: true, saved, totalCount: saved.length });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: safeErrorMessage(err, 'Failed to load saved scholarships.', 500) });
  }
});

/** POST /api/scholarships/saved — save a scholarship bookmark for the authenticated user. */
router.post('/', authenticateToken, savedWriteLimiter, validate(SaveBookmarkSchema, 'body'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const body = req.body as {
      scholarshipId: string;
      status?: SavedScholarshipStatus;
      targetNote?: string;
      checklist?: SavedChecklistItem[];
    };
    const saved = savedScholarshipRepository.save(req.user!.userId, body.scholarshipId, {
      status: body.status,
      targetNote: body.targetNote,
      checklist: body.checklist,
    });
    if (!saved) {
      res.status(404).json({ success: false, error: 'Scholarship not found.' });
      return;
    }
    maybeNotifyClosingSoon(req.user!.userId, body.scholarshipId);
    res.status(201).json({
      success: true,
      data: {
        ...saved,
        scholarship: scholarshipService.getScholarshipById(saved.scholarshipId),
      },
    });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: safeErrorMessage(err, 'Failed to save scholarship.', 400) });
  }
});

/** POST /api/scholarships/saved/sync — merge guest localStorage bookmark IDs into user's SQLite bookmarks. */
router.post('/sync', authenticateToken, savedWriteLimiter, validate(SyncBookmarksSchema, 'body'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const { scholarshipIds } = req.body as { scholarshipIds: string[] };
    const merged = savedScholarshipRepository.syncIds(req.user!.userId, scholarshipIds);
    for (const item of merged) {
      maybeNotifyClosingSoon(req.user!.userId, item.scholarshipId);
    }
    const saved = hydrateBookmarks(req.user!.userId);
    res.json({ success: true, saved, totalCount: saved.length });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: safeErrorMessage(err, 'Failed to sync bookmarks.', 400) });
  }
});

/** PATCH /api/scholarships/saved/:scholarshipId — update bookmark status, notes, or checklist items. */
router.patch('/:scholarshipId', authenticateToken, savedWriteLimiter, validate(PatchBookmarkSchema, 'body'), (req: AuthenticatedRequest, res: Response): void => {
  try {
    const body = req.body as {
      status?: SavedScholarshipStatus;
      targetNote?: string;
      checklist?: SavedChecklistItem[];
    };
    const updated = savedScholarshipRepository.update(req.user!.userId, req.params.scholarshipId, body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Saved scholarship not found.' });
      return;
    }
    res.json({
      success: true,
      data: {
        ...updated,
        scholarship: scholarshipService.getScholarshipById(updated.scholarshipId),
      },
    });
  } catch (err: unknown) {
    res.status(400).json({ success: false, error: safeErrorMessage(err, 'Failed to update saved scholarship.', 400) });
  }
});

/** DELETE /api/scholarships/saved/:scholarshipId — remove a bookmark owned by authenticated user. */
router.delete('/:scholarshipId', authenticateToken, savedWriteLimiter, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const removed = savedScholarshipRepository.remove(req.user!.userId, req.params.scholarshipId);
    if (!removed) {
      res.status(404).json({ success: false, error: 'Saved scholarship not found.' });
      return;
    }
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: safeErrorMessage(err, 'Failed to remove bookmark.', 500) });
  }
});

export default router;
