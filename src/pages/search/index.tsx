import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, SlidersHorizontal, ChevronRight, Package, Sparkles } from 'lucide-react';
import { categories } from '@/data/categories';
import { productService, type SortOption } from '@/services/productService';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import type { Product } from '@/data/products';

const POPULAR_SEARCHES = ['Arabica Cầu Đất', 'Robusta', 'Cà phê hữu cơ', 'Espresso', 'Mokka'];

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const addProduct = useCartStore((state) => state.addProduct);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [appliedQuery, setAppliedQuery] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    productService.getAll().then((res) => {
      setAllProducts(res);
      setLoading(false);
    });
  }, []);

  const results = useMemo(() => {
    if (!appliedQuery.trim()) return [];
    const q = appliedQuery.toLowerCase();
    let result = allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.flavorNotes.some((note) => note.toLowerCase().includes(q))
    );

    if (categoryFilter) {
      result = result.filter((p) => p.categorySlug === categoryFilter);
    }

    switch (sortBy) {
      case 'newest':
        return [...result].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'price_asc':
        return [...result].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
      case 'price_desc':
        return [...result].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
      case 'rating':
        return [...result].sort((a, b) => b.rating - a.rating);
      case 'bestseller':
        return [...result].sort((a, b) => b.reviewCount - a.reviewCount);
      default:
        return result;
    }
  }, [allProducts, appliedQuery, categoryFilter, sortBy]);

  const handleSearch = () => {
    setAppliedQuery(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    setAppliedQuery('');
    setCategoryFilter('');
  };

  const handleAddToCart = (product: Product) => {
    addProduct(product, 1);
  };

  const handleToggleWishlist = (product: Product) => {
    toggleWishlist(product);
  };

  const popularSuggestions = POPULAR_SEARCHES.filter(
    (s) => appliedQuery && s.toLowerCase().includes(appliedQuery.toLowerCase())
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
            <span className="font-medium text-stone-800 dark:text-stone-200">Tìm kiếm</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 py-8 text-white">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">Tìm Kiếm Sản Phẩm</h1>
          <div className="flex max-w-2xl gap-2">
            <Input
              type="search"
              placeholder="Tìm kiếm cà phê..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              leftIcon={<Search className="h-5 w-5" />}
              rightIcon={
                searchTerm ? (
                  <button type="button" onClick={() => setSearchTerm('')} aria-label="Xóa">
                    <X className="h-5 w-5 hover:text-stone-600" />
                  </button>
                ) : undefined
              }
              className="bg-white text-stone-900"
            />
            <Button
              variant="primary"
              size="lg"
              onClick={handleSearch}
              className="border-2 border-white bg-amber-900 hover:bg-amber-950"
            >
              Tìm
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {appliedQuery && (
          <div className="mb-6">
            <p className="text-stone-700 dark:text-stone-200">
              Kết quả tìm kiếm cho:{' '}
              <strong className="text-amber-700 dark:text-amber-500">"{appliedQuery}"</strong> (
              {loading ? '...' : `${results.length} kết quả`})
            </p>
          </div>
        )}

        {!appliedQuery && (
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-stone-800 dark:text-stone-100">
              <Sparkles className="h-5 w-5 text-amber-600" />
              Tìm kiếm phổ biến
            </h2>
            <div className="mb-8 flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSearchTerm(s);
                    setAppliedQuery(s);
                  }}
                  className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm transition-colors hover:border-amber-600 hover:text-amber-700 dark:border-zinc-700 dark:bg-zinc-800"
                >
                  {s}
                </button>
              ))}
            </div>

            <h2 className="mb-4 text-xl font-bold text-stone-800 dark:text-stone-100">
              Khám phá danh mục
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="group overflow-hidden rounded-xl border border-stone-200 bg-white transition-all hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                >
                  <div className="aspect-square overflow-hidden bg-stone-100 dark:bg-zinc-700">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-100">
                      {cat.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {appliedQuery && (
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-xl border border-stone-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-semibold text-stone-800 dark:text-stone-100">
                    <SlidersHorizontal className="h-5 w-5" />
                    Lọc kết quả
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-stone-700 dark:text-stone-200">
                      Danh mục
                    </h3>
                    <div className="space-y-2">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="category"
                          checked={!categoryFilter}
                          onChange={() => setCategoryFilter('')}
                          className="text-amber-600"
                        />
                        <span className="text-sm">Tất cả</span>
                      </label>
                      {categories.map((cat) => (
                        <label key={cat.id} className="flex cursor-pointer items-center gap-2">
                          <input
                            type="radio"
                            name="category"
                            checked={categoryFilter === cat.slug}
                            onChange={() => setCategoryFilter(cat.slug)}
                            className="text-amber-600"
                          />
                          <span className="text-sm">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <div>
              <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDrawerOpen(true)}
                  className="lg:hidden"
                >
                  Lọc kết quả
                </Button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-700"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá thấp → cao</option>
                  <option value="price_desc">Giá cao → thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square animate-pulse rounded-xl bg-white dark:bg-zinc-800"
                    />
                  ))}
                </div>
              ) : results.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-stone-200 bg-white py-20 text-center dark:border-zinc-700 dark:bg-zinc-800"
                >
                  <Package className="mx-auto mb-4 h-16 w-16 text-stone-300 dark:text-zinc-700" />
                  <h3 className="mb-2 text-xl font-semibold text-stone-700 dark:text-stone-200">
                    Không tìm thấy sản phẩm
                  </h3>
                  <p className="mb-6 text-stone-500 dark:text-stone-400">
                    Không có kết quả nào cho "{appliedQuery}". Thử từ khóa khác?
                  </p>
                  {popularSuggestions.length > 0 && (
                    <div className="mb-6">
                      <p className="mb-3 text-sm text-stone-600 dark:text-stone-400">Gợi ý:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {popularSuggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              setSearchTerm(s);
                              setAppliedQuery(s);
                            }}
                            className="rounded-full bg-amber-100 px-4 py-1.5 text-sm text-amber-800 transition-colors hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button variant="primary" onClick={handleClear}>
                    Xóa tìm kiếm
                  </Button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                  {results.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isInWishlist={isInWishlist(product.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto bg-white lg:hidden dark:bg-zinc-900">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="font-semibold">Lọc kết quả</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <h3 className="mb-2 font-medium">Danh mục</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="c-m"
                      checked={!categoryFilter}
                      onChange={() => setCategoryFilter('')}
                    />
                    <span className="text-sm">Tất cả</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="c-m"
                        checked={categoryFilter === cat.slug}
                        onChange={() => setCategoryFilter(cat.slug)}
                      />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button variant="primary" fullWidth onClick={() => setDrawerOpen(false)}>
                Áp dụng
              </Button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default SearchPage;
