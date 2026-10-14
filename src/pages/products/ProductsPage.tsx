import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Coffee, Star } from 'lucide-react';
import { productApi, categoryApi } from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import { Button, Spinner } from '@/components/ui';

interface Product {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  price: number;
  salePrice?: number;
  averageRating?: number;
  reviewCount?: number;
  stock: number;
  category?: { name: string; slug: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getAll() as Category[];
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productApi.getAll({
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
          sortBy,
          sortOrder,
          page: currentPage,
          limit: 12,
        }) as { products: Product[]; pagination: Pagination };
        setProducts(data.products);
        setPagination(data.pagination);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Backend đang ngủ, vui lòng đổi 30s rồi tải lại trang');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery, selectedCategory, sortBy, sortOrder, currentPage]);

  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    if (newParams.page === undefined && !newParams.page) {
      params.delete('page');
    }
    setSearchParams(params);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl || '',
      price: product.salePrice || product.price,
    });
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedCategory;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-warm-200 bg-cream-50 py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-coffee-900 lg:text-4xl">
            Sản phẩm
          </h1>
          <p className="mt-2 text-coffee-600">
            {pagination ? `${pagination.total} sản phẩm` : 'Đang tải...'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <div>
                <h3 className="mb-3 font-semibold text-coffee-900">Tìm kiếm</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Tên sản phẩm..."
                    value={searchQuery}
                    onChange={(e) => updateParams({ search: e.target.value, page: null })}
                    className="w-full rounded-lg border border-stone-300 py-2 pl-10 pr-4 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="mb-3 font-semibold text-coffee-900">Danh mục</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => updateParams({ category: null })}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                      !selectedCategory
                        ? 'bg-amber-100 text-amber-700'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    Tất cả
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateParams({ category: cat.slug })}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                        selectedCategory === cat.slug
                          ? 'bg-amber-100 text-amber-700'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="mb-3 font-semibold text-coffee-900">Sắp xếp</h3>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [by, order] = e.target.value.split('-');
                    updateParams({ sortBy: by, sortOrder: order });
                  }}
                  className="w-full rounded-lg border border-stone-300 py-2 px-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="createdAt-desc">Mới nhất</option>
                  <option value="createdAt-asc">Cũ nhất</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                  <option value="averageRating-desc">Đánh giá cao nhất</option>
                </select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full gap-2"
                >
                  <X className="h-4 w-4" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Mobile Filter Toggle */}
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <span className="text-sm text-coffee-600">
                {pagination && `${(currentPage - 1) * 12 + 1}-${Math.min(currentPage * 12, pagination.total)} của ${pagination.total}`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Bộ lọc
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-warm-200 bg-cream-50 p-8 text-center">
                <p className="text-amber-700">{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-xl border border-warm-200 bg-cream-50 p-12 text-center">
                <Coffee className="mx-auto h-16 w-16 text-coffee-300" />
                <h3 className="mt-4 font-display text-xl font-semibold text-coffee-900">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="mt-2 text-coffee-600">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="group overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm transition-all hover:shadow-coffee-lg"
                    >
                      <Link to={`/products/${product.slug}`} className="block">
                        <div className="relative aspect-square overflow-hidden bg-cream-100">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Coffee className="h-12 w-12 text-coffee-300" />
                            </div>
                          )}
                          {!product.stock && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                              <span className="rounded-lg bg-white px-3 py-1 text-sm font-medium">
                                Hết hàng
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-4">
                        {product.category && (
                          <p className="text-xs text-stone-500">{typeof product.category === 'string' ? product.category : (product.category as { name?: string }).name}</p>
                        )}
                        <Link to={`/products/${product.slug}`}>
                          <h3 className="mt-1 line-clamp-2 font-semibold text-coffee-900 transition-colors hover:text-amber-700">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="mt-2 flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          <span className="text-sm text-coffee-600">
                            {product.averageRating?.toFixed(1) || '0.0'} ({product.reviewCount || 0})
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div>
                            <span className="text-lg font-bold text-amber-700">
                              {formatPrice(product.salePrice || product.price)}
                            </span>
                            {product.salePrice && product.salePrice < product.price && (
                              <span className="ml-2 text-sm text-stone-400 line-through">
                                {formatPrice(product.price)}
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.stock}
                          >
                            Thêm
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => updateParams({ page: String(currentPage - 1) })}
                    >
                      Trước
                    </Button>
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let page = i + 1;
                      if (pagination.pages > 5) {
                        if (currentPage > 3) {
                          page = currentPage - 2 + i;
                          if (page > pagination.pages) page = pagination.pages - 4 + i;
                        }
                      }
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? undefined : 'outline'}
                          size="sm"
                          onClick={() => updateParams({ page: String(page) })}
                          className={currentPage === page ? 'bg-coffee-700' : ''}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === pagination.pages}
                      onClick={() => updateParams({ page: String(currentPage + 1) })}
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
    </div>
  );
}
