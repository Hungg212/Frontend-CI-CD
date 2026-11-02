import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, MapPin, X, Star } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  detail: string;
  isDefault: boolean;
}

const emptyForm = {
  label: 'home',
  name: '',
  phone: '',
  province: '',
  district: '',
  ward: '',
  detail: '',
  isDefault: false,
};

const inputCls =
  'w-full rounded-md border border-warm-300 px-3 py-2 text-sm focus:border-coffee-500 focus:outline-none';

export default function AddressesPage() {
  const token = useAuthStore((s) => s.token) || '';
  const notify = useNotificationStore();
  const [items, setItems] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/addresses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Tải địa chỉ thất bại');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      notify.error('Lỗi', e instanceof Error ? e.message : 'Không thể tải địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (a: Address) => {
    setEditingId(a.id);
    setForm({
      label: a.label,
      name: a.name,
      phone: a.phone,
      province: a.province,
      district: a.district,
      ward: a.ward,
      detail: a.detail,
      isDefault: a.isDefault,
    });
    setErrors({});
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = 'Vui lòng nhập tên';
    if (!form.phone.trim()) err.phone = 'Vui lòng nhập số điện thoại';
    if (!form.province.trim()) err.province = 'Vui lòng nhập tỉnh/thành';
    if (!form.district.trim()) err.district = 'Vui lòng nhập quận/huyện';
    if (!form.ward.trim()) err.ward = 'Vui lòng nhập phường/xã';
    if (!form.detail.trim()) err.detail = 'Vui lòng nhập số nhà, tên đường';
    setErrors(err);
    if (Object.keys(err).length) return;

    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/auth/addresses/${editingId}` : '/api/auth/addresses',
        {
          method: editingId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Lưu địa chỉ thất bại');
      notify.success('Thành công', editingId ? 'Đã cập nhật địa chỉ' : 'Đã thêm địa chỉ');
      setShowForm(false);
      load();
    } catch (err2: unknown) {
      notify.error('Lỗi', err2 instanceof Error ? err2.message : 'Lưu địa chỉ thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa địa chỉ này?')) return;
    try {
      const res = await fetch(`/api/auth/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Xóa thất bại');
      notify.success('Thành công', 'Đã xóa địa chỉ');
      load();
    } catch (e: unknown) {
      notify.error('Lỗi', e instanceof Error ? e.message : 'Không thể xóa');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">Địa chỉ đã lưu</h2>
        <Button size="sm" onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm địa chỉ
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={submit}
          className="space-y-4 rounded-xl border border-warm-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">
              {editingId ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}
            </h3>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Đóng">
              <X className="h-5 w-5 text-stone-500" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Họ và tên *</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Số điện thoại *</label>
              <input
                className={inputCls}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Tỉnh/Thành phố *</label>
              <input
                className={inputCls}
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
              />
              {errors.province && <p className="mt-1 text-xs text-red-600">{errors.province}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Quận/Huyện *</label>
              <input
                className={inputCls}
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
              />
              {errors.district && <p className="mt-1 text-xs text-red-600">{errors.district}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phường/Xã *</label>
              <input
                className={inputCls}
                value={form.ward}
                onChange={(e) => setForm({ ...form, ward: e.target.value })}
              />
              {errors.ward && <p className="mt-1 text-xs text-red-600">{errors.ward}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Số nhà, tên đường *</label>
            <input
              className={inputCls}
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
            />
            {errors.detail && <p className="mt-1 text-xs text-red-600">{errors.detail}</p>}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="h-4 w-4 rounded border-warm-300"
            />
            Đặt làm địa chỉ mặc định
          </label>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Spinner size="sm" />}
              Lưu địa chỉ
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Hủy
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-stone-500">Đang tải địa chỉ...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-coffee-700 dark:text-cream-300">
          Bạn chưa lưu địa chỉ nào. Nhấn "Thêm địa chỉ" để tạo.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-warm-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-coffee-500" />
                  <p className="font-semibold">{a.name}</p>
                  {a.isDefault && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Mặc định
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(a)}
                    aria-label="Sửa địa chỉ"
                    className="rounded-full p-1.5 text-stone-500 transition hover:bg-stone-100"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    aria-label="Xóa địa chỉ"
                    className="rounded-full p-1.5 text-red-500 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-stone-600">{a.phone}</p>
              <p className="mt-1 text-sm text-stone-600">
                {a.detail}, {a.ward}, {a.district}, {a.province}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
