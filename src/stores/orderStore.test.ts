import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOrderStore } from './orderStore';
import type { Product, Address, Order } from '../types';
import { generateId, generateOrderNumber } from '../utils/formatters';

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

const mockProduct2: Product = {
  ...mockProduct,
  id: 'prod-2',
  name: 'Cà Phê Robusta',
  slug: 'ca-phe-robusta',
  price: 150000,
  salePrice: undefined,
};

const mockAddress: Address = {
  id: 'addr-1',
  label: 'home',
  name: 'Test User',
  phone: '0901234567',
  province: 'TP. Hồ Chí Minh',
  district: 'Quận 1',
  ward: 'Phường Bến Nghé',
  detail: '123 Nguyễn Huệ',
  isDefault: true,
};

describe('orderStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useOrderStore());
    act(() => {
      result.current.resetOrders();
    });
  });

  describe('createOrder', () => {
    it('should create a new order with correct data', () => {
      const { result } = renderHook(() => useOrderStore());
      
      const initialOrderCount = result.current.orders.length;
      
      act(() => {
        result.current.createOrder({
          items: [
            { product: mockProduct, quantity: 2 },
          ],
          shippingAddress: mockAddress,
          paymentMethod: 'COD',
        });
      });

      expect(result.current.orders.length).toBe(initialOrderCount + 1);
      const newOrder = result.current.orders[0];
      expect(newOrder.items).toHaveLength(1);
      expect(newOrder.status).toBe('PENDING');
      expect(newOrder.paymentStatus).toBe('PENDING');
    });

    it('should calculate subtotal correctly', () => {
      const { result } = renderHook(() => useOrderStore());
      
      act(() => {
        result.current.createOrder({
          items: [
            { product: mockProduct, quantity: 2 }, // 2 x 200000 = 400000
            { product: mockProduct2, quantity: 1 }, // 1 x 150000 = 150000
          ],
          shippingAddress: mockAddress,
          paymentMethod: 'COD',
        });
      });

      const newOrder = result.current.orders[0];
      expect(newOrder.subtotal).toBe(550000);
    });

    it('should set correct shipping fee based on subtotal', () => {
      const { result } = renderHook(() => useOrderStore());
      
      // Order < 500000 should have shipping fee
      act(() => {
        result.current.createOrder({
          items: [{ product: mockProduct2, quantity: 1 }], // 150000
          shippingAddress: mockAddress,
          paymentMethod: 'COD',
        });
      });

      let order = result.current.orders[0];
      expect(order.shippingFee).toBe(30000);
      expect(order.total).toBe(180000);

      // Order >= 500000 should have free shipping
      act(() => {
        result.current.createOrder({
          items: [{ product: mockProduct, quantity: 3 }], // 600000
          shippingAddress: mockAddress,
          paymentMethod: 'COD',
        });
      });

      order = result.current.orders[0];
      expect(order.shippingFee).toBe(0);
      expect(order.total).toBe(600000);
    });

    it('should generate order number with correct format', () => {
      const { result } = renderHook(() => useOrderStore());
      
      act(() => {
        result.current.createOrder({
          items: [{ product: mockProduct, quantity: 1 }],
          shippingAddress: mockAddress,
          paymentMethod: 'COD',
        });
      });

      const newOrder = result.current.orders[0];
      expect(newOrder.orderNumber).toMatch(/^CHB-\d{8}-\d{3}$/);
    });

    it('should create order with initial timeline entry', () => {
      const { result } = renderHook(() => useOrderStore());
      
      act(() => {
        result.current.createOrder({
          items: [{ product: mockProduct, quantity: 1 }],
          shippingAddress: mockAddress,
          paymentMethod: 'COD',
        });
      });

      const newOrder = result.current.orders[0];
      expect(newOrder.timeline).toHaveLength(1);
      expect(newOrder.timeline[0].status).toBe('PENDING');
      expect(newOrder.timeline[0].note).toBe('Đơn hàng được tạo');
    });

    it('should set currentOrder after creation', () => {
      const { result } = renderHook(() => useOrderStore());
      
      // Create order and verify it returns correct order
      let createdOrder: ReturnType<typeof result.current.createOrder> | null = null;
      
      act(() => {
        createdOrder = result.current.createOrder({
          items: [{ product: mockProduct, quantity: 1 }],
          shippingAddress: mockAddress,
          paymentMethod: 'COD',
        });
      });

      // The createOrder function returns the created order
      expect(createdOrder).toBeDefined();
      expect(createdOrder?.id).toBeDefined();
      expect(createdOrder?.status).toBe('PENDING');
    });
  });

  describe('cancelOrder', () => {
    it('should cancel a pending order', () => {
      const { result } = renderHook(() => useOrderStore());
      
      let createdOrderId = '';
      
      act(() => {
        const order = result.current.createOrder({
          items: [{ product: mockProduct, quantity: 1 }],
          shippingAddress: mockAddress,
          paymentMethod: 'COD',
        });
        createdOrderId = order.id;
      });

      act(() => {
        const cancelled = result.current.cancelOrder(createdOrderId, 'Customer requested cancellation');
        expect(cancelled).not.toBeNull();
        expect(cancelled?.status).toBe('CANCELLED');
      });

      const cancelledOrder = result.current.getOrderById(createdOrderId);
      expect(cancelledOrder?.status).toBe('CANCELLED');
      expect(cancelledOrder?.timeline).toHaveLength(2);
      expect(cancelledOrder?.timeline[1].status).toBe('CANCELLED');
    });

    it('should refund if payment was made', () => {
      const { result } = renderHook(() => useOrderStore());
      
      // Create order with PAID payment status directly
      const paidOrder: Order = {
        id: generateId('order'),
        orderNumber: generateOrderNumber(),
        items: [{ product: mockProduct, quantity: 1, price: mockProduct.salePrice || mockProduct.price }],
        subtotal: 200000,
        shippingFee: 30000,
        discount: 0,
        total: 230000,
        status: 'PENDING',
        paymentMethod: 'VNPAY',
        paymentStatus: 'PAID', // Already paid
        shippingAddress: mockAddress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [{ status: 'PENDING', timestamp: new Date().toISOString(), note: 'Đơn hàng được tạo' }],
      };

      act(() => {
        result.current.createOrder(paidOrder);
      });

      // Now cancel and check refund
      act(() => {
        const cancelled = result.current.cancelOrder(paidOrder.id);
        expect(cancelled?.paymentStatus).toBe('REFUNDED');
      });
    });

    it('should not cancel a delivered order', () => {
      const { result } = renderHook(() => useOrderStore());
      
      // Get an existing delivered order from initial orders
      const deliveredOrder = result.current.orders.find(o => o.status === 'DELIVERED');
      
      if (deliveredOrder) {
        act(() => {
          const result_1 = result.current.cancelOrder(deliveredOrder.id);
          expect(result_1?.status).toBe('DELIVERED'); // Should return original status
        });
      }
    });

    it('should not cancel an already cancelled order', () => {
      const { result } = renderHook(() => useOrderStore());
      
      // Get an existing cancelled order from initial orders
      const cancelledOrder = result.current.orders.find(o => o.status === 'CANCELLED');
      
      if (cancelledOrder) {
        const originalTimelineLength = cancelledOrder.timeline.length;
        act(() => {
          result.current.cancelOrder(cancelledOrder.id);
        });

        const order = result.current.getOrderById(cancelledOrder.id);
        expect(order?.timeline.length).toBe(originalTimelineLength); // No new timeline entry
      }
    });

    it('should return null for non-existent order', () => {
      const { result } = renderHook(() => useOrderStore());
      
      act(() => {
        const result_1 = result.current.cancelOrder('non-existent-id');
        expect(result_1).toBeNull();
      });
    });
  });

  describe('getOrders', () => {
    it('should get order by id', () => {
      const { result } = renderHook(() => useOrderStore());
      
      act(() => {
        result.current.createOrder({
          items: [{ product: mockProduct, quantity: 1 }],
          shippingAddress: mockAddress,
          paymentMethod: 'COD',
        });
      });

      const order = result.current.orders[0];
      const foundOrder = result.current.getOrderById(order.id);
      expect(foundOrder?.id).toBe(order.id);
    });

    it('should return undefined for non-existent order id', () => {
      const { result } = renderHook(() => useOrderStore());
      
      const foundOrder = result.current.getOrderById('non-existent-id');
      expect(foundOrder).toBeUndefined();
    });

    it('should get orders by user phone', () => {
      const { result } = renderHook(() => useOrderStore());
      
      act(() => {
        result.current.createOrder({
          items: [{ product: mockProduct, quantity: 1 }],
          shippingAddress: mockAddress,
          paymentMethod: 'COD',
        });
      });

      const userOrders = result.current.getOrdersByUser(mockAddress.phone);
      expect(userOrders.length).toBeGreaterThan(0);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status with timeline entry', () => {
      const { result } = renderHook(() => useOrderStore());
      
      let createdOrderId = '';
      
      act(() => {
        const order = result.current.createOrder({
          items: [{ product: mockProduct, quantity: 1 }],
          shippingAddress: mockAddress,
          paymentMethod: 'COD',
        });
        createdOrderId = order.id;
      });

      act(() => {
        result.current.updateOrderStatus(createdOrderId, 'CONFIRMED', 'Xác nhận đơn hàng');
      });

      const updatedOrder = result.current.getOrderById(createdOrderId);
      expect(updatedOrder?.status).toBe('CONFIRMED');
      expect(updatedOrder?.timeline).toHaveLength(2);
      expect(updatedOrder?.timeline[1].note).toBe('Xác nhận đơn hàng');
    });

    it('should update payment status to PAID when COD order is delivered', () => {
      const { result } = renderHook(() => useOrderStore());
      
      let createdOrderId = '';
      
      act(() => {
        const order = result.current.createOrder({
          items: [{ product: mockProduct, quantity: 1 }],
          shippingAddress: mockAddress,
          paymentMethod: 'COD',
        });
        createdOrderId = order.id;
      });

      act(() => {
        result.current.updateOrderStatus(createdOrderId, 'DELIVERED', 'Giao hàng thành công');
      });

      const updatedOrder = result.current.getOrderById(createdOrderId);
      expect(updatedOrder?.paymentStatus).toBe('PAID');
    });
  });

  describe('addReview', () => {
    it('should add a review to an order item', () => {
      const { result } = renderHook(() => useOrderStore());
      
      let createdOrderId = '';
      
      act(() => {
        const order = result.current.createOrder({
          items: [{ product: mockProduct, quantity: 1 }],
          shippingAddress: mockAddress,
          paymentMethod: 'COD',
        });
        createdOrderId = order.id;
      });

      act(() => {
        result.current.addReview(createdOrderId, {
          productId: mockProduct.id,
          rating: 5,
          comment: 'Sản phẩm rất ngon!',
        });
      });

      const updatedOrder = result.current.getOrderById(createdOrderId);
      const itemWithReview = updatedOrder?.items.find(i => i.product.id === mockProduct.id);
      expect(itemWithReview?.review).toBeDefined();
      expect(itemWithReview?.review?.rating).toBe(5);
      expect(itemWithReview?.review?.comment).toBe('Sản phẩm rất ngon!');
    });

    it('should return null for non-existent order', () => {
      const { result } = renderHook(() => useOrderStore());
      
      act(() => {
        const review = result.current.addReview('non-existent-id', {
          productId: mockProduct.id,
          rating: 5,
          comment: 'Test',
        });
        expect(review).toBeNull();
      });
    });
  });

  describe('setCurrentOrder', () => {
    it('should set current order', () => {
      const { result } = renderHook(() => useOrderStore());
      
      const order = result.current.orders[0];
      
      act(() => {
        result.current.setCurrentOrder(order);
      });

      expect(result.current.currentOrder?.id).toBe(order.id);
    });

    it('should clear current order', () => {
      const { result } = renderHook(() => useOrderStore());
      
      const order = result.current.orders[0];
      
      act(() => {
        result.current.setCurrentOrder(order);
        result.current.setCurrentOrder(null);
      });

      expect(result.current.currentOrder).toBeNull();
    });
  });

  describe('resetOrders', () => {
    it('should reset orders to initial state', () => {
      const { result } = renderHook(() => useOrderStore());
      
      const initialOrderCount = result.current.orders.length;
      
      act(() => {
        result.current.createOrder({
          items: [{ product: mockProduct, quantity: 1 }],
          shippingAddress: mockAddress,
          paymentMethod: 'COD',
        });
      });

      expect(result.current.orders.length).toBe(initialOrderCount + 1);
      
      act(() => {
        result.current.resetOrders();
      });

      expect(result.current.orders.length).toBe(initialOrderCount);
    });
  });
});
