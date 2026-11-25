import { useCallback, useEffect, useState } from 'react';
import type { NotificationItem } from '../types';
import { notificationClient } from '../services/notificationClient';

export function usePersistedNotifications(authenticated: boolean, sessionKey: string) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!authenticated) {
      setNotifications([]);
      return;
    }
    let active = true;
    notificationClient
      .list(30)
      .then((res) => {
        if (!active) return;
        setNotifications(
          res.notifications.map((n) => ({
            id: n.id,
            title: n.title,
            message: n.body,
            timestamp: n.createdAt,
            type: n.category === 'deadline' || n.category === 'scholarship' ? 'opportunity' : 'system',
            isRead: n.isRead,
            actionTab: n.actionTab,
          }))
        );
      })
      .catch(() => {
        if (active) setNotifications([]);
      });
    return () => {
      active = false;
    };
  }, [authenticated, sessionKey]);

  const markRead = useCallback(
    (id: string) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      if (authenticated) void notificationClient.markRead(id).catch(() => {});
    },
    [authenticated]
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (authenticated) void notificationClient.markAllRead().catch(() => {});
  }, [authenticated]);

  const pushNotification = useCallback((item: NotificationItem) => {
    setNotifications((prev) => [item, ...prev]);
  }, []);

  return { notifications, markRead, markAllRead, pushNotification };
}
