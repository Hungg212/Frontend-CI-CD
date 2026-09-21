import { useParams } from 'react-router-dom';
import { products } from '@/data/products';
import NotFoundPage from '@/pages/NotFoundPage';

export default function ProductDetailPage() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  if (!product) return <NotFoundPage />;

  return (
    <div className="container mx-auto px-4 py-10 lg:px-8">
      <h1 className="font-display text-3xl font-bold">{product.name}</h1>
      <p className="mt-4 text-coffee-700 dark:text-cream-300">
        {product.description}
      </p>
      <div className="mt-6 text-2xl font-bold">
        ${product.salePrice ?? product.price}
      </div>
    </div>
  );
}
