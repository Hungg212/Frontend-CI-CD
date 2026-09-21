import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';
import type { OrderStatus, OrderTimeline as OrderTimelineType } from '@/types';

export interface OrderTimelineProps {
  timeline: OrderTimelineType[];
  currentStatus: OrderStatus;
  className?: string;
}

const steps: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'PENDING', label: 'Chờ xác nhận', icon: <Clock className="w-4 h-4" /> },
  { status: 'CONFIRMED', label: 'Đã xác nhận', icon: <Check className="w-4 h-4" /> },
  { status: 'PROCESSING', label: 'Đang xử lý', icon: <Package className="w-4 h-4" /> },
  { status: 'SHIPPING', label: 'Đang giao', icon: <Truck className="w-4 h-4" /> },
  { status: 'DELIVERED', label: 'Đã giao', icon: <CheckCircle2 className="w-4 h-4" /> },
];

const statusOrder: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED'];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function OrderTimeline({ timeline, currentStatus, className = '' }: OrderTimelineProps) {
  const isCancelled = currentStatus === 'CANCELLED';
  const currentStepIndex = isCancelled ? -1 : statusOrder.indexOf(currentStatus);

  const findTimelineEntry = (status: OrderStatus) => {
    return timeline.find((t) => t.status === status);
  };

  if (isCancelled) {
    const cancelledEntry = timeline.find((t) => t.status === 'CANCELLED');
    return (
      <div className={`${className}`}>
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center">
            <XCircle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-red-700 dark:text-red-400">Đơn hàng đã bị hủy</p>
            {cancelledEntry && (
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                {formatDate(cancelledEntry.timestamp)}
              </p>
            )}
            {cancelledEntry?.note && (
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">{cancelledEntry.note}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-0 ${className}`}>
      {steps.map((step, index) => {
        const entry = findTimelineEntry(step.status);
        const isCompleted = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.status} className="flex gap-3 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center
                  transition-colors duration-300
                  ${isCompleted
                    ? 'bg-amber-600 text-white dark:bg-amber-500'
                    : 'bg-stone-200 text-stone-400 dark:bg-zinc-700 dark:text-zinc-500'
                  }
                  ${isCurrent ? 'ring-4 ring-amber-200 dark:ring-amber-900/50' : ''}
                `}
              >
                {step.icon}
              </motion.div>
              {!isLast && (
                <div
                  className={`
                    w-0.5 flex-1 mt-2 transition-colors duration-300
                    ${index < currentStepIndex
                      ? 'bg-amber-600 dark:bg-amber-500'
                      : 'bg-stone-200 dark:bg-zinc-700'
                    }
                  `}
                  style={{ minHeight: '24px' }}
                />
              )}
            </div>
            <div className="flex-1 pt-1">
              <p
                className={`
                  font-medium
                  ${isCompleted ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400 dark:text-stone-500'}
                `}
              >
                {step.label}
              </p>
              {entry && (
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                  {formatDate(entry.timestamp)}
                </p>
              )}
              {entry?.note && (
                <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">{entry.note}</p>
              )}
              {!entry && isCurrent && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-0.5">
                  Đang xử lý...
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default OrderTimeline;
