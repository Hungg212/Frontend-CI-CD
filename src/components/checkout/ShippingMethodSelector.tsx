import React from 'react';
import { Truck, Zap, Bike } from 'lucide-react';
import type { ShippingMethod } from '@/types';

export interface ShippingOption {
  id: ShippingMethod;
  label: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon: React.ReactNode;
}

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'STANDARD',
    label: 'Giao hàng tiêu chuẩn',
    description: 'Giao hàng trong 2-3 ngày làm việc',
    price: 25000,
    estimatedDays: '2-3 ngày',
    icon: <Truck className="h-5 w-5" />,
  },
  {
    id: 'EXPRESS',
    label: 'Giao hàng nhanh',
    description: 'Giao hàng trong 1 ngày làm việc',
    price: 50000,
    estimatedDays: '1 ngày',
    icon: <Zap className="h-5 w-5" />,
  },
  {
    id: 'SAME_DAY',
    label: 'Giao hàng trong ngày',
    description: 'Chỉ áp dụng tại TP. Hồ Chí Minh',
    price: 80000,
    estimatedDays: 'Trong ngày',
    icon: <Bike className="h-5 w-5" />,
  },
];

export interface ShippingMethodSelectorProps {
  value: ShippingMethod;
  onChange: (method: ShippingMethod) => void;
  error?: string;
  className?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function ShippingMethodSelector({
  value,
  onChange,
  error,
  className = '',
}: ShippingMethodSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`} role="radiogroup" aria-label="Phương thức vận chuyển">
      {SHIPPING_OPTIONS.map((option) => {
        const isSelected = value === option.id;
        return (
          <label
            key={option.id}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all duration-200 ${
              isSelected
                ? 'border-amber-600 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20'
                : 'border-stone-200 hover:border-amber-300 dark:border-zinc-700 dark:hover:border-amber-700'
            } `}
          >
            <input
              type="radio"
              name="shipping-method"
              value={option.id}
              checked={isSelected}
              onChange={() => onChange(option.id)}
              className="sr-only"
            />
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                isSelected
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-600 dark:bg-zinc-700 dark:text-stone-300'
              } `}
            >
              {option.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-stone-800 dark:text-stone-100">{option.label}</p>
                <p className="whitespace-nowrap font-semibold text-amber-700 dark:text-amber-500">
                  {formatCurrency(option.price)}
                </p>
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400">{option.description}</p>
            </div>
            <div
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? 'border-amber-600' : 'border-stone-300 dark:border-zinc-600'} `}
            >
              {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-amber-600" />}
            </div>
          </label>
        );
      })}
      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default ShippingMethodSelector;
