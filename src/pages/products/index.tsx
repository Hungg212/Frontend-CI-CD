import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { categories } from '@/data/categories';
import { productService } from '@/services/productService';
import { ProductCard } from '@/components/product/ProductCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import type { Product, FilterOptions } from '@/types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá: Thấp → Cao' },
  { value: 'price_desc', label: 'Giá: Cao → Thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
  { value: 'bestseller', label: 'Bán chạy nhất' },
];

const ITEMS_PER_PAGE = 12;

const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState<FilterOptions['sortBy']>('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState<number | undefined>();

  const addProduct = useCartStore((s) => s.addProduct);

  useEffect(() => {
    setLoading(true);
    productService.getProducts({ sortBy: 'newest' }).then((res) => {
      setAllProducts(res);
      setLoading(false);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    let result = allProducts;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p: Product) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (category) result = result.filter((p: Product) => p.categorySlug === category);
    if (minPrice) result = result.filter((p: Product) => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter((p: Product) => p.price <= Number(maxPrice));
    if (minRating) result = result.filter((p: Product) => p.rating >= minRating);

    switch (sortBy) {
      case 'price_asc':
        return [...result].sort((a, b) => a.price - b.price);
      case 'price_desc':
        return [...result].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...result].sort((a, b) => b.rating - a.rating);
      case 'bestseller':
        return [...result].sort((a, b) => b.reviewCount - a.reviewCount);
      default:
        return [...result].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  }, [allProducts, search, category, sortBy, minPrice, maxPrice, minRating]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginated = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-900">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              type="search"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="h-4 w-4" />}
              className="flex-1"
            />
            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-700"
              >
                <option value="">Tất cả</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={sortBy ?? 'newest'}
                onChange={(e) => setSortBy(e.target.value as FilterOptions['sortBy'])}
                className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-700"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <p className="mb-6 text-sm text-stone-500 dark:text-stone-400">
          Tìm thấy{' '}
          <strong className="text-amber-700 dark:text-amber-500">{filteredProducts.length}</strong>{' '}
          sản phẩm
        </p>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl bg-white dark:bg-zinc-800" />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-20 text-center">
            <p className="mb-4 text-stone-500">Không tìm thấy sản phẩm nào.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setCategory('');
                setMinPrice('');
                setMaxPrice('');
                setMinRating(undefined);
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {paginated.map((product: Product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => addProduct(p, 1)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`h-10 min-w-[40px] rounded-lg px-3 text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-amber-700 text-white'
                        : 'border border-stone-200 bg-white hover:bg-stone-50 dark:border-zinc-700 dark:bg-zinc-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
