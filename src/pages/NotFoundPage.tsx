import { Link } from 'react-router-dom';
import { Coffee } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream-50 px-6 text-center dark:bg-coffee-950">
      <div className="relative mb-8">
        <Coffee className="h-32 w-32 text-coffee-300 dark:text-coffee-700" />
        <span className="absolute -top-2 -right-2 rounded-full bg-coffee-700 px-3 py-1 text-xs font-semibold text-cream-50">
          404
        </span>
      </div>
      <h1 className="mb-3 font-display text-5xl font-bold text-coffee-900 dark:text-cream-50">
        Page Not Found
      </h1>
      <p className="mb-8 max-w-md text-base text-coffee-600 dark:text-cream-300">
        We couldn't find the page you were looking for. The link may be broken,
        or the page may have been moved.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <LinkButton to="/">Back to Home</LinkButton>
        <LinkButton to="/products" variant="outline">
          Browse Products
        </LinkButton>
      </div>
    </div>
  );
}
