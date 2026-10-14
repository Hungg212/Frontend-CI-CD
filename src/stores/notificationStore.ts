import { create } from 'zustand';
import type { Notification } from '../types';
import { generateId } from '../utils/formatters';

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  success: (title: string, message: string, duration?: number) => string;
  error: (title: string, message: string, duration?: number) => string;
  warning: (title: string, message: string, duration?: number) => string;
  info: (title: string, message: string, duration?: number) => string;
}

const DEFAULT_DURATION = 4000;

const scheduleRemoval = (id: string, duration: number, removeFn: (id: string) => void) => {
  if (duration > 0) {
    setTimeout(() => removeFn(id), duration);
  }
};

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = generateId('notif');
    const newNotification: Notification = {
      id,
      duration: DEFAULT_DURATION,
      ...notification,
    };

    set({ notifications: [...get().notifications, newNotification] });
    scheduleRemoval(id, newNotification.duration ?? DEFAULT_DURATION, get().removeNotification);
    return id;
  },

  removeNotification: (id) => {
    set({ notifications: get().notifications.filter((n) => n.id !== id) });
  },

  clearAll: () => set({ notifications: [] }),

  success: (title, message, duration) =>
    get().addNotification({ type: 'success', title, message, duration }),

  error: (title, message, duration) =>
    get().addNotification({ type: 'error', title, message, duration }),

  warning: (title, message, duration) =>
    get().addNotification({ type: 'warning', title, message, duration }),

  info: (title, message, duration) =>
    get().addNotification({ type: 'info', title, message, duration }),
}));
