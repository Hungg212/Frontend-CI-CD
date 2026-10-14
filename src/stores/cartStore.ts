import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Coupon } from '@/types';

// Flat cart item input type (what callers pass)
export interface CartItemInput {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  weight?: string;
}

// Internal cart item (stored in localStorage)
interface CartItem {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  weight?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isBackendReachable: boolean;
  appliedCoupon: Coupon | null;
}

interface CartActions {
  addItem: (item: CartItemInput, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalCount: () => number;
  getTotalPrice: () => number;
  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingFee: () => number;
  getTotal: () => number;
  getDiscount: () => number;
  setBackendReachable: (reachable: boolean) => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
}

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isBackendReachable: true,
      appliedCoupon: null,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          let nextItems: CartItem[];
          if (existing) {
            nextItems = state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            );
          } else {
            const newItem: CartItem = { ...item, quantity };
            nextItems = [...state.items, newItem];
          }
          return { items: nextItems };
        });
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], appliedCoupon: null }),

      getTotalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + (i.originalPrice ?? i.price) * i.quantity,
          0
        ),

      getItemCount: () => get().items.length,

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getShippingFee: () => {
        const total = get().getSubtotal();
        return total >= 500000 ? 0 : 30000;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shippingFee = get().getShippingFee();
        const discount = get().getDiscount();
        return Math.max(0, subtotal + shippingFee - discount);
      },

      getDiscount: () => {
        const coupon = get().appliedCoupon;
        const subtotal = get().getSubtotal();
        if (!coupon) return 0;
        if (coupon.type === 'PERCENT') {
          let discount = (subtotal * coupon.value) / 100;
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
          return discount;
        }
        return coupon.value;
      },

      setBackendReachable: (reachable) => set({ isBackendReachable: reachable }),

      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
      removeCoupon: () => set({ appliedCoupon: null }),
    }),
    {
      name: 'coffee-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
