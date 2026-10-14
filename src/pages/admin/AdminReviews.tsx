import { useEffect, useState } from 'react';
import { Star, Trash2, MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { Button } from '@/components/ui';

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: string;
  productId: string;
  productName?: string;
}

export default function AdminReviews() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((s) => s.token) || '';
  const notify = useNotificationStore();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Tải đánh giá thất bại');
      const data: Review[] | { reviews: Review[] } = await res.json();
      setItems(Array.isArray(data) ? data : (data as { reviews: Review[] }).reviews || []);
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

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa đánh giá này?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Xóa thất bại');
      notify.success('Đã xóa đánh giá', '');
      load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Không thể xóa';
      notify.error('Lỗi', msg);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-coffee-900">Đánh giá</h1>
        <p className="text-sm text-coffee-600">Quản lý đánh giá từ khách hàng</p>
      </div>

      <div className="rounded-xl border border-warm-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-coffee-500">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-coffee-500">Chưa có đánh giá nào.</div>
        ) : (
          <div className="divide-y divide-warm-200">
            {items.map((r) => (
              <div key={r.id} className="flex gap-4 p-5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <MessageCircle className="h-5 w-5 text-amber-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-coffee-900">{r.userName}</div>
                      <div className="text-xs text-coffee-500">
                        {new Date(r.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(r.id)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {r.productName && (
                    <div className="mt-1 text-xs text-coffee-600">Sản phẩm: {r.productName}</div>
                  )}
                  <div className="mt-2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < r.rating ? 'fill-amber-500 text-amber-500' : 'text-coffee-200'}`}
                      />
                    ))}
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-coffee-700">{r.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
