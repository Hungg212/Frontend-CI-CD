import React, { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Grid,
  Package,
} from 'lucide-react';
import { getCategoryBySlug } from '@/data/categories';
import { getProductsByCategory } from '@/data/products';
import type { FilterOptions } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Rating } from '@/components/ui/Rating';
import { useCartStore } from '@/stores/cartStore';
import type { Product } from '@/types';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá: Thấp → Cao' },
  { value: 'price_desc', label: 'Giá: Cao → Thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
  { value: 'bestseller', label: 'Bán chạy nhất' },
];

const ITEMS_PER_PAGE = 9;

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const addProduct = useCartStore((s) => s.addProduct);

  const category = slug ? getCategoryBySlug(slug) : undefined;
  const categoryProducts = slug ? getProductsByCategory(slug) : [];

  const [sortBy, setSortBy] = useState<FilterOptions['sortBy']>('newest');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState<number | undefined>();
  const [inStockOnly, setInStockOnly] = useState(false);

  const filteredProducts = useMemo(() => {
    let result = categoryProducts;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p: Product) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (minPrice) result = result.filter((p: Product) => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter((p: Product) => p.price <= Number(maxPrice));
    if (minRating !== undefined) result = result.filter((p: Product) => p.rating >= minRating);
    if (inStockOnly) result = result.filter((p: Product) => p.stock > 0);

    switch (sortBy) {
      case 'newest':
        return [...result].sort(
          (a: Product, b: Product) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'price_asc':
        return [...result].sort((a: Product, b: Product) => a.price - b.price);
      case 'price_desc':
        return [...result].sort((a: Product, b: Product) => b.price - a.price);
      case 'rating':
        return [...result].sort((a: Product, b: Product) => b.rating - a.rating);
      case 'bestseller':
        return [...result].sort((a: Product, b: Product) => b.reviewCount - a.reviewCount);
      default:
        return result;
    }
  }, [categoryProducts, searchTerm, minPrice, maxPrice, minRating, inStockOnly, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginated = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  React.useEffect(() => {
    setPage(1);
  }, [slug, searchTerm, sortBy, minPrice, maxPrice, minRating, inStockOnly]);

  const handleAddToCart = (product: Product) => {
    addProduct(product, 1);
  };

  if (!category) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-stone-300" />
          <h2 className="mb-2 text-2xl font-bold">Danh mục không tồn tại</h2>
          <Button onClick={() => navigate('/products')}>Xem tất cả sản phẩm</Button>
        </div>
      </div>
    );
  }

  const FilterContent: React.FC<{ onApply?: () => void }> = ({ onApply }) => (
    <div className="space-y-6">
      <Input
        type="search"
        placeholder="Tìm trong danh mục..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
      />
      <div>
        <h3 className="mb-3 font-semibold text-stone-800 dark:text-stone-100">Khoảng giá</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Từ"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Đến"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-semibold text-stone-800 dark:text-stone-100">Đánh giá</h3>
        <div className="space-y-2">
          {([5, 4, 3, 2, 1] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setMinRating(minRating === r ? undefined : r)}
              className={`flex w-full items-center gap-2 rounded-lg p-2 ${
                minRating === r
                  ? 'bg-amber-50 dark:bg-amber-900/20'
                  : 'hover:bg-stone-50 dark:hover:bg-zinc-700'
              }`}
            >
              <Rating value={r} size="sm" />
              <span className="text-sm">trở lên</span>
            </button>
          ))}
        </div>
      </div>
      <label className="flex cursor-pointer items-center justify-between rounded-lg bg-stone-50 p-3 dark:bg-zinc-700">
        <span className="text-sm font-medium">Chỉ còn hàng</span>
        <button
          type="button"
          onClick={() => setInStockOnly(!inStockOnly)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            inStockOnly ? 'bg-amber-600' : 'bg-stone-300 dark:bg-zinc-600'
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${inStockOnly ? 'translate-x-5' : ''}`}
          />
        </button>
      </label>
      <div className="flex gap-2 border-t border-stone-200 pt-4 dark:border-zinc-700">
        <Button
          variant="outline"
          fullWidth
          onClick={() => {
            setSearchTerm('');
            setMinPrice('');
            setMaxPrice('');
            setMinRating(undefined);
            setInStockOnly(false);
          }}
        >
          Xóa bộ lọc
        </Button>
        {onApply && (
          <Button variant="primary" fullWidth onClick={onApply}>
            Áp dụng
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-900">
      {/* Breadcrumb */}
      <div className="border-b border-stone-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
            <Link to="/" className="hover:text-amber-700">
              Trang chủ
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/products" className="hover:text-amber-700">
              Sản phẩm
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-stone-800 dark:text-stone-200">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Category Banner */}
      <div className="relative h-64 overflow-hidden md:h-80">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${category.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="container relative z-10 mx-auto flex h-full items-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl text-white"
          >
            <h1 className="mb-3 text-3xl font-bold md:text-5xl">{category.name}</h1>
            <p className="text-stone-200 md:text-lg">{category.description}</p>
            <p className="mt-2 text-sm text-amber-300">{category.productCount} sản phẩm</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-xl border border-stone-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold text-stone-800 dark:text-stone-100">
                  <SlidersHorizontal className="h-5 w-5" />
                  Bộ lọc
                </h2>
              </div>
              <FilterContent />
            </div>
          </aside>

          <div>
            <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDrawerOpen(true)}
                  className="lg:hidden"
                  leftIcon={<Filter className="h-4 w-4" />}
                >
                  Bộ lọc
                </Button>
                <p className="text-sm text-stone-600 dark:text-stone-300">
                  Tìm thấy{' '}
                  <strong className="text-amber-700 dark:text-amber-500">
                    {filteredProducts.length}
                  </strong>{' '}
                  sản phẩm
                </p>
              </div>
              <select
                value={sortBy ?? 'newest'}
                onChange={(e) => setSortBy(e.target.value as FilterOptions['sortBy'])}
                className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-700"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {paginated.length === 0 ? (
              <div className="rounded-xl border border-stone-200 bg-white py-20 text-center dark:border-zinc-700 dark:bg-zinc-800">
                <Grid className="mx-auto mb-4 h-16 w-16 text-stone-300 dark:text-zinc-700" />
                <h3 className="mb-2 text-xl font-semibold text-stone-700 dark:text-stone-200">
                  Không có sản phẩm phù hợp
                </h3>
                <p className="mb-6 text-stone-500 dark:text-stone-400">Thử điều chỉnh bộ lọc</p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSearchTerm('');
                    setMinPrice('');
                    setMaxPrice('');
                    setMinRating(undefined);
                    setInStockOnly(false);
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                  {paginated.map((product: Product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                      leftIcon={<ChevronLeft className="h-4 w-4" />}
                    >
                      Trước
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`h-9 min-w-[40px] rounded-lg px-3 text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-amber-700 text-white'
                            : 'border border-stone-200 bg-white hover:bg-stone-50 dark:border-zinc-700 dark:bg-zinc-800'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === totalPages}
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto bg-white lg:hidden dark:bg-zinc-900">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Filter className="h-5 w-5" />
                Bộ lọc
              </h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5">
              <FilterContent onApply={() => setDrawerOpen(false)} />
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default CategoryPage;
