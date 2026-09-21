import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'sale' | 'new' | 'bestseller' | 'primary' | 'secondary' | 'danger';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-stone-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  error: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  sale: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  new: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  bestseller: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  primary: 'bg-amber-700 text-white dark:bg-amber-600',
  secondary: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  danger: 'bg-red-500 text-white dark:bg-red-600',
};

const dotClasses: Record<BadgeVariant, string> = {
  default: 'bg-stone-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  sale: 'bg-red-500',
  new: 'bg-emerald-500',
  bestseller: 'bg-amber-500',
  primary: 'bg-white',
  secondary: 'bg-amber-500',
  danger: 'bg-white',
};

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', dotClasses[variant])} />
      )}
      {children}
    </span>
  );
}
