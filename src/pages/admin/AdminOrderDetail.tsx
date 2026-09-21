import { useParams } from 'react-router-dom';

export default function AdminOrderDetail() {
  const { id } = useParams();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Order #{id}</h1>
      <p className="text-coffee-700 dark:text-cream-300">Detailed order view coming soon.</p>
    </div>
  );
}
