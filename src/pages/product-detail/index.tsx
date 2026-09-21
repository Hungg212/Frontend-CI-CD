import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  Package,
  Award,
  ShoppingCart,
} from 'lucide-react';
import { productService } from '@/services/productService';
import { getReviewsByProduct } from '@/data/products';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { useCartStore } from '@/stores/cartStore';
import type { Product, Review } from '@/types';
import { RatingDisplay } from '@/components/ui/Rating';

const formatPrice = (price: number): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const addProduct = useCartStore((s) => s.addProduct);

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setActiveImage(0);
    setQuantity(1);
    productService
      .getProductBySlug(slug)
      .then((p) => {
        setProduct(p ?? null);
        if (p) {
          productService.getRelatedProducts(p.id, 4).then(setRelatedProducts);
          setReviews(getReviewsByProduct(p.id));
        }
        setLoading(false);
        window.scrollTo({ top: 0 });
      })
      .catch(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-zinc-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-700 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-zinc-900">
        <div className="text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-stone-300" />
          <h2 className="mb-2 text-2xl font-bold">Sản phẩm không tồn tại</h2>
          <Button onClick={() => navigate('/products')}>Xem tất cả sản phẩm</Button>
        </div>
      </div>
    );
  }

  const hasDiscount = product.salePrice !== undefined && product.salePrice > 0;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.salePrice ?? 0)) / product.price) * 100)
    : 0;
  const salePrice = product.salePrice ?? product.price;

  const handleAddToCart = () => {
    addProduct(product, quantity);
  };

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
            <Link to={`/category/${product.categorySlug}`} className="hover:text-amber-700">
              {product.category}
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-stone-800 dark:text-stone-200">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div
              className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl bg-stone-100 dark:bg-zinc-800"
              onClick={() => setZoom(!zoom)}
            >
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {hasDiscount && (
                <Badge variant="sale" className="absolute left-4 top-4">
                  -{discountPercent}%
                </Badge>
              )}
              {product.isNewArrival && (
                <Badge variant="new" className="absolute left-4 top-4 mt-8">
                  MỚI
                </Badge>
              )}
              {product.isBestSeller && (
                <Badge variant="bestseller" className="absolute right-4 top-4">
                  BÁN CHẠY
                </Badge>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      idx === activeImage ? 'border-amber-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="mb-1 text-sm font-medium text-amber-700 dark:text-amber-500">
                {product.category}
              </p>
              <h1 className="mb-3 text-3xl font-bold text-stone-900 md:text-4xl dark:text-stone-100">
                {product.name}
              </h1>
              <RatingDisplay value={product.rating} count={product.reviewCount} />
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-amber-700 dark:text-amber-500">
                {formatPrice(salePrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-stone-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <Badge variant="sale">-{discountPercent}%</Badge>
                </>
              )}
            </div>

            <p className="leading-relaxed text-stone-600 dark:text-stone-300">
              {product.shortDescription}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-amber-700" />
                <span className="text-sm">Giao hàng nhanh 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-700" />
                <span className="text-sm">Bảo hành chất lượng</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-amber-700" />
                <span className="text-sm">Đổi trả 30 ngày</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-700" />
                <span className="text-sm">100% nguyên chất</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Khối lượng: <span className="font-normal">{product.weight}</span>
              </p>
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Độ rang: <span className="font-normal">{product.roastLevel}</span>
              </p>
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Hương vị: <span className="font-normal">{product.flavorNotes.join(', ')}</span>
              </p>
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Xuất xứ: <span className="font-normal">{product.origin}</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={Math.min(product.stock, 10)}
              />
              <span
                className={`text-sm ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}
              >
                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
              </span>
            </div>

            <div className="flex gap-3">
              <Button size="lg" onClick={handleAddToCart} disabled={product.stock === 0}>
                <ShoppingCart className="h-5 w-5" />
                Thêm vào giỏ hàng
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Mô tả</TabsTrigger>
            <TabsTrigger value="specs">Thông số</TabsTrigger>
            <TabsTrigger value="reviews">Đánh giá ({product.reviewCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
              <h2 className="mb-4 text-xl font-bold">Mô tả sản phẩm</h2>
              <p className="whitespace-pre-line leading-relaxed text-stone-600 dark:text-stone-300">
                {product.description}
              </p>
              <h3 className="mb-3 mt-6 text-lg font-semibold">Pha chế</h3>
              <div className="flex flex-wrap gap-2">
                {product.brewingMethod.map((method) => (
                  <Badge key={method} variant="secondary">
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs">
            <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
              <h2 className="mb-4 text-xl font-bold">Thông số kỹ thuật</h2>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-stone-100 dark:divide-zinc-700">
                  <tr>
                    <td className="w-1/3 py-2 font-medium">Tên sản phẩm</td>
                    <td className="py-2">{product.name}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">SKU</td>
                    <td className="py-2">{product.sku}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Khối lượng</td>
                    <td className="py-2">{product.weight}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Độ rang</td>
                    <td className="py-2">{product.roastLevel}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Hương vị</td>
                    <td className="py-2">{product.flavorNotes.join(', ')}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Xuất xứ</td>
                    <td className="py-2">{product.origin}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Danh mục</td>
                    <td className="py-2">{product.category}</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Tồn kho</td>
                    <td className="py-2">{product.stock}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
              <h2 className="mb-4 text-xl font-bold">Đánh giá sản phẩm</h2>
              {reviews.length === 0 ? (
                <p className="py-8 text-center text-stone-500">Chưa có đánh giá nào.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-stone-100 pb-4 dark:border-zinc-700"
                    >
                      <RatingDisplay value={review.rating} size="sm" />
                      <p className="mt-1 font-medium">{review.userName}</p>
                      <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                        {review.comment}
                      </p>
                      <p className="mt-1 text-xs text-stone-400">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} onAddToCart={(prod) => addProduct(prod, 1)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
