import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { Button, Spinner } from '@/components/ui';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductForm {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: string;
  salePrice: string;
  discount: string;
  categorySlug: string;
  stock: string;
  sku: string;
  weight: string;
  origin: string;
  roastLevel: string;
  imageUrl: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
}

const EMPTY: ProductForm = {
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  price: '',
  salePrice: '',
  discount: '',
  categorySlug: 'ca-phe-hat',
  stock: '0',
  sku: '',
  weight: '',
  origin: '',
  roastLevel: 'Medium',
  imageUrl: '',
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const inputCls =
  'w-full rounded-md border border-warm-300 px-3 py-2 text-sm focus:border-coffee-500 focus:outline-none dark:border-coffee-700 dark:bg-coffee-800';

export default function AdminProductEdit() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token) || '';
  const notify = useNotificationStore();

  const [form, setForm] = useState<ProductForm>(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // categories
    fetch('/api/categories')
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => setCategories(Array.isArray(list) ? list : list.categories || []))
      .catch(() => setCategories([]));

    if (!isEdit) return;
    fetch(`/api/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error('Không tìm thấy sản phẩm');
        return r.json();
      })
      .then((p) => {
        setForm({
          name: p.name || '',
          slug: p.slug || '',
          shortDescription: p.shortDescription || '',
          description: p.description || '',
          price: String(p.price ?? ''),
          salePrice: p.salePrice != null ? String(p.salePrice) : '',
          discount: p.discount != null ? String(p.discount) : '',
          categorySlug: p.categorySlug || 'ca-phe-hat',
          stock: String(p.stock ?? 0),
          sku: p.sku || '',
          weight: p.weight || '',
          origin: p.origin || '',
          roastLevel: p.roastLevel || 'Medium',
          imageUrl: p.imageUrl || '',
          isFeatured: !!p.isFeatured,
          isNewArrival: !!p.isNewArrival,
          isBestSeller: !!p.isBestSeller,
        });
      })
      .catch((e: unknown) =>
        notify.error('Lỗi', e instanceof Error ? e.message : 'Không thể tải sản phẩm')
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Vui lòng nhập tên sản phẩm';
    if (!form.slug.trim()) e.slug = 'Vui lòng nhập slug';
    if (!form.price || Number(form.price) <= 0) e.price = 'Giá phải lớn hơn 0';
    if (form.salePrice && Number(form.salePrice) > Number(form.price)) {
      e.salePrice = 'Giá sale không được lớn hơn giá gốc';
    }
    if (Number(form.stock) < 0) e.stock = 'Tồn kho không được âm';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        discount: form.discount ? Number(form.discount) : null,
        categorySlug: form.categorySlug,
        stock: Number(form.stock) || 0,
        sku: form.sku.trim(),
        weight: form.weight.trim(),
        origin: form.origin.trim(),
        roastLevel: form.roastLevel,
        images: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
        isFeatured: form.isFeatured,
        isNewArrival: form.isNewArrival,
        isBestSeller: form.isBestSeller,
      };
      const res = await fetch(isEdit ? `/api/admin/products/${id}` : '/api/admin/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Lưu sản phẩm thất bại');
      notify.success('Thành công', isEdit ? 'Đã cập nhật sản phẩm' : 'Đã tạo sản phẩm');
      navigate('/admin/products');
    } catch (err: unknown) {
      notify.error('Lỗi', err instanceof Error ? err.message : 'Lưu sản phẩm thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="py-12 text-center text-stone-500">Đang tải sản phẩm...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/products"
          className="rounded-full p-2 text-stone-600 transition hover:bg-stone-100"
          aria-label="Quay lại"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold">
          {isEdit ? `Sửa sản phẩm #${id}` : 'Tạo sản phẩm mới'}
        </h1>
      </div>

      <form
        onSubmit={submit}
        className="space-y-6 rounded-xl border border-warm-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Tên sản phẩm *</label>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => {
                set('name', e.target.value);
                if (!isEdit) set('slug', slugify(e.target.value));
              }}
              placeholder="Cà phê Arabica Cầu Đất"
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Slug *</label>
            <input
              className={inputCls}
              value={form.slug}
              onChange={(e) => set('slug', slugify(e.target.value))}
              placeholder="ca-phe-arabica-cau-dat"
            />
            {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Mô tả ngắn</label>
          <input
            className={inputCls}
            value={form.shortDescription}
            onChange={(e) => set('shortDescription', e.target.value)}
            placeholder="Arabica Cầu Đất - Hương thơm nhẹ, vị chua thanh"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Mô tả chi tiết</label>
          <textarea
            className={inputCls}
            rows={4}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Giá *</label>
            <input
              className={inputCls}
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
            />
            {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Giá sale</label>
            <input
              className={inputCls}
              type="number"
              min={0}
              value={form.salePrice}
              onChange={(e) => set('salePrice', e.target.value)}
            />
            {errors.salePrice && <p className="mt-1 text-xs text-red-600">{errors.salePrice}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">% giảm giá</label>
            <input
              className={inputCls}
              type="number"
              min={0}
              max={100}
              value={form.discount}
              onChange={(e) => set('discount', e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Danh mục</label>
            <select
              className={inputCls}
              value={form.categorySlug}
              onChange={(e) => set('categorySlug', e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Tồn kho</label>
            <input
              className={inputCls}
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => set('stock', e.target.value)}
            />
            {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">SKU</label>
            <input
              className={inputCls}
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
              placeholder="CHB-ARA-001"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Khối lượng</label>
            <input
              className={inputCls}
              value={form.weight}
              onChange={(e) => set('weight', e.target.value)}
              placeholder="500g"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Vùng trồng</label>
            <input
              className={inputCls}
              value={form.origin}
              onChange={(e) => set('origin', e.target.value)}
              placeholder="Cầu Đất, Đà Lạt"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Mức rang</label>
            <select
              className={inputCls}
              value={form.roastLevel}
              onChange={(e) => set('roastLevel', e.target.value)}
            >
              {['Light', 'Medium', 'Medium-Dark', 'Dark'].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Ảnh sản phẩm (URL)</label>
          <input
            className={inputCls}
            value={form.imageUrl}
            onChange={(e) => set('imageUrl', e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
          />
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="preview"
              className="mt-3 h-32 w-32 rounded-lg object-cover"
            />
          )}
        </div>

        <div className="flex flex-wrap gap-6">
          {(
            [
              ['isFeatured', 'Sản phẩm nổi bật'],
              ['isNewArrival', 'Hàng mới về'],
              ['isBestSeller', 'Bán chạy'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => set(key, e.target.checked)}
                className="h-4 w-4 rounded border-warm-300"
              />
              {label}
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <Spinner size="sm" /> : <Save className="h-4 w-4" />}
            {isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
