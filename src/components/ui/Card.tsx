import React, { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'coffee';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const radiusClasses = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
};

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  coffee: 'shadow-coffee',
};

export function Card({
  children,
  padding = 'md',
  radius = 'lg',
  shadow = 'sm',
  hover = false,
  className,
  onClick,
}: CardProps) {
  const Component = hover ? motion.div : 'div';
  const motionProps = hover
    ? {
        whileHover: { y: -4 },
        transition: { duration: 0.2 },
        className: cn(
          'cursor-pointer bg-white dark:bg-zinc-800',
          'border border-stone-200 dark:border-zinc-700',
          paddingClasses[padding],
          radiusClasses[radius],
          shadowClasses[shadow],
          className
        ),
      }
    : {};

  return (
    <Component
      {...motionProps}
      className={cn(
        !hover && 'bg-white dark:bg-zinc-800',
        !hover && 'border border-stone-200 dark:border-zinc-700',
        paddingClasses[padding],
        radiusClasses[radius],
        shadowClasses[shadow],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </Component>
  );
}
