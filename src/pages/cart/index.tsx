import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CouponInput } from '@/components/cart/CouponInput';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { findCouponByCode } from '@/data/coupons';
import { CartItemRow } from './CartItemRow';
import type { Coupon } from '@/types';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const FREE_SHIPPING_THRESHOLD = 500000;
const STANDARD_SHIPPING_FEE = 30000;

const EmptyState: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center justify-center py-16"
  >
    <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
      <ShoppingBag className="h-12 w-12 text-amber-700 dark:text-amber-500" />
    </div>
    <h2 className="mb-2 text-2xl font-bold text-stone-800 dark:text-stone-100">
      Giỏ Hàng Của Bạn Đang Trống
    </h2>
    <p className="mb-6 max-w-md text-center text-stone-600 dark:text-stone-400">
      Hãy khám phá các sản phẩm cà phê thơm ngon của chúng tôi và thêm vào giỏ hàng nhé!
    </p>
    <Link to="/products">
      <Button variant="primary" size="lg" leftIcon={<ShoppingBag className="h-5 w-5" />}>
        Khám Phá Sản Phẩm
      </Button>
    </Link>
  </motion.div>
);

const CartPage: React.FC = () => {
  const items = useCartStore((s) => s.items);
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);
  const discount = useCartStore((s) => s.discount);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const pushNotification = useUIStore((s) => s.pushNotification);

  const subtotal = useCartStore((s) => s.getSubtotal());
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const total = Math.max(0, subtotal + shippingFee - discount);

  const handleApplyCoupon = async (code: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const coupon = findCouponByCode(code);
    if (!coupon) {
      return { success: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn' };
    }
    if (subtotal < coupon.minOrderValue) {
      return {
        success: false,
        message: `Đơn hàng tối thiểu ${formatCurrency(coupon.minOrderValue)} để áp dụng mã này`,
      };
    }
    applyCoupon(coupon);
    return { success: true, message: 'Áp dụng mã giảm giá thành công', coupon };
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      pushNotification({
        type: 'warning',
        title: 'Giỏ hàng trống',
        message: 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.',
      });
      return;
    }
    window.location.href = '/checkout';
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-amber-700 dark:text-stone-400 dark:hover:text-amber-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Tiếp Tục Mua Hàng
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-stone-800 dark:text-stone-100">
            Giỏ Hàng Của Bạn
          </h1>
          <p className="mt-1 text-stone-600 dark:text-stone-400">
            {items.length > 0 ? `${items.length} sản phẩm trong giỏ hàng` : 'Chưa có sản phẩm nào'}
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              <AnimatePresence>
                {items.map((item) => (
                  <CartItemRow key={item.product.id} item={item} />
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1">
              <Card padding="md" className="lg:sticky lg:top-24">
                <h2 className="mb-4 text-lg font-bold text-stone-800 dark:text-stone-100">
                  Tóm Tắt Đơn Hàng
                </h2>

                <div className="space-y-3 border-b border-stone-200 pb-4 dark:border-zinc-700">
                  <CouponInput
                    appliedCoupon={appliedCoupon as Coupon | null}
                    onApply={handleApplyCoupon}
                    onRemove={removeCoupon}
                  />
                </div>

                <div className="space-y-2 border-b border-stone-200 py-4 dark:border-zinc-700">
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Giảm giá</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>Phí vận chuyển</span>
                    <span>
                      {shippingFee === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">Miễn phí</span>
                      ) : (
                        formatCurrency(shippingFee)
                      )}
                    </span>
                  </div>
                  {subtotal < FREE_SHIPPING_THRESHOLD && (
                    <p className="pt-2 text-xs text-stone-500 dark:text-stone-400">
                      Mua thêm {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} để được miễn phí
                      vận chuyển
                    </p>
                  )}
                </div>

                <div className="flex items-baseline justify-between py-4">
                  <span className="font-bold text-stone-800 dark:text-stone-100">Tổng cộng</span>
                  <span className="text-2xl font-bold text-amber-700 dark:text-amber-500">
                    {formatCurrency(total)}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  onClick={handleCheckout}
                >
                  Tiến Hành Thanh Toán
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
