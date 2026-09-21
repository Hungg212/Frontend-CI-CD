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
        className={`flex gap-4 bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 p-3 animate-pulse ${className}`}
      >
        <div className="w-32 h-32 flex-shrink-0 bg-stone-200 dark:bg-zinc-700 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 bg-stone-200 dark:bg-zinc-700 rounded" />
          <div className="h-4 w-full bg-stone-200 dark:bg-zinc-700 rounded" />
          <div className="h-4 w-2/3 bg-stone-200 dark:bg-zinc-700 rounded" />
          <div className="h-5 w-1/2 bg-stone-200 dark:bg-zinc-700 rounded mt-3" />
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`flex flex-col bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 p-3 animate-pulse ${className}`}
      >
        <div className="aspect-square w-full bg-stone-200 dark:bg-zinc-700 rounded-lg mb-2" />
        <div className="h-3 w-2/3 bg-stone-200 dark:bg-zinc-700 rounded" />
        <div className="h-4 w-full bg-stone-200 dark:bg-zinc-700 rounded mt-1" />
        <div className="h-4 w-1/2 bg-stone-200 dark:bg-zinc-700 rounded mt-2" />
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 overflow-hidden animate-pulse ${className}`}
    >
      <div className="aspect-square w-full bg-stone-200 dark:bg-zinc-700" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/3 bg-stone-200 dark:bg-zinc-700 rounded" />
        <div className="h-4 w-full bg-stone-200 dark:bg-zinc-700 rounded" />
        <div className="h-4 w-3/4 bg-stone-200 dark:bg-zinc-700 rounded" />
        <div className="h-4 w-1/2 bg-stone-200 dark:bg-zinc-700 rounded" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 w-20 bg-stone-200 dark:bg-zinc-700 rounded" />
          <div className="h-8 w-8 bg-stone-200 dark:bg-zinc-700 rounded" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
