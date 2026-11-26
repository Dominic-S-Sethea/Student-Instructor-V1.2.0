import crypto from 'node:crypto';
import { getDatabase } from '../db/connection';

export type NotificationCategory = 'deadline' | 'scholarship' | 'privacy' | 'study' | 'system';

export interface UserNotificationRow {
  id: string;
  user_id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  action_tab: string | null;
  dedupe_key: string | null;
  is_read: number;
  created_at: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  actionTab: string | null;
  isRead: boolean;
  createdAt: string;
}

function mapNotification(row: UserNotificationRow): UserNotification {
  return {
    id: row.id,
    userId: row.user_id,
    category: row.category,
    title: row.title,
    body: row.body,
    actionTab: row.action_tab,
    isRead: row.is_read === 1,
    createdAt: row.created_at,
  };
}

export class NotificationRepository {
  public listByUser(userId: string, limit = 30): UserNotification[] {
    const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));
    const rows = getDatabase()
      .prepare(
        `SELECT * FROM user_notifications
         WHERE user_id = ?
         ORDER BY is_read ASC, created_at DESC
         LIMIT ?`
      )
      .all(userId, safeLimit) as UserNotificationRow[];
    return rows.map(mapNotification);
  }

  public getUnreadCount(userId: string): number {
    const row = getDatabase()
      .prepare('SELECT COUNT(*) AS count FROM user_notifications WHERE user_id = ? AND is_read = 0')
      .get(userId) as { count?: number } | undefined;
    return Number(row?.count ?? 0);
  }

  public create(params: {
    userId: string;
    category: NotificationCategory;
    title: string;
    body: string;
    actionTab?: string | null;
    dedupeKey?: string | null;
  }): UserNotification | null {
    const db = getDatabase();
    const now = new Date().toISOString();
    const id = `ntf-${crypto.randomUUID()}`;
    const title = params.title.trim().slice(0, 140);
    const body = params.body.trim().slice(0, 400);
    if (!title || !body) return null;

    if (params.dedupeKey) {
      const existing = db
        .prepare('SELECT * FROM user_notifications WHERE user_id = ? AND dedupe_key = ?')
        .get(params.userId, params.dedupeKey) as UserNotificationRow | undefined;
      if (existing) {
        return mapNotification(existing);
      }
    }

    db.prepare(
      `INSERT INTO user_notifications (
        id, user_id, category, title, body, action_tab, dedupe_key, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`
    ).run(
      id,
      params.userId,
      params.category,
      title,
      body,
      params.actionTab ?? null,
      params.dedupeKey ?? null,
      now
    );

    const inserted = db.prepare('SELECT * FROM user_notifications WHERE id = ?').get(id) as UserNotificationRow;
    return mapNotification(inserted);
  }

  public markRead(userId: string, notificationId: string): boolean {
    const res = getDatabase()
      .prepare('UPDATE user_notifications SET is_read = 1 WHERE id = ? AND user_id = ?')
      .run(notificationId, userId);
    return Number(res.changes) > 0;
  }

  public markAllRead(userId: string): number {
    const res = getDatabase()
      .prepare('UPDATE user_notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0')
      .run(userId);
    return Number(res.changes);
  }

  public remove(userId: string, notificationId: string): boolean {
    const res = getDatabase()
      .prepare('DELETE FROM user_notifications WHERE id = ? AND user_id = ?')
      .run(notificationId, userId);
    return Number(res.changes) > 0;
  }
}

export const notificationRepository = new NotificationRepository();
