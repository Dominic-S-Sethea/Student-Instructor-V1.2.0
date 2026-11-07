import { Router, Request, Response } from 'express';
import { AvatarWorldService } from '../services/avatarWorldService';

const router = Router();
const worldService = new AvatarWorldService();

const DEFAULT_STUDENT_ID = 'usr-student-01';

/**
 * GET /api/avatar-world/state
 * Retrieves complete educational identity, personal room, inventory, achievements, and hallway locations.
 */
router.get('/state', (req: Request, res: Response) => {
  try {
    const studentId = (req.query.studentId as string) || DEFAULT_STUDENT_ID;
    const state = worldService.getStudentWorldState(studentId);
    return res.json({
      success: true,
      data: state,
    });
  } catch (error: any) {
    console.error('Error fetching avatar world state:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/avatar-world/avatar
 * Updates or creates student avatar customizations
 */
router.post('/avatar', (req: Request, res: Response) => {
  try {
    const studentId = (req.body.studentId as string) || DEFAULT_STUDENT_ID;
    const profile = worldService.updateAvatar(studentId, req.body);
    return res.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error('Error saving avatar profile:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/avatar-world/room
 * Customizes student virtual study room
 */
router.put('/room', (req: Request, res: Response) => {
  try {
    const studentId = (req.body.studentId as string) || DEFAULT_STUDENT_ID;
    const updatedRoom = worldService.customizeRoom(studentId, req.body);
    return res.json({
      success: true,
      data: updatedRoom,
    });
  } catch (error: any) {
    console.error('Error customizing room:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/avatar-world/room/objects
 * Places an item from inventory into the virtual room
 */
router.post('/room/objects', (req: Request, res: Response) => {
  try {
    const studentId = (req.body.studentId as string) || DEFAULT_STUDENT_ID;
    const { item_id, position_x, position_y, layer, rotation } = req.body;

    if (!item_id) {
      return res.status(400).json({ success: false, error: 'item_id is required' });
    }

    const placed = worldService.placeItemInRoom(studentId, {
      item_id,
      position_x: Number(position_x) || 50,
      position_y: Number(position_y) || 50,
      layer: layer || 'floor',
      rotation: Number(rotation) || 0,
    });

    return res.json({
      success: true,
      data: placed,
    });
  } catch (error: any) {
    console.error('Error placing item in room:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/avatar-world/room/objects/:id
 * Removes placed item back into inventory
 */
router.delete('/room/objects/:id', (req: Request, res: Response) => {
  try {
    const studentId = (req.query.studentId as string) || (req.body.studentId as string) || DEFAULT_STUDENT_ID;
    const objectId = req.params.id;

    const removed = worldService.removeObjectFromRoom(studentId, objectId);
    return res.json({
      success: removed,
      message: removed ? 'Item removed from room.' : 'Item not found in room.',
    });
  } catch (error: any) {
    console.error('Error removing room object:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/avatar-world/room/objects/:id
 * Re-positions an existing room item
 */
router.patch('/room/objects/:id', (req: Request, res: Response) => {
  try {
    const studentId = (req.body.studentId as string) || DEFAULT_STUDENT_ID;
    const objectId = req.params.id;
    const { position_x, position_y } = req.body;

    const updated = worldService.updateObjectPosition(
      studentId,
      objectId,
      Number(position_x),
      Number(position_y)
    );

    return res.json({
      success: updated,
    });
  } catch (error: any) {
    console.error('Error updating object position:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/avatar-world/achievements/wall
 * Toggles displaying an achievement on the personal room achievement wall
 */
router.post('/achievements/wall', (req: Request, res: Response) => {
  try {
    const studentId = (req.body.studentId as string) || DEFAULT_STUDENT_ID;
    const { achievement_id, display, slot_index } = req.body;

    if (!achievement_id) {
      return res.status(400).json({ success: false, error: 'achievement_id is required' });
    }

    const success = worldService.toggleWallAchievement(
      studentId,
      achievement_id,
      display !== false,
      slot_index ? Number(slot_index) : undefined
    );

    return res.json({
      success,
    });
  } catch (error: any) {
    console.error('Error toggling achievement wall:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/avatar-world/visit
 * Logs room_entered event
 */
router.post('/visit', (req: Request, res: Response) => {
  try {
    const studentId = (req.body.studentId as string) || DEFAULT_STUDENT_ID;
    worldService.trackRoomEntry(studentId);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/avatar-world/location-click
 * Logs location_clicked event
 */
router.post('/location-click', (req: Request, res: Response) => {
  try {
    const studentId = (req.body.studentId as string) || DEFAULT_STUDENT_ID;
    const { slug } = req.body;
    worldService.trackLocationClick(studentId, slug || 'unknown');
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/avatar-world/item-view
 * Logs item_viewed event
 */
router.post('/item-view', (req: Request, res: Response) => {
  try {
    const studentId = (req.body.studentId as string) || DEFAULT_STUDENT_ID;
    const { item_id } = req.body;
    worldService.trackItemView(studentId, item_id);
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/avatar-world/time-spent
 * Logs time_spent event
 */
router.post('/time-spent', (req: Request, res: Response) => {
  try {
    const studentId = (req.body.studentId as string) || DEFAULT_STUDENT_ID;
    const { seconds, area } = req.body;
    worldService.trackTimeSpent(studentId, Number(seconds) || 10, area || 'room');
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
