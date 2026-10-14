import React from 'react';

export interface ProductCardSkeletonProps {
  variant?: 'default' | 'horizontal' | 'compact';
  className?: string;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({
  variant = 'default',
  className = '',
}) => {
  if (variant === 'horizontal') {
    return (
      <div
        className={`flex animate-pulse gap-4 rounded-xl border border-stone-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800 ${className}`}
      >
        <div className="h-32 w-32 flex-shrink-0 rounded-lg bg-stone-200 dark:bg-zinc-700" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 rounded bg-stone-200 dark:bg-zinc-700" />
          <div className="h-4 w-full rounded bg-stone-200 dark:bg-zinc-700" />
          <div className="h-4 w-2/3 rounded bg-stone-200 dark:bg-zinc-700" />
          <div className="mt-3 h-5 w-1/2 rounded bg-stone-200 dark:bg-zinc-700" />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`flex animate-pulse flex-col rounded-xl border border-stone-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800 ${className}`}
      >
        <div className="mb-2 aspect-square w-full rounded-lg bg-stone-200 dark:bg-zinc-700" />
        <div className="h-3 w-2/3 rounded bg-stone-200 dark:bg-zinc-700" />
        <div className="mt-1 h-4 w-full rounded bg-stone-200 dark:bg-zinc-700" />
        <div className="mt-2 h-4 w-1/2 rounded bg-stone-200 dark:bg-zinc-700" />
      </div>
    );
  }

  return (
    <div
      className={`animate-pulse overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800 ${className}`}
    >
      <div className="aspect-square w-full bg-stone-200 dark:bg-zinc-700" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 rounded bg-stone-200 dark:bg-zinc-700" />
        <div className="h-4 w-full rounded bg-stone-200 dark:bg-zinc-700" />
        <div className="h-4 w-3/4 rounded bg-stone-200 dark:bg-zinc-700" />
        <div className="h-4 w-1/2 rounded bg-stone-200 dark:bg-zinc-700" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 w-20 rounded bg-stone-200 dark:bg-zinc-700" />
          <div className="h-8 w-8 rounded bg-stone-200 dark:bg-zinc-700" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
