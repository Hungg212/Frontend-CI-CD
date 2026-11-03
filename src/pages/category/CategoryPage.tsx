import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { productApi, categoryApi } from '@/lib/api';
import type { Product } from '@/types';

interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!slug) return;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [cat, data] = await Promise.all([
          categoryApi.getBySlug(slug).catch(() => null),
          productApi.getAll({ category: slug, limit: 48 }),
        ]);
        if (cancelled) return;
        setCategory(cat as CategoryInfo | null);
        setProducts((data?.products ?? []) as Product[]);
      } catch (err) {
        console.error('Category load failed:', err);
        if (!cancelled) setError('Không tải được danh mục. Vui lòng thử lại.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="container mx-auto px-4 py-10 lg:px-8">
      <Link
        to="/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-coffee-600 hover:text-coffee-800"
      >
        <ChevronLeft className="h-4 w-4" /> Tất cả sản phẩm
      </Link>

      <h1 className="font-display text-3xl font-bold">{category?.name ?? slug}</h1>
      {category?.description && (
        <p className="mb-4 mt-2 max-w-2xl text-coffee-700 dark:text-cream-300">
          {category.description}
        </p>
      )}
      <p className="mb-8 mt-2 text-coffee-700 dark:text-cream-300">
        {loading ? 'Đang tải...' : `${products.length} sản phẩm`}
      </p>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-300 py-16 text-center">
          <p className="mb-2 text-lg font-semibold text-stone-700">Danh mục đang trống</p>
          <Link to="/products" className="text-coffee-600 hover:underline">
            Xem tất cả sản phẩm
          </Link>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
