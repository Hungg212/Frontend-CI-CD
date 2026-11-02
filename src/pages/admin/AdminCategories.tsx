import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { Button, Spinner } from '@/components/ui';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

const emptyForm = { name: '', slug: '', description: '', image: '', productCount: 0 };

const inputCls =
  'w-full rounded-md border border-warm-300 px-3 py-2 text-sm focus:border-coffee-500 focus:outline-none';

export default function AdminCategories() {
  const token = useAuthStore((s) => s.token) || '';
  const notify = useNotificationStore();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Tải danh mục thất bại');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.categories || []);
    } catch (e: unknown) {
      notify.error('Lỗi', e instanceof Error ? e.message : 'Không thể tải danh mục');
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

  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      image: c.image || '',
      productCount: c.productCount || 0,
    });
    setErrors({});
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = 'Vui lòng nhập tên danh mục';
    if (!form.slug.trim()) err.slug = 'Vui lòng nhập slug';
    setErrors(err);
    if (Object.keys(err).length) return;

    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/admin/categories/${editingId}` : '/api/admin/categories',
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
      if (!res.ok) throw new Error(body.error || 'Lưu danh mục thất bại');
      notify.success('Thành công', editingId ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục');
      setShowForm(false);
      load();
    } catch (err2: unknown) {
      notify.error('Lỗi', err2 instanceof Error ? err2.message : 'Lưu danh mục thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa danh mục "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Xóa thất bại');
      notify.success('Đã xóa', name);
      load();
    } catch (e: unknown) {
      notify.error('Lỗi', e instanceof Error ? e.message : 'Không thể xóa');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Danh mục</h1>
          <p className="text-sm text-coffee-600">{items.length} danh mục</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Thêm danh mục
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={submit}
          className="space-y-4 rounded-xl border border-warm-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              {editingId ? 'Sửa danh mục' : 'Tạo danh mục mới'}
            </h2>
            <button type="button" onClick={() => setShowForm(false)} aria-label="Đóng">
              <X className="h-5 w-5 text-stone-500" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Tên danh mục *</label>
              <input
                className={inputCls}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Cà phê hạt"
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Slug *</label>
              <input
                className={inputCls}
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="ca-phe-hat"
              />
              {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Mô tả</label>
            <textarea
              className={inputCls}
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Ảnh danh mục (URL)</label>
            <input
              className={inputCls}
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
            />
            {form.image && (
              <img
                src={form.image}
                alt="preview"
                className="mt-3 h-28 w-44 rounded-lg object-cover"
              />
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Spinner size="sm" />}
              {editingId ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Hủy
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-12 text-center text-stone-500">Đang tải danh mục...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <div
              key={c.id}
              className="overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm"
            >
              {c.image && (
                <img src={c.image} alt={c.name} className="h-32 w-full object-cover" />
              )}
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{c.name}</h3>
                    <p className="truncate text-xs text-stone-500">{c.slug}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => openEdit(c)}
                      aria-label={`Sửa ${c.name}`}
                      className="rounded-full p-1.5 text-stone-500 transition hover:bg-stone-100"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      aria-label={`Xóa ${c.name}`}
                      className="rounded-full p-1.5 text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {c.description && (
                  <p className="line-clamp-2 text-xs text-stone-500">{c.description}</p>
                )}
                <p className="text-xs text-stone-500">
                  {c.productCount} sản phẩm ·{' '}
                  <Link
                    to={`/products?category=${c.slug}`}
                    className="text-coffee-700 hover:underline"
                  >
                    Xem sản phẩm
                  </Link>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
