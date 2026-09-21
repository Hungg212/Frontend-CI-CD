import { Heart } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';

export default function WishlistPage() {
  return (
    <div className="container mx-auto px-4 py-10 lg:px-8">
      <h1 className="mb-2 font-display text-3xl font-bold">Wishlist</h1>
      <p className="mb-8 text-coffee-700 dark:text-cream-300">Items you've saved for later</p>
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-warm-300 bg-cream-100/50 p-12 text-center dark:border-coffee-700 dark:bg-coffee-900/50">
        <Heart className="mb-4 h-12 w-12 text-coffee-400" />
        <p className="mb-4 text-coffee-700 dark:text-cream-300">Your wishlist is empty.</p>
        <LinkButton to="/products">Discover Products</LinkButton>
      </div>
    </div>
  );
}
