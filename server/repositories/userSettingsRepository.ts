import { getDatabase } from '../db/connection';

export interface UserSettingsRow {
  user_id: string;
  settings_json: string;
  updated_at: string;
}

export class UserSettingsRepository {
  public getRawByUserId(userId: string): UserSettingsRow | null {
    const db = getDatabase();
    const row = db
      .prepare('SELECT user_id, settings_json, updated_at FROM user_settings WHERE user_id = ?')
      .get(userId) as UserSettingsRow | undefined;
    return row ?? null;
  }

  public upsert(userId: string, settingsJson: string): UserSettingsRow {
    const db = getDatabase();
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO user_settings (user_id, settings_json, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         settings_json = excluded.settings_json,
         updated_at = excluded.updated_at`
    ).run(userId, settingsJson, now);
    return { user_id: userId, settings_json: settingsJson, updated_at: now };
  }

  public deleteByUserId(userId: string): boolean {
    const db = getDatabase();
    const res = db.prepare('DELETE FROM user_settings WHERE user_id = ?').run(userId);
    return Number(res.changes) > 0;
  }
}

export const userSettingsRepository = new UserSettingsRepository();
