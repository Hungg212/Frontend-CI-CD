import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { CartItem } from './CartItem';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { items, isOpen, closeCart, subtotal, discount, total } = useCart();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const handleApplyCoupon = () => {
    if (coupon.trim()) {
      setCouponApplied(true);
    }
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 z-40 bg-black/50"
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label="Giỏ hàng"
            className="fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl sm:w-96 md:w-[28rem] dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between border-b border-stone-200 p-4 dark:border-zinc-700">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-800 dark:text-stone-100">
                <ShoppingBag className="h-5 w-5" />
                Giỏ Hàng ({items.length})
              </h2>
              <button
                type="button"
                onClick={closeCart}
                className="rounded-lg p-1.5 transition-colors hover:bg-stone-100 dark:hover:bg-zinc-800"
                aria-label="Đóng giỏ hàng"
              >
                <X className="h-5 w-5 text-stone-600 dark:text-stone-300" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <ShoppingBag className="mb-4 h-16 w-16 text-stone-300 dark:text-zinc-700" />
                <h3 className="mb-2 text-lg font-semibold text-stone-700 dark:text-stone-200">
                  Giỏ hàng trống
                </h3>
                <p className="mb-6 text-sm text-stone-500 dark:text-stone-400">
                  Khám phá các sản phẩm cà phê tuyệt vời của chúng tôi
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    closeCart();
                    navigate('/products');
                  }}
                >
                  Tiếp Tục Mua Hàng
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>

                <div className="space-y-3 border-t border-stone-200 bg-stone-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Mã giảm giá"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      leftIcon={<Tag className="h-4 w-4" />}
                      disabled={couponApplied}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleApplyCoupon}
                      disabled={couponApplied || !coupon.trim()}
                    >
                      {couponApplied ? 'Đã áp dụng' : 'Áp dụng'}
                    </Button>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-stone-600 dark:text-stone-300">
                      <span>Tạm tính</span>
                      <span>{formatPrice(subtotal + discount)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Giảm giá</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-stone-200 pt-2 text-lg font-semibold text-stone-800 dark:border-zinc-700 dark:text-stone-100">
                      <span>Tổng cộng</span>
                      <span className="text-amber-700 dark:text-amber-500">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleCheckout}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Thanh Toán
                  </Button>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="w-full py-1 text-center text-sm text-amber-700 hover:underline dark:text-amber-500"
                  >
                    Tiếp Tục Mua Hàng
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
