import { describe, it, expect, beforeEach } from 'vitest';
import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { useCartStore } from './cartStore';
import type { Product, Coupon } from '../types';

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Cà Phê Arabica',
  slug: 'ca-phe-arabica',
  description: 'Cà phê Arabica chất lượng cao',
  shortDescription: 'Cà phê Arabica',
  price: 250000,
  salePrice: 200000,
  category: 'Single Origin',
  categorySlug: 'single-origin',
  images: ['/arabica.jpg'],
  rating: 4.5,
  reviewCount: 120,
  stock: 100,
  sku: 'CFA-001',
  tags: ['arabica', 'viet nam'],
  origin: 'Việt Nam',
  roastLevel: 'Medium',
  flavorNotes: ['Hoa quả', 'Chua nhẹ'],
  brewingMethod: ['Pour over', 'French press'],
  weight: '250g',
  isFeatured: true,
  isNewArrival: false,
  isBestSeller: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const _createMockCoupon = (overrides: Partial<Coupon> = {}): Coupon => ({
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
    });
  });

  describe('addItem', () => {
    it('should add a new item to the cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(
          {
            id: 'item-1',
            productId: 'prod-1',
            name: 'Cà Phê Arabica',
            slug: 'ca-phe-arabica',
            image: '/arabica.jpg',
            price: 200000,
            weight: '250g',
            product: mockProduct,
          },
          2
        );
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.items[0].name).toBe('Cà Phê Arabica');
    });

    it('should increase quantity if item already exists', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(
          {
            id: 'item-1',
            productId: 'prod-1',
            name: 'Cà Phê Arabica',
            slug: 'ca-phe-arabica',
            image: '/arabica.jpg',
            price: 200000,
            weight: '250g',
            product: mockProduct,
          },
          1
        );
        result.current.addItem(
          {
            id: 'item-1',
            productId: 'prod-1',
            name: 'Cà Phê Arabica',
            slug: 'ca-phe-arabica',
            image: '/arabica.jpg',
            price: 200000,
            weight: '250g',
            product: mockProduct,
          },
          2
        );
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(3);
    });
  });

  describe('addProduct', () => {
    it('should add a product to the cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addProduct(mockProduct, 1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].productId).toBe(mockProduct.id);
      expect(result.current.items[0].price).toBe(mockProduct.salePrice);
    });

    it('should use salePrice when available', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addProduct(mockProduct, 1);
      });

      expect(result.current.items[0].price).toBe(mockProduct.salePrice);
    });
  });

  describe('removeItem', () => {
    it('should remove an item from the cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(
          {
            id: 'item-1',
            productId: 'prod-1',
            name: 'Cà Phê Arabica',
            slug: 'ca-phe-arabica',
            image: '/arabica.jpg',
            price: 200000,
            weight: '250g',
            product: mockProduct,
          },
          1
        );
        result.current.removeItem('item-1');
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(
          {
            id: 'item-1',
            productId: 'prod-1',
            name: 'Cà Phê Arabica',
            slug: 'ca-phe-arabica',
            image: '/arabica.jpg',
            price: 200000,
            weight: '250g',
            product: mockProduct,
          },
          1
        );
        result.current.updateQuantity('item-1', 5);
      });

      expect(result.current.items[0].quantity).toBe(5);
    });

    it('should remove item if quantity is 0 or less', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(
          {
            id: 'item-1',
            productId: 'prod-1',
            name: 'Cà Phê Arabica',
            slug: 'ca-phe-arabica',
            image: '/arabica.jpg',
            price: 200000,
            weight: '250g',
            product: mockProduct,
          },
          1
        );
        result.current.updateQuantity('item-1', 0);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from the cart', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(
          {
            id: 'item-1',
            productId: 'prod-1',
            name: 'Cà Phê Arabica',
            slug: 'ca-phe-arabica',
            image: '/arabica.jpg',
            price: 200000,
            weight: '250g',
            product: mockProduct,
          },
          2
        );
        result.current.addItem(
          {
            id: 'item-2',
            productId: 'prod-2',
            name: 'Cà Phê Robusta',
            slug: 'ca-phe-robusta',
            image: '/robusta.jpg',
            price: 150000,
            weight: '250g',
            product: mockProduct,
          },
          1
        );
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('applyCoupon', () => {
    it('should apply a valid coupon', async () => {
      const { result } = renderHook(() => useCartStore());

      // First add items to cart
      act(() => {
        result.current.addItem(
          {
            id: 'item-1',
            productId: 'prod-1',
            name: 'Cà Phê Arabica',
            slug: 'ca-phe-arabica',
            image: '/arabica.jpg',
            price: 200000,
            weight: '250g',
            product: mockProduct,
          },
          1
        );
      });

      // Apply WELCOME10 coupon (10% off, min order 200000)
      const response = await act(async () => {
        return result.current.applyCoupon('WELCOME10');
      });

      expect(response.success).toBe(true);
    });

    it('should reject coupon when subtotal is below minimum', async () => {
      const { result } = renderHook(() => useCartStore());

      // Add a cheap item
      act(() => {
        result.current.addItem(
          {
            id: 'item-1',
            productId: 'prod-1',
            name: 'Cà Phê Arabica',
            slug: 'ca-phe-arabica',
            image: '/arabica.jpg',
            price: 50000,
            weight: '250g',
            product: mockProduct,
          },
          1
        );
      });

      // Apply WELCOME10 coupon (min order 200000)
      const response = await act(async () => {
        return result.current.applyCoupon('WELCOME10');
      });

      expect(response.success).toBe(false);
      expect(response.message).toContain('tối thiểu');
    });

    it('should reject non-existent coupon', async () => {
      const { result } = renderHook(() => useCartStore());

      const response = await act(async () => {
        return result.current.applyCoupon('INVALID');
      });

      expect(response.success).toBe(false);
    });
  });

  describe('getSubtotal', () => {
    it('should calculate correct subtotal', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(
          {
            id: 'item-1',
            productId: 'prod-1',
            name: 'Cà Phê Arabica',
            slug: 'ca-phe-arabica',
            image: '/arabica.jpg',
            price: 200000,
            weight: '250g',
            product: mockProduct,
          },
          2
        ); // 2 x 200000 = 400000
        result.current.addItem(
          {
            id: 'item-2',
            productId: 'prod-2',
            name: 'Cà Phê Robusta',
            slug: 'ca-phe-robusta',
            image: '/robusta.jpg',
            price: 150000,
            weight: '250g',
            product: mockProduct,
          },
          1
        ); // 1 x 150000 = 150000
      });

      expect(result.current.getSubtotal()).toBe(550000);
    });

    it('should return 0 for empty cart', () => {
      const { result } = renderHook(() => useCartStore());
      expect(result.current.getSubtotal()).toBe(0);
    });
  });

  describe('getTotal', () => {
    it('should include shipping fee when subtotal is below 500000', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(
          {
            id: 'item-1',
            productId: 'prod-1',
            name: 'Cà Phê Arabica',
            slug: 'ca-phe-arabica',
            image: '/arabica.jpg',
            price: 200000,
            weight: '250g',
            product: mockProduct,
          },
          2
        ); // 400000 - no free shipping
      });

      expect(result.current.getSubtotal()).toBe(400000);
      expect(result.current.getShippingFee()).toBe(30000);
      expect(result.current.getTotal()).toBe(430000);
    });

    it('should have free shipping when subtotal >= 500000', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(
          {
            id: 'item-1',
            productId: 'prod-1',
            name: 'Cà Phê Arabica',
            slug: 'ca-phe-arabica',
            image: '/arabica.jpg',
            price: 200000,
            weight: '250g',
            product: mockProduct,
          },
          3
        ); // 600000 - free shipping
      });

      expect(result.current.getSubtotal()).toBe(600000);
      expect(result.current.getShippingFee()).toBe(0);
      expect(result.current.getTotal()).toBe(600000);
    });
  });

  describe('getItemCount', () => {
    it('should return total number of items', () => {
      const { result } = renderHook(() => useCartStore());

      act(() => {
        result.current.addItem(
          {
            id: 'item-1',
            productId: 'prod-1',
            name: 'Cà Phê Arabica',
            slug: 'ca-phe-arabica',
            image: '/arabica.jpg',
            price: 200000,
            weight: '250g',
            product: mockProduct,
          },
          2
        );
        result.current.addItem(
          {
            id: 'item-2',
            productId: 'prod-2',
            name: 'Cà Phê Robusta',
            slug: 'ca-phe-robusta',
            image: '/robusta.jpg',
            price: 150000,
            weight: '250g',
            product: mockProduct,
          },
          3
        );
      });

      expect(result.current.getItemCount()).toBe(5);
    });
  });
});
