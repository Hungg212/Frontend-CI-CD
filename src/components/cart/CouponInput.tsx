import React, { useState } from 'react';
import { Tag, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Coupon } from '@/types';

export interface CouponInputProps {
  appliedCoupon: Coupon | null;
  onApply: (code: string) => Promise<{ success: boolean; message: string; coupon?: Coupon }>;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
}

export function CouponInput({
  appliedCoupon,
  onApply,
  onRemove,
  disabled = false,
  className = '',
}: CouponInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Vui lòng nhập mã giảm giá');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await onApply(code.trim().toUpperCase());
      if (result.success) {
        setSuccess(result.message);
        setCode('');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    onRemove();
    setError(null);
    setSuccess(null);
  };

  if (appliedCoupon) {
    return (
      <div className={`bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-emerald-800 dark:text-emerald-300 truncate">
                {appliedCoupon.code}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                {appliedCoupon.type === 'PERCENT'
                  ? `Giảm ${appliedCoupon.value}%`
                  : `Giảm ${new Intl.NumberFormat('vi-VN').format(appliedCoupon.value)}đ`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="flex-shrink-0 p-1 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded transition-colors disabled:opacity-50"
            aria-label="Hủy mã giảm giá"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
        Mã giảm giá
      </label>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
          }}
          placeholder="Nhập mã giảm giá"
          leftIcon={<Tag className="w-4 h-4" />}
          error={error || undefined}
          disabled={disabled || loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleApply();
            }
          }}
          className="flex-1"
        />
        <Button
          onClick={handleApply}
          isLoading={loading}
          disabled={disabled || !code.trim()}
          variant="outline"
          size="md"
          aria-label="Áp dụng mã giảm giá"
        >
          Áp Dụng
        </Button>
      </div>
      <AnimatePresence>
        {success && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {success}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CouponInput;
