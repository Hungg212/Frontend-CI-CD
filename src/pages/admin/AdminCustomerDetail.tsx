import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, ShoppingBag } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
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

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n || 0);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { dateStyle: 'medium' });

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const token = useAuthStore((s) => s.token) || '';
  const notify = useNotificationStore();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Không tìm thấy khách hàng');
        const data = await res.json();
        setCustomer(data);
        setOrders(data.orders || []);
      } catch (e: unknown) {
        notify.error('Lỗi', e instanceof Error ? e.message : 'Không thể tải khách hàng');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <p className="py-12 text-center text-stone-500">Đang tải khách hàng...</p>;
  }

  if (!customer) {
    return (
      <div className="py-12 text-center">
        <p className="text-stone-500">Không tìm thấy khách hàng.</p>
        <Link to="/admin/customers" className="mt-4 inline-block text-coffee-700 underline">
          Quay lại danh sách khách hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/customers"
          className="rounded-full p-2 text-stone-600 transition hover:bg-stone-100"
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">{customer.name}</h1>
          <p className="text-sm text-stone-500">Thành viên từ {formatDate(customer.createdAt)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <ShoppingBag className="h-4 w-4" /> Lịch sử đơn hàng ({orders.length})
            </h2>
            {orders.length === 0 ? (
              <p className="text-sm text-stone-500">Khách hàng chưa có đơn hàng nào.</p>
            ) : (
              <ul className="divide-y divide-stone-100">
                {orders.map((o) => {
                  const st = STATUS_LABELS[o.status] || {
                    label: o.status,
                    color: 'bg-stone-100 text-stone-700',
                  };
                  return (
                    <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <Link
                          to={`/admin/orders/${o.id}`}
                          className="font-medium text-coffee-700 hover:underline"
                        >
                          {o.orderNumber}
                        </Link>
                        <p className="text-xs text-stone-500">{formatDate(o.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${st.color}`}
                        >
                          {st.label}
                        </span>
                        <span className="font-semibold">{formatVND(o.total)}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-stone-200 bg-white p-5">
            <h2 className="mb-4 font-semibold">Thông tin liên hệ</h2>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-stone-400" />
                {customer.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-stone-400" />
                {customer.phone || '—'}
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-stone-400" />
                {formatDate(customer.createdAt)}
              </p>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-stone-200 bg-white p-5 text-center">
              <p className="text-xs uppercase tracking-wide text-stone-500">Số đơn</p>
              <p className="mt-1 text-2xl font-bold">{customer.orderCount}</p>
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-5 text-center">
              <p className="text-xs uppercase tracking-wide text-stone-500">Tổng chi tiêu</p>
              <p className="mt-1 text-lg font-bold">{formatVND(customer.totalSpent)}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
