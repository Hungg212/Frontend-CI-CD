import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, Coupon } from '../types';
import { getCouponByCode } from '../data/coupons';

export interface CartLineItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  weight: string;
  product: Product;
}

export function getProductFromLineItem(item: CartLineItem): Product | undefined {
  return item.product;
}

interface CartStore {
  items: CartLineItem[];
  coupon: Coupon | null;
  appliedCoupon: Coupon | null;
  discount: number;
  note: string;
  addItem: (item: Omit<CartLineItem, 'quantity'>, quantity?: number) => void;
  addProduct: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  removeProduct: (productId: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (codeOrCoupon: string | Coupon) => { success: boolean; message: string };
  removeCoupon: () => void;
  setNote: (note: string) => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getShippingFee: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const findCouponByCode = (code: string): Coupon | undefined => getCouponByCode(code);

const recalcDiscount = (items: CartLineItem[], coupon: Coupon | null): number => {
  if (!coupon) return 0;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  if (subtotal < coupon.minOrderValue) return 0;
  if (coupon.type === 'PERCENT') {
    const d = (subtotal * coupon.value) / 100;
    return coupon.maxDiscount ? Math.min(d, coupon.maxDiscount) : d;
  }
  return Math.min(coupon.value, subtotal);
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      appliedCoupon: null,
      discount: 0,
      note: '',

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          let nextItems: CartLineItem[];
          if (existing) {
            nextItems = state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
            );
          } else {
            nextItems = [...state.items, { ...item, quantity }];
          }
          return {
            items: nextItems,
            discount: recalcDiscount(nextItems, state.coupon),
          };
        }),

      addProduct: (product, quantity = 1) => {
        const item: Omit<CartLineItem, 'quantity'> = {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: product.images[0] ?? '',
          price: product.salePrice ?? product.price,
          originalPrice: product.price,
          weight: product.weight,
          product,
        };
        get().addItem(item, quantity);
      },

      removeItem: (id) =>
        set((state) => {
          const nextItems = state.items.filter((i) => i.id !== id);
          return {
            items: nextItems,
            discount: recalcDiscount(nextItems, state.coupon),
          };
        }),

      removeProduct: (productId) =>
        set((state) => {
          const nextItems = state.items.filter((i) => i.productId !== productId);
          return {
            items: nextItems,
            discount: recalcDiscount(nextItems, state.coupon),
          };
        }),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => {
          const nextItems = state.items.map((i) => (i.id === id ? { ...i, quantity } : i));
          return {
            items: nextItems,
            discount: recalcDiscount(nextItems, state.coupon),
          };
        });
      },

      clearCart: () => set({ items: [], coupon: null, appliedCoupon: null, discount: 0, note: '' }),

      applyCoupon: (codeOrCoupon) => {
        const coupon =
          typeof codeOrCoupon === 'string' ? findCouponByCode(codeOrCoupon) : codeOrCoupon;
        if (!coupon) return { success: false, message: 'Mã giảm giá không tồn tại' };
        const subtotal = get().getSubtotal();
        if (subtotal < coupon.minOrderValue) {
          return {
            success: false,
            message: `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}đ`,
          };
        }
        const discount = recalcDiscount(get().items, coupon);
        set({ coupon, appliedCoupon: coupon, discount });
        return { success: true, message: 'Áp dụng mã giảm giá thành công' };
      },

      removeCoupon: () => set({ coupon: null, appliedCoupon: null, discount: 0 }),

      setNote: (note) => set({ note }),

      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getDiscountAmount: () => get().discount,

      getShippingFee: () => {
        const s = get().getSubtotal();
        if (s === 0) return 0;
        return s >= 500000 ? 0 : 30000;
      },

      getTotal: () => {
        const s = get().getSubtotal();
        const d = get().discount;
        const ship = get().getShippingFee();
        return Math.max(0, s - d + ship);
      },

      getItemCount: () => get().items.reduce((c, i) => c + i.quantity, 0),
      getTotalItems: () => get().items.reduce((c, i) => c + i.quantity, 0),
      getTotalPrice: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    {
      name: 'coffee-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
