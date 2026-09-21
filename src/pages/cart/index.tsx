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
    <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
      <ShoppingBag className="w-12 h-12 text-amber-700 dark:text-amber-500" />
    </div>
    <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
      Giỏ Hàng Của Bạn Đang Trống
    </h2>
    <p className="text-stone-600 dark:text-stone-400 mb-6 max-w-md text-center">
      Hãy khám phá các sản phẩm cà phê thơm ngon của chúng tôi và thêm vào giỏ hàng nhé!
    </p>
    <Link to="/products">
      <Button variant="primary" size="lg" leftIcon={<ShoppingBag className="w-5 h-5" />}>
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
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Tiếp Tục Mua Hàng
          </Link>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mt-2">
            Giỏ Hàng Của Bạn
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            {items.length > 0 ? `${items.length} sản phẩm trong giỏ hàng` : 'Chưa có sản phẩm nào'}
          </p>
        </div>

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
                {items.map((item) => (
                  <CartItemRow key={item.product.id} item={item} />
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1">
              <Card padding="md" className="lg:sticky lg:top-24">
                <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">
                  Tóm Tắt Đơn Hàng
                </h2>

                <div className="space-y-3 pb-4 border-b border-stone-200 dark:border-zinc-700">
                  <CouponInput
                    appliedCoupon={appliedCoupon as Coupon | null}
                    onApply={handleApplyCoupon}
                    onRemove={removeCoupon}
                  />
                </div>

                <div className="py-4 space-y-2 border-b border-stone-200 dark:border-zinc-700">
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
                    <p className="text-xs text-stone-500 dark:text-stone-400 pt-2">
                      Mua thêm {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} để được miễn phí vận chuyển
                    </p>
                  )}
                </div>

                <div className="py-4 flex justify-between items-baseline">
                  <span className="font-bold text-stone-800 dark:text-stone-100">Tổng cộng</span>
                  <span className="font-bold text-2xl text-amber-700 dark:text-amber-500">
                    {formatCurrency(total)}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  rightIcon={<ArrowRight className="w-5 h-5" />}
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
