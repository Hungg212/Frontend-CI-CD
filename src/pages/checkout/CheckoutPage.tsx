import { useCartStore } from '@/stores/cartStore';
import { ShieldCheck } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getSubtotal());

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-4 font-display text-3xl font-bold">Nothing to check out</h1>
        <LinkButton to="/products">Browse Products</LinkButton>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 lg:px-8">
      <h1 className="mb-6 font-display text-3xl font-bold">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <form className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-warm-200 bg-cream-100 p-6 dark:border-coffee-800 dark:bg-coffee-900">
            <h2 className="mb-4 font-display text-xl font-semibold">Shipping address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="rounded-md border border-warm-300 px-3 py-2 dark:border-coffee-700 dark:bg-coffee-800"
                placeholder="Full name"
              />
              <input
                className="rounded-md border border-warm-300 px-3 py-2 dark:border-coffee-700 dark:bg-coffee-800"
                placeholder="Phone"
              />
              <input
                className="rounded-md border border-warm-300 px-3 py-2 sm:col-span-2 dark:border-coffee-700 dark:bg-coffee-800"
                placeholder="Address line 1"
              />
              <input
                className="rounded-md border border-warm-300 px-3 py-2 dark:border-coffee-700 dark:bg-coffee-800"
                placeholder="City"
              />
              <input
                className="rounded-md border border-warm-300 px-3 py-2 dark:border-coffee-700 dark:bg-coffee-800"
                placeholder="ZIP / Postal code"
              />
            </div>
          </section>
          <section className="rounded-xl border border-warm-200 bg-cream-100 p-6 dark:border-coffee-800 dark:bg-coffee-900">
            <h2 className="mb-4 font-display text-xl font-semibold">Payment</h2>
            <div className="flex items-center gap-2 text-sm text-coffee-700 dark:text-cream-300">
              <ShieldCheck className="h-4 w-4" /> Secured checkout
            </div>
          </section>
        </form>
        <aside className="h-fit rounded-xl border border-warm-200 bg-cream-100 p-6 dark:border-coffee-800 dark:bg-coffee-900">
          <h2 className="mb-4 font-display text-xl font-semibold">Order summary</h2>
          <div className="space-y-2 border-b border-warm-200 pb-4 text-sm dark:border-coffee-800">
            {items.map((i) => (
              <div key={i.product.id} className="flex justify-between">
                <span>
                  {i.product.name} × {i.quantity}
                </span>
                <span>${(i.product.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <LinkButton to="/order-success/demo" fullWidth className="mt-4">
            Place Order
          </LinkButton>
        </aside>
      </div>
    </div>
  );
}
