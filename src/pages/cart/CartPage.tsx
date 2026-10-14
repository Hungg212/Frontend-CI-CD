import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-coffee-300" />
        <h1 className="mb-2 font-display text-3xl font-bold">Giỏ hàng trống</h1>
        <p className="mb-6 text-coffee-700 dark:text-cream-300">
          Hãy thêm sản phẩm vào giỏ hàng của bạn.
        </p>
        <LinkButton to="/products">Xem sản phẩm</LinkButton>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 lg:px-8">
      <h1 className="mb-6 font-display text-3xl font-bold">Giỏ hàng của bạn</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 border-b border-stone-200 pb-4">
              <Link
                to={`/products/${item.slug}`}
                className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100"
              >
                <img
                  src={item.imageUrl || ''}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </Link>
              <div className="flex-1">
                <Link
                  to={`/products/${item.slug}`}
                  className="font-medium text-stone-800 hover:text-amber-700"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-stone-500">
                  {item.weight || ''}
                </p>
                <p className="mt-1 font-semibold text-amber-700">
                  {formatPrice(item.price)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                <p className="mt-1 text-sm text-stone-500">x{item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
        <aside className="h-fit rounded-xl border border-warm-200 bg-cream-100 p-6 dark:border-coffee-800 dark:bg-coffee-900">
          <h2 className="mb-4 font-display text-xl font-semibold">Tổng cộng</h2>
          <div className="flex justify-between text-sm">
            <span>Tạm tính</span>
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </div>
          <LinkButton to="/checkout" fullWidth className="mt-4">
            Thanh toán
          </LinkButton>
        </aside>
      </div>
    </div>
  );
}
