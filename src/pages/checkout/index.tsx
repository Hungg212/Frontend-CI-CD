import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Truck,
  CreditCard,
  MapPin,
  User as UserIcon,
  Package,
  Truck as TruckIcon,
  Edit3,
  QrCode,
  Building2,
  Smartphone,
  Wallet,
  Banknote,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CouponInput } from '@/components/cart/CouponInput';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/orderStore';
import { useUIStore } from '@/stores/uiStore';
import { findCouponByCode } from '@/data/coupons';
import { PROVINCES, DISTRICTS, WARDS } from '@/data/addresses';
import type { Address, Coupon, PaymentMethod, Order, OrderItem } from '@/types';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const FREE_SHIPPING_THRESHOLD = 500000;
const SHIPPING_OPTIONS = [
  {
    id: 'STANDARD' as const,
    label: 'Giao hàng tiêu chuẩn',
    fee: 30000,
    eta: '3-5 ngày',
    icon: <TruckIcon className="h-5 w-5" />,
  },
  {
    id: 'EXPRESS' as const,
    label: 'Giao hàng nhanh',
    fee: 50000,
    eta: '1-2 ngày',
    icon: <Truck className="h-5 w-5" />,
  },
  {
    id: 'FREE' as const,
    label: 'Miễn phí vận chuyển',
    fee: 0,
    eta: '5-7 ngày',
    icon: <Package className="h-5 w-5" />,
    note: 'Đơn từ 500.000đ',
  },
];

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
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

const customerSchema = z.object({
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ (VD: 0901234567)'),
});
type CustomerData = z.infer<typeof customerSchema>;

const addressSchema = z.object({
  province: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  district: z.string().min(1, 'Vui lòng chọn quận/huyện'),
  ward: z.string().min(1, 'Vui lòng chọn phường/xã'),
  detail: z.string().min(5, 'Địa chỉ chi tiết phải có ít nhất 5 ký tự'),
  label: z.enum(['home', 'office', 'other']),
  saveAddress: z.boolean().optional(),
});
type AddressData = z.infer<typeof addressSchema>;

const STEPS = [
  { id: 1, label: 'Thông Tin', icon: UserIcon },
  { id: 2, label: 'Địa Chỉ', icon: MapPin },
  { id: 3, label: 'Vận Chuyển', icon: Truck },
  { id: 4, label: 'Thanh Toán', icon: CreditCard },
  { id: 5, label: 'Xác Nhận', icon: Package },
];

const StepIndicator: React.FC<{ current: number; onJump: (s: number) => void }> = ({
  current,
  onJump,
}) => (
  <div className="mb-6">
    <div className="hidden items-center justify-between sm:flex">
      {STEPS.map((step, idx) => {
        const isCompleted = current > step.id;
        const isCurrent = current === step.id;
        const Icon = step.icon;
        return (
          <React.Fragment key={step.id}>
            <button
              type="button"
              onClick={() => isCompleted && onJump(step.id)}
              disabled={!isCompleted}
              className={`flex flex-col items-center gap-1.5 ${
                isCompleted ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                      ? 'bg-amber-600 text-white ring-4 ring-amber-200 dark:ring-amber-900/50'
                      : 'bg-stone-200 text-stone-500 dark:bg-zinc-700'
                }`}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <span
                className={`text-xs font-medium ${
                  isCurrent
                    ? 'text-amber-700 dark:text-amber-500'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                {step.label}
              </span>
            </button>
            {idx < STEPS.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 transition-colors ${
                  current > step.id ? 'bg-emerald-500' : 'bg-stone-200 dark:bg-zinc-700'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
    <div className="sm:hidden">
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Bước {current} / {STEPS.length}:{' '}
        <span className="font-semibold text-amber-700 dark:text-amber-500">
          {STEPS[current - 1].label}
        </span>
      </p>
    </div>
  </div>
);

const Step1Customer: React.FC<{
  defaultValues: Partial<CustomerData>;
  onSubmit: (d: CustomerData) => void;
}> = ({ defaultValues, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerData>({
    resolver: zodResolver(customerSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="mb-2 text-xl font-bold text-stone-800 dark:text-stone-100">
        Thông Tin Khách Hàng
      </h2>
      <Input
        label="Họ và tên *"
        {...register('name')}
        error={errors.name?.message}
        placeholder="Nguyễn Văn A"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Email *"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          placeholder="email@example.com"
        />
        <Input
          label="Số điện thoại *"
          type="tel"
          {...register('phone')}
          error={errors.phone?.message}
          placeholder="0901234567"
        />
      </div>
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          rightIcon={<ChevronRight className="h-4 w-4" />}
          isLoading={isSubmitting}
        >
          Tiếp Tục
        </Button>
      </div>
    </form>
  );
};

const Step2Address: React.FC<{
  defaultValues: Partial<AddressData>;
  onSubmit: (d: AddressData) => void;
  onBack: () => void;
}> = ({ defaultValues, onSubmit, onBack }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressData>({
    resolver: zodResolver(addressSchema),
    defaultValues,
  });

  const province = watch('province');
  const district = watch('district');
  const districtOptions = province ? DISTRICTS[province] || [] : [];
  const wardOptions = district ? WARDS[district] || [] : [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="mb-2 text-xl font-bold text-stone-800 dark:text-stone-100">
        Địa Chỉ Giao Hàng
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Select
          label="Tỉnh/Thành phố *"
          {...register('province')}
          error={errors.province?.message}
          options={PROVINCES}
          placeholder="Chọn tỉnh/thành phố"
          onChange={(e) => {
            setValue('province', e.target.value);
            setValue('district', '');
            setValue('ward', '');
          }}
        />
        <Select
          label="Quận/Huyện *"
          {...register('district')}
          error={errors.district?.message}
          options={districtOptions}
          placeholder="Chọn quận/huyện"
          disabled={!province}
          onChange={(e) => {
            setValue('district', e.target.value);
            setValue('ward', '');
          }}
        />
        <Select
          label="Phường/Xã *"
          {...register('ward')}
          error={errors.ward?.message}
          options={wardOptions}
          placeholder="Chọn phường/xã"
          disabled={!district}
        />
      </div>
      <Textarea
        label="Địa chỉ chi tiết *"
        {...register('detail')}
        error={errors.detail?.message}
        placeholder="Số nhà, tên đường, ngõ, hẻm..."
      />
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-200">
          Loại địa chỉ
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'home', label: 'Nhà riêng' },
            { value: 'office', label: 'Văn phòng' },
            { value: 'other', label: 'Khác' },
          ].map((opt) => (
            <label
              key={opt.value}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 transition-colors hover:bg-stone-50 dark:border-zinc-700 dark:hover:bg-zinc-700"
            >
              <input
                type="radio"
                value={opt.value}
                {...register('label')}
                className="text-amber-600 focus:ring-amber-500"
                defaultChecked={opt.value === 'home'}
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          {...register('saveAddress')}
          className="h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
        />
        <span className="text-sm text-stone-700 dark:text-stone-300">
          Lưu địa chỉ này cho lần sau
        </span>
      </label>
      <div className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          leftIcon={<ChevronLeft className="h-4 w-4" />}
          onClick={onBack}
        >
          Quay Lại
        </Button>
        <Button
          type="submit"
          variant="primary"
          rightIcon={<ChevronRight className="h-4 w-4" />}
          isLoading={isSubmitting}
        >
          Tiếp Tục
        </Button>
      </div>
    </form>
  );
};

const Step3Shipping: React.FC<{
  selected: string;
  subtotal: number;
  onSelect: (id: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}> = ({ selected, subtotal, onSelect, onSubmit, onBack }) => {
  const availableOptions = SHIPPING_OPTIONS.filter((opt) => {
    if (opt.id === 'FREE') return subtotal >= FREE_SHIPPING_THRESHOLD;
    return true;
  });

  return (
    <div className="space-y-4">
      <h2 className="mb-2 text-xl font-bold text-stone-800 dark:text-stone-100">
        Phương Thức Vận Chuyển
      </h2>
      <div className="space-y-2">
        {availableOptions.map((opt) => (
          <label
            key={opt.id}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
              selected === opt.id
                ? 'border-amber-600 bg-amber-50 dark:bg-amber-900/20'
                : 'border-stone-200 hover:border-amber-300 dark:border-zinc-700'
            }`}
          >
            <input
              type="radio"
              name="shipping"
              value={opt.id}
              checked={selected === opt.id}
              onChange={() => onSelect(opt.id)}
              className="sr-only"
            />
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                selected === opt.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-600 dark:bg-zinc-700'
              }`}
            >
              {opt.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-stone-800 dark:text-stone-100">{opt.label}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {opt.note ?? `Thời gian: ${opt.eta}`}
              </p>
            </div>
            <p className="whitespace-nowrap font-semibold text-amber-700 dark:text-amber-500">
              {opt.fee === 0 ? 'Miễn phí' : formatCurrency(opt.fee)}
            </p>
          </label>
        ))}
      </div>
      <div className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          leftIcon={<ChevronLeft className="h-4 w-4" />}
          onClick={onBack}
        >
          Quay Lại
        </Button>
        <Button
          variant="primary"
          rightIcon={<ChevronRight className="h-4 w-4" />}
          onClick={onSubmit}
        >
          Tiếp Tục
        </Button>
      </div>
    </div>
  );
};

const Step4Payment: React.FC<{
  selected: PaymentMethod;
  onSelect: (m: PaymentMethod) => void;
  onSubmit: () => void;
  onBack: () => void;
}> = ({ selected, onSelect, onSubmit, onBack }) => {
  return (
    <div className="space-y-4">
      <h2 className="mb-2 text-xl font-bold text-stone-800 dark:text-stone-100">
        Phương Thức Thanh Toán
      </h2>
      <div className="space-y-2">
        {PAYMENT_METHODS.map((method) => (
          <label
            key={method.id}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
              selected === method.id
                ? 'border-amber-600 bg-amber-50 dark:bg-amber-900/20'
                : 'border-stone-200 hover:border-amber-300 dark:border-zinc-700'
            }`}
          >
            <input
              type="radio"
              name="payment"
              value={method.id}
              checked={selected === method.id}
              onChange={() => onSelect(method.id)}
              className="sr-only"
            />
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                selected === method.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-600 dark:bg-zinc-700'
              }`}
            >
              {method.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-stone-800 dark:text-stone-100">{method.label}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">{method.description}</p>
            </div>
            <div
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                selected === method.id
                  ? 'border-amber-600'
                  : 'border-stone-300 dark:border-zinc-600'
              }`}
            >
              {selected === method.id && <div className="h-2.5 w-2.5 rounded-full bg-amber-600" />}
            </div>
          </label>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selected === 'CREDIT_CARD' && (
          <motion.div
            key="card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-zinc-700 dark:bg-zinc-700/50">
              <p className="text-sm font-medium text-stone-700 dark:text-stone-200">
                Thông tin thẻ (mô phỏng)
              </p>
              <Input label="Số thẻ" placeholder="1234 5678 9012 3456" maxLength={19} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Ngày hết hạn" placeholder="MM/YY" maxLength={5} />
                <Input label="CVV" placeholder="123" maxLength={3} type="password" />
              </div>
            </div>
          </motion.div>
        )}
        {(selected === 'VNPAY' || selected === 'MOMO') && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-zinc-700 dark:bg-zinc-700/50">
              <div className="flex h-40 w-40 items-center justify-center rounded-lg border-2 border-stone-300 bg-white">
                <QrCode className="h-24 w-24 text-stone-800" />
              </div>
              <p className="text-center text-sm text-stone-600 dark:text-stone-400">
                Quét mã QR bằng ứng dụng {selected === 'VNPAY' ? 'VNPay' : 'MoMo'} để thanh toán
              </p>
            </div>
          </motion.div>
        )}
        {selected === 'BANK_TRANSFER' && (
          <motion.div
            key="bank"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-700/50">
              <p className="font-medium text-stone-800 dark:text-stone-100">
                Thông tin tài khoản ảo:
              </p>
              <p className="text-stone-600 dark:text-stone-400">
                Ngân hàng:{' '}
                <span className="font-mono text-stone-800 dark:text-stone-100">Vietcombank</span>
              </p>
              <p className="text-stone-600 dark:text-stone-400">
                Số tài khoản:{' '}
                <span className="font-mono text-stone-800 dark:text-stone-100">9876 5432 1098</span>
              </p>
              <p className="text-stone-600 dark:text-stone-400">
                Chủ tài khoản:{' '}
                <span className="font-mono text-stone-800 dark:text-stone-100">
                  CONG TY COFFEE HOME BLEND
                </span>
              </p>
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                Nội dung: <span className="font-mono">[Mã đơn hàng] - [Số điện thoại]</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          leftIcon={<ChevronLeft className="h-4 w-4" />}
          onClick={onBack}
        >
          Quay Lại
        </Button>
        <Button
          variant="primary"
          rightIcon={<ChevronRight className="h-4 w-4" />}
          onClick={onSubmit}
        >
          Tiếp Tục
        </Button>
      </div>
    </div>
  );
};

const Step5Confirm: React.FC<{
  customer: CustomerData | null;
  address: (AddressData & { fullName?: string; phone?: string }) | null;
  shippingId: string;
  payment: PaymentMethod;
  note: string;
  onNoteChange: (n: string) => void;
  terms: boolean;
  onTermsChange: (b: boolean) => void;
  onSubmit: () => void;
  onBack: () => void;
  onEdit: (step: number) => void;
  isSubmitting: boolean;
}> = ({
  customer,
  address,
  shippingId,
  payment,
  note,
  onNoteChange,
  terms,
  onTermsChange,
  onSubmit,
  onBack,
  onEdit,
  isSubmitting,
}) => {
  const shipping = SHIPPING_OPTIONS.find((s) => s.id === shippingId);
  const paymentLabel = PAYMENT_METHODS.find((p) => p.id === payment)?.label;

  return (
    <div className="space-y-5">
      <h2 className="mb-2 text-xl font-bold text-stone-800 dark:text-stone-100">
        Xác Nhận Đơn Hàng
      </h2>

      <div className="space-y-3">
        <div className="flex items-start justify-between rounded-lg bg-stone-50 p-3 dark:bg-zinc-700/50">
          <div className="flex-1">
            <p className="mb-1 text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
              Thông tin khách hàng
            </p>
            <p className="font-medium text-stone-800 dark:text-stone-100">{customer?.name}</p>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {customer?.email} · {customer?.phone}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEdit(1)}
            className="inline-flex items-center gap-1 text-sm text-amber-700 hover:underline dark:text-amber-500"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Sửa
          </button>
        </div>

        <div className="flex items-start justify-between rounded-lg bg-stone-50 p-3 dark:bg-zinc-700/50">
          <div className="flex-1">
            <p className="mb-1 text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
              Địa chỉ giao hàng
            </p>
            <p className="text-sm text-stone-700 dark:text-stone-300">
              {address?.detail}, {address?.ward}, {address?.district}, {address?.province}
            </p>
            <p className="mt-1 text-xs capitalize text-stone-500 dark:text-stone-400">
              Loại:{' '}
              {address?.label === 'home'
                ? 'Nhà riêng'
                : address?.label === 'office'
                  ? 'Văn phòng'
                  : 'Khác'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEdit(2)}
            className="inline-flex items-center gap-1 text-sm text-amber-700 hover:underline dark:text-amber-500"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Sửa
          </button>
        </div>

        <div className="flex items-start justify-between rounded-lg bg-stone-50 p-3 dark:bg-zinc-700/50">
          <div className="flex-1">
            <p className="mb-1 text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
              Vận chuyển
            </p>
            <p className="font-medium text-stone-800 dark:text-stone-100">{shipping?.label}</p>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {shipping?.note ?? shipping?.eta}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEdit(3)}
            className="inline-flex items-center gap-1 text-sm text-amber-700 hover:underline dark:text-amber-500"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Sửa
          </button>
        </div>

        <div className="flex items-start justify-between rounded-lg bg-stone-50 p-3 dark:bg-zinc-700/50">
          <div className="flex-1">
            <p className="mb-1 text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">
              Thanh toán
            </p>
            <p className="font-medium text-stone-800 dark:text-stone-100">{paymentLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => onEdit(4)}
            className="inline-flex items-center gap-1 text-sm text-amber-700 hover:underline dark:text-amber-500"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Sửa
          </button>
        </div>
      </div>

      <Textarea
        label="Ghi chú (tùy chọn)"
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Ghi chú cho người bán..."
      />

      <label className="flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => onTermsChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
        />
        <span className="text-sm text-stone-700 dark:text-stone-300">
          Tôi đã đọc và đồng ý với{' '}
          <Link to="/terms" className="text-amber-700 hover:underline dark:text-amber-500">
            Điều khoản dịch vụ
          </Link>{' '}
          và{' '}
          <Link to="/privacy" className="text-amber-700 hover:underline dark:text-amber-500">
            Chính sách bảo mật
          </Link>{' '}
          của Coffee Home Blend.
        </span>
      </label>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="ghost"
          leftIcon={<ChevronLeft className="h-4 w-4" />}
          onClick={onBack}
          disabled={isSubmitting}
        >
          Quay Lại
        </Button>
        <Button
          variant="primary"
          size="lg"
          rightIcon={<Check className="h-4 w-4" />}
          onClick={onSubmit}
          disabled={!terms}
          isLoading={isSubmitting}
        >
          Đặt Hàng
        </Button>
      </div>
    </div>
  );
};

const OrderSummary: React.FC<{
  items: {
    product: { id: string; name: string; images: string[]; price: number; salePrice?: number };
    quantity: number;
  }[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (code: string) => Promise<{ success: boolean; message: string; coupon?: Coupon }>;
  onRemoveCoupon: () => void;
}> = ({
  items,
  subtotal,
  discount,
  shippingFee,
  total,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  return (
    <Card padding="md" className="space-y-4 lg:sticky lg:top-24">
      <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">Đơn Hàng Của Bạn</h2>

      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {items.map((item) => {
          const price = item.product.salePrice ?? item.product.price;
          return (
            <div key={item.product.id} className="flex items-center gap-3">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-zinc-700">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-xs font-semibold text-white">
                  {item.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-stone-800 dark:text-stone-100">
                  {item.product.name}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {formatCurrency(price)}
                </p>
              </div>
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                {formatCurrency(price * item.quantity)}
              </p>
            </div>
          );
        })}
      </div>

      <CouponInput
        appliedCoupon={appliedCoupon as Coupon | null}
        onApply={onApplyCoupon}
        onRemove={onRemoveCoupon}
      />

      <div className="space-y-2 border-t border-stone-200 pt-3 dark:border-zinc-700">
        <div className="flex justify-between text-sm">
          <span className="text-stone-600 dark:text-stone-400">Tạm tính</span>
          <span className="text-stone-800 dark:text-stone-100">{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-emerald-600 dark:text-emerald-400">Giảm giá</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              -{formatCurrency(discount)}
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-stone-600 dark:text-stone-400">Phí vận chuyển</span>
          <span className="text-stone-800 dark:text-stone-100">
            {shippingFee === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400">Miễn phí</span>
            ) : (
              formatCurrency(shippingFee)
            )}
          </span>
        </div>
        <div className="flex items-baseline justify-between border-t border-stone-200 pt-2 dark:border-zinc-700">
          <span className="font-bold text-stone-800 dark:text-stone-100">Tổng cộng</span>
          <span className="text-xl font-bold text-amber-700 dark:text-amber-500">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </Card>
  );
};

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);
  const discount = useCartStore((s) => s.discount);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const authUser = useAuthStore((s) => s.user);
  const createOrder = useOrderStore((s) => s.createOrder);
  const pushNotification = useUIStore((s) => s.pushNotification);

  const [step, setStep] = React.useState(1);
  const [customer, setCustomer] = React.useState<CustomerData | null>(
    authUser ? { name: authUser.name, email: authUser.email, phone: authUser.phone || '' } : null
  );
  const [address, setAddress] = React.useState<AddressData | null>(null);
  const [shippingId, setShippingId] = React.useState<string>('STANDARD');
  const [payment, setPayment] = React.useState<PaymentMethod>('COD');
  const [note, setNote] = React.useState('');
  const [terms, setTerms] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const selectedShipping = SHIPPING_OPTIONS.find((s) => s.id === shippingId);
  const computedShippingFee =
    selectedShipping?.id === 'FREE'
      ? 0
      : subtotal >= FREE_SHIPPING_THRESHOLD && shippingId === 'STANDARD'
        ? 0
        : (selectedShipping?.fee ?? 0);
  const total = Math.max(0, subtotal + computedShippingFee - discount);

  React.useEffect(() => {
    if (items.length === 0 && step <= 5) {
      navigate('/cart');
    }
  }, [items.length, navigate, step]);

  const handleApplyCoupon = async (code: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const coupon = findCouponByCode(code);
    if (!coupon) return { success: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn' };
    if (subtotal < coupon.minOrderValue) {
      return {
        success: false,
        message: `Đơn hàng tối thiểu ${formatCurrency(coupon.minOrderValue)} để áp dụng mã này`,
      };
    }
    applyCoupon(coupon);
    return { success: true, message: 'Áp dụng mã giảm giá thành công', coupon };
  };

  const handlePlaceOrder = async () => {
    if (!customer || !address) return;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const orderItems: OrderItem[] = items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.product.salePrice ?? item.product.price,
      }));
      const fullAddress: Address = {
        id: `addr-${Date.now()}`,
        label: address.label,
        name: customer.name,
        phone: customer.phone,
        province: PROVINCES.find((p) => p.value === address.province)?.label ?? address.province,
        district:
          DISTRICTS[address.province]?.find((d) => d.value === address.district)?.label ??
          address.district,
        ward: WARDS[address.district]?.find((w) => w.value === address.ward)?.label ?? address.ward,
        detail: address.detail,
        isDefault: false,
      };
      const orderId = `order-${Date.now()}`;
      const orderNumber = `CHB${Math.floor(1000 + Math.random() * 9000)}`;
      const order: Order = {
        id: orderId,
        orderNumber,
        items: orderItems,
        subtotal,
        shippingFee: computedShippingFee,
        discount,
        total,
        status: 'PENDING',
        paymentMethod: payment,
        paymentStatus: payment === 'COD' ? 'PENDING' : 'PENDING',
        shippingAddress: fullAddress,
        note: note || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [{ status: 'PENDING', timestamp: new Date().toISOString() }],
      };
      createOrder(order);
      clearCart();
      pushNotification({
        type: 'success',
        title: 'Đặt hàng thành công',
        message: `Đơn hàng #${orderNumber} đã được tạo.`,
      });
      navigate(`/checkout/success?order=${orderId}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/cart"
            className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-amber-700 dark:text-stone-400 dark:hover:text-amber-500"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại giỏ hàng
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-stone-800 dark:text-stone-100">Thanh Toán</h1>
        </div>

        <StepIndicator current={step} onJump={setStep} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card padding="md" className="lg:col-span-2">
            {step === 1 && (
              <Step1Customer
                defaultValues={customer ?? {}}
                onSubmit={(d) => {
                  setCustomer(d);
                  setStep(2);
                }}
              />
            )}
            {step === 2 && (
              <Step2Address
                defaultValues={address ?? { label: 'home', saveAddress: true }}
                onSubmit={(d) => {
                  setAddress(d);
                  setStep(3);
                }}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <Step3Shipping
                selected={shippingId}
                subtotal={subtotal}
                onSelect={setShippingId}
                onSubmit={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}
            {step === 4 && (
              <Step4Payment
                selected={payment}
                onSelect={setPayment}
                onSubmit={() => setStep(5)}
                onBack={() => setStep(3)}
              />
            )}
            {step === 5 && (
              <Step5Confirm
                customer={customer}
                address={address}
                shippingId={shippingId}
                payment={payment}
                note={note}
                onNoteChange={setNote}
                terms={terms}
                onTermsChange={setTerms}
                onSubmit={handlePlaceOrder}
                onBack={() => setStep(4)}
                onEdit={(s) => setStep(s)}
                isSubmitting={submitting}
              />
            )}
          </Card>

          <div className="lg:col-span-1">
            <OrderSummary
              items={items}
              subtotal={subtotal}
              discount={discount}
              shippingFee={computedShippingFee}
              total={total}
              appliedCoupon={appliedCoupon as Coupon | null}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={removeCoupon}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
