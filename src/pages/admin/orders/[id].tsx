import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  User,
  CreditCard,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  FileText,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { Modal } from '@/components/ui';
import { useAdminStore } from '@/stores/adminStore';
import { formatVND, formatDateTime, formatDate } from '@/utils/adminFormat';
import type { AdminOrder } from '@/types/admin';

const allStatuses: AdminOrder['status'][] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPING',
  'DELIVERED',
  'CANCELLED',
];

const statusLabel: Record<AdminOrder['status'], string> = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

const statusVariant: Record<AdminOrder['status'], 'warning' | 'info' | 'primary' | 'success' | 'danger'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'primary',
  SHIPPING: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

const paymentLabel: Record<AdminOrder['paymentStatus'], string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Hoàn tiền',
};

const paymentLabelVN: Record<AdminOrder['paymentMethod'], string> = {
  COD: 'Thanh toán khi nhận hàng',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  VNPAY: 'VNPay',
  MOMO: 'Ví MoMo',
  CREDIT_CARD: 'Thẻ tín dụng',
};

interface StepDef {
  status: AdminOrder['status'];
  label: string;
  icon: React.ReactNode;
}

const flowSteps: StepDef[] = [
  { status: 'PENDING', label: 'Chờ xử lý', icon: <Clock className="w-4 h-4" /> },
  { status: 'CONFIRMED', label: 'Đã xác nhận', icon: <CheckCircle2 className="w-4 h-4" /> },
  { status: 'PROCESSING', label: 'Đang chuẩn bị', icon: <Package className="w-4 h-4" /> },
  { status: 'SHIPPING', label: 'Đang giao', icon: <Truck className="w-4 h-4" /> },
  { status: 'DELIVERED', label: 'Đã giao', icon: <PackageCheck className="w-4 h-4" /> },
];

export default function AdminOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const order = useAdminStore((s) => s.orders.find((o) => o.id === id));
  const updateOrderStatus = useAdminStore((s) => s.updateOrderStatus);

  const [statusModal, setStatusModal] = useState<AdminOrder['status'] | null>(null);
  const [statusNote, setStatusNote] = useState('');

  if (!order) {
    return (
      <AdminLayout title="Không tìm thấy đơn hàng">
        <Card className="p-8 text-center">
          <p className="text-stone-600 dark:text-stone-400 mb-4">Đơn hàng không tồn tại</p>
          <Button onClick={() => navigate('/admin/orders')}>Quay lại</Button>
        </Card>
      </AdminLayout>
    );
  }

  const stepStatuses = new Set(order.timeline.map((t) => t.status));
  const _currentStepIndex = flowSteps.findIndex((s) => s.status === order.status);

  const handleConfirmStatus = () => {
    if (!statusModal) return;
    updateOrderStatus(order.id, statusModal, statusNote || `Cập nhật trạng thái: ${statusLabel[statusModal]}`);
    setStatusModal(null);
    setStatusNote('');
  };

  return (
    <AdminLayout
      title={`Đơn hàng ${order.orderNumber}`}
      subtitle={`Đặt lúc ${formatDateTime(order.createdAt)}`}
    >
      <div className="space-y-4">
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate('/admin/orders')}
        >
          Quay lại danh sách
        </Button>

        {/* Status banner */}
        <Card className="p-4 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={statusVariant[order.status]} size="lg">
              {statusLabel[order.status]}
            </Badge>
            <Badge variant="info" size="lg">
              {paymentLabel[order.paymentStatus]}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {allStatuses
              .filter((s) => s !== order.status)
              .map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={s === 'CANCELLED' ? 'danger' : 'outline'}
                  onClick={() => setStatusModal(s)}
                >
                  Chuyển sang: {statusLabel[s]}
                </Button>
              ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Order items */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-amber-700" />
                <h2 className="font-semibold text-stone-800 dark:text-stone-100">Sản phẩm</h2>
              </div>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 py-3 border-b border-stone-100 dark:border-zinc-700 last:border-0"
                  >
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-14 h-14 rounded-lg object-cover bg-stone-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-stone-800 dark:text-stone-100">{item.productName}</p>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        {formatVND(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-stone-800 dark:text-stone-100">
                      {formatVND(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-stone-200 dark:border-zinc-700 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-stone-400">Tạm tính</span>
                  <span className="font-medium">{formatVND(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-stone-400">Phí vận chuyển</span>
                  <span className="font-medium">{formatVND(order.shippingFee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Giảm giá</span>
                    <span className="font-medium">-{formatVND(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-stone-200 dark:border-zinc-700">
                  <span>Tổng cộng</span>
                  <span className="text-amber-700">{formatVND(order.total)}</span>
                </div>
              </div>
            </Card>

            {/* Status timeline */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-amber-700" />
                <h2 className="font-semibold text-stone-800 dark:text-stone-100">Lịch sử trạng thái</h2>
              </div>
              <ol className="relative space-y-4">
                <span
                  className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-stone-200 dark:bg-zinc-700"
                  aria-hidden
                />
                {flowSteps.map((step) => {
                  const reached = stepStatuses.has(step.status);
                  const timelineEntry = order.timeline.find((t) => t.status === step.status);
                  const isCurrent = order.status === step.status;
                  return (
                    <li key={step.status} className="flex gap-3 relative">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                          reached
                            ? isCurrent
                              ? 'bg-amber-700 text-white ring-4 ring-amber-200'
                              : 'bg-emerald-500 text-white'
                            : 'bg-stone-200 text-stone-500 dark:bg-zinc-700'
                        }`}
                      >
                        {step.icon}
                      </span>
                      <div className="flex-1 pb-2">
                        <p
                          className={`font-medium ${
                            reached ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400'
                          }`}
                        >
                          {step.label}
                        </p>
                        {timelineEntry && (
                          <>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              {formatDateTime(timelineEntry.timestamp)}
                            </p>
                            {timelineEntry.note && (
                              <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">
                                {timelineEntry.note}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
                {order.status === 'CANCELLED' && (
                  <li className="flex gap-3 relative">
                    <span className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white flex-shrink-0 z-10">
                      <XCircle className="w-4 h-4" />
                    </span>
                    <div className="flex-1 pb-2">
                      <p className="font-medium text-red-600">Đơn hàng đã hủy</p>
                      {order.timeline.find((t) => t.status === 'CANCELLED') && (
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {formatDateTime(
                            order.timeline.find((t) => t.status === 'CANCELLED')!.timestamp
                          )}
                        </p>
                      )}
                    </div>
                  </li>
                )}
              </ol>
            </Card>

            {order.note && (
              <Card className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-amber-700" />
                  <h2 className="font-semibold text-stone-800 dark:text-stone-100">Ghi chú</h2>
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-300">{order.note}</p>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            {/* Customer info */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-amber-700" />
                <h2 className="font-semibold text-stone-800 dark:text-stone-100">Khách hàng</h2>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-stone-800 dark:text-stone-100">
                  {order.customerName}
                </p>
                <p className="text-stone-600 dark:text-stone-400">{order.customerEmail}</p>
                <p className="text-stone-600 dark:text-stone-400">{order.customerPhone}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => navigate(`/admin/customers/${order.customerId}`)}
                >
                  Xem hồ sơ
                </Button>
              </div>
            </Card>

            {/* Shipping */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-amber-700" />
                <h2 className="font-semibold text-stone-800 dark:text-stone-100">Địa chỉ giao hàng</h2>
              </div>
              <div className="text-sm space-y-1">
                <p className="font-medium text-stone-800 dark:text-stone-100">
                  {order.shippingAddress.fullName}
                </p>
                <p className="text-stone-600 dark:text-stone-400">
                  {order.shippingAddress.phone}
                </p>
                <p className="text-stone-600 dark:text-stone-400">
                  {order.shippingAddress.detail}, {order.shippingAddress.ward},{' '}
                  {order.shippingAddress.district}, {order.shippingAddress.province}
                </p>
              </div>
            </Card>

            {/* Payment */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-amber-700" />
                <h2 className="font-semibold text-stone-800 dark:text-stone-100">Thanh toán</h2>
              </div>
              <div className="text-sm space-y-2">
                <div>
                  <span className="text-stone-600 dark:text-stone-400">Phương thức:</span>
                  <p className="font-medium text-stone-800 dark:text-stone-100">
                    {paymentLabelVN[order.paymentMethod]}
                  </p>
                </div>
                <div>
                  <span className="text-stone-600 dark:text-stone-400">Trạng thái:</span>
                  <p>
                    <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'} size="sm">
                      {paymentLabel[order.paymentStatus]}
                    </Badge>
                  </p>
                </div>
                <div>
                  <span className="text-stone-600 dark:text-stone-400">Ngày tạo:</span>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <span className="text-stone-600 dark:text-stone-400">Cập nhật:</span>
                  <p className="font-medium">{formatDate(order.updatedAt)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Update status modal */}
        <Modal
          isOpen={!!statusModal}
          onClose={() => {
            setStatusModal(null);
            setStatusNote('');
          }}
          title={`Cập nhật trạng thái: ${statusModal ? statusLabel[statusModal] : ''}`}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Trạng thái mới sẽ được lưu vào lịch sử đơn hàng.
            </p>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-1.5">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="VD: Đã liên hệ khách xác nhận..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setStatusModal(null);
                  setStatusNote('');
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleConfirmStatus}>Xác nhận</Button>
            </div>
          </div>
        </Modal>
      </div>
    </AdminLayout>
  );
}
