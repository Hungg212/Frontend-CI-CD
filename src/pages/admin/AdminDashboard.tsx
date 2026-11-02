import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, ShoppingBag, DollarSign, Package, Clock } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  ordersByStatus?: Record<string, number>;
  topProducts?: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    rating: number;
    sold: number;
  }>;
  recentOrders?: Array<{
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    customerName: string | null;
    createdAt: string;
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao',
  SHIPPED: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n || 0);

const formatNumber = (n: number) => new Intl.NumberFormat('vi-VN').format(n || 0);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

export default function AdminDashboard() {
  const token = useAuthStore((s) => s.token) || '';
  const notify = useNotificationStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Không thể tải thống kê');
        setStats(await res.json());
      } catch (e: unknown) {
        notify.error('Lỗi', e instanceof Error ? e.message : 'Không thể tải thống kê');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cards = [
    {
      label: 'Doanh thu',
      value: formatVND(stats?.totalRevenue ?? 0),
      icon: DollarSign,
    },
    {
      label: 'Đơn hàng',
      value: formatNumber(stats?.totalOrders ?? 0),
      icon: ShoppingBag,
    },
    {
      label: 'Khách hàng',
      value: formatNumber(stats?.totalCustomers ?? 0),
      icon: Users,
    },
    {
      label: 'Sản phẩm',
      value: formatNumber(stats?.totalProducts ?? 0),
      icon: Package,
    },
  ];

  const statusEntries = Object.entries(stats?.ordersByStatus || {});

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-warm-200 bg-white p-6 dark:border-coffee-800 dark:bg-coffee-900"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-coffee-700 dark:text-cream-300">{s.label}</span>
              <s.icon className="h-5 w-5 text-coffee-500" />
            </div>
            <p className="font-display text-2xl font-bold">
              {loading ? '…' : s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <section className="rounded-xl border border-warm-200 bg-white p-6 lg:col-span-2 dark:border-coffee-800 dark:bg-coffee-900">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
            <Clock className="h-5 w-5" /> Đơn hàng gần đây
          </h2>
          {!stats?.recentOrders?.length ? (
            <p className="text-sm text-coffee-700 dark:text-cream-300">Chưa có đơn hàng nào.</p>
          ) : (
            <ul className="divide-y divide-warm-200 dark:divide-coffee-800">
              {stats.recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link
                      to={`/admin/orders/${o.id}`}
                      className="font-medium text-coffee-700 hover:underline dark:text-cream-300"
                    >
                      {o.orderNumber}
                    </Link>
                    <p className="truncate text-xs text-stone-500">
                      {o.customerName || 'Khách vô danh'} · {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatVND(o.total)}</p>
                    <p className="text-xs text-stone-500">{STATUS_LABELS[o.status] || o.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Order status breakdown */}
        <section className="rounded-xl border border-warm-200 bg-white p-6 dark:border-coffee-800 dark:bg-coffee-900">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
            <TrendingUp className="h-5 w-5" /> Trạng thái đơn hàng
          </h2>
          {!statusEntries.length ? (
            <p className="text-sm text-coffee-700 dark:text-cream-300">Chưa có dữ liệu.</p>
          ) : (
            <ul className="space-y-2">
              {statusEntries.map(([k, v]) => (
                <li key={k} className="flex items-center justify-between text-sm">
                  <span className="text-coffee-700 dark:text-cream-300">
                    {STATUS_LABELS[k] || k}
                  </span>
                  <span className="font-semibold">{v}</span>
                </li>
              ))}
            </ul>
          )}

          {!!stats?.topProducts?.length && (
            <>
              <h3 className="mb-2 mt-6 font-display text-base font-semibold">Bán chạy nhất</h3>
              <ul className="space-y-2">
                {stats.topProducts.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                    <Link
                      to={`/products/${p.slug}`}
                      className="min-w-0 truncate text-coffee-700 hover:underline dark:text-cream-300"
                    >
                      {p.name}
                    </Link>
                    <span className="shrink-0 font-semibold">{p.sold} sp</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
