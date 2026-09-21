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
    icon: <Banknote className="h-5 w-5" />,
  },
  {
    id: 'BANK_TRANSFER',
    label: 'Chuyển khoản ngân hàng',
    description: 'Tài khoản ảo - Nhập nội dung chuyển khoản',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    id: 'VNPAY',
    label: 'Ví VNPay',
    description: 'Thanh toán qua ví điện tử VNPay',
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    id: 'MOMO',
    label: 'Ví MoMo',
    description: 'Thanh toán qua ví điện tử MoMo',
    icon: <Smartphone className="h-5 w-5" />,
  },
  {
    id: 'CREDIT_CARD',
    label: 'Thẻ tín dụng / Ghi nợ',
    description: 'Visa, Mastercard, JCB',
    icon: <CreditCard className="h-5 w-5" />,
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
            className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-all duration-200 ${
              isSelected
                ? 'border-amber-600 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20'
                : 'border-stone-200 hover:border-amber-300 dark:border-zinc-700 dark:hover:border-amber-700'
            } `}
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
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                isSelected
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-600 dark:bg-zinc-700 dark:text-stone-300'
              } `}
            >
              {method.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-stone-800 dark:text-stone-100">{method.label}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">{method.description}</p>
            </div>
            <div
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? 'border-amber-600' : 'border-stone-300 dark:border-zinc-600'} `}
            >
              {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-amber-600" />}
            </div>
          </label>
        );
      })}

      {value === 'CREDIT_CARD' && (
        <div className="mt-3 space-y-3 rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-zinc-700 dark:bg-zinc-700/50">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-200">
            Thông tin thẻ (mô phỏng - sẽ được xử lý bởi cổng thanh toán)
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-300">
                Số thẻ
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-300">
                Ngày hết hạn
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                maxLength={5}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-stone-600 dark:text-stone-300">
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                maxLength={3}
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-stone-100"
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
