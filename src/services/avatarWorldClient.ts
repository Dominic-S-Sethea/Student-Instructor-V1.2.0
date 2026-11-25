import {
  ClientWorldState,
  ClientAvatarProfile,
  ClientVirtualRoom,
  ClientRoomObject,
} from '../types';
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from './apiClient';

const BASE_URL = '/api/avatar-world';

export const avatarWorldClient = {
  async getWorldState(_studentId?: string): Promise<ClientWorldState> {
    return apiGet<ClientWorldState>(`${BASE_URL}/state`);
  },

  async saveAvatarProfile(
    _studentId: string,
    profileData: Partial<ClientAvatarProfile>
  ): Promise<ClientAvatarProfile> {
    return apiPost<ClientAvatarProfile>(`${BASE_URL}/avatar`, profileData);
  },

  async customizeRoom(
    _studentId: string,
    roomData: Partial<ClientVirtualRoom>
  ): Promise<ClientVirtualRoom> {
    return apiPut<ClientVirtualRoom>(`${BASE_URL}/room`, roomData);
  },

  async placeObject(
    _studentId: string,
    payload: {
      item_id: string;
      position_x: number;
      position_y: number;
      layer: 'floor' | 'wall' | 'desk' | 'shelf';
      rotation?: number;
    }
  ): Promise<ClientRoomObject> {
    return apiPost<ClientRoomObject>(`${BASE_URL}/room/objects`, payload);
  },

  async removeObject(_studentId: string, objectId: string): Promise<boolean> {
    const res = await apiDelete<{ success?: boolean }>(`${BASE_URL}/room/objects/${encodeURIComponent(objectId)}`);
    return res?.success !== false;
  },

  async repositionObject(
    _studentId: string,
    objectId: string,
    position_x: number,
    position_y: number
  ): Promise<boolean> {
    const res = await apiPatch<{ success?: boolean }>(
      `${BASE_URL}/room/objects/${encodeURIComponent(objectId)}`,
      { position_x, position_y }
    );
    return res?.success !== false;
  },

  async toggleWallAchievement(
    _studentId: string,
    achievementId: string,
    display: boolean,
    slotIndex?: number
  ): Promise<boolean> {
    const res = await apiPost<{ success?: boolean }>(`${BASE_URL}/achievements/wall`, {
      achievement_id: achievementId,
      display,
      slot_index: slotIndex,
    });
    return res?.success !== false;
  },

  async trackRoomEntry(_studentId?: string) {
    await apiPost(`${BASE_URL}/visit`, {});
  },

  async trackLocationClick(_studentId: string, slug: string) {
    await apiPost(`${BASE_URL}/location-click`, { slug });
  },

  async trackItemView(_studentId: string, itemId: string) {
    await apiPost(`${BASE_URL}/item-view`, { item_id: itemId });
  },

  async trackTimeSpent(_studentId: string, seconds: number, area: string) {
    await apiPost(`${BASE_URL}/time-spent`, { seconds, area });
  },
};
