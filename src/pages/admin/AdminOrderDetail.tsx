import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Package } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { Button } from '@/components/ui';

interface OrderItem {
  productId: string;
  name: string;
  slug?: string;
  image?: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  label?: string;
  name?: string;
  phone?: string;
  province?: string;
  district?: string;
  ward?: string;
  detail?: string;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerEmail: string | null;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: ShippingAddress | null;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
  PROCESSING: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-700' },
  SHIPPING: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
  SHIPPED: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPING',
  'DELIVERED',
  'CANCELLED',
];

const PAYMENT_LABELS: Record<string, string> = {
  COD: 'Thanh toán khi nhận hàng',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
  MOMO: 'Ví MoMo',
  CREDIT_CARD: 'Thẻ tín dụng',
};

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n || 0);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });

export default function AdminOrderDetail() {
  const { id } = useParams();
  const token = useAuthStore((s) => s.token) || '';
  const notify = useNotificationStore();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Không tìm thấy đơn hàng');
      setOrder(await res.json());
    } catch (e: unknown) {
      notify.error('Lỗi', e instanceof Error ? e.message : 'Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (status: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      notify.success('Cập nhật thành công', `Trạng thái: ${STATUS_LABELS[status]?.label || status}`);
      await load();
    } catch (e: unknown) {
      notify.error('Lỗi', e instanceof Error ? e.message : 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="py-12 text-center text-stone-500">Đang tải đơn hàng...</p>;
  }

  if (!order) {
    return (
      <div className="py-12 text-center">
        <p className="text-stone-500">Không tìm thấy đơn hàng.</p>
        <Link to="/admin/orders" className="mt-4 inline-block text-coffee-700 underline">
          Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  const status = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-stone-100 text-stone-700' };
  const addr = order.shippingAddress;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="rounded-full p-2 text-stone-600 transition hover:bg-stone-100"
            aria-label="Quay lại"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold">Đơn hàng {order.orderNumber}</h1>
            <p className="text-sm text-stone-500">Đặt lúc {formatDate(order.createdAt)}</p>
          </div>
        </div>
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <section className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Package className="h-4 w-4" /> Sản phẩm ({order.items?.length || 0})
            </h2>
            <ul className="divide-y divide-stone-100">
              {(order.items || []).map((it, idx) => (
                <li key={`${it.productId}-${idx}`} className="flex items-center gap-4 py-3">
                  <img
                    src={it.image}
                    alt={it.name}
                    loading="lazy"
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{it.name}</p>
                    <p className="text-sm text-stone-500">
                      {formatVND(it.price)} × {it.quantity}
                    </p>
                  </div>
                  <span className="font-semibold">{formatVND(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-1 border-t border-stone-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-500">Tạm tính</dt>
                <dd>{formatVND(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Phí vận chuyển</dt>
                <dd>{formatVND(order.shippingFee)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <dt>Giảm giá</dt>
                  <dd>-{formatVND(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-stone-100 pt-2 text-base font-bold">
                <dt>Tổng cộng</dt>
                <dd>{formatVND(order.total)}</dd>
              </div>
            </dl>
          </section>

          {/* Status update */}
          <section className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="mb-4 font-semibold">Cập nhật trạng thái</h2>
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUSES.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={order.status === s ? 'primary' : 'outline'}
                  disabled={saving || order.status === s}
                  onClick={() => updateStatus(s)}
                >
                  {STATUS_LABELS[s]?.label || s}
                </Button>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="mb-4 font-semibold">Khách hàng</h2>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-stone-400" />
                {order.customerEmail || '—'}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-stone-400" />
                {addr?.phone || '—'}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <MapPin className="h-4 w-4" /> Địa chỉ giao hàng
            </h2>
            {addr ? (
              <address className="space-y-1 text-sm not-italic">
                {addr.name && <p className="font-medium">{addr.name}</p>}
                {addr.detail && <p>{addr.detail}</p>}
                {(addr.ward || addr.district || addr.province) && (
                  <p className="text-stone-500">
                    {[addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}
                  </p>
                )}
              </address>
            ) : (
              <p className="text-sm text-stone-500">—</p>
            )}
          </section>

          <section className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="mb-4 font-semibold">Thanh toán</h2>
            <p className="text-sm">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</p>
            <p className="mt-1 text-sm text-stone-500">
              Trạng thái: <span className="font-medium">{order.paymentStatus}</span>
            </p>
            {order.note && (
              <p className="mt-3 rounded-lg bg-stone-50 p-3 text-sm text-stone-600">
                Ghi chú: {order.note}
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
