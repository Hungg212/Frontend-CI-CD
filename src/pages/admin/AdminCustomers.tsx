import { useEffect, useState } from 'react';
import { Search, Mail, Phone } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  totalOrders?: number;
  totalSpent?: number;
}

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);

export default function AdminCustomers() {
  const [items, setItems] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const token = useAuthStore((s) => s.token) || '';
  const notify = useNotificationStore();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Tải khách hàng thất bại');
      const data: Customer[] | { customers: Customer[] } = await res.json();
      setItems(Array.isArray(data) ? data : (data as { customers: Customer[] }).customers || []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không thể tải';
      notify.error('Lỗi', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter(
    (c) =>
      c.name.toLowerCase().includes(keyword.toLowerCase()) ||
      c.email.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-coffee-900">Khách hàng</h1>
        <p className="text-sm text-coffee-600">{items.length} tài khoản</p>
      </div>

      <div className="rounded-xl border border-warm-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-warm-200 p-4">
          <Search className="h-4 w-4 text-coffee-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm tên, email..."
            className="flex-1 bg-transparent text-sm text-coffee-900 placeholder-coffee-400 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-coffee-500">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-coffee-500">Không có khách hàng.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-50 text-xs uppercase tracking-wider text-coffee-600">
                <tr>
                  <th className="px-4 py-3 text-left">Khách hàng</th>
                  <th className="px-4 py-3 text-left">Liên hệ</th>
                  <th className="px-4 py-3 text-left">Vai trò</th>
                  <th className="px-4 py-3 text-left">Đơn hàng</th>
                  <th className="px-4 py-3 text-left">Chi tiêu</th>
                  <th className="px-4 py-3 text-left">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-200">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-cream-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium text-coffee-900">{c.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-coffee-700">
                        <Mail className="h-3 w-3" /> {c.email}
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1 text-xs text-coffee-500">
                          <Phone className="h-3 w-3" /> {c.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${c.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-700'}`}
                      >
                        {c.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-coffee-900">{c.totalOrders ?? '—'}</td>
                    <td className="px-4 py-3 font-medium text-coffee-900">
                      {c.totalSpent ? formatVND(c.totalSpent) : '—'}
                    </td>
                    <td className="px-4 py-3 text-coffee-600">
                      {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
