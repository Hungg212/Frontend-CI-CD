import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Package,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  mockStats,
  mockRevenueData,
  mockOrdersByDay,
  mockCategorySales,
  mockCustomerGrowth,
  mockRecentOrders,
  mockTopProducts,
} from '@/data/adminMockData';
import { formatVND, formatCompactVND, formatDateTime } from '@/utils/adminFormat';
import type { AdminRecentOrder } from '@/types/admin';

const statusVariant: Record<
  AdminRecentOrder['status'],
  'warning' | 'info' | 'primary' | 'success' | 'danger'
> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'primary',
  SHIPPING: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

const statusLabel: Record<AdminRecentOrder['status'], string> = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};

const paymentLabel: Record<AdminRecentOrder['paymentStatus'], string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  FAILED: 'Thất bại',
  REFUNDED: 'Hoàn tiền',
};

const statsCards = [
  {
    key: 'revenue',
    label: 'Tổng Doanh Thu',
    value: formatVND(mockStats.revenue),
    change: mockStats.revenueChange,
    icon: <DollarSign className="h-6 w-6" />,
    color: 'from-amber-500 to-amber-700',
  },
  {
    key: 'orders',
    label: 'Đơn Hàng',
    value: mockStats.orderCount.toLocaleString('vi-VN'),
    change: mockStats.orderCountChange,
    icon: <ShoppingCart className="h-6 w-6" />,
    color: 'from-blue-500 to-blue-700',
  },
  {
    key: 'customers',
    label: 'Khách Hàng',
    value: mockStats.customerCount.toLocaleString('vi-VN'),
    change: mockStats.customerCountChange,
    icon: <Users className="h-6 w-6" />,
    color: 'from-emerald-500 to-emerald-700',
  },
  {
    key: 'avg',
    label: 'Giá Trị Đơn TB',
    value: formatVND(mockStats.averageOrderValue),
    change: mockStats.averageOrderValueChange,
    icon: <TrendingUp className="h-6 w-6" />,
    color: 'from-purple-500 to-purple-700',
  },
];

const tooltipStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.97)',
  border: '1px solid #e7e5e4',
  borderRadius: 12,
  padding: '8px 12px',
  fontSize: 12,
  color: '#1c1917',
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <AdminLayout title="Dashboard" subtitle="Tổng quan hoạt động cửa hàng">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((s) => (
            <Card key={s.key} className="p-5" hover>
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
                    {s.label}
                  </p>
                  <p className="mt-2 truncate text-2xl font-bold text-stone-800 dark:text-stone-100">
                    {s.value}
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    {s.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={`font-semibold ${
                        s.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {s.change >= 0 ? '+' : ''}
                      {s.change.toFixed(1)}%
                    </span>
                    <span className="text-stone-500 dark:text-stone-400">vs tháng trước</span>
                  </div>
                </div>
                <div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-br ${s.color} flex flex-shrink-0 items-center justify-center text-white shadow-lg`}
                >
                  {s.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-stone-800 dark:text-stone-100">
                  Doanh Thu 12 Tháng
                </h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  Tổng doanh thu theo tháng trong năm 2026
                </p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={mockRevenueData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b45309" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#b45309" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                  <XAxis dataKey="month" stroke="#78716c" fontSize={12} />
                  <YAxis
                    stroke="#78716c"
                    fontSize={12}
                    tickFormatter={(v) => formatCompactVND(v)}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: number) => [formatVND(v), 'Doanh thu']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#b45309"
                    strokeWidth={2.5}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-stone-800 dark:text-stone-100">
                Doanh Số Theo Danh Mục
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">Phân bổ theo tỉ lệ</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockCategorySales}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {mockCategorySales.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: number, name) => [`${v}%`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-stone-800 dark:text-stone-100">Đơn Hàng 7 Ngày</h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Số lượng đơn theo ngày trong tuần
              </p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockOrdersByDay} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b45309" stopOpacity={1} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                  <XAxis dataKey="day" stroke="#78716c" fontSize={12} />
                  <YAxis stroke="#78716c" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, 'Đơn hàng']} />
                  <Bar dataKey="orders" fill="url(#colorOrders)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-stone-800 dark:text-stone-100">
                Tăng Trưởng Khách Hàng
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Số khách hàng mới mỗi tháng
              </p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={mockCustomerGrowth}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                  <XAxis dataKey="month" stroke="#78716c" fontSize={12} />
                  <YAxis stroke="#78716c" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: number) => [v, 'Khách hàng']}
                  />
                  <Area
                    type="monotone"
                    dataKey="customers"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fill="url(#colorCustomers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Revenue line chart (extra detail) */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-stone-800 dark:text-stone-100">
                Xu Hướng Doanh Thu
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Đường doanh thu chi tiết theo tháng
              </p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockRevenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#b45309" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#b45309" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis dataKey="month" stroke="#78716c" fontSize={12} />
                <YAxis stroke="#78716c" fontSize={12} tickFormatter={(v) => formatCompactVND(v)} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => [formatVND(v), 'Doanh thu']}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#b45309"
                  strokeWidth={3}
                  dot={{ fill: '#b45309', r: 4 }}
                  activeDot={{ r: 6 }}
                  fill="url(#colorLine)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent activity + Top products */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="overflow-hidden p-0 lg:col-span-2">
            <div className="flex items-center justify-between p-5 pb-3">
              <div>
                <h2 className="font-semibold text-stone-800 dark:text-stone-100">
                  Đơn Hàng Gần Đây
                </h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">5 đơn hàng mới nhất</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/orders')}
                className="flex items-center gap-1 text-sm text-amber-700 hover:underline dark:text-amber-400"
              >
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 dark:bg-zinc-900/50">
                  <tr className="text-left text-xs uppercase text-stone-500 dark:text-stone-400">
                    <th className="px-5 py-3 font-semibold">Mã đơn</th>
                    <th className="px-5 py-3 font-semibold">Khách hàng</th>
                    <th className="px-5 py-3 font-semibold">Tổng</th>
                    <th className="px-5 py-3 font-semibold">Trạng thái</th>
                    <th className="px-5 py-3 font-semibold">Ngày</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-zinc-700">
                  {mockRecentOrders.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => navigate(`/admin/orders/${o.id}`)}
                      className="cursor-pointer hover:bg-stone-50 dark:hover:bg-zinc-700/30"
                    >
                      <td className="px-5 py-3 font-medium text-amber-700 dark:text-amber-400">
                        {o.orderNumber}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-stone-800 dark:text-stone-100">
                          {o.customerName}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {o.customerEmail}
                        </p>
                      </td>
                      <td className="px-5 py-3 font-semibold text-stone-800 dark:text-stone-100">
                        {formatVND(o.total)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={statusVariant[o.status]} size="sm">
                          {statusLabel[o.status]}
                        </Badge>
                        <p className="mt-1 text-xs text-stone-500">
                          {paymentLabel[o.paymentStatus]}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-stone-500 dark:text-stone-400">
                        {formatDateTime(o.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 dark:text-stone-100">
                Sản Phẩm Bán Chạy
              </h2>
              <Package className="h-5 w-5 text-amber-700" />
            </div>
            <ul className="space-y-3">
              {mockTopProducts.map((p, idx) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-stone-50 dark:hover:bg-zinc-700/40"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    {idx + 1}
                  </span>
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-100">
                      {p.name}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Đã bán: {p.soldCount}
                    </p>
                  </div>
                  <p className="flex-shrink-0 text-sm font-semibold text-amber-700 dark:text-amber-400">
                    {formatCompactVND(p.revenue)}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
