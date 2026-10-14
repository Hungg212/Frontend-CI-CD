import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Coffee, Star, Truck, Shield, Award, Minus, Plus, ShoppingCart, Heart } from 'lucide-react';
import { productApi } from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import { Button, Spinner } from '@/components/ui';

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice?: number;
  discount?: number;
  categorySlug: string;
  category: string;
  images: string[];
  imageUrl: string;
  rating: number;
  reviewCount: number;
  stock: number;
  origin?: string;
  roastLevel?: string;
  flavorNotes?: string[];
  brewingMethod?: string[];
  weight?: string;
  sku?: string;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetch = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const p = (await productApi.getBySlug(slug)) as ProductDetail;
        setProduct(p);
        const r = (await productApi.getReviews(p.id)) as Review[];
        setReviews(r);
        setError(null);
      } catch (e) {
        setError('Không tìm thấy sản phẩm hoặc backend chưa sẵn sàng');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    setActiveImage(0);
    setQuantity(1);
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Coffee className="mx-auto h-16 w-16 text-coffee-300" />
        <h2 className="mt-4 font-display text-2xl font-bold text-coffee-900">
          {error || 'Không tìm thấy sản phẩm'}
        </h2>
        <Button className="mt-6" onClick={() => navigate('/products')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const finalPrice = product.salePrice || product.price;
  const images = product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : [];

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: images[0] || '',
      price: finalPrice,
    }, quantity);
  };

  const handleBuyNow = () => {
    handleAdd();
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-warm-200 bg-cream-50">
        <div className="container mx-auto px-4 py-3 text-sm text-coffee-600 lg:px-8">
          <Link to="/" className="hover:text-amber-700">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link to={`/products?category=${product.categorySlug}`} className="hover:text-amber-700">
            {product.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-coffee-900">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 lg:px-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Images */}
          <div>
            <div className="aspect-square overflow-hidden rounded-2xl border border-warm-200 bg-white">
              {images[activeImage] ? (
                <img src={images[activeImage]} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Coffee className="h-24 w-24 text-coffee-300" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                      idx === activeImage ? 'border-amber-600' : 'border-warm-200'
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <span className="inline-block rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold uppercase text-coffee-700">
              {product.category}
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold text-coffee-900 lg:text-4xl">
              {product.name}
            </h1>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.round(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-coffee-200'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-coffee-600">
                {product.rating?.toFixed(1)} ({product.reviewCount} đánh giá)
              </span>
              <span className="text-coffee-300">|</span>
              <span className={`text-sm ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-amber-700">
                {formatPrice(finalPrice)}
              </span>
              {product.salePrice && product.salePrice < product.price && (
                <>
                  <span className="text-lg text-coffee-400 line-through">{formatPrice(product.price)}</span>
                  <span className="rounded bg-red-100 px-2 py-0.5 text-sm font-semibold text-red-600">
                    -{product.discount || Math.round((1 - product.salePrice / product.price) * 100)}%
                  </span>
                </>
              )}
            </div>

            <p className="mt-4 leading-relaxed text-coffee-700">{product.shortDescription}</p>

            {/* Quantity + Add */}
            <div className="mt-8 flex items-center gap-4">
              <span className="text-sm font-medium text-coffee-900">Số lượng:</span>
              <div className="flex items-center rounded-lg border border-warm-200">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-coffee-700 hover:bg-cream-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center text-coffee-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-2 text-coffee-700 hover:bg-cream-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={handleAdd} disabled={product.stock === 0} className="flex-1 gap-2">
                <ShoppingCart className="h-5 w-5" /> Thêm vào giỏ
              </Button>
              <Button size="lg" variant="outline" onClick={handleBuyNow} disabled={product.stock === 0} className="flex-1">
                Mua ngay
              </Button>
              <Button size="lg" variant="outline" aria-label="Yêu thích">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Specs */}
            {(product.origin || product.roastLevel || product.flavorNotes?.length) && (
              <div className="mt-8 rounded-xl border border-warm-200 bg-cream-50 p-6">
                <h3 className="font-semibold text-coffee-900">Thông tin chi tiết</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  {product.origin && (
                    <div className="flex">
                      <dt className="w-32 text-coffee-600">Xuất xứ</dt>
                      <dd className="text-coffee-900">{product.origin}</dd>
                    </div>
                  )}
                  {product.roastLevel && (
                    <div className="flex">
                      <dt className="w-32 text-coffee-600">Mức rang</dt>
                      <dd className="text-coffee-900">{product.roastLevel}</dd>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex">
                      <dt className="w-32 text-coffee-600">Khối lượng</dt>
                      <dd className="text-coffee-900">{product.weight}</dd>
                    </div>
                  )}
                  {product.sku && (
                    <div className="flex">
                      <dt className="w-32 text-coffee-600">SKU</dt>
                      <dd className="text-coffee-900">{product.sku}</dd>
                    </div>
                  )}
                  {product.flavorNotes && product.flavorNotes.length > 0 && (
                    <div className="flex">
                      <dt className="w-32 text-coffee-600">Hương vị</dt>
                      <dd className="text-coffee-900">{product.flavorNotes.join(', ')}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Service guarantees */}
            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-coffee-700">
              <div className="rounded-lg border border-warm-200 p-3">
                <Truck className="mx-auto h-5 w-5 text-amber-700" />
                <p className="mt-1">Giao hàng nhanh</p>
              </div>
              <div className="rounded-lg border border-warm-200 p-3">
                <Shield className="mx-auto h-5 w-5 text-amber-700" />
                <p className="mt-1">Thanh toán an toàn</p>
              </div>
              <div className="rounded-lg border border-warm-200 p-3">
                <Award className="mx-auto h-5 w-5 text-amber-700" />
                <p className="mt-1">Chất lượng cao</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <section className="mt-12 rounded-2xl border border-warm-200 bg-white p-6 lg:p-10">
          <h2 className="font-display text-2xl font-bold text-coffee-900">Mô tả sản phẩm</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-coffee-700">{product.description}</p>
        </section>

        {/* Reviews */}
        <section className="mt-8 rounded-2xl border border-warm-200 bg-white p-6 lg:p-10">
          <h2 className="font-display text-2xl font-bold text-coffee-900">
            Đánh giá ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <p className="mt-4 text-coffee-600">Chưa có đánh giá nào.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-lg border border-warm-200 p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-coffee-900">{r.userName}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < r.rating ? 'fill-amber-500 text-amber-500' : 'text-coffee-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="mt-2 text-coffee-700">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
