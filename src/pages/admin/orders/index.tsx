import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Calendar, ShoppingBag } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui';
import { Input } from '@/components/ui';
import { Select } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Button } from '@/components/ui';
import { useAdminStore } from '@/stores/adminStore';
import { formatVND, formatDate } from '@/utils/adminFormat';
import type { AdminOrder } from '@/types/admin';

const orderStatusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'PROCESSING', label: 'Đang chuẩn bị' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const statusVariant: Record<AdminOrder['status'], 'warning' | 'info' | 'primary' | 'success' | 'danger'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'primary',
  SHIPPING: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

const statusLabel: Record<AdminOrder['status'], string> = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

const paymentLabel: Record<AdminOrder['paymentStatus'], string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Hoàn tiền',
};

const paymentVariant: Record<AdminOrder['paymentStatus'], 'warning' | 'success' | 'danger' | 'info'> = {
  PENDING: 'warning',
  PAID: 'success',
  FAILED: 'danger',
  REFUNDED: 'info',
};

const quickStatus: AdminOrder['status'][] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPING',
  'DELIVERED',
  'CANCELLED',
];

export default function AdminOrders() {
  const navigate = useNavigate();
  const orders = useAdminStore((s) => s.orders);
  const updateOrderStatus = useAdminStore((s) => s.updateOrderStatus);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !o.orderNumber.toLowerCase().includes(q) &&
          !o.customerName.toLowerCase().includes(q) &&
          !o.customerEmail.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (statusFilter && o.status !== statusFilter) return false;
      if (dateFrom && new Date(o.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && new Date(o.createdAt) > new Date(`${dateTo}T23:59:59`)) return false;
      return true;
    });
  }, [orders, search, statusFilter, dateFrom, dateTo]);

  const handleStatusChange = (id: string, status: AdminOrder['status']) => {
    updateOrderStatus(id, status, `Cập nhật trạng thái thành ${statusLabel[status]}`);
  };

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'PENDING').length,
      shipping: orders.filter((o) => o.status === 'SHIPPING').length,
      completed: orders.filter((o) => o.status === 'DELIVERED').length,
    };
  }, [orders]);

  return (
    <AdminLayout title="Quản Lý Đơn Hàng" subtitle="Danh sách và xử lý đơn hàng">
      {/* Mini stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Card className="p-4">
          <p className="text-xs text-stone-500 dark:text-stone-400">Tổng đơn</p>
          <p className="text-2xl font-bold text-stone-800 dark:text-stone-100 mt-1">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-stone-500 dark:text-stone-400">Chờ xử lý</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-stone-500 dark:text-stone-400">Đang giao</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.shipping}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-stone-500 dark:text-stone-400">Hoàn thành</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.completed}</p>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-stone-200 dark:border-zinc-700 grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            type="search"
            placeholder="Tìm mã đơn, khách hàng..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            options={orderStatusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="Từ ngày"
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <Input
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="Đến ngày"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-zinc-900/50">
              <tr className="text-left text-xs uppercase text-stone-500 dark:text-stone-400">
                <th className="px-4 py-3 font-semibold">Mã đơn</th>
                <th className="px-4 py-3 font-semibold">Khách hàng</th>
                <th className="px-4 py-3 font-semibold">Ngày đặt</th>
                <th className="px-4 py-3 font-semibold">Tổng tiền</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Thanh toán</th>
                <th className="px-4 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-zinc-700">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-stone-50 dark:hover:bg-zinc-700/30">
                  <td className="px-4 py-3">
                    <p className="font-medium text-amber-700 dark:text-amber-400">{o.orderNumber}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{o.items.length} sản phẩm</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-800 dark:text-stone-100">{o.customerName}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{o.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400">
                    {formatDate(o.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-stone-800 dark:text-stone-100">
                    {formatVND(o.total)}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      options={quickStatus.map((s) => ({ value: s, label: statusLabel[s] }))}
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value as AdminOrder['status'])}
                      className="min-w-[140px]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={paymentVariant[o.paymentStatus]} size="sm">
                      {paymentLabel[o.paymentStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/orders/${o.id}`)}
                        className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-700 hover:text-amber-700"
                        aria-label="Xem"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <ShoppingBag className="w-12 h-12 mx-auto text-stone-300 mb-2" />
                    <p className="text-stone-500">Không tìm thấy đơn hàng nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-stone-200 dark:border-zinc-700 text-sm">
          <p className="text-stone-500 dark:text-stone-400">
            Hiển thị <span className="font-semibold text-stone-800 dark:text-stone-100">{filtered.length}</span> / {orders.length} đơn
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/analytics')}>
            Xem phân tích chi tiết
          </Button>
        </div>
      </Card>
    </AdminLayout>
  );
}
