import React from 'react';
import { Badge } from '@/components/ui/Badge';
import type { OrderStatus, PaymentStatus } from '@/types';

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'warning' | 'info' | 'default' | 'success' | 'error'; className: string }> = {
  PENDING: {
    label: 'Chờ Xác Nhận',
    variant: 'warning',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  CONFIRMED: {
    label: 'Đã Xác Nhận',
    variant: 'info',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  PROCESSING: {
    label: 'Đang Xử Lý',
    variant: 'info',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  },
  SHIPPING: {
    label: 'Đang Giao',
    variant: 'info',
    className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  },
  SHIPPED: {
    label: 'Đã Giao Hàng',
    variant: 'success',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  DELIVERED: {
    label: 'Đã Giao',
    variant: 'success',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  CANCELLED: {
    label: 'Đã Hủy',
    variant: 'error',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
};

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className} ${className}`}
      aria-label={`Trạng thái đơn hàng: ${config.label}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {config.label}
    </span>
  );
}

export interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  className?: string;
}

const paymentConfig: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Chờ Thanh Toán',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  PAID: {
    label: 'Đã Thanh Toán',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  FAILED: {
    label: 'Thanh Toán Thất Bại',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  REFUNDED: {
    label: 'Đã Hoàn Tiền',
    className: 'bg-stone-100 text-stone-700 dark:bg-zinc-700 dark:text-stone-200',
  },
};

export function PaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
  const config = paymentConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className} ${className}`}
      aria-label={`Trạng thái thanh toán: ${config.label}`}
    >
      {config.label}
    </span>
  );
}

export default OrderStatusBadge;
