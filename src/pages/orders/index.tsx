import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { OrderCard } from '@/components/orders/OrderCard';
import { Button } from '@/components/ui/Button';
import { useOrders, type OrderFilter } from '@/hooks/useOrders';
import type { OrderStatus } from '@/types';

const TABS: { id: OrderFilter; label: string; statuses?: OrderStatus[] }[] = [
  { id: 'all', label: 'Tất cả' },
  {
    id: 'pending',
    label: 'Đang xử lý',
    statuses: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING'],
  },
  { id: 'delivered', label: 'Đã giao', statuses: ['DELIVERED'] },
  { id: 'cancelled', label: 'Đã hủy', statuses: ['CANCELLED'] },
];

export default function OrdersListPage() {
  const { filter, setFilter, page, setPage, totalPages, paginatedOrders, counts } = useOrders(5);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-stone-800 sm:text-3xl dark:text-stone-100">
            <Package className="h-7 w-7 text-amber-600" />
            Đơn Hàng Của Tôi
          </h1>
          <p className="mt-1 text-stone-500 dark:text-stone-400">
            Theo dõi và quản lý đơn hàng của bạn
          </p>
        </div>
        <Link to="/products">
          <Button variant="outline" leftIcon={<ShoppingBag className="h-4 w-4" />}>
            Tiếp tục mua sắm
          </Button>
        </Link>
      </div>

      <div className="mb-6 overflow-x-auto border-b border-stone-200 dark:border-zinc-700">
        <div className="flex min-w-max gap-1 sm:gap-2">
          {TABS.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`relative whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${
                  isActive
                    ? 'text-amber-700 dark:text-amber-500'
                    : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                } `}
                role="tab"
                aria-selected={isActive}
              >
                {tab.label}
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                    isActive
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-stone-100 text-stone-500 dark:bg-zinc-700 dark:text-stone-400'
                  } `}
                >
                  {counts[tab.id]}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 dark:bg-amber-500"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {paginatedOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-16 text-center"
        >
          <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
            <Package className="h-16 w-16 text-amber-600 dark:text-amber-500" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-stone-800 dark:text-stone-100">
            Chưa có đơn hàng nào
          </h2>
          <p className="mx-auto mb-6 max-w-md text-stone-500 dark:text-stone-400">
            {filter === 'all'
              ? 'Bạn chưa có đơn hàng nào. Hãy khám phá các sản phẩm của chúng tôi!'
              : 'Không có đơn hàng nào trong mục này.'}
          </p>
          {filter === 'all' && (
            <Link to="/products">
              <Button size="lg" leftIcon={<ShoppingBag className="h-5 w-5" />}>
                Bắt đầu mua sắm
              </Button>
            </Link>
          )}
        </motion.div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Trước
              </Button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx + 1)}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                    page === idx + 1
                      ? 'bg-amber-600 text-white'
                      : 'border border-stone-200 bg-white text-stone-700 hover:bg-amber-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-300 dark:hover:bg-amber-900/20'
                  } `}
                  aria-label={`Trang ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
