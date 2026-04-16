"use client";

import { useNotificationStore } from "@/store";

export function useNotifications() {
  const notifications = useNotificationStore((state) => state.notifications);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const markRead = useNotificationStore((state) => state.markRead);
  const clearNotifications = useNotificationStore((state) => state.clearNotifications);

  return {
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read).length,
    addNotification,
    markAllRead,
    markRead,
    clearNotifications,
  };
}
