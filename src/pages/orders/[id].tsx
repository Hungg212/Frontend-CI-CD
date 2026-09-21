import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Package,
  MapPin,
  CreditCard,
  Truck,
  XCircle,
  Star,
  RefreshCw,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders/OrderStatusBadge';
import { ReviewModal } from './ReviewModal';
import { useOrderStore } from '@/stores/orderStore';
import type { OrderItem } from '@/types';

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

const CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const order = useOrderStore((s) => (id ? s.getOrderById(id) : undefined));
  const cancelOrderStore = useOrderStore((s) => s.cancelOrder);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [reviewItem, setReviewItem] = useState<OrderItem | null>(null);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
          Không tìm thấy đơn hàng
        </h1>
        <p className="text-stone-500 dark:text-stone-400 mb-6">
          Đơn hàng này không tồn tại hoặc đã bị xóa.
        </p>
        <Link to="/orders">
          <Button variant="outline" leftIcon={<ChevronLeft className="w-4 h-4" />}>
            Quay lại danh sách đơn hàng
          </Button>
        </Link>
      </div>
    );
  }

  const canCancel = CANCELLABLE_STATUSES.includes(order.status);
  const isDelivered = order.status === 'DELIVERED';

  const handleCancel = async () => {
    setIsCancelling(true);
    await new Promise((r) => setTimeout(r, 800));
    cancelOrderStore(order.id, cancelReason || 'Khách hàng hủy đơn');
    setIsCancelling(false);
    setShowCancelConfirm(false);
    setCancelReason('');
  };

  const handleReorder = () => {
    try {
      const cartData = JSON.parse(localStorage.getItem('cart-storage') || '{}');
      const existingItems: any[] = cartData?.state?.items || [];
      const merged = [...existingItems];
      order.items.forEach((item) => {
        const existing = merged.find((c) => c.product.id === item.product.id);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          merged.push({ product: item.product, quantity: item.quantity });
        }
      });
      localStorage.setItem(
        'cart-storage',
        JSON.stringify({
          state: { items: merged, isLoading: false },
          version: cartData.version || 0,
        }),
      );
      navigate('/cart');
    } catch {
      navigate('/cart');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/orders')}
        className="inline-flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Quay lại danh sách
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">
                  Mã đơn hàng
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-500 mb-2">
                  #{order.orderNumber}
                </h1>
                <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                  <span>Đặt ngày {formatDate(order.createdAt)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-start sm:items-end">
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-600" />
              Trạng Thái Đơn Hàng
            </h2>
            <OrderTimeline timeline={order.timeline} currentStatus={order.status} />
          </Card>

          <Card padding="lg">
            <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              Sản Phẩm ({order.items.length})
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 p-3 bg-stone-50 dark:bg-zinc-700/50 rounded-lg"
                >
                  <Link
                    to={`/products/${item.product.slug}`}
                    className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-stone-100 dark:bg-zinc-700"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${item.product.slug}`}
                      className="font-medium text-stone-800 dark:text-stone-100 line-clamp-2 hover:text-amber-700 dark:hover:text-amber-500 transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                      Số lượng: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                    {item.review && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                        <Star className="w-3 h-3 fill-current" />
                        Đã đánh giá
                      </div>
                    )}
                  </div>
                  <div className="text-right flex flex-col justify-between items-end gap-2">
                    <p className="font-semibold text-stone-800 dark:text-stone-100">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    {isDelivered && !item.review && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setReviewItem(item)}
                        leftIcon={<Star className="w-3.5 h-3.5" />}
                      >
                        Đánh giá
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-4">
              Tóm Tắt Đơn Hàng
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-600 dark:text-stone-400">Tạm tính</span>
                <span className="text-stone-800 dark:text-stone-100">{formatCurrency(order.subtotal)}</span>
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
              <div className="pt-3 mt-3 border-t border-stone-200 dark:border-zinc-700 flex justify-between items-center">
                <span className="text-base font-semibold text-stone-800 dark:text-stone-100">
                  Tổng cộng
                </span>
                <span className="text-xl font-bold text-amber-700 dark:text-amber-500">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>

            {order.note && (
              <div className="mt-4 p-3 bg-stone-50 dark:bg-zinc-700/50 rounded-lg">
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">
                  Ghi chú
                </p>
                <p className="text-sm text-stone-700 dark:text-stone-200">{order.note}</p>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            <Card padding="lg" className="space-y-4">
              <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                Địa Chỉ Giao Hàng
              </h2>
              <div className="text-sm space-y-1">
                <p className="font-medium text-stone-800 dark:text-stone-100">
                  {order.shippingAddress.name}
                </p>
                <p className="text-stone-600 dark:text-stone-300">{order.shippingAddress.phone}</p>
                <p className="text-stone-600 dark:text-stone-300">
                  {order.shippingAddress.detail}
                </p>
                <p className="text-stone-500 dark:text-stone-400 text-xs">
                  {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
                </p>
              </div>
            </Card>

            <Card padding="lg" className="space-y-4">
              <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                Thanh Toán
              </h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-stone-400">Phương thức</span>
                  <span className="font-medium text-stone-800 dark:text-stone-100">
                    {paymentMethodLabels[order.paymentMethod]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 dark:text-stone-400">Trạng thái</span>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>
            </Card>

            <Card padding="lg" className="space-y-2">
              {canCancel && (
                <Button
                  fullWidth
                  variant="danger"
                  leftIcon={<XCircle className="w-4 h-4" />}
                  onClick={() => setShowCancelConfirm(true)}
                >
                  Hủy Đơn Hàng
                </Button>
              )}
              {isDelivered && (
                <Button
                  fullWidth
                  variant="outline"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  onClick={handleReorder}
                >
                  Mua Lại
                </Button>
              )}
              <div className="flex items-center justify-center gap-2 text-xs text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-200 dark:border-zinc-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Đảm bảo hoàn tiền 100%
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="Hủy đơn hàng?"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-stone-600 dark:text-stone-300">
            Bạn có chắc chắn muốn hủy đơn hàng <strong>#{order.orderNumber}</strong>?
            Hành động này không thể hoàn tác.
          </p>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-1.5">
              Lý do hủy (tùy chọn)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="Cho chúng tôi biết lý do bạn muốn hủy đơn hàng..."
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowCancelConfirm(false)}>
              Không hủy
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              isLoading={isCancelling}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Xác nhận hủy
            </Button>
          </div>
        </div>
      </Modal>

      {reviewItem && (
        <ReviewModal
          isOpen={!!reviewItem}
          onClose={() => setReviewItem(null)}
          product={reviewItem.product}
          mode="create"
          onSuccess={() => {
            setReviewItem(null);
          }}
        />
      )}
    </div>
  );
}
