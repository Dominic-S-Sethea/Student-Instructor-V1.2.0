import {
  DEFAULT_USER_SETTINGS,
  normalizeUserSettings,
  type PartialUserSettings,
  type UserSettings,
} from '../../shared/types/userSettings';
import {
  userSettingsRepository,
  type UserSettingsRepository,
} from '../repositories/userSettingsRepository';

export interface UserSettingsResult {
  settings: UserSettings;
  updatedAt: string | null;
}

export class UserSettingsService {
  private repo: UserSettingsRepository;

  constructor(repo?: UserSettingsRepository) {
    this.repo = repo || userSettingsRepository;
  }

  public getSettings(userId: string): UserSettingsResult {
    const row = this.repo.getRawByUserId(userId);
    if (!row) {
      return { settings: { ...DEFAULT_USER_SETTINGS }, updatedAt: null };
    }
    try {
      const parsed: unknown = JSON.parse(row.settings_json);
      return { settings: normalizeUserSettings(parsed), updatedAt: row.updated_at };
    } catch {
      return { settings: { ...DEFAULT_USER_SETTINGS }, updatedAt: row.updated_at };
    }
  }

  public updateSettings(userId: string, patch: PartialUserSettings): UserSettingsResult {
    const current = this.getSettings(userId).settings;
    const merged = normalizeUserSettings({ ...current, ...patch });
    const saved = this.repo.upsert(userId, JSON.stringify(merged));
    return { settings: merged, updatedAt: saved.updated_at };
  }

  public resetSettings(userId: string): UserSettingsResult {
    this.repo.deleteByUserId(userId);
    return { settings: { ...DEFAULT_USER_SETTINGS }, updatedAt: null };
  }
}

export const userSettingsService = new UserSettingsService();
