import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui';
import { useNotificationStore } from '@/stores/notificationStore';

interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: unknown[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
  PROCESSING: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-700' },
  SHIPPED: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

const PAYMENT_LABELS: Record<string, string> = {
  COD: 'COD',
  BANK_TRANSFER: 'Chuyển khoản',
  MOMO: 'MoMo',
  CREDIT_CARD: 'Thẻ tín dụng',
};

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

export default function AdminOrders() {
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const notify = useNotificationStore();
  const token = useAuthStore((s) => s.token) || '';

  const load = async () => {
    setLoading(true);
    try {
      const data: AdminOrder[] = (await orderApi.getAll(token)) as AdminOrder[];
      setItems(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không thể tải đơn hàng';
      notify.error('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((o) => {
    const matchKw =
      o.orderNumber.toLowerCase().includes(keyword.toLowerCase()) ||
      o.customerName.toLowerCase().includes(keyword.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(keyword.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchKw && matchStatus;
  });

  const totalRevenue = items
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-coffee-900">Đơn hàng</h1>
        <p className="text-sm text-coffee-600">
          {items.length} đơn · Doanh thu: {formatVND(totalRevenue)}
        </p>
      </div>

      <div className="rounded-xl border border-warm-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-warm-200 p-4 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-warm-200 px-3">
            <Search className="h-4 w-4 text-coffee-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm mã, tên, email..."
              className="flex-1 bg-transparent py-2 text-sm text-coffee-900 placeholder-coffee-400 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-warm-200 bg-white px-3 py-2 text-sm text-coffee-900 focus:outline-none"
          >
            <option value="">Tất cả</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-coffee-500">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-coffee-500">Không có đơn hàng.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-50 text-xs uppercase tracking-wider text-coffee-600">
                <tr>
                  <th className="px-4 py-3 text-left">Mã đơn</th>
                  <th className="px-4 py-3 text-left">Khách hàng</th>
                  <th className="px-4 py-3 text-left">Ngày</th>
                  <th className="px-4 py-3 text-left">Tổng</th>
                  <th className="px-4 py-3 text-left">Thanh toán</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-200">
                {filtered.map((o) => {
                  const status = STATUS_LABELS[o.status] || {
                    label: o.status,
                    color: 'bg-stone-100 text-stone-700',
                  };
                  return (
                    <tr key={o.id} className="hover:bg-cream-50/50">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-coffee-900">
                        {o.orderNumber}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-coffee-900">{o.customerName}</div>
                        <div className="text-xs text-coffee-500">{o.customerEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-coffee-600">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-3 font-semibold text-coffee-900">
                        {formatVND(o.total)}
                      </td>
                      <td className="px-4 py-3 text-coffee-700">
                        {PAYMENT_LABELS[o.paymentMethod] || o.paymentMethod}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/admin/orders/${o.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
