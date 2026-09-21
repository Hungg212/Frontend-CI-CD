import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Package } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="mb-4 rounded-full bg-stone-100 p-4 dark:bg-zinc-800">
        {icon || <Package className="h-12 w-12 text-stone-400" />}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-stone-900 dark:text-stone-100">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-stone-500 dark:text-stone-400">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Preset empty states
export function EmptyCart({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="h-12 w-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      }
      title="Giỏ hàng trống"
      description="Hãy thêm một số sản phẩm vào giỏ hàng của bạn để bắt đầu mua sắm."
      action={onBrowse ? { label: 'Khám phá sản phẩm', onClick: onBrowse } : undefined}
    />
  );
}

export function EmptyWishlist({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="h-12 w-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      }
      title="Danh sách yêu thích trống"
      description="Lưu những sản phẩm bạn thích vào đây để mua sắm sau."
      action={onBrowse ? { label: 'Khám phá sản phẩm', onClick: onBrowse } : undefined}
    />
  );
}

export function EmptySearch({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon={
        <svg className="h-12 w-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      title="Không tìm thấy kết quả"
      description="Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm của bạn."
      action={onReset ? { label: 'Đặt lại bộ lọc', onClick: onReset } : undefined}
    />
  );
}
