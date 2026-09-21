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
  { id: 'pending', label: 'Đang xử lý', statuses: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING'] },
  { id: 'delivered', label: 'Đã giao', statuses: ['DELIVERED'] },
  { id: 'cancelled', label: 'Đã hủy', statuses: ['CANCELLED'] },
];

export default function OrdersListPage() {
  const {
    filter,
    setFilter,
    page,
    setPage,
    totalPages,
    paginatedOrders,
    counts,
  } = useOrders(5);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <Package className="w-7 h-7 text-amber-600" />
            Đơn Hàng Của Tôi
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">
            Theo dõi và quản lý đơn hàng của bạn
          </p>
        </div>
        <Link to="/products">
          <Button variant="outline" leftIcon={<ShoppingBag className="w-4 h-4" />}>
            Tiếp tục mua sắm
          </Button>
        </Link>
      </div>

      <div className="mb-6 border-b border-stone-200 dark:border-zinc-700 overflow-x-auto">
        <div className="flex gap-1 sm:gap-2 min-w-max">
          {TABS.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`
                  relative px-3 sm:px-4 py-3 text-sm font-medium whitespace-nowrap
                  transition-colors
                  ${isActive
                    ? 'text-amber-700 dark:text-amber-500'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }
                `}
                role="tab"
                aria-selected={isActive}
              >
                {tab.label}
                <span
                  className={`
                    ml-1.5 px-1.5 py-0.5 rounded-full text-xs
                    ${isActive
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-stone-100 text-stone-500 dark:bg-zinc-700 dark:text-stone-400'
                    }
                  `}
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
          className="text-center py-16"
        >
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
            <Package className="w-16 h-16 text-amber-600 dark:text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100 mb-2">
            Chưa có đơn hàng nào
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mb-6 max-w-md mx-auto">
            {filter === 'all'
              ? 'Bạn chưa có đơn hàng nào. Hãy khám phá các sản phẩm của chúng tôi!'
              : 'Không có đơn hàng nào trong mục này.'}
          </p>
          {filter === 'all' && (
            <Link to="/products">
              <Button size="lg" leftIcon={<ShoppingBag className="w-5 h-5" />}>
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
            <div className="flex items-center justify-center gap-2 mt-6">
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
                  className={`
                    w-9 h-9 rounded-lg text-sm font-medium transition-colors
                    ${page === idx + 1
                      ? 'bg-amber-600 text-white'
                      : 'bg-white dark:bg-zinc-800 text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-stone-200 dark:border-zinc-700'
                    }
                  `}
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
