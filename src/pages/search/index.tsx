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
    productService.getAll().then(res => {
      setAllProducts(res);
      setLoading(false);
    });
  }, []);

  const results = useMemo(() => {
    if (!appliedQuery.trim()) return [];
    const q = appliedQuery.toLowerCase();
    let result = allProducts.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.flavorNotes.some(note => note.toLowerCase().includes(q))
    );

    if (categoryFilter) {
      result = result.filter(p => p.categorySlug === categoryFilter);
    }

    switch (sortBy) {
      case 'newest':
        return [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  const popularSuggestions = POPULAR_SEARCHES.filter(s =>
    appliedQuery && s.toLowerCase().includes(appliedQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-zinc-800 border-b border-stone-200 dark:border-zinc-700">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <Link to="/" className="hover:text-amber-700">Trang chủ</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-stone-800 dark:text-stone-200 font-medium">Tìm kiếm</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Tìm Kiếm Sản Phẩm</h1>
          <div className="flex gap-2 max-w-2xl">
            <Input
              type="search"
              placeholder="Tìm kiếm cà phê..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              leftIcon={<Search className="w-5 h-5" />}
              rightIcon={
                searchTerm ? (
                  <button type="button" onClick={() => setSearchTerm('')} aria-label="Xóa">
                    <X className="w-5 h-5 hover:text-stone-600" />
                  </button>
                ) : undefined
              }
              className="bg-white text-stone-900"
            />
            <Button variant="primary" size="lg" onClick={handleSearch} className="bg-amber-900 hover:bg-amber-950 border-2 border-white">
              Tìm
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {appliedQuery && (
          <div className="mb-6">
            <p className="text-stone-700 dark:text-stone-200">
              Kết quả tìm kiếm cho: <strong className="text-amber-700 dark:text-amber-500">"{appliedQuery}"</strong>
              {' '}({loading ? '...' : `${results.length} kết quả`})
            </p>
          </div>
        )}

        {!appliedQuery && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-stone-800 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              Tìm kiếm phổ biến
            </h2>
            <div className="flex flex-wrap gap-2 mb-8">
              {POPULAR_SEARCHES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setSearchTerm(s); setAppliedQuery(s); }}
                  className="px-4 py-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-full hover:border-amber-600 hover:text-amber-700 text-sm transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            <h2 className="text-xl font-bold mb-4 text-stone-800 dark:text-stone-100">
              Khám phá danh mục
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="group bg-white dark:bg-zinc-800 rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-700 hover:shadow-lg transition-all"
                >
                  <div className="aspect-square bg-stone-100 dark:bg-zinc-700 overflow-hidden">
                    <img src={cat.image} alt={cat.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-3 text-center">
                    <p className="font-medium text-sm text-stone-800 dark:text-stone-100">{cat.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {appliedQuery && (
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            <aside className="hidden lg:block">
              <div className="bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 p-5 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5" />
                    Lọc kết quả
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm mb-2 text-stone-700 dark:text-stone-200">Danh mục</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          checked={!categoryFilter}
                          onChange={() => setCategoryFilter('')}
                          className="text-amber-600"
                        />
                        <span className="text-sm">Tất cả</span>
                      </label>
                      {categories.map(cat => (
                        <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
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
              <div className="flex items-center justify-between gap-3 mb-6 bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700 p-3">
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
                  onChange={e => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-1.5 text-sm bg-white dark:bg-zinc-700 border border-stone-200 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá thấp → cao</option>
                  <option value="price_desc">Giá cao → thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
                </select>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-white dark:bg-zinc-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : results.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-stone-200 dark:border-zinc-700"
                >
                  <Package className="w-16 h-16 mx-auto text-stone-300 dark:text-zinc-700 mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-stone-700 dark:text-stone-200">
                    Không tìm thấy sản phẩm
                  </h3>
                  <p className="text-stone-500 dark:text-stone-400 mb-6">
                    Không có kết quả nào cho "{appliedQuery}". Thử từ khóa khác?
                  </p>
                  {popularSuggestions.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
                        Gợi ý:
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {popularSuggestions.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => { setSearchTerm(s); setAppliedQuery(s); }}
                            className="px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full hover:bg-amber-200 transition-colors text-sm"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button variant="primary" onClick={handleClear}>Xóa tìm kiếm</Button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {results.map(product => (
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
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setDrawerOpen(false)} />
          <aside className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-zinc-900 z-50 lg:hidden overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-zinc-700 sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <h2 className="font-semibold">Lọc kết quả</h2>
              <button type="button" onClick={() => setDrawerOpen(false)} className="p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg" aria-label="Đóng">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Danh mục</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="c-m" checked={!categoryFilter} onChange={() => setCategoryFilter('')} />
                    <span className="text-sm">Tất cả</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2">
                      <input type="radio" name="c-m" checked={categoryFilter === cat.slug} onChange={() => setCategoryFilter(cat.slug)} />
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
