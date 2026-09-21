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
      <div className="min-h-screen flex flex-col items-center justify-center py-16">
        <Package className="w-16 h-16 text-stone-300 dark:text-zinc-700 mb-4" />
        <p className="text-stone-600 dark:text-stone-400 mb-4">Không tìm thấy đơn hàng</p>
        <Link to="/orders" className="text-amber-700 dark:text-amber-500 hover:underline">
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
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400 mb-4 flex-wrap">
          <Link to="/" className="hover:text-amber-700 dark:hover:text-amber-500 inline-flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Trang chủ
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/orders" className="hover:text-amber-700 dark:hover:text-amber-500">Đơn hàng</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-stone-700 dark:text-stone-200">#{order.orderNumber}</span>
        </nav>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Đơn hàng #{order.orderNumber}</h1>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card padding="md">
              <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">Trạng thái đơn hàng</h2>
              <OrderTimeline timeline={order.timeline} currentStatus={order.status} />
            </Card>

            <Card padding="md">
              <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Sản phẩm ({order.items.length})
              </h2>
              {order.items.length === 0 ? (
                <p className="text-sm text-stone-500 dark:text-stone-400">Không có sản phẩm nào trong đơn hàng.</p>
              ) : (
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.product.id} className="flex items-start gap-3 py-2 border-b border-stone-100 dark:border-zinc-700 last:border-0">
                      <Link to={`/product/${item.product.slug}`} className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-stone-100 dark:bg-zinc-700">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.product.slug}`} className="font-medium text-stone-800 dark:text-stone-100 hover:text-amber-700 dark:hover:text-amber-500 line-clamp-2">
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                        {order.status === 'DELIVERED' && user && (
                          <div className="mt-2">
                            {item.review || hasReviewed(item.product.id, user.id) ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                Đã đánh giá
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenReview(item.product)}
                                className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-500 hover:text-amber-800"
                              >
                                <Star className="w-3.5 h-3.5" />
                                Viết đánh giá
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="font-semibold text-stone-800 dark:text-stone-100 whitespace-nowrap">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card padding="md">
              <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">Tổng tiền</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600 dark:text-stone-400">Tạm tính</span>
                  <span className="text-stone-800 dark:text-stone-100">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400">Giảm giá</span>
                    <span className="text-emerald-600 dark:text-emerald-400">-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600 dark:text-stone-400">Phí vận chuyển</span>
                  <span className="text-stone-800 dark:text-stone-100">
                    {order.shippingFee === 0 ? <span className="text-emerald-600 dark:text-emerald-400">Miễn phí</span> : formatCurrency(order.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-3 border-t border-stone-200 dark:border-zinc-700">
                  <span className="font-bold text-stone-800 dark:text-stone-100">Tổng cộng</span>
                  <span className="font-bold text-xl text-amber-700 dark:text-amber-500">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </Card>

            <Card padding="md">
              <div className="flex flex-col sm:flex-row gap-3">
                {canCancel && (
                  <Button variant="danger" leftIcon={<X className="w-4 h-4" />} onClick={() => setCancelModalOpen(true)}>
                    Hủy Đơn Hàng
                  </Button>
                )}
                {order.status === 'DELIVERED' && (
                  <Button variant="primary" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={handleReorder}>
                    Mua Lại
                  </Button>
                )}
                <Link to="/products" className="inline-flex">
                  <Button variant="outline" leftIcon={<ShoppingBag className="w-4 h-4" />}>
                    Tiếp Tục Mua Hàng
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card padding="md">
              <h3 className="text-sm font-semibold uppercase text-stone-500 dark:text-stone-400 mb-3">
                Thông tin đơn hàng
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Hash className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Mã đơn hàng</p>
                    <p className="font-medium text-stone-800 dark:text-stone-100">{order.orderNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Ngày đặt</p>
                    <p className="font-medium text-stone-800 dark:text-stone-100">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CreditCard className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Phương thức thanh toán</p>
                    <p className="font-medium text-stone-800 dark:text-stone-100">{paymentLabel[order.paymentMethod]}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-stone-200 dark:border-zinc-700">
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Trạng thái thanh toán</p>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>
            </Card>

            <Card padding="md">
              <h3 className="text-sm font-semibold uppercase text-stone-500 dark:text-stone-400 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Địa chỉ giao hàng
              </h3>
              <div className="text-sm space-y-1">
                <p className="font-medium text-stone-800 dark:text-stone-100">{order.shippingAddress.name}</p>
                <p className="text-stone-600 dark:text-stone-400">{order.shippingAddress.phone}</p>
                <p className="text-stone-600 dark:text-stone-400">
                  {order.shippingAddress.detail}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 capitalize mt-2">
                  Loại: {order.shippingAddress.label === 'home' ? 'Nhà riêng' : order.shippingAddress.label === 'office' ? 'Văn phòng' : 'Khác'}
                </p>
              </div>
            </Card>

            {order.note && (
              <Card padding="md">
                <h3 className="text-sm font-semibold uppercase text-stone-500 dark:text-stone-400 mb-2">Ghi chú</h3>
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
        <p className="text-stone-700 dark:text-stone-300 mb-4">
          Bạn có chắc chắn muốn hủy đơn hàng <span className="font-semibold">#{order.orderNumber}</span> không?
          Hành động này không thể hoàn tác.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setCancelModalOpen(false)} disabled={cancelling}>
            Không
          </Button>
          <Button variant="danger" onClick={handleConfirmCancel} isLoading={cancelling} disabled={cancelling} leftIcon={cancelling ? <Loader2 className="w-4 h-4" /> : undefined}>
            Hủy đơn hàng
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetailPage;
