import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Package,
  Truck,
  CreditCard,
  MapPin,
  ShoppingBag,
  ArrowRight,
  Phone,
  Mail,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useOrderStore } from '@/stores/orderStore';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders/OrderStatusBadge';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const paymentMethodLabels: Record<string, string> = {
  COD: 'Thanh toán khi nhận hàng (COD)',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  VNPAY: 'Ví VNPay',
  MOMO: 'Ví MoMo',
  CREDIT_CARD: 'Thẻ tín dụng / Ghi nợ',
};

export default function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const getOrderById = useOrderStore((s) => s.getOrderById);
  const order = orderId ? getOrderById(orderId) : null;

  useEffect(() => {
    if (!order) {
      const timer = setTimeout(() => navigate('/orders'), 2000);
      return () => clearTimeout(timer);
    }
  }, [order, navigate]);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-stone-500 dark:text-stone-400">Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 dark:bg-zinc-900">
      <div className="container mx-auto max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30"
          >
            <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
          <h1 className="mb-2 text-2xl font-bold text-stone-800 sm:text-3xl dark:text-stone-100">
            Đặt Hàng Thành Công!
          </h1>
          <p className="text-stone-600 dark:text-stone-300">
            Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đang được xử lý.
          </p>
        </motion.div>

        <Card padding="lg" className="mb-6 space-y-6">
          <div className="flex flex-col justify-between gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-center dark:border-zinc-700">
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400">Mã đơn hàng</p>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-500">
                #{order.orderNumber}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <OrderStatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <MapPin className="h-5 w-5 text-amber-700 dark:text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs text-stone-500 dark:text-stone-400">Địa chỉ giao hàng</p>
                <p className="font-medium text-stone-800 dark:text-stone-100">
                  {order.shippingAddress.name}
                </p>
                <p className="text-sm text-stone-600 dark:text-stone-300">
                  {order.shippingAddress.phone}
                </p>
                <p className="text-sm text-stone-600 dark:text-stone-300">
                  {order.shippingAddress.detail}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <CreditCard className="h-5 w-5 text-amber-700 dark:text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs text-stone-500 dark:text-stone-400">
                    Phương thức thanh toán
                  </p>
                  <p className="font-medium text-stone-800 dark:text-stone-100">
                    {paymentMethodLabels[order.paymentMethod] || order.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <Truck className="h-5 w-5 text-amber-700 dark:text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs text-stone-500 dark:text-stone-400">Ngày đặt hàng</p>
                  <p className="font-medium text-stone-800 dark:text-stone-100">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-200">
              <Package className="h-4 w-4" />
              Sản phẩm ({order.items.length})
            </p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 rounded-lg bg-stone-50 p-2 dark:bg-zinc-700/50"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="h-14 w-14 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium text-stone-800 dark:text-stone-100">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-semibold text-stone-800 dark:text-stone-100">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t border-stone-200 pt-4 text-sm dark:border-zinc-700">
            <div className="flex justify-between">
              <span className="text-stone-600 dark:text-stone-400">Tạm tính</span>
              <span className="text-stone-800 dark:text-stone-100">
                {formatCurrency(order.subtotal)}
              </span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Giảm giá</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-600 dark:text-stone-400">Phí vận chuyển</span>
              <span className="text-stone-800 dark:text-stone-100">
                {order.shippingFee === 0 ? 'Miễn phí' : formatCurrency(order.shippingFee)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-stone-200 pt-3 dark:border-zinc-700">
              <span className="text-base font-semibold text-stone-800 dark:text-stone-100">
                Tổng cộng
              </span>
              <span className="text-xl font-bold text-amber-700 dark:text-amber-500">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </Card>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link to={`/orders/${order.id}`} className="contents">
            <Button
              fullWidth
              size="lg"
              variant="primary"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Theo dõi đơn hàng
            </Button>
          </Link>
          <Link to="/products" className="contents">
            <Button
              fullWidth
              size="lg"
              variant="outline"
              leftIcon={<ShoppingBag className="h-4 w-4" />}
            >
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>

        <Card
          padding="md"
          className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 dark:bg-amber-800">
              <Phone className="h-5 w-5 text-amber-700 dark:text-amber-300" />
            </div>
            <div className="flex-1">
              <p className="mb-1 font-semibold text-amber-900 dark:text-amber-200">Cần hỗ trợ?</p>
              <p className="mb-2 text-sm text-amber-800 dark:text-amber-300">
                Liên hệ với chúng tôi qua hotline hoặc email
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <a
                  href="tel:19001234"
                  className="inline-flex items-center gap-1 font-medium text-amber-900 hover:underline dark:text-amber-200"
                >
                  <Phone className="h-3.5 w-3.5" />
                  1900 1234
                </a>
                <a
                  href="mailto:support@coffeehome.vn"
                  className="inline-flex items-center gap-1 font-medium text-amber-900 hover:underline dark:text-amber-200"
                >
                  <Mail className="h-3.5 w-3.5" />
                  support@coffeehome.vn
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
