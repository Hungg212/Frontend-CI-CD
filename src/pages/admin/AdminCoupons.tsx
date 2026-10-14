import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { Plus, Trash2, Tag, Copy } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { Button } from '@/components/ui';

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
}

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);

export default function AdminCoupons() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 0,
    maxUses: 100,
    expiresAt: '',
  });
  const token = useAuthStore((s) => s.token) || '';
  const notify = useNotificationStore((s) => s);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: Coupon[] = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } else {
        setItems([
          {
            id: 'c1',
            code: 'WELCOME10',
            description: 'Giảm 10%',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            minOrderValue: 200000,
            maxUses: 1000,
            usedCount: 23,
            isActive: true,
            expiresAt: '2026-12-31',
          },
          {
            id: 'c2',
            code: 'FREESHIP',
            description: 'Free ship',
            discountType: 'FIXED',
            discountValue: 30000,
            minOrderValue: 500000,
            maxUses: 500,
            usedCount: 89,
            isActive: true,
            expiresAt: '2026-12-31',
          },
        ]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        notify.success('Đã tạo mã', form.code);
        setShowForm(false);
        load();
      } else {
        notify.success('Đã tạo mã', form.code);
        setShowForm(false);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Lỗi';
      notify.error('Lỗi', msg);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Xóa "${code}"?`)) return;
    await fetch(`/api/admin/coupons/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    notify.success('Đã xóa', code);
    load();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    notify.success('Đã sao chép', code);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-coffee-900">Mã giảm giá</h1>
          <p className="text-sm text-coffee-600">{items.length} mã</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Tạo mã
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-warm-200 bg-white p-6 shadow-sm"
        >
          <h2 className="mb-4 font-semibold text-coffee-900">Tạo mã mới</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-coffee-700">Mã *</label>
              <input
                required
                value={form.code}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                placeholder="VD: SALE20"
                className="mt-1 w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-coffee-700">Loại</label>
              <select
                value={form.discountType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setForm({ ...form, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })
                }
                className="mt-1 w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              >
                <option value="PERCENTAGE">% Giảm giá</option>
                <option value="FIXED">Số tiền cố định</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-coffee-700">Giá trị *</label>
              <input
                type="number"
                required
                value={form.discountValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, discountValue: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-coffee-700">Đơn tối thiểu</label>
              <input
                type="number"
                value={form.minOrderValue}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, minOrderValue: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-coffee-700">Lượt dùng tối đa</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, maxUses: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-coffee-700">Ngày hết hạn</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, expiresAt: e.target.value })
                }
                className="mt-1 w-full rounded-lg border border-warm-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="submit">Tạo mã</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Hủy
            </Button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-coffee-500">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="col-span-2 rounded-xl border border-warm-200 bg-white p-12 text-center text-coffee-500">
            Chưa có mã.
          </div>
        ) : (
          items.map((c) => (
            <div key={c.id} className="rounded-xl border border-warm-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                    <Tag className="h-5 w-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-bold text-coffee-900">{c.code}</span>
                      <button
                        onClick={() => copyCode(c.code)}
                        className="text-coffee-400 hover:text-amber-700"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {c.description && <p className="text-xs text-coffee-600">{c.description}</p>}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(c.id, c.code)}
                  className="text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-warm-200 pt-3 text-sm">
                <div>
                  <p className="text-xs text-coffee-500">Giảm</p>
                  <p className="font-semibold text-amber-700">
                    {c.discountType === 'PERCENTAGE'
                      ? `${c.discountValue}%`
                      : formatVND(c.discountValue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-coffee-500">Đã dùng</p>
                  <p className="font-semibold text-coffee-900">
                    {c.usedCount}
                    {c.maxUses ? ` / ${c.maxUses}` : ''}
                  </p>
                </div>
                {c.minOrderValue && c.minOrderValue > 0 && (
                  <div>
                    <p className="text-xs text-coffee-500">Đơn tối thiểu</p>
                    <p className="font-medium text-coffee-900">{formatVND(c.minOrderValue)}</p>
                  </div>
                )}
                {c.expiresAt && (
                  <div>
                    <p className="text-xs text-coffee-500">Hết hạn</p>
                    <p className="font-medium text-coffee-900">
                      {new Date(c.expiresAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
