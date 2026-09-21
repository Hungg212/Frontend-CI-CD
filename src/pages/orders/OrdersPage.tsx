import OrderCard from '@/components/orders/OrderCard';
import { useOrderStore } from '@/stores/orderStore';
import type { Order } from '@/types';

export default function OrdersPage() {
  const orders = useOrderStore((s) => s.orders);

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500">Bạn chưa có đơn hàng nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
