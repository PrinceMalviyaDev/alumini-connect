import { create } from 'zustand';
import { Notification } from '../types';
import api from '../lib/axios';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAllRead: () => Promise<void>;
  markOneRead: (id: string) => Promise<void>;
  setUnreadCount: (count: number) => void;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => {
    set({ notifications });
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAllRead: async () => {
    try {
      await api.put('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  markOneRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set((state) => {
        const notification = state.notifications.find((n) => n._id === id);
        const wasUnread = notification && !notification.isRead;
        return {
          notifications: state.notifications.map((n) =>
            n._id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  setUnreadCount: (count) => {
    set({ unreadCount: count });
  },

  fetchNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      set({ notifications: response.data.data.notifications || [] });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      const count = response.data.data.count ?? 0;
      set({ unreadCount: count });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      // Try fetching all notifications to count unread
      const { notifications } = get();
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      set({ unreadCount });
    }
  },
}));
