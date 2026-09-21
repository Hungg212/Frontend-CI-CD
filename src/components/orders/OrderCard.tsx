import React from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge';
import type { Order } from '@/types';

export interface OrderCardProps {
  order: Order;
  className?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderCard({ order, className = '' }: OrderCardProps) {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const firstImages = order.items.slice(0, 3).map((item) => item.product.images[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card hover className={`${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-zinc-700">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-stone-800 dark:text-stone-100">
                #{order.orderNumber}
              </span>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(order.createdAt)}
          </div>
        </div>

        <div className="py-3 flex items-center gap-3">
          <div className="flex -space-x-2">
            {firstImages.map((img, idx) => (
              <div
                key={idx}
                className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white dark:border-zinc-800 bg-stone-100 dark:bg-zinc-700"
              >
                <img
                  src={img}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="w-12 h-12 rounded-lg border-2 border-white dark:border-zinc-800 bg-stone-100 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium text-stone-600 dark:text-stone-300">
                +{order.items.length - 3}
              </div>
            )}
          </div>
          <div className="flex-1 text-sm text-stone-600 dark:text-stone-400">
            {totalItems} sản phẩm
          </div>
          <div className="text-right">
            <p className="text-xs text-stone-500 dark:text-stone-400">Tổng cộng</p>
            <p className="font-semibold text-amber-700 dark:text-amber-500">
              {formatCurrency(order.total)}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-stone-200 dark:border-zinc-700 flex items-center justify-between gap-3 flex-wrap">
          <PaymentStatusBadge status={order.paymentStatus} />
          <Link
            to={`/orders/${order.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-400 transition-colors"
            aria-label={`Xem chi tiết đơn hàng ${order.orderNumber}`}
          >
            Xem Chi Tiết
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}

export default OrderCard;
