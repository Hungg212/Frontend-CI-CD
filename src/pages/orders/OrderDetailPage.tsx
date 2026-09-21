import { useParams } from 'react-router-dom';
import OrderTimeline from '@/components/orders/OrderTimeline';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { LinkButton } from '@/components/ui/Button';
import { useOrderStore } from '@/stores/orderStore';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orders = useOrderStore((s) => s.orders);
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-semibold">Order #{id}</h2>
        <p className="text-stone-500">Order not found.</p>
        <LinkButton to="/profile/orders" variant="outline">
          ← Back to orders
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">Order #{order.orderNumber}</h2>
        <OrderStatusBadge status={order.status} />
      </div>
      <OrderTimeline timeline={order.timeline} currentStatus={order.status} />
      <LinkButton to="/profile/orders" variant="outline">
        ← Back to orders
      </LinkButton>
    </div>
  );
}
