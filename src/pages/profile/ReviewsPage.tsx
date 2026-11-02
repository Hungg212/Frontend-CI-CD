import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';

interface MyReview {
  id: string;
  productId: string;
  productName: string | null;
  productSlug: string | null;
  productImage: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { dateStyle: 'medium' });

export default function ReviewsPage() {
  const token = useAuthStore((s) => s.token) || '';
  const notify = useNotificationStore();
  const [items, setItems] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/reviews', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Tải đánh giá thất bại');
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        notify.error('Lỗi', e instanceof Error ? e.message : 'Không thể tải đánh giá');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">Đánh giá của tôi</h2>

      {loading ? (
        <p className="py-8 text-center text-sm text-stone-500">Đang tải đánh giá...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-coffee-700 dark:text-cream-300">
          Bạn chưa đánh giá sản phẩm nào.{' '}
          <Link to="/products" className="text-coffee-700 underline dark:text-cream-300">
            Khám phá sản phẩm
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          {items.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-warm-200 bg-white p-4 shadow-sm dark:border-coffee-800 dark:bg-coffee-900"
            >
              <div className="mb-2 flex items-start gap-3">
                {r.productImage && (
                  <img
                    src={r.productImage}
                    alt={r.productName || ''}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      to={r.productSlug ? `/products/${r.productSlug}` : '/products'}
                      className="font-semibold text-coffee-800 hover:underline dark:text-cream-300"
                    >
                      {r.productName || 'Sản phẩm'}
                    </Link>
                    <span className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < r.rating
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">{formatDate(r.createdAt)}</p>
                </div>
              </div>
              {r.comment && (
                <p className="text-sm text-stone-700 dark:text-stone-300">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
