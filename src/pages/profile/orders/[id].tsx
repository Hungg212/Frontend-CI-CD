import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight,
  Home,
  Package,
  Star,
  X,
  ShoppingBag,
  RotateCcw,
  MapPin,
  CreditCard,
  Calendar,
  Hash,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders/OrderStatusBadge';
import { useOrderStore } from '@/stores/orderStore';
import { useAuthStore } from '@/stores/authStore';
import { useReviewStore } from '@/stores/reviewStore';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import { ReviewModal } from './ReviewModal';
import type { Product } from '@/types';

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

const CANCELLABLE_STATUSES = ['PENDING', 'CONFIRMED'];

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getOrderById = useOrderStore((s) => s.getOrderById);
  const cancelOrder = useOrderStore((s) => s.cancelOrder);
  const user = useAuthStore((s) => s.user);
  const hasReviewed = useReviewStore((s) => s.hasReviewed);
  const addProduct = useCartStore((s) => s.addProduct);
  const pushNotification = useUIStore((s) => s.pushNotification);

  const order = id ? getOrderById(id) : undefined;

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-16">
        <Package className="mb-4 h-16 w-16 text-stone-300 dark:text-zinc-700" />
        <p className="mb-4 text-stone-600 dark:text-stone-400">Không tìm thấy đơn hàng</p>
        <Link to="/orders" className="text-amber-700 hover:underline dark:text-amber-500">
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  const canCancel = CANCELLABLE_STATUSES.includes(order.status);
  const paymentLabel: Record<string, string> = {
    COD: 'Thanh toán khi nhận hàng (COD)',
    BANK_TRANSFER: 'Chuyển khoản ngân hàng',
    VNPAY: 'Ví VNPay',
    MOMO: 'Ví MoMo',
    CREDIT_CARD: 'Thẻ tín dụng / Ghi nợ',
  };

  const handleOpenReview = (product: Product) => {
    setReviewProduct(product);
    setReviewModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      cancelOrder(order.id);
      pushNotification({
        type: 'success',
        title: 'Đã hủy đơn hàng',
        message: `Đơn hàng #${order.orderNumber} đã được hủy.`,
      });
      setCancelModalOpen(false);
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = () => {
    order.items.forEach((item) => {
      addProduct(item.product, item.quantity);
    });
    pushNotification({
      type: 'success',
      title: 'Đã thêm vào giỏ hàng',
      message: 'Các sản phẩm đã được thêm vào giỏ hàng.',
    });
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
          <Link
            to="/"
            className="inline-flex items-center gap-1 hover:text-amber-700 dark:hover:text-amber-500"
          >
            <Home className="h-3.5 w-3.5" />
            Trang chủ
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/orders" className="hover:text-amber-700 dark:hover:text-amber-500">
            Đơn hàng
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-stone-700 dark:text-stone-200">#{order.orderNumber}</span>
        </nav>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            Đơn hàng #{order.orderNumber}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card padding="md">
              <h2 className="mb-4 text-lg font-bold text-stone-800 dark:text-stone-100">
                Trạng thái đơn hàng
              </h2>
              <OrderTimeline timeline={order.timeline} currentStatus={order.status} />
            </Card>

            <Card padding="md">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-stone-800 dark:text-stone-100">
                <Package className="h-5 w-5" />
                Sản phẩm ({order.items.length})
              </h2>
              {order.items.length === 0 ? (
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  Không có sản phẩm nào trong đơn hàng.
                </p>
              ) : (
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-start gap-3 border-b border-stone-100 py-2 last:border-0 dark:border-zinc-700"
                    >
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-zinc-700"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="line-clamp-2 font-medium text-stone-800 hover:text-amber-700 dark:text-stone-100 dark:hover:text-amber-500"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                        {order.status === 'DELIVERED' && user && (
                          <div className="mt-2">
                            {item.review || hasReviewed(item.product.id, user.id) ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                Đã đánh giá
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenReview(item.product)}
                                className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-800 dark:text-amber-500"
                              >
                                <Star className="h-3.5 w-3.5" />
                                Viết đánh giá
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="whitespace-nowrap font-semibold text-stone-800 dark:text-stone-100">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card padding="md">
              <h2 className="mb-4 text-lg font-bold text-stone-800 dark:text-stone-100">
                Tổng tiền
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600 dark:text-stone-400">Tạm tính</span>
                  <span className="text-stone-800 dark:text-stone-100">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400">Giảm giá</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600 dark:text-stone-400">Phí vận chuyển</span>
                  <span className="text-stone-800 dark:text-stone-100">
                    {order.shippingFee === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">Miễn phí</span>
                    ) : (
                      formatCurrency(order.shippingFee)
                    )}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-stone-200 pt-3 dark:border-zinc-700">
                  <span className="font-bold text-stone-800 dark:text-stone-100">Tổng cộng</span>
                  <span className="text-xl font-bold text-amber-700 dark:text-amber-500">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </Card>

            <Card padding="md">
              <div className="flex flex-col gap-3 sm:flex-row">
                {canCancel && (
                  <Button
                    variant="danger"
                    leftIcon={<X className="h-4 w-4" />}
                    onClick={() => setCancelModalOpen(true)}
                  >
                    Hủy Đơn Hàng
                  </Button>
                )}
                {order.status === 'DELIVERED' && (
                  <Button
                    variant="primary"
                    leftIcon={<RotateCcw className="h-4 w-4" />}
                    onClick={handleReorder}
                  >
                    Mua Lại
                  </Button>
                )}
                <Link to="/products" className="inline-flex">
                  <Button variant="outline" leftIcon={<ShoppingBag className="h-4 w-4" />}>
                    Tiếp Tục Mua Hàng
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card padding="md">
              <h3 className="mb-3 text-sm font-semibold uppercase text-stone-500 dark:text-stone-400">
                Thông tin đơn hàng
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Hash className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" />
                  <div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Mã đơn hàng</p>
                    <p className="font-medium text-stone-800 dark:text-stone-100">
                      {order.orderNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" />
                  <div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Ngày đặt</p>
                    <p className="font-medium text-stone-800 dark:text-stone-100">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" />
                  <div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Phương thức thanh toán
                    </p>
                    <p className="font-medium text-stone-800 dark:text-stone-100">
                      {paymentLabel[order.paymentMethod]}
                    </p>
                  </div>
                </div>
                <div className="border-t border-stone-200 pt-2 dark:border-zinc-700">
                  <p className="mb-1 text-xs text-stone-500 dark:text-stone-400">
                    Trạng thái thanh toán
                  </p>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>
            </Card>

            <Card padding="md">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase text-stone-500 dark:text-stone-400">
                <MapPin className="h-4 w-4" />
                Địa chỉ giao hàng
              </h3>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-stone-800 dark:text-stone-100">
                  {order.shippingAddress.name}
                </p>
                <p className="text-stone-600 dark:text-stone-400">{order.shippingAddress.phone}</p>
                <p className="text-stone-600 dark:text-stone-400">
                  {order.shippingAddress.detail}, {order.shippingAddress.ward},{' '}
                  {order.shippingAddress.district}, {order.shippingAddress.province}
                </p>
                <p className="mt-2 text-xs capitalize text-stone-500 dark:text-stone-400">
                  Loại:{' '}
                  {order.shippingAddress.label === 'home'
                    ? 'Nhà riêng'
                    : order.shippingAddress.label === 'office'
                      ? 'Văn phòng'
                      : 'Khác'}
                </p>
              </div>
            </Card>

            {order.note && (
              <Card padding="md">
                <h3 className="mb-2 text-sm font-semibold uppercase text-stone-500 dark:text-stone-400">
                  Ghi chú
                </h3>
                <p className="text-sm text-stone-700 dark:text-stone-300">{order.note}</p>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        product={reviewProduct}
      />

      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Hủy đơn hàng"
        size="sm"
      >
        <p className="mb-4 text-stone-700 dark:text-stone-300">
          Bạn có chắc chắn muốn hủy đơn hàng{' '}
          <span className="font-semibold">#{order.orderNumber}</span> không? Hành động này không thể
          hoàn tác.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setCancelModalOpen(false)} disabled={cancelling}>
            Không
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmCancel}
            isLoading={cancelling}
            disabled={cancelling}
            leftIcon={cancelling ? <Loader2 className="h-4 w-4" /> : undefined}
          >
            Hủy đơn hàng
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetailPage;
