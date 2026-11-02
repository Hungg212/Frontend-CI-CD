import { useState, useEffect, useMemo, useCallback } from 'react';
import { useOrderStore } from '@/stores/orderStore';
import { useAuthStore } from '@/stores/authStore';
import type { Order, OrderStatus, Product } from '@/types';

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

const API_BASE = (() => {
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
  if (!base) return '/api';
  if (base.endsWith('/api')) return base;
  return `${base}/api`;
})();

interface ApiOrderItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
}

interface ApiOrder {
  id: string;
  orderNumber: string;
  items: ApiOrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: Order['paymentMethod'];
  paymentStatus: Order['paymentStatus'];
  shippingAddress: Order['shippingAddress'];
  note?: string;
  createdAt: string;
  updatedAt: string;
  timeline?: Order['timeline'];
}

/** Convert a raw API order into the frontend Order shape. */
export function mapApiOrder(o: ApiOrder): Order {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    items: (o.items || []).map((it) => ({
      product: {
        id: it.productId,
        name: it.name,
        slug: it.slug,
        imageUrl: it.image,
        images: it.image ? [it.image] : [],
        price: it.price,
      } as unknown as Product,
      quantity: it.quantity,
      price: it.price,
    })),
    subtotal: o.subtotal,
    shippingFee: o.shippingFee,
    discount: o.discount,
    total: o.total,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    shippingAddress: o.shippingAddress,
    note: o.note,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    timeline: o.timeline?.length
      ? o.timeline
      : [{ status: o.status, timestamp: o.createdAt }],
  };
}

export function useOrders(pageSize = 5): UseOrdersReturn {
  const token = useAuthStore((s) => s.token);
  const storeOrders = useOrderStore((s) => s.orders);
  const getOrderById = useOrderStore((s) => s.getOrderById);
  const cancelOrderStore = useOrderStore((s) => s.cancelOrder);
  const setOrders = useOrderStore((s) => s.setOrders);

  const [apiOrders, setApiOrders] = useState<Order[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [filter, setFilter] = useState<OrderFilter>('all');
  const [page, setPage] = useState(1);

  // Load the customer's real orders from the backend when authenticated.
  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setApiOrders(null);
      return;
    }
    setIsLoading(true);
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as ApiOrder[];
        if (cancelled) return;
        const mapped = (Array.isArray(data) ? data : []).map(mapApiOrder);
        setApiOrders(mapped);
        // Keep the local store in sync so detail pages can resolve the order.
        setOrders(mapped);
      } catch (err) {
        console.error('Failed to load orders:', err);
        if (!cancelled) setApiOrders(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, setOrders]);

  const orders = apiOrders ?? storeOrders;

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

  const cancelOrder = useCallback(
    (id: string, reason?: string) => {
      cancelOrderStore(id, reason);
    },
    [cancelOrderStore]
  );

  const reorder = useCallback(
    (orderId: string) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;
      try {
        const cartData = JSON.parse(localStorage.getItem('cart-storage') || '{}');
        const existingItems = cartData?.state?.items || [];
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
          })
        );
        window.location.href = '/cart';
      } catch (_e) {
        /* ignore */
      }
    },
    [orders]
  );

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
    isLoading,
    getOrderById,
    cancelOrder,
    reorder,
    counts,
  };
}

export default useOrders;
