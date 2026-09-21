import { useCartStore } from '@/stores/cartStore';
import CartItem from '@/components/cart/CartItem';
import { ShoppingBag } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-coffee-300" />
        <h1 className="mb-2 font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mb-6 text-coffee-700 dark:text-cream-300">
          Start adding some brews to your cart.
        </p>
        <LinkButton to="/products">Browse Products</LinkButton>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 lg:px-8">
      <h1 className="mb-6 font-display text-3xl font-bold">Your Cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}
        </div>
        <aside className="h-fit rounded-xl border border-warm-200 bg-cream-100 p-6 dark:border-coffee-800 dark:bg-coffee-900">
          <h2 className="mb-4 font-display text-xl font-semibold">Summary</h2>
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <LinkButton to="/checkout" fullWidth className="mt-4">
            Proceed to Checkout
          </LinkButton>
        </aside>
      </div>
    </div>
  );
}
