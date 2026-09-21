import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WishlistItem, Product } from '../types';
import { useCartStore } from './cartStore';

interface WishlistState {
  items: WishlistItem[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  moveToCart: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  getCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addToWishlist: (product) => {
        const exists = get().items.some((item) => item.product.id === product.id);
        if (exists) return;

        set({
          items: [
            ...get().items,
            { product, addedAt: new Date().toISOString() },
          ],
        });
      },

      removeFromWishlist: (productId) => {
        set({ items: get().items.filter((item) => item.product.id !== productId) });
      },

      moveToCart: (productId) => {
        const item = get().items.find((i) => i.product.id === productId);
        if (!item) return;

        useCartStore.getState().addProduct(item.product);
        get().removeFromWishlist(productId);
      },

      clearWishlist: () => set({ items: [] }),

      isInWishlist: (productId) => {
        return get().items.some((item) => item.product.id === productId);
      },

      toggleWishlist: (product) => {
        if (get().isInWishlist(product.id)) {
          get().removeFromWishlist(product.id);
        } else {
          get().addToWishlist(product);
        }
      },

      getCount: () => get().items.length,
    }),
    {
      name: 'coffee-wishlist',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
