import { useState, useMemo } from 'react';
import { useOrderStore } from '@/stores/orderStore';
import type { Order, OrderStatus } from '@/types';

export type OrderFilter = 'all' | 'pending' | 'delivered' | 'cancelled';

export interface UseOrdersReturn {
  orders: Order[];
  filteredOrders: Order[];
  filter: OrderFilter;
  setFilter: (filter: OrderFilter) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  totalPages: number;
  paginatedOrders: Order[];
  isLoading: boolean;
  getOrderById: (id: string) => Order | undefined;
  cancelOrder: (id: string, reason?: string) => void;
  reorder: (orderId: string) => void;
  counts: Record<OrderFilter, number>;
}

const filterMap: Record<OrderFilter, (status: OrderStatus) => boolean> = {
  all: () => true,
  pending: (s) => ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING'].includes(s),
  delivered: (s) => s === 'DELIVERED',
  cancelled: (s) => s === 'CANCELLED',
};

export function useOrders(pageSize = 5): UseOrdersReturn {
  const orders = useOrderStore((s) => s.orders);
  const getOrderById = useOrderStore((s) => s.getOrderById);
  const cancelOrderStore = useOrderStore((s) => s.cancelOrder);

  const [filter, setFilter] = useState<OrderFilter>('all');
  const [page, setPage] = useState(1);

  const filteredOrders = useMemo(() => {
    const predicate = filterMap[filter];
    return orders
      .filter((o) => predicate(o.status))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  const counts = useMemo(() => {
    const c: Record<OrderFilter, number> = {
      all: orders.length,
      pending: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      if (['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING'].includes(o.status)) c.pending++;
      if (o.status === 'DELIVERED') c.delivered++;
      if (o.status === 'CANCELLED') c.cancelled++;
    });
    return c;
  }, [orders]);

  const cancelOrder = (id: string, reason?: string) => {
    cancelOrderStore(id, reason);
  };

  const reorder = (orderId: string) => {
    const order = getOrderById(orderId);
    if (!order) return;
    try {
      const cartData = JSON.parse(localStorage.getItem('cart-storage') || '{}');
      const existingItems: any[] = cartData?.state?.items || [];
      const merged = [...existingItems];
      order.items.forEach((item) => {
        const existing = merged.find((c) => c.product.id === item.product.id);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          merged.push({ product: item.product, quantity: item.quantity });
        }
      });
      localStorage.setItem(
        'cart-storage',
        JSON.stringify({
          state: { items: merged, isLoading: false },
          version: cartData.version || 0,
        }),
      );
      window.location.href = '/cart';
    } catch {}
  };

  return {
    orders,
    filteredOrders,
    filter,
    setFilter: (f) => {
      setFilter(f);
      setPage(1);
    },
    page,
    setPage,
    pageSize,
    totalPages,
    paginatedOrders,
    isLoading: false,
    getOrderById,
    cancelOrder,
    reorder,
    counts,
  };
}

export default useOrders;
