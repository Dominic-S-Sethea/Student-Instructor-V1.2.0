import { useCallback, useEffect, useRef, useState } from 'react';
import type { NotificationItem } from '../types';
import { notificationClient } from '../services/notificationClient';

export function usePersistedNotifications(authenticated: boolean, sessionKey: string) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  useEffect(() => {
    if (!authenticated) {
      setNotifications([]);
      setError(null);
      return;
    }
    let active = true;
    setError(null);
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
      .catch((err) => {
        if (!active) return;
        setNotifications([]);
        setError(err instanceof Error ? err.message : 'Unable to load notifications.');
      });
    return () => {
      active = false;
    };
  }, [authenticated, sessionKey]);

  const markRead = useCallback(
    (id: string) => {
      setError(null);
      const snapshot = notificationsRef.current;
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      if (!authenticated) return;
      void notificationClient.markRead(id).catch((err) => {
        setNotifications(snapshot);
        setError(err instanceof Error ? err.message : 'Failed to mark notification as read.');
      });
    },
    [authenticated]
  );

  const markAllRead = useCallback(() => {
    setError(null);
    const snapshot = notificationsRef.current;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (!authenticated) return;
    void notificationClient.markAllRead().catch((err) => {
      setNotifications(snapshot);
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read.');
    });
  }, [authenticated]);

  const pushNotification = useCallback((item: NotificationItem) => {
    setNotifications((prev) => [item, ...prev]);
  }, []);

  return { notifications, error, markRead, markAllRead, pushNotification };
}
