import { apiFetchRaw } from './apiClient';

export interface PersistedNotification {
  id: string;
  userId: string;
  category: 'deadline' | 'scholarship' | 'privacy' | 'study' | 'system';
  title: string;
  body: string;
  actionTab: string | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationClient = {
  async list(limit = 30): Promise<{ notifications: PersistedNotification[]; unreadCount: number }> {
    const res = await apiFetchRaw<{
      success: boolean;
      data?: { notifications?: PersistedNotification[]; unreadCount?: number };
    }>(`/api/users/notifications?limit=${encodeURIComponent(String(limit))}`);
    return {
      notifications: Array.isArray(res.data?.notifications) ? res.data.notifications : [],
      unreadCount: typeof res.data?.unreadCount === 'number' ? res.data.unreadCount : 0,
    };
  },

  async markRead(id: string): Promise<void> {
    await apiFetchRaw<{ success: boolean }>(`/api/users/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PATCH',
    });
  },

  async markAllRead(): Promise<void> {
    await apiFetchRaw<{ success: boolean }>('/api/users/notifications/read-all', {
      method: 'POST',
    });
  },

  async remove(id: string): Promise<void> {
    await apiFetchRaw<{ success: boolean }>(`/api/users/notifications/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
