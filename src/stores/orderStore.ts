import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Order, OrderStatus, CreateOrderData, CreateReviewData, Review } from '../types';
import { orders as initialOrders } from '../data/orders';
import { generateId, generateOrderNumber } from '../utils/formatters';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  createOrder: (data: CreateOrderData | Order) => Order;
  updateOrderStatus: (id: string, status: OrderStatus, note?: string) => Order | null;
  cancelOrder: (id: string, reason?: string) => Order | null;
  getOrderById: (id: string) => Order | undefined;
  getOrdersByUser: (userId: string) => Order[];
  addReview: (orderId: string, review: CreateReviewData | Review) => Review | null;
  resetOrders: () => void;
  setCurrentOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: initialOrders,
      currentOrder: null,

      createOrder: (data) => {
        // Support both CreateOrderData and pre-built Order
        if ('items' in data && 'subtotal' in data) {
          const o = data as Order;
          set({ orders: [o, ...get().orders], currentOrder: o });
          return o;
        }
        const cd = data as CreateOrderData;
        const now = new Date().toISOString();
        const subtotal = cd.items.reduce((sum, item) => {
          const price = item.product.salePrice ?? item.product.price;
          return sum + price * item.quantity;
        }, 0);

        const newOrder: Order = {
          id: generateId('order'),
          orderNumber: generateOrderNumber(),
          items: cd.items.map((item) => ({
            product: item.product,
            quantity: item.quantity,
            price: item.product.salePrice ?? item.product.price,
          })),
          subtotal,
          shippingFee: subtotal >= 500000 ? 0 : 30000,
          discount: 0,
          total: subtotal + (subtotal >= 500000 ? 0 : 30000),
          status: 'PENDING',
          paymentMethod: cd.paymentMethod,
          paymentStatus: 'PENDING',
          shippingAddress: cd.shippingAddress,
          note: cd.note,
          createdAt: now,
          updatedAt: now,
          timeline: [
            {
              status: 'PENDING',
              timestamp: now,
              note: 'Đơn hàng được tạo',
            },
          ],
        };

        set({ orders: [newOrder, ...get().orders], currentOrder: newOrder });
        return newOrder;
      },

      updateOrderStatus: (id, status, note) => {
        const order = get().orders.find((o) => o.id === id);
        if (!order) return null;

        const now = new Date().toISOString();
        const updatedOrder: Order = {
          ...order,
          status,
          updatedAt: now,
          paymentStatus:
            status === 'DELIVERED' && order.paymentMethod === 'COD' ? 'PAID' : order.paymentStatus,
          timeline: [
            ...order.timeline,
            { status, timestamp: now, note: note || `Cập nhật trạng thái: ${status}` },
          ],
        };

        set({
          orders: get().orders.map((o) => (o.id === id ? updatedOrder : o)),
        });
        return updatedOrder;
      },

      cancelOrder: (id, reason) => {
        const order = get().orders.find((o) => o.id === id);
        if (!order) return null;
        if (order.status === 'DELIVERED' || order.status === 'CANCELLED') return order;

        const now = new Date().toISOString();
        const updatedOrder: Order = {
          ...order,
          status: 'CANCELLED',
          updatedAt: now,
          paymentStatus: order.paymentStatus === 'PAID' ? 'REFUNDED' : order.paymentStatus,
          timeline: [
            ...order.timeline,
            {
              status: 'CANCELLED',
              timestamp: now,
              note: reason || 'Đơn hàng đã bị hủy',
            },
          ],
        };

        set({
          orders: get().orders.map((o) => (o.id === id ? updatedOrder : o)),
        });
        return updatedOrder;
      },

      getOrderById: (id) => get().orders.find((o) => o.id === id),

      getOrdersByUser: (userId) => get().orders.filter((o) => o.shippingAddress.phone === userId),

      addReview: (orderId, reviewOrData) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return null;

        // Support both Review (pre-built) and CreateReviewData
        const isReview = (r: unknown): r is Review => {
          return typeof r === 'object' && r !== null && 'userId' in r;
        };

        let newReview: Review;
        if (isReview(reviewOrData)) {
          newReview = reviewOrData as Review;
        } else {
          const rd = reviewOrData as CreateReviewData;
          newReview = {
            id: generateId('review'),
            userId: 'current-user',
            userName: 'Khách hàng',
            productId: rd.productId,
            rating: rd.rating,
            comment: rd.comment,
            images: rd.images,
            createdAt: new Date().toISOString(),
            isVerified: true,
          };
        }

        const updatedOrder: Order = {
          ...order,
          items: order.items.map((item) =>
            item.product.id === newReview.productId ? { ...item, review: newReview } : item
          ),
        };

        set({
          orders: get().orders.map((o) => (o.id === orderId ? updatedOrder : o)),
        });
        return newReview;
      },

      resetOrders: () => set({ orders: initialOrders, currentOrder: null }),
      setCurrentOrder: (order) => set({ currentOrder: order }),
    }),
    {
      name: 'coffee-orders',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
