import { getDatabase, withTransaction } from '../db/connection';
import crypto from 'node:crypto';
import {
  AvatarProfile,
  AvatarItem,
  StudentInventoryItem,
  VirtualRoom,
  RoomObject,
  Achievement,
  StudentAchievement,
  WorldLocation
} from '../types/avatarTypes';

export class AvatarRepository {
  private get db() {
    return getDatabase();
  }

  // ----------------------------------------------------
  // AVATAR PROFILES
  // ----------------------------------------------------
  getAvatarProfile(studentId: string): AvatarProfile | null {
    const row = this.db
      .prepare('SELECT * FROM avatar_profiles WHERE student_id = ?')
      .get(studentId) as unknown as AvatarProfile | undefined;
    return row || null;
  }

  upsertAvatarProfile(profile: Partial<AvatarProfile> & { student_id: string }): AvatarProfile {
    return withTransaction(() => {
      const now = new Date().toISOString();
      const existing = this.getAvatarProfile(profile.student_id);

      if (existing) {
        this.db
          .prepare(`
            UPDATE avatar_profiles
            SET avatar_name = COALESCE(?, avatar_name),
                gender_presentation = COALESCE(?, gender_presentation),
                skin_tone = COALESCE(?, skin_tone),
                hair_style = COALESCE(?, hair_style),
                hair_color = COALESCE(?, hair_color),
                eye_color = COALESCE(?, eye_color),
                clothing_outfit = COALESCE(?, clothing_outfit),
                accessory = COALESCE(?, accessory),
                expression = COALESCE(?, expression),
                updated_at = ?
            WHERE student_id = ?
          `)
          .run(
            profile.avatar_name ?? null,
            profile.gender_presentation ?? null,
            profile.skin_tone ?? null,
            profile.hair_style ?? null,
            profile.hair_color ?? null,
            profile.eye_color ?? null,
            profile.clothing_outfit ?? null,
            profile.accessory ?? null,
            profile.expression ?? null,
            now,
            profile.student_id
          );
      } else {
        this.db
          .prepare(`
            INSERT INTO avatar_profiles (
              student_id, avatar_name, gender_presentation, skin_tone, hair_style, hair_color,
              eye_color, clothing_outfit, accessory, expression, level, merit_points, updated_at, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 150, ?, ?)
            ON CONFLICT(student_id) DO UPDATE SET
              avatar_name = COALESCE(excluded.avatar_name, avatar_profiles.avatar_name),
              updated_at = excluded.updated_at
          `)
          .run(
            profile.student_id,
            profile.avatar_name || 'Cadet Scholar',
            profile.gender_presentation || 'neutral',
            profile.skin_tone || '#E0AC69',
            profile.hair_style || 'short_wavy',
            profile.hair_color || '#2A2421',
            profile.eye_color || '#3B2F2F',
            profile.clothing_outfit || 'cdes_uniform',
            profile.accessory || 'glasses_round',
            profile.expression || 'smiling',
            now,
            now
          );
      }

      return this.getAvatarProfile(profile.student_id)!;
    });
  }

  addMeritPoints(studentId: string, points: number): void {
    this.db
      .prepare(`
        UPDATE avatar_profiles
        SET merit_points = merit_points + ?,
            level = CASE WHEN (merit_points + ?) >= 500 THEN 4
                         WHEN (merit_points + ?) >= 300 THEN 3
                         WHEN (merit_points + ?) >= 150 THEN 2
                         ELSE 1 END,
            updated_at = ?
        WHERE student_id = ?
      `)
      .run(points, points, points, points, new Date().toISOString(), studentId);
  }

  acquireItem(studentId: string, itemId: string): void {
    this.addInventoryItem(studentId, itemId);
  }

  // ----------------------------------------------------
  // ITEMS & INVENTORY
  // ----------------------------------------------------
  getAllItems(): AvatarItem[] {
    return this.db.prepare('SELECT * FROM avatar_items ORDER BY category ASC, name ASC').all() as unknown as AvatarItem[];
  }

  getItemById(itemId: string): AvatarItem | null {
    const row = this.db.prepare('SELECT * FROM avatar_items WHERE id = ?').get(itemId) as unknown as AvatarItem | undefined;
    return row || null;
  }

  hasInventoryItem(studentId: string, itemId: string): boolean {
    const row = this.db
      .prepare('SELECT 1 FROM student_inventory WHERE student_id = ? AND item_id = ? AND quantity > 0 LIMIT 1')
      .get(studentId, itemId);
    return Boolean(row);
  }

  getStudentInventory(studentId: string): (StudentInventoryItem & { item: AvatarItem })[] {
    const rows = this.db
      .prepare(`
        SELECT 
          si.id, si.student_id, si.item_id, si.quantity, si.acquired_at, si.is_equipped,
          ai.id as itm_id, ai.name as itm_name, ai.category as itm_category, ai.description as itm_description,
          ai.icon_key as itm_icon_key, ai.default_slot as itm_default_slot, ai.educational_value as itm_educational_value,
          ai.subject_tag as itm_subject_tag, ai.unlock_condition_type as itm_unlock_condition_type,
          ai.unlock_condition_val as itm_unlock_condition_val, ai.created_at as itm_created_at
        FROM student_inventory si
        JOIN avatar_items ai ON si.item_id = ai.id
        WHERE si.student_id = ?
        ORDER BY ai.category ASC, si.acquired_at DESC
      `)
      .all(studentId) as Array<Record<string, unknown>>;

    return rows.map((r) => ({
      id: String(r.id),
      student_id: String(r.student_id),
      item_id: String(r.item_id),
      quantity: Number(r.quantity),
      acquired_at: String(r.acquired_at),
      is_equipped: Number(r.is_equipped),
      item: {
        id: String(r.itm_id),
        name: String(r.itm_name),
        category: String(r.itm_category) as AvatarItem['category'],
        description: String(r.itm_description || ''),
        icon_key: String(r.itm_icon_key || ''),
        default_slot: String(r.itm_default_slot || '') as AvatarItem['default_slot'],
        educational_value: String(r.itm_educational_value || ''),
        subject_tag: String(r.itm_subject_tag || ''),
        unlock_condition_type: String(r.itm_unlock_condition_type || 'free') as AvatarItem['unlock_condition_type'],
        unlock_condition_val: String(r.itm_unlock_condition_val || ''),
        created_at: String(r.itm_created_at || ''),
      },
    }));
  }

  addInventoryItem(studentId: string, itemId: string): void {
    withTransaction(() => {
      const now = new Date().toISOString();
      const id = `inv-${crypto.randomUUID()}`;
      this.db
        .prepare(`
          INSERT INTO student_inventory (id, student_id, item_id, quantity, acquired_at, is_equipped)
          VALUES (?, ?, ?, 1, ?, 0)
          ON CONFLICT(student_id, item_id) DO UPDATE SET quantity = quantity + 1
        `)
        .run(id, studentId, itemId, now);
    });
  }

  // ----------------------------------------------------
  // VIRTUAL ROOM
  // ----------------------------------------------------
  getVirtualRoom(studentId: string): VirtualRoom | null {
    return withTransaction(() => {
      let room = this.db
        .prepare('SELECT * FROM virtual_rooms WHERE student_id = ?')
        .get(studentId) as unknown as VirtualRoom | undefined;

      if (!room) {
        const now = new Date().toISOString();
        const roomId = `room-${studentId}`;
        this.db
          .prepare(`
            INSERT OR IGNORE INTO virtual_rooms (
              id, student_id, room_name, background_theme, wall_color, floor_style, layout_grid_size, study_streak_days, updated_at, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, 12, 3, ?, ?)
          `)
          .run(roomId, studentId, 'Study Sanctuary', 'daylight_study', '#F0F4F8', 'warm_wood', now, now);

        room = this.db.prepare('SELECT * FROM virtual_rooms WHERE student_id = ?').get(studentId) as unknown as VirtualRoom;
      }

      return room;
    });
  }

  updateVirtualRoom(studentId: string, roomData: Partial<VirtualRoom>): VirtualRoom {
    return withTransaction(() => {
      const now = new Date().toISOString();
      this.getVirtualRoom(studentId);

      this.db
        .prepare(`
          UPDATE virtual_rooms
          SET room_name = COALESCE(?, room_name),
              background_theme = COALESCE(?, background_theme),
              wall_color = COALESCE(?, wall_color),
              floor_style = COALESCE(?, floor_style),
              updated_at = ?
          WHERE student_id = ?
        `)
        .run(
          roomData.room_name ?? null,
          roomData.background_theme ?? null,
          roomData.wall_color ?? null,
          roomData.floor_style ?? null,
          now,
          studentId
        );

      return this.getVirtualRoom(studentId)!;
    });
  }

  getRoomObjects(roomId: string): (RoomObject & { item: AvatarItem })[] {
    const rows = this.db
      .prepare(`
        SELECT 
          ro.id, ro.room_id, ro.item_id, ro.position_x, ro.position_y, ro.layer, ro.rotation, ro.is_interactive, ro.placed_at,
          ai.id as itm_id, ai.name as itm_name, ai.category as itm_category, ai.description as itm_description,
          ai.icon_key as itm_icon_key, ai.default_slot as itm_default_slot, ai.educational_value as itm_educational_value,
          ai.subject_tag as itm_subject_tag, ai.unlock_condition_type as itm_unlock_condition_type,
          ai.unlock_condition_val as itm_unlock_condition_val, ai.created_at as itm_created_at
        FROM room_objects ro
        JOIN avatar_items ai ON ro.item_id = ai.id
        WHERE ro.room_id = ?
        ORDER BY ro.layer ASC, ro.placed_at ASC
      `)
      .all(roomId) as any[];

    return rows.map((r) => ({
      id: r.id,
      room_id: r.room_id,
      item_id: r.item_id,
      position_x: r.position_x,
      position_y: r.position_y,
      layer: r.layer,
      rotation: r.rotation,
      is_interactive: r.is_interactive,
      placed_at: r.placed_at,
      item: {
        id: r.itm_id,
        name: r.itm_name,
        category: r.itm_category,
        description: r.itm_description,
        icon_key: r.itm_icon_key,
        default_slot: r.itm_default_slot,
        educational_value: r.itm_educational_value,
        subject_tag: r.itm_subject_tag,
        unlock_condition_type: r.itm_unlock_condition_type,
        unlock_condition_val: r.itm_unlock_condition_val,
        created_at: r.itm_created_at,
      },
    }));
  }

  placeRoomObject(roomId: string, objectData: { item_id: string; position_x: number; position_y: number; layer: string; rotation?: number }): RoomObject {
    const id = `obj-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    this.db
      .prepare(`
        INSERT INTO room_objects (id, room_id, item_id, position_x, position_y, layer, rotation, is_interactive, placed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
      `)
      .run(
        id,
        roomId,
        objectData.item_id,
        objectData.position_x,
        objectData.position_y,
        objectData.layer || 'floor',
        objectData.rotation || 0,
        now
      );

    const row = this.db.prepare('SELECT * FROM room_objects WHERE id = ?').get(id) as unknown as RoomObject;
    return row;
  }

  removeRoomObject(objectId: string, roomId: string): boolean {
    const res = this.db.prepare('DELETE FROM room_objects WHERE id = ? AND room_id = ?').run(objectId, roomId);
    return res.changes > 0;
  }

  updateRoomObjectPosition(objectId: string, roomId: string, position_x: number, position_y: number): boolean {
    const res = this.db
      .prepare('UPDATE room_objects SET position_x = ?, position_y = ? WHERE id = ? AND room_id = ?')
      .run(position_x, position_y, objectId, roomId);
    return res.changes > 0;
  }

  // ----------------------------------------------------
  // ACHIEVEMENTS & WALL INTEGRATION
  // ----------------------------------------------------
  getAllAchievements(): Achievement[] {
    return this.db.prepare('SELECT * FROM achievements ORDER BY category ASC, merit_points DESC').all() as unknown as Achievement[];
  }

  getStudentAchievements(studentId: string): (StudentAchievement & { achievement: Achievement })[] {
    const rows = this.db
      .prepare(`
        SELECT 
          sa.id, sa.student_id, sa.achievement_id, sa.unlocked_at, sa.is_displayed_on_wall, sa.wall_slot_index, sa.progress_percentage,
          a.id as ach_id, a.code as ach_code, a.title as ach_title, a.title_km as ach_title_km,
          a.description as ach_description, a.category as ach_category, a.badge_icon as ach_badge_icon,
          a.item_reward_id as ach_item_reward_id, a.merit_points as ach_merit_points, a.created_at as ach_created_at
        FROM student_achievements sa
        JOIN achievements a ON sa.achievement_id = a.id
        WHERE sa.student_id = ?
        ORDER BY sa.is_displayed_on_wall DESC, sa.unlocked_at DESC
      `)
      .all(studentId) as any[];

    return rows.map((r) => ({
      id: r.id,
      student_id: r.student_id,
      achievement_id: r.achievement_id,
      unlocked_at: r.unlocked_at,
      is_displayed_on_wall: r.is_displayed_on_wall,
      wall_slot_index: r.wall_slot_index,
      progress_percentage: r.progress_percentage,
      achievement: {
        id: r.ach_id,
        code: r.ach_code,
        title: r.ach_title,
        title_km: r.ach_title_km,
        description: r.ach_description,
        category: r.ach_category,
        badge_icon: r.ach_badge_icon,
        item_reward_id: r.ach_item_reward_id,
        merit_points: r.ach_merit_points,
        created_at: r.ach_created_at,
      },
    }));
  }

  toggleAchievementWall(studentId: string, achievementId: string, display: boolean, slotIndex?: number): boolean {
    if (display) {
      // Find current displayed count; cap at 4 slots
      const currentDisplayed = this.db
        .prepare('SELECT COUNT(*) as cnt FROM student_achievements WHERE student_id = ? AND is_displayed_on_wall = 1')
        .get(studentId) as { cnt: number };

      const assignedSlot = slotIndex || Math.min(4, currentDisplayed.cnt + 1);

      const res = this.db
        .prepare(`
          UPDATE student_achievements
          SET is_displayed_on_wall = 1, wall_slot_index = ?
          WHERE student_id = ? AND achievement_id = ?
        `)
        .run(assignedSlot, studentId, achievementId);
      return res.changes > 0;
    } else {
      const res = this.db
        .prepare(`
          UPDATE student_achievements
          SET is_displayed_on_wall = 0, wall_slot_index = NULL
          WHERE student_id = ? AND achievement_id = ?
        `)
        .run(studentId, achievementId);
      return res.changes > 0;
    }
  }

  // ----------------------------------------------------
  // WORLD LOCATIONS (HALLWAY NAVIGATION)
  // ----------------------------------------------------
  getWorldLocations(): WorldLocation[] {
    return this.db.prepare('SELECT * FROM world_locations ORDER BY order_index ASC').all() as unknown as WorldLocation[];
  }
}
