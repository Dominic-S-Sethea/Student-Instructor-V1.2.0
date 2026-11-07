import {
  ClientWorldState,
  ClientAvatarProfile,
  ClientVirtualRoom,
  ClientRoomObject,
} from '../types';
import { apiGet, apiPost } from './apiClient';

const BASE_URL = '/api/avatar-world';

export const avatarWorldClient = {
  /**
   * Fetch complete world state for the student
   */
  async getWorldState(studentId: string = 'usr-student-01'): Promise<ClientWorldState> {
    const res = await apiGet(`${BASE_URL}/state?studentId=${encodeURIComponent(studentId)}`)
    if (!res.ok) {
      throw new Error(`Failed to load avatar world state (${res.status})`);
    }
    const json = await res.json();
    return json.data;
  },

  /**
   * Update student avatar customizations
   */
  async saveAvatarProfile(
    studentId: string,
    profileData: Partial<ClientAvatarProfile>
  ): Promise<ClientAvatarProfile> {
    const res = await apiPost(`${BASE_URL}/avatar`, { studentId, ...profileData });
    if (!res.ok) throw new Error('Failed to update avatar profile');
    const json = await res.json();
    return json.data;
  },

  /**
   * Customize room wallpaper, floor style, or room name
   */
  async customizeRoom(
    studentId: string,
    roomData: Partial<ClientVirtualRoom>
  ): Promise<ClientVirtualRoom> {
    const res = await apiPost(`${BASE_URL}/room`, { studentId, ...roomData });
    if (!res.ok) throw new Error('Failed to customize room');
    const json = await res.json();
    return json.data;
  },

  /**
   * Place an item from inventory into room
   */
  async placeObject(
    studentId: string,
    payload: {
      item_id: string;
      position_x: number;
      position_y: number;
      layer: 'floor' | 'wall' | 'desk' | 'shelf';
      rotation?: number;
    }
  ): Promise<ClientRoomObject> {
    const res = await apiPost(`${BASE_URL}/room/objects`, { studentId, ...payload });
    if (!res.ok) throw new Error('Failed to place item');
    const json = await res.json();
    return json.data;
  },

  /**
   * Remove object from room back into inventory
   */
  async removeObject(studentId: string, objectId: string): Promise<boolean> {
    const res = await apiPost(`${BASE_URL}/room/objects/${objectId}/remove`);
    if (!res.ok) throw new Error('Failed to remove item');
    const json = await res.json();
    return json.success;
  },

  /**
   * Update position of object in room
   */
  async repositionObject(
    studentId: string,
    objectId: string,
    position_x: number,
    position_y: number
  ): Promise<boolean> {
    const res = await apiPost(`${BASE_URL}/room/objects/${objectId}/position`, { studentId, position_x, position_y });
    if (!res.ok) throw new Error('Failed to reposition item');
    const json = await res.json();
    return json.success;
  },

  /**
   * Toggle achievement wall display
   */
  async toggleWallAchievement(
    studentId: string,
    achievementId: string,
    display: boolean,
    slotIndex?: number
  ): Promise<boolean> {
    const res = await apiPost(`${BASE_URL}/achievements/wall`, { studentId, achievement_id: achievementId, display, slot_index: slotIndex });
    if (!res.ok) throw new Error('Failed to toggle achievement wall');
    const json = await res.json();
    return json.success;
  },

  /**
   * Analytics telemetry dispatchers
   */
  async trackRoomEntry(studentId: string = 'usr-student-01') {
    await apiPost(`${BASE_URL}/visit`, { studentId });
  },

  async trackLocationClick(studentId: string = 'usr-student-01', slug: string) {
    await apiPost(`${BASE_URL}/location-click`, { studentId, slug });
  },

  async trackItemView(studentId: string = 'usr-student-01', itemId: string) {
    await apiPost(`${BASE_URL}/item-view`, { studentId, item_id: itemId });
  },

  async trackTimeSpent(studentId: string = 'usr-student-01', seconds: number, area: string) {
    await apiPost(`${BASE_URL}/time-spent`, { studentId, seconds, area });
  },
};
