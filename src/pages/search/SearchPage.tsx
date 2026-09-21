import { useSearchParams } from 'react-router-dom';
import ProductCard from '@/components/product/ProductCard';
import { products } from '@/data/products';

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';
  const results = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase()),
      )
    : [];

  return (
    <div className="container mx-auto px-4 py-10 lg:px-8">
      <h1 className="font-display text-3xl font-bold">
        {query ? `Results for "${query}"` : 'Search'}
      </h1>
      <p className="mt-2 mb-8 text-coffee-700 dark:text-cream-300">
        {results.length} {results.length === 1 ? 'result' : 'results'}
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
