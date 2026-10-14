import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { OrderCard } from '@/components/orders/OrderCard';
import { useOrderStore } from '@/stores/orderStore';
import type { OrderStatus } from '@/types';

const TABS: {
  id: 'ALL' | 'PENDING_GROUP' | 'COMPLETED' | 'CANCELLED';
  label: string;
  statuses?: OrderStatus[];
}[] = [
  { id: 'ALL', label: 'Tất cả' },
  {
    id: 'PENDING_GROUP',
    label: 'Đang xử lý',
    statuses: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING'],
  },
  { id: 'COMPLETED', label: 'Hoàn thành', statuses: ['DELIVERED'] },
  { id: 'CANCELLED', label: 'Đã hủy', statuses: ['CANCELLED'] },
];

const OrdersPage: React.FC = () => {
  const orders = useOrderStore((s) => s.orders);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('ALL');

  const filteredOrders = useMemo(() => {
    const tab = TABS.find((t) => t.id === activeTab);
    if (!tab || !tab.statuses) return orders;
    return orders.filter((o) => tab.statuses!.includes(o.status));
  }, [orders, activeTab]);

  const counts = useMemo(
    () => ({
      ALL: orders.length,
      PENDING_GROUP: orders.filter((o) =>
        ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING'].includes(o.status)
      ).length,
      COMPLETED: orders.filter((o) => o.status === 'DELIVERED').length,
      CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
    }),
    [orders]
  );

  return (
    <div className="min-h-screen bg-stone-50 py-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-2 flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
          <Link to="/" className="hover:text-amber-700 dark:hover:text-amber-500">
            Trang chủ
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/profile" className="hover:text-amber-700 dark:hover:text-amber-500">
            Tài khoản
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-stone-700 dark:text-stone-200">Đơn hàng</span>
        </nav>
        <h1 className="mb-1 text-3xl font-bold text-stone-800 dark:text-stone-100">
          Đơn Hàng Của Tôi
        </h1>
        <p className="mb-6 text-stone-600 dark:text-stone-400">
          Quản lý và theo dõi tất cả đơn hàng của bạn
        </p>

        <div className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-stone-200 dark:border-zinc-700">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-600 text-amber-700 dark:text-amber-500'
                  : 'border-transparent text-stone-600 hover:text-amber-700 dark:text-stone-400 dark:hover:text-amber-500'
              }`}
            >
              {tab.label}
              <span className="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-xs text-stone-700 dark:bg-zinc-700 dark:text-stone-300">
                {counts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="flex flex-col items-center py-8">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 dark:bg-zinc-700">
                <Package className="h-10 w-10 text-stone-400" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-stone-800 dark:text-stone-100">
                Chưa có đơn hàng nào
              </h2>
              <p className="mb-4 text-stone-600 dark:text-stone-400">
                Bạn chưa có đơn hàng nào trong mục này
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-1 rounded-lg bg-amber-700 px-4 py-2 text-white transition-colors hover:bg-amber-800"
              >
                Khám phá sản phẩm
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
