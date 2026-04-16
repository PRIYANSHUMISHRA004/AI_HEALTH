"use client";

import { create } from "zustand";

export type NotificationType =
  | "new_issue"
  | "issue_resolved"
  | "new_appointment"
  | "chat_message"
  | "equipment_update";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
}

interface NotificationStore {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, "id" | "createdAt" | "read">) => string;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearNotifications: () => void;
}

const MAX_NOTIFICATIONS = 20;

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({
      notifications: [
        {
          ...notification,
          id,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...state.notifications,
      ].slice(0, MAX_NOTIFICATIONS),
    }));
    return id;
  },
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    })),
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
