import { useParams } from 'react-router-dom';
import ProductCard from '@/components/product/ProductCard';
import { products } from '@/data/products';
import { categories } from '@/data/categories';

export default function CategoryPage() {
  const { slug } = useParams();
  const category = categories.find((c) => c.slug === slug);
  const filtered = products.filter((p) => p.categorySlug === slug);

  return (
    <div className="container mx-auto px-4 py-10 lg:px-8">
      <h1 className="font-display text-3xl font-bold">
        {category?.name ?? slug}
      </h1>
      <p className="mt-2 mb-8 text-coffee-700 dark:text-cream-300">
        {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
