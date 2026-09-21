import { useState, useEffect, type ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: {
    button: 'h-8 w-8',
    input: 'w-12 text-sm',
  },
  md: {
    button: 'h-10 w-10',
    input: 'w-14 text-base',
  },
  lg: {
    button: 'h-12 w-12',
    input: 'w-16 text-lg',
  },
};

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  disabled = false,
  size = 'md',
  className,
}: QuantitySelectorProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const numVal = parseInt(val, 10);
    if (!isNaN(numVal) && numVal >= min && numVal <= max) {
      onChange(numVal);
    }
  };

  const handleBlur = () => {
    const numVal = parseInt(inputValue, 10);
    if (isNaN(numVal) || numVal < min) {
      setInputValue(min.toString());
      onChange(min);
    } else if (numVal > max) {
      setInputValue(max.toString());
      onChange(max);
    }
  };

  const canDecrement = value > min && !disabled;
  const canIncrement = value < max && !disabled;

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-stone-300 bg-white dark:border-zinc-600 dark:bg-zinc-800',
        disabled && 'opacity-50',
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        className={cn(
          'flex items-center justify-center rounded-l-lg text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-zinc-700',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
          sizeClasses[size].button,
          !canDecrement && 'cursor-not-allowed opacity-50'
        )}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={cn(
          'border-x border-stone-300 bg-transparent text-center text-stone-800 dark:border-zinc-600 dark:text-stone-100',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
          'disabled:cursor-not-allowed',
          sizeClasses[size].input
        )}
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        className={cn(
          'flex items-center justify-center rounded-r-lg text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-zinc-700',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
          sizeClasses[size].button,
          !canIncrement && 'cursor-not-allowed opacity-50'
        )}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
