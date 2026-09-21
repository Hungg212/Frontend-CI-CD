import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Package,
  Truck,
  Calendar,
  MapPin,
  CreditCard,
  ShoppingBag,
  Home,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useOrderStore } from '@/stores/orderStore';

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const getEstimatedDelivery = (createdAt: string): string => {
  const created = new Date(createdAt);
  const eta = new Date(created.getTime() + 3 * 86400000);
  return eta.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const CheckoutSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const currentOrder = useOrderStore((s) => s.currentOrder);
  const getOrderById = useOrderStore((s) => s.getOrderById);

  const order = useMemo(() => {
    if (currentOrder && currentOrder.id === orderId) return currentOrder;
    if (orderId) return getOrderById(orderId);
    return null;
  }, [orderId, currentOrder, getOrderById]);

  useEffect(() => {
    if (!order) {
      const timeout = setTimeout(() => navigate('/orders'), 2000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [order, navigate]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-stone-600 dark:text-stone-400">Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-900 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, type: 'spring' }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 12 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4"
          >
            <motion.div
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <CheckCircle2 className="w-14 h-14 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            </motion.div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-stone-800 dark:text-stone-100"
          >
            Đặt Hàng Thành Công!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-stone-600 dark:text-stone-400 mt-2"
          >
            Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card padding="md" className="space-y-5 mb-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-zinc-700">
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400">Mã đơn hàng</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-500">#{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-stone-500 dark:text-stone-400">Ngày đặt</p>
                <p className="text-sm font-medium text-stone-700 dark:text-stone-300">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Dự kiến giao hàng</p>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    {getEstimatedDelivery(order.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Thanh toán</p>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    {order.paymentMethod === 'COD' ? 'Khi nhận hàng' : order.paymentMethod}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-stone-500 dark:text-stone-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400">Địa chỉ giao hàng</p>
                  <p className="text-sm text-stone-700 dark:text-stone-300">
                    {order.shippingAddress.name} · {order.shippingAddress.phone}
                  </p>
                  <p className="text-sm text-stone-600 dark:text-stone-400">
                    {order.shippingAddress.detail}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-stone-500 dark:text-stone-400 mb-2 flex items-center gap-1">
                <Package className="w-4 h-4" />
                Sản phẩm ({order.items.length})
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {order.items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 py-2 border-b border-stone-100 dark:border-zinc-700 last:border-0">
                    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100 dark:bg-zinc-700">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-100 line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">SL: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-stone-200 dark:border-zinc-700">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600 dark:text-stone-400">Tạm tính</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400">Giảm giá</span>
                  <span className="text-emerald-600 dark:text-emerald-400">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-stone-600 dark:text-stone-400">Phí vận chuyển</span>
                <span>{order.shippingFee === 0 ? 'Miễn phí' : formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-stone-200 dark:border-zinc-700">
                <span className="font-bold text-stone-800 dark:text-stone-100">Tổng cộng</span>
                <span className="font-bold text-xl text-amber-700 dark:text-amber-500">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <Link to={`/orders/${order.id}`} className="block">
            <Button variant="primary" size="lg" fullWidth rightIcon={<ChevronRight className="w-4 h-4" />}>
              Theo Dõi Đơn Hàng
            </Button>
          </Link>
          <Link to="/products" className="block">
            <Button variant="outline" size="lg" fullWidth leftIcon={<ShoppingBag className="w-4 h-4" />}>
              Tiếp Tục Mua Hàng
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
