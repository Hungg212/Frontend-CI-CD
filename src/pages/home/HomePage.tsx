import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Coffee, Star, Truck, Shield, Award } from 'lucide-react';
import { productApi, categoryApi } from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import { Button, Spinner } from '@/components/ui';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  productCount: number;
}

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
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesData, featuredData] = await Promise.all([
          categoryApi.getAll() as Promise<Category[]>,
          productApi.getFeatured() as Promise<Product[]>,
        ]);
        setCategories(categoriesData.slice(0, 4));
        setFeaturedProducts(featuredData.slice(0, 8));
        setError(null);
      } catch (err) {
        console.error('Failed to fetch home data:', err);
        setError('Backend đang ngủ, vui lòng đợi 30s rồi tải lại trang');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl || '',
      price: product.salePrice || product.price,
    });
  };

  const testimonials = [
    {
      name: 'Nguyễn Thị Lan',
      avatar: 'https://i.pravatar.cc/100?img=1',
      rating: 5,
      comment: 'Cà phê ngon nhất từ trước đến giờ! Đã thử nhiều loại nhưng Coffee Home Blend là số 1.',
    },
    {
      name: 'Trần Minh Đức',
      avatar: 'https://i.pravatar.cc/100?img=3',
      rating: 5,
      comment: 'Giao hàng nhanh, đóng gói cẩn thận. Hạt cà phê rang mộc Cầu Đất tuyệt vời!',
    },
    {
      name: 'Lê Hoàng Nam',
      avatar: 'https://i.pravatar.cc/100?img=5',
      rating: 5,
      comment: 'Đặt làm quà tặng đối tác, rất sang trọng và ý nghĩa. Khách hàng rất hài lòng!',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cream-50 via-white to-amber-50 py-16 lg:py-24">
        <div className="absolute inset-0 opacity-5">
          <img src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1920&q=50" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-coffee-700 shadow-sm">
                <Coffee className="h-3.5 w-3.5" /> Small-batch roasters
              </span>
              <h1 className="text-4xl font-display font-bold leading-tight text-coffee-900 lg:text-6xl">
                Brew your perfect cup, delivered to your door.
              </h1>
              <p className="text-lg text-coffee-700">
                Hạt cà phê nguyên chất từ những vùng trồng nổi tiếng Việt Nam. 
                Hương vị đậm đà, tinh túy từng ly.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/products">
                  <Button size="lg" className="gap-2">
                    Mua sắm ngay <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/products?category=ca-phe-hat">
                  <Button size="lg" variant="outline" className="gap-2">
                    Khám phá hạt cà phê
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl shadow-coffee-lg lg:aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&h=800&q=85"
                  alt="Coffee beans"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="rounded-xl bg-white/95 p-4 backdrop-blur-sm">
                    <p className="font-display text-lg font-bold text-coffee-900">☕ Hạt cà phê đặc sản</p>
                    <p className="text-sm text-coffee-600">Từ vùng Cầu Đất, Buôn Ma Thuột</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-amber-400 opacity-50 blur-2xl" />
              <div className="absolute -top-4 -left-4 h-32 w-32 rounded-full bg-amber-200 opacity-40 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y border-warm-200 bg-cream-50 py-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { icon: Coffee, title: '100% Nguyên chất', desc: 'Cà phê nguyên chất, không pha tạp' },
              { icon: Truck, title: 'Giao hàng nhanh', desc: 'Ship toàn quốc, free từ 500K' },
              { icon: Shield, title: 'Thanh toán an toàn', desc: 'Bảo mật 100%' },
              { icon: Award, title: 'Chất lượng cao', desc: 'Được kiểm định kỹ lưỡng' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                  <feature.icon className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-coffee-900">{feature.title}</h3>
                  <p className="text-sm text-coffee-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-coffee-900 lg:text-4xl">
              Danh mục nổi bật
            </h2>
            <p className="mt-3 text-coffee-600">
              Khám phá các loại cà phê đa dạng của chúng tôi
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-warm-200 bg-cream-50 p-8 text-center">
              <p className="text-amber-700">{error}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.slug}`}
                  className="group overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm transition-all hover:shadow-coffee-lg"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-cream-100">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Coffee className="h-12 w-12 text-coffee-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-semibold text-coffee-900 group-hover:text-amber-700">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-sm text-coffee-600">
                      {category.productCount} sản phẩm
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-cream-50 py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-coffee-900 lg:text-4xl">
                Sản phẩm nổi bật
              </h2>
              <p className="mt-3 text-coffee-600">
                Những loại cà phê được yêu thích nhất
              </p>
            </div>
            <Link
              to="/products"
              className="hidden items-center gap-2 text-amber-700 hover:text-amber-800 sm:flex"
            >
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-warm-200 bg-white p-8 text-center">
              <p className="text-amber-700">{error}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
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
                    <Link to={`/products/${product.slug}`}>
                      <h3 className="line-clamp-2 font-semibold text-coffee-900 transition-colors hover:text-amber-700">
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
                        className="gap-1"
                      >
                        <Coffee className="h-4 w-4" />
                        Thêm
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800"
            >
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-coffee-900 lg:text-4xl">
              Khách hàng nói gì về chúng tôi
            </h2>
            <p className="mt-3 text-coffee-600">
              Đánh giá từ những người đã trải nghiệm sản phẩm
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-warm-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-coffee-900">{testimonial.name}</h4>
                    <div className="flex gap-0.5">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-coffee-700">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-coffee-700 py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center lg:px-8">
          <h2 className="font-display text-3xl font-bold text-white lg:text-4xl">
            Sẵn sàng thưởng thức?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-coffee-200">
            Đăng ký ngay hôm nay để nhận ưu đãi 10% cho đơn hàng đầu tiên
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/register">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-coffee-700">
                Đăng ký ngay
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" className="bg-amber-600 text-white hover:bg-amber-700">
                Mua sắm ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
