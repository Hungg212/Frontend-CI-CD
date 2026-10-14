import { CheckCircle2 } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';

export default function OrderSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-600" />
      <h1 className="mb-2 font-display text-3xl font-bold">Order placed!</h1>
      <p className="mb-6 text-coffee-700 dark:text-cream-300">
        Thanks for your purchase. We'll email you tracking information shortly.
      </p>
      <LinkButton to="/profile/orders">View Your Orders</LinkButton>
    </div>
  );
}
