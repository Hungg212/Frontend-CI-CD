import { create } from 'zustand';
import type { Notification } from '../types';

interface UIState {
  isMobileMenuOpen: boolean;
  isCartOpen: boolean;
  isSearchOpen: boolean;
  isQuickViewOpen: boolean;
  quickViewProductId: string | null;
  notifications: Notification[];
  toggleMobileMenu: () => void;
  toggleCart: () => void;
  toggleSearch: () => void;
  toggleQuickView: (productId?: string) => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openQuickView: (productId: string) => void;
  closeQuickView: () => void;
  closeAll: () => void;
  pushNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

let notifCounter = 0;

export const useUIStore = create<UIState>()((set) => ({
  isMobileMenuOpen: false,
  isCartOpen: false,
  isSearchOpen: false,
  isQuickViewOpen: false,
  quickViewProductId: null,
  notifications: [],

  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

  toggleQuickView: (productId) =>
    set((state) => ({
      isQuickViewOpen: !state.isQuickViewOpen,
      quickViewProductId: !state.isQuickViewOpen ? (productId ?? null) : null,
    })),

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  openQuickView: (productId) => set({ isQuickViewOpen: true, quickViewProductId: productId }),
  closeQuickView: () => set({ isQuickViewOpen: false, quickViewProductId: null }),

  closeAll: () =>
    set({
      isMobileMenuOpen: false,
      isCartOpen: false,
      isSearchOpen: false,
      isQuickViewOpen: false,
      quickViewProductId: null,
    }),

  pushNotification: (notification) => {
    const id = `notif-${++notifCounter}`;
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));
    if (notification.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, notification.duration ?? 5000);
    }
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
