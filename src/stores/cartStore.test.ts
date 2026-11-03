import { describe, it, expect, beforeEach } from 'vitest';
import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { useCartStore } from './cartStore';
import type { Coupon } from '../types';

const item = (overrides: Partial<Parameters<ReturnType<typeof useCartStore.getState>['addItem']>[0]> = {}) => ({
  productId: 'prod-1',
  slug: 'ca-phe-arabica',
  name: 'Cà Phê Arabica',
  imageUrl: '/arabica.jpg',
  price: 200000,
  weight: '250g',
  ...overrides,
});

const coupon = (overrides: Partial<Coupon> = {}): Coupon => ({
  id: 'coupon-1',
  code: 'TEST10',
  type: 'PERCENT',
  value: 10,
  minOrderValue: 100000,
  maxDiscount: 50000,
  usageLimit: 100,
  usedCount: 0,
  validFrom: '2025-01-01T00:00:00Z',
  validTo: '2026-12-31T23:59:59Z',
  isActive: true,
  ...overrides,
});

describe('cartStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useCartStore());
    act(() => {
      result.current.clearCart();
      result.current.removeCoupon();
    });
  });

  describe('addItem', () => {
    it('should add a new item to the cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(item(), 2);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.items[0].name).toBe('Cà Phê Arabica');
    });

    it('should increase the quantity when the same product is added again', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(item(), 2);
      });
      act(() => {
        result.current.addItem(item(), 1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(3);
    });

    it('should add different products as separate items', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(item(), 1);
      });
      act(() => {
        result.current.addItem(item({ productId: 'prod-2', name: 'Cà Phê Robusta' }), 1);
      });

      expect(result.current.items).toHaveLength(2);
    });
  });

  describe('removeItem', () => {
    it('should remove an item from the cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(item(), 1);
      });
      act(() => {
        result.current.removeItem('prod-1');
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should ignore an unknown product id', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(item(), 1);
      });
      act(() => {
        result.current.removeItem('does-not-exist');
      });

      expect(result.current.items).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(item(), 1);
      });
      act(() => {
        result.current.updateQuantity('prod-1', 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
    });

    it('should remove the item when the quantity drops to zero', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(item(), 1);
      });
      act(() => {
        result.current.updateQuantity('prod-1', 0);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should empty the cart but keep the applied coupon', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(item(), 2);
        result.current.applyCoupon(coupon());
      });
      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('totals', () => {
    it('should return the total number of items', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(item(), 2);
      });
      act(() => {
        result.current.addItem(item({ productId: 'prod-2' }), 3);
      });

      expect(result.current.getItemCount()).toBe(2);
      expect(result.current.getTotalCount()).toBe(5);
    });

    it('should calculate the subtotal from the item prices', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(item(), 2);
      });

      expect(result.current.getSubtotal()).toBe(400000);
    });

    it('should charge a flat shipping fee below the free-shipping threshold', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(item(), 1);
      });

      expect(result.current.getShippingFee()).toBe(30000);
    });

    it('should ship free at or above 500.000 VND', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(item(), 3);
      });

      expect(result.current.getShippingFee()).toBe(0);
    });
  });

  describe('coupons', () => {
    it('should apply a valid coupon', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.applyCoupon(coupon());
      });

      expect(result.current.appliedCoupon?.code).toBe('TEST10');
    });

    it('should calculate a percentage discount', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(item(), 1);
        result.current.applyCoupon(coupon({ type: 'PERCENT', value: 10, maxDiscount: undefined }));
      });

      expect(result.current.getDiscount()).toBe(20000);
    });

    it('should cap a percentage discount at maxDiscount', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(item(), 10);
        result.current.applyCoupon(coupon({ type: 'PERCENT', value: 10, maxDiscount: 50000 }));
      });

      expect(result.current.getDiscount()).toBe(50000);
    });

    it('should calculate a fixed discount', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(item(), 1);
        result.current.applyCoupon(coupon({ type: 'FIXED', value: 30000 }));
      });

      expect(result.current.getDiscount()).toBe(30000);
    });

    it('should remove the coupon', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.applyCoupon(coupon());
      });
      act(() => {
        result.current.removeCoupon();
      });

      expect(result.current.appliedCoupon).toBeNull();
      expect(result.current.getDiscount()).toBe(0);
    });
  });
});
