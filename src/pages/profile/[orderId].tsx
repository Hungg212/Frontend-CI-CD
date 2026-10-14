import React from 'react';
import { useParams } from 'react-router-dom';
import OrderDetailPage from '@/pages/orders/[id]';

export default function ProfileOrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  return <OrderDetailPage key={orderId} />;
}
