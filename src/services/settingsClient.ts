import { apiDelete, apiGet, apiPut } from './apiClient';
import {
  normalizeUserSettings,
  type PartialUserSettings,
  type UserSettings,
} from '../../shared/types/userSettings';

interface UserSettingsEnvelope {
  settings?: UserSettings;
  updatedAt?: string | null;
}

function unwrapSettings(payload: UserSettingsEnvelope | UserSettings): UserSettings {
  if (payload && typeof payload === 'object' && 'settings' in payload && payload.settings) {
    return normalizeUserSettings(payload.settings);
  }
  return normalizeUserSettings(payload);
}

export const settingsClient = {
  async getSettings(): Promise<UserSettings> {
    const res = await apiGet<UserSettingsEnvelope | UserSettings>('/api/users/settings');
    return unwrapSettings(res);
  },

  async updateSettings(patch: PartialUserSettings): Promise<UserSettings> {
    const res = await apiPut<UserSettingsEnvelope | UserSettings>('/api/users/settings', patch);
    return unwrapSettings(res);
  },

  async resetSettings(): Promise<UserSettings> {
    const res = await apiDelete<UserSettingsEnvelope | UserSettings>('/api/users/settings');
    return unwrapSettings(res);
  },
};
