import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  reviewCount?: number;
  onChange?: (value: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function Rating({
  value,
  max = 5,
  size = 'md',
  readonly = false,
  showValue = false,
  reviewCount,
  onChange,
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;

  return (
    <div
      className={cn('inline-flex items-center gap-2', className)}
      role={readonly ? 'img' : 'slider'}
      aria-label={`Rating: ${value} out of ${max} stars`}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div className="flex">
        {Array.from({ length: max }).map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= displayValue;
          const isHalf = !isFilled && starValue - 0.5 <= displayValue;

          return (
            <button
              key={i}
              type="button"
              disabled={readonly}
              onClick={() => !readonly && onChange?.(starValue)}
              onMouseEnter={() => !readonly && setHoverValue(starValue)}
              onMouseLeave={() => !readonly && setHoverValue(null)}
              className={cn(
                'relative',
                !readonly && 'cursor-pointer transition-transform hover:scale-110',
                readonly && 'cursor-default'
              )}
              aria-label={`Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'text-stone-300 dark:text-zinc-600',
                  (isFilled || isHalf) && 'fill-amber-500 text-amber-500'
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
          {value.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-sm text-stone-500 dark:text-stone-400">({reviewCount})</span>
      )}
    </div>
  );
}

// Display-only rating with review count
export function RatingDisplay({
  value,
  count,
  size = 'sm',
}: {
  value: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div className="flex items-center gap-2">
      <Rating value={value} size={size} readonly showValue />
      {count !== undefined && (
        <span className="text-sm text-stone-500 dark:text-stone-400">({count} đánh giá)</span>
      )}
    </div>
  );
}
