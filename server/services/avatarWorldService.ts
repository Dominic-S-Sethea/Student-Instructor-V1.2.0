import { AvatarRepository } from '../repositories/avatarRepository';
import { AnalyticsRepository } from '../repositories/analyticsRepository';
import { IntelligenceRepository } from '../repositories/intelligenceRepository';
import { PrivacyService } from './privacyService';
import { HttpError, NotFoundError } from '../utils/httpErrors';
import {
  AvatarProfile,
  VirtualRoom,
  RoomObject,
  AvatarItem,
  StudentAchievement,
  WorldLocation
} from '../types/avatarTypes';

export interface WorldStateResponse {
  avatarProfile: AvatarProfile;
  room: VirtualRoom & {
    objects: (RoomObject & { item: AvatarItem })[];
    wallAchievements: (StudentAchievement & { achievement: any })[];
  };
  inventory: Array<{
    id: string;
    student_id: string;
    item_id: string;
    quantity: number;
    acquired_at: string;
    is_equipped: number;
    item: AvatarItem;
  }>;
  availableItems: AvatarItem[];
  achievements: (StudentAchievement & { achievement: any })[];
  locations: WorldLocation[];
  intelligenceSnippet: {
    gritPersistence: number;
    curiosityBreadth: number;
    primaryStyle: string;
    meritPoints: number;
    streakDays: number;
  };
}

export class AvatarWorldService {
  private avatarRepo = new AvatarRepository();
  private analyticsRepo = new AnalyticsRepository();
  private intelRepo = new IntelligenceRepository();
  private privacyService = new PrivacyService();

  /**
   * Get full consolidated Avatar World state for a student
   */
  getStudentWorldState(studentId: string): WorldStateResponse {
    let profile = this.avatarRepo.getAvatarProfile(studentId);
    if (!profile) {
      profile = this.avatarRepo.upsertAvatarProfile({
        student_id: studentId,
        avatar_name: 'Cadet Scholar',
      });
    }

    const room = this.avatarRepo.getVirtualRoom(studentId)!;
    const objects = this.avatarRepo.getRoomObjects(room.id);
    const inventory = this.avatarRepo.getStudentInventory(studentId);
    const availableItems = this.avatarRepo.getAllItems();
    const achievements = this.avatarRepo.getStudentAchievements(studentId);
    const locations = this.avatarRepo.getWorldLocations();

    const wallAchievements = achievements.filter((a) => a.is_displayed_on_wall === 1);

    // Intelligence linkage
    const intelProfile = this.intelRepo.getProfile(studentId);
    const prefs = (intelProfile?.learningPreferences as any) || {};

    return {
      avatarProfile: profile,
      room: {
        ...room,
        objects,
        wallAchievements,
      },
      inventory,
      availableItems,
      achievements,
      locations,
      intelligenceSnippet: {
        gritPersistence: intelProfile?.persistenceScore || 85,
        curiosityBreadth: intelProfile?.interestPatterns?.length || 4,
        primaryStyle: prefs.primaryStyle || 'Interactive / Simulation',
        meritPoints: profile.merit_points,
        streakDays: room.study_streak_days,
      },
    };
  }

  /**
   * Update student avatar appearance and metadata (never caller-supplied level/merit_points)
   */
  updateAvatar(studentId: string, updateData: Partial<AvatarProfile>): AvatarProfile {
    const isNew = !this.avatarRepo.getAvatarProfile(studentId);
    const { level: _lvl, merit_points: _mp, student_id: _sid, ...safeAppearance } = updateData;
    const updated = this.avatarRepo.upsertAvatarProfile({
      ...safeAppearance,
      student_id: studentId,
    });

    if (this.privacyService.canCollectAnalytics(studentId)) {
      this.analyticsRepo.logActivityEvent({
        student_id: studentId,
        user_id: studentId,
        event_type: isNew ? 'avatar_created' : 'avatar_updated',
        metadata: {
          gender_presentation: updated.gender_presentation,
          clothing_outfit: updated.clothing_outfit,
          accessory: updated.accessory,
          expression: updated.expression,
        },
      });
    }

    return updated;
  }

  /**
   * Customize personal room background, wall color, and theme (never caller-supplied study_streak_days)
   */
  customizeRoom(studentId: string, roomData: Partial<VirtualRoom>): VirtualRoom {
    const { study_streak_days: _streak, student_id: _sid, id: _rid, ...safeRoom } = roomData;
    const updated = this.avatarRepo.updateVirtualRoom(studentId, safeRoom);

    if (this.privacyService.canCollectAnalytics(studentId)) {
      this.analyticsRepo.logActivityEvent({
        student_id: studentId,
        user_id: studentId,
        event_type: 'room_customized',
        metadata: {
          theme: updated.background_theme,
          wallColor: updated.wall_color,
          floorStyle: updated.floor_style,
        },
      });
    }

    return updated;
  }

  /**
   * Place an item from inventory into the room (verifies ownership for locked items)
   */
  placeItemInRoom(
    studentId: string,
    payload: {
      item_id: string;
      position_x: number;
      position_y: number;
      layer: 'floor' | 'wall' | 'desk' | 'shelf';
      rotation?: number;
    }
  ): RoomObject {
    const item = this.avatarRepo.getItemById(payload.item_id);
    if (!item) {
      throw new NotFoundError('Avatar item not found.');
    }
    const unlockType = String(item.unlock_condition_type || 'default').toLowerCase();
    const isStarterFree = unlockType === 'default' || unlockType === 'free';
    if (!isStarterFree && !this.avatarRepo.hasInventoryItem(studentId, payload.item_id)) {
      throw new HttpError(403, 'Item is not unlocked in your inventory.');
    }
    const room = this.avatarRepo.getVirtualRoom(studentId);
    if (!room) {
      throw new NotFoundError('Virtual room not found.');
    }
    const placed = this.avatarRepo.placeRoomObject(room.id, payload);

    if (this.privacyService.canCollectAnalytics(studentId)) {
      this.analyticsRepo.logActivityEvent({
        student_id: studentId,
        user_id: studentId,
        event_type: 'item_placed',
        metadata: {
          itemId: payload.item_id,
          itemName: item.name,
          category: item.category,
          layer: payload.layer,
          positionX: payload.position_x,
          positionY: payload.position_y,
        },
      });
    }

    return placed;
  }

  /**
   * Remove an object from the room
   */
  removeObjectFromRoom(studentId: string, objectId: string): boolean {
    const room = this.avatarRepo.getVirtualRoom(studentId);
    if (!room) return false;
    return this.avatarRepo.removeRoomObject(objectId, room.id);
  }

  /**
   * Update object position (re-arranging)
   */
  updateObjectPosition(studentId: string, objectId: string, posX: number, posY: number): boolean {
    const room = this.avatarRepo.getVirtualRoom(studentId);
    if (!room) return false;
    return this.avatarRepo.updateRoomObjectPosition(objectId, room.id, posX, posY);
  }

  /**
   * Toggle displaying an achievement on the achievement wall
   */
  toggleWallAchievement(studentId: string, achievementId: string, display: boolean, slotIndex?: number): boolean {
    const success = this.avatarRepo.toggleAchievementWall(studentId, achievementId, display, slotIndex);

    if (this.privacyService.canCollectAnalytics(studentId)) {
      this.analyticsRepo.logActivityEvent({
        student_id: studentId,
        user_id: studentId,
        event_type: 'achievement_viewed',
        metadata: {
          achievementId,
          displayedOnWall: display,
          slotIndex,
        },
      });
    }

    return success;
  }

  /**
   * Track entering room or spending time
   */
  trackRoomEntry(studentId: string): void {
    this.analyticsRepo.logActivityEvent({
      student_id: studentId,
      user_id: studentId,
      event_type: 'room_entered',
      metadata: {
        enteredAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Track clicking a location in the hallway navigation
   */
  trackLocationClick(studentId: string, locationSlug: string): void {
    this.analyticsRepo.logActivityEvent({
      student_id: studentId,
      user_id: studentId,
      event_type: 'location_clicked',
      metadata: {
        destinationSlug: locationSlug,
      },
    });
  }

  /**
   * Track item inspection in room or inventory
   */
  trackItemView(studentId: string, itemId: string): void {
    const item = this.avatarRepo.getItemById(itemId);
    this.analyticsRepo.logActivityEvent({
      student_id: studentId,
      user_id: studentId,
      event_type: 'item_viewed',
      metadata: {
        itemId,
        itemName: item?.name,
        educationalValue: item?.educational_value,
      },
    });
  }

  /**
   * Track session time spent in Avatar World
   */
  trackTimeSpent(studentId: string, seconds: number, area: string): void {
    this.analyticsRepo.logActivityEvent({
      student_id: studentId,
      user_id: studentId,
      event_type: 'time_spent',
      duration: seconds,
      metadata: {
        area,
        seconds,
      },
    });
  }
}
