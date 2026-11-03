import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { productApi } from '@/lib/api';
import type { Product } from '@/types';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const term = query.trim();

    if (!term) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await productApi.getAll({ search: term, limit: 48 });
        if (cancelled) return;
        const list = (data?.products ?? []) as Product[];
        setResults(list);
      } catch (err) {
        console.error('Search failed:', err);
        if (!cancelled) {
          setResults([]);
          setError('Không tải được kết quả tìm kiếm. Vui lòng thử lại.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query]);

  const handleChange = (value: string) => {
    const next = new URLSearchParams(params);
    if (value.trim()) next.set('q', value.trim());
    else next.delete('q');
    setParams(next, { replace: true });
  };

  return (
    <div className="container mx-auto px-4 py-10 lg:px-8">
      <h1 className="font-display text-3xl font-bold">
        {query ? `Kết quả cho "${query}"` : 'Tìm kiếm'}
      </h1>
      <p className="mb-8 mt-2 text-coffee-700 dark:text-cream-300">
        {loading ? 'Đang tìm kiếm...' : `${results.length} sản phẩm`}
      </p>

      <div className="mb-8 max-w-md">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>
      )}

      {!loading && !error && query && results.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-300 py-16 text-center">
          <p className="mb-2 text-lg font-semibold text-stone-700">
            Không tìm thấy sản phẩm nào
          </p>
          <p className="text-stone-500">Thử tìm với từ khóa khác, ví dụ: "cà phê", "đà lạt"</p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
