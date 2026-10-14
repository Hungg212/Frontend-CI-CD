import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Star } from 'lucide-react';
import { productApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui';
import { useNotificationStore } from '@/stores/notificationStore';

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  category?: string;
  images: string[];
}

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(n);

export default function AdminProducts() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const notify = useNotificationStore((s) => s);
  const token = useAuthStore((s) => s.token) || '';

  const load = async () => {
    setLoading(true);
    try {
      const data: { products: AdminProduct[]; pagination: unknown } = await productApi.getAll({
        limit: 100,
      });
      setItems(data.products || []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không thể tải sản phẩm';
      notify.error('Lỗi tải sản phẩm', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Xóa thất bại');
      notify.success('Đã xóa', name);
      load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không thể xóa';
      notify.error('Lỗi xóa', msg);
    }
  };

  const filtered = items.filter((p) => p.name.toLowerCase().includes(keyword.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-coffee-900">Sản phẩm</h1>
          <p className="text-sm text-coffee-600">{items.length} sản phẩm</p>
        </div>
        <Link to="/admin/products/create">
          <Button>
            <Plus className="h-4 w-4" /> Thêm sản phẩm
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-warm-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-warm-200 p-4">
          <Search className="h-4 w-4 text-coffee-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm..."
            className="flex-1 bg-transparent text-sm text-coffee-900 placeholder-coffee-400 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-coffee-500">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-coffee-500">Không có sản phẩm.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-50 text-xs uppercase tracking-wider text-coffee-600">
                <tr>
                  <th className="px-4 py-3 text-left">Sản phẩm</th>
                  <th className="px-4 py-3 text-left">Giá</th>
                  <th className="px-4 py-3 text-left">Kho</th>
                  <th className="px-4 py-3 text-left">Đánh giá</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-200">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-cream-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-cream-100">
                          {p.images?.[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-coffee-400">
                              ☕
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            to={`/admin/products/${p.id}/edit`}
                            className="font-medium text-coffee-900 hover:text-amber-700"
                          >
                            {p.name}
                          </Link>
                          <p className="text-xs text-coffee-500">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-coffee-900">
                        {formatVND(p.salePrice || p.price)}
                      </div>
                      {p.salePrice && p.salePrice < p.price && (
                        <div className="text-xs text-coffee-400 line-through">
                          {formatVND(p.price)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {p.stock > 0 ? `${p.stock}` : 'Hết hàng'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-amber-600">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="font-medium">{p.rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-xs text-coffee-500">({p.reviewCount || 0})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.isFeatured && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">
                            Nổi bật
                          </span>
                        )}
                        {p.isNewArrival && (
                          <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                            Mới
                          </span>
                        )}
                        {p.isBestSeller && (
                          <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                            Bán chạy
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/products/${p.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(p.id, p.name)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
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
