import { Router, Response } from 'express';
import { AvatarWorldService } from '../services/avatarWorldService';
import { PrivacyService } from '../services/privacyService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { AvatarObjectPositionSchema } from '../validators/apiSchemas';
import { HttpError, safeErrorMessage } from '../utils/httpErrors';

function sendAvatarError(res: Response, error: unknown, fallback: string) {
  const status = error instanceof HttpError ? error.status : 500;
  return res.status(status).json({
    success: false,
    error: safeErrorMessage(error, fallback, status),
  });
}

const router = Router();
const worldService = new AvatarWorldService();
const privacyService = new PrivacyService();

router.use(authenticateToken);

/** GET /api/avatar-world/state */
router.get('/state', (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const state = worldService.getStudentWorldState(studentId);
    return res.json({ success: true, data: state });
  } catch (error: unknown) {
    return sendAvatarError(res, error, 'Failed to load avatar state');
  }
});

/** POST /api/avatar-world/avatar */
router.post('/avatar', (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const profile = worldService.updateAvatar(studentId, req.body);
    return res.json({ success: true, data: profile });
  } catch (error: unknown) {
    return sendAvatarError(res, error, 'Failed to update avatar');
  }
});

/** PUT /api/avatar-world/room */
router.put('/room', (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const updatedRoom = worldService.customizeRoom(studentId, req.body);
    return res.json({ success: true, data: updatedRoom });
  } catch (error: unknown) {
    return sendAvatarError(res, error, 'Failed to update room');
  }
});

/** POST /api/avatar-world/room/objects */
router.post('/room/objects', (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { item_id, position_x, position_y, layer, rotation } = (req.body || {}) as Record<string, unknown>;

    if (!item_id || typeof item_id !== 'string') {
      return res.status(400).json({ success: false, error: 'item_id is required' });
    }

    const posX = position_x === undefined ? 50 : Number(position_x);
    const posY = position_y === undefined ? 50 : Number(position_y);
    const rot = rotation === undefined ? 0 : Number(rotation);
    if (!Number.isFinite(posX) || !Number.isFinite(posY) || !Number.isFinite(rot)) {
      return res.status(400).json({ success: false, error: 'position_x, position_y, and rotation must be finite numbers.' });
    }

    const placed = worldService.placeItemInRoom(studentId, {
      item_id,
      position_x: posX,
      position_y: posY,
      layer: (layer === 'wall' || layer === 'desk' || layer === 'shelf' ? layer : 'floor'),
      rotation: rot,
    });

    return res.json({ success: true, data: placed });
  } catch (error: unknown) {
    return sendAvatarError(res, error, 'Failed to place room object');
  }
});

/** DELETE /api/avatar-world/room/objects/:id */
router.delete('/room/objects/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const removed = worldService.removeObjectFromRoom(studentId, req.params.id);
    if (!removed) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in room.',
        message: 'Item not found in room.',
      });
    }
    return res.json({
      success: true,
      message: 'Item removed from room.',
    });
  } catch (error: unknown) {
    return sendAvatarError(res, error, 'Failed to remove object');
  }
});

/** PATCH /api/avatar-world/room/objects/:id */
router.patch('/room/objects/:id', validate(AvatarObjectPositionSchema, 'body'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { position_x, position_y } = req.body as { position_x: number; position_y: number };
    const updated = worldService.updateObjectPosition(
      studentId,
      req.params.id,
      position_x,
      position_y
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Room object not found.' });
    }
    return res.json({ success: true });
  } catch (error: unknown) {
    return sendAvatarError(res, error, 'Failed to move object');
  }
});

/** POST /api/avatar-world/achievements/wall */
router.post('/achievements/wall', (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    const { achievement_id, display, slot_index } = (req.body || {}) as Record<string, unknown>;
    if (!achievement_id || typeof achievement_id !== 'string') {
      return res.status(400).json({ success: false, error: 'achievement_id is required' });
    }
    const success = worldService.toggleWallAchievement(
      studentId,
      achievement_id,
      display !== false,
      slot_index ? Number(slot_index) : undefined
    );
    return res.json({ success });
  } catch (error: unknown) {
    return sendAvatarError(res, error, 'Failed to update wall');
  }
});

/** POST /api/avatar-world/visit */
router.post('/visit', (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    if (!privacyService.canCollectAnalytics(studentId)) {
      return res.json({ success: true, persisted: false, reason: 'consent_disabled' });
    }
    worldService.trackRoomEntry(studentId);
    return res.json({ success: true, persisted: true });
  } catch (error: unknown) {
    return sendAvatarError(res, error, 'Failed to log visit');
  }
});

/** POST /api/avatar-world/location-click */
router.post('/location-click', (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    if (!privacyService.canCollectAnalytics(studentId)) {
      return res.json({ success: true, persisted: false, reason: 'consent_disabled' });
    }
    const slug = typeof req.body?.slug === 'string' ? req.body.slug : 'unknown';
    worldService.trackLocationClick(studentId, slug);
    return res.json({ success: true, persisted: true });
  } catch (error: unknown) {
    return sendAvatarError(res, error, 'Failed to log click');
  }
});

/** POST /api/avatar-world/item-view */
router.post('/item-view', (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    if (!privacyService.canCollectAnalytics(studentId)) {
      return res.json({ success: true, persisted: false, reason: 'consent_disabled' });
    }
    const itemId = typeof req.body?.item_id === 'string' ? req.body.item_id : '';
    worldService.trackItemView(studentId, itemId);
    return res.json({ success: true, persisted: true });
  } catch (error: unknown) {
    return sendAvatarError(res, error, 'Failed to log item view');
  }
});

/** POST /api/avatar-world/time-spent */
router.post('/time-spent', (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user!.userId;
    if (!privacyService.canCollectAnalytics(studentId)) {
      return res.json({ success: true, persisted: false, reason: 'consent_disabled' });
    }
    const seconds = Number(req.body?.seconds) || 10;
    const area = typeof req.body?.area === 'string' ? req.body.area : 'room';
    worldService.trackTimeSpent(studentId, seconds, area);
    return res.json({ success: true, persisted: true });
  } catch (error: unknown) {
    return sendAvatarError(res, error, 'Failed to log time spent');
  }
});

export default router;
