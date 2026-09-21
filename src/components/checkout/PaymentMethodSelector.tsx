import React from 'react';
import { CreditCard, Wallet, Building2, Smartphone, Banknote } from 'lucide-react';
import type { PaymentMethod as PaymentMethodType } from '@/types';

export interface PaymentMethodOption {
  id: PaymentMethodType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'COD',
    label: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán bằng tiền mặt khi nhận hàng',
    icon: <Banknote className="w-5 h-5" />,
  },
  {
    id: 'BANK_TRANSFER',
    label: 'Chuyển khoản ngân hàng',
    description: 'Tài khoản ảo - Nhập nội dung chuyển khoản',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    id: 'VNPAY',
    label: 'Ví VNPay',
    description: 'Thanh toán qua ví điện tử VNPay',
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    id: 'MOMO',
    label: 'Ví MoMo',
    description: 'Thanh toán qua ví điện tử MoMo',
    icon: <Smartphone className="w-5 h-5" />,
  },
  {
    id: 'CREDIT_CARD',
    label: 'Thẻ tín dụng / Ghi nợ',
    description: 'Visa, Mastercard, JCB',
    icon: <CreditCard className="w-5 h-5" />,
  },
];

export interface PaymentMethodSelectorProps {
  value: PaymentMethodType;
  onChange: (method: PaymentMethodType) => void;
  error?: string;
  className?: string;
}

export function PaymentMethodSelector({
  value,
  onChange,
  error,
  className = '',
}: PaymentMethodSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`} role="radiogroup" aria-label="Phương thức thanh toán">
      {PAYMENT_METHODS.map((method) => {
        const isSelected = value === method.id;
        return (
          <label
            key={method.id}
            className={`
              flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer
              transition-all duration-200
              ${isSelected
                ? 'border-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-500'
                : 'border-stone-200 dark:border-zinc-700 hover:border-amber-300 dark:hover:border-amber-700'
              }
            `}
          >
            <input
              type="radio"
              name="payment-method"
              value={method.id}
              checked={isSelected}
              onChange={() => onChange(method.id)}
              className="sr-only"
            />
            <div
              className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                ${isSelected
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-600 dark:bg-zinc-700 dark:text-stone-300'
                }
              `}
            >
              {method.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-800 dark:text-stone-100">
                {method.label}
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {method.description}
              </p>
            </div>
            <div
              className={`
                flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${isSelected ? 'border-amber-600' : 'border-stone-300 dark:border-zinc-600'}
              `}
            >
              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />}
            </div>
          </label>
        );
      })}

      {value === 'CREDIT_CARD' && (
        <div className="mt-3 p-4 bg-stone-50 dark:bg-zinc-700/50 rounded-lg space-y-3 border border-stone-200 dark:border-zinc-700">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">
            Thông tin thẻ (mô phỏng - sẽ được xử lý bởi cổng thanh toán)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
                Số thẻ
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
                Ngày hết hạn
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                maxLength={5}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-300 mb-1">
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                maxLength={3}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default PaymentMethodSelector;
