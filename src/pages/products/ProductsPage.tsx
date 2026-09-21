import { useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/product/ProductCard';
import { products } from '@/data/products';

export default function ProductsPage() {
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const filtered = query
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()),
      )
    : products;

  return (
    <div className="container mx-auto px-4 py-10 lg:px-8">
      <h1 className="mb-2 font-display text-3xl font-bold">All Products</h1>
      <p className="mb-8 text-coffee-700 dark:text-cream-300">
        {filtered.length} {filtered.length === 1 ? 'product' : 'products'}{' '}
        available
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
