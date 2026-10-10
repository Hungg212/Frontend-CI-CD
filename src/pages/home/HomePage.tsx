import { Coffee, ArrowRight } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-20">
      <section className="grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-coffee-700 ring-1 ring-warm-200">
            <Coffee className="h-3.5 w-3.5" /> Small-batch roasters
          </span>
          <h1 className="text-balance font-display text-5xl font-bold leading-tight text-coffee-900 lg:text-6xl">
            Brew your perfect cup, delivered to your door.
          </h1>
          <p className="text-pretty text-lg text-coffee-700">
            Single-origin beans, signature blends, and curated accessories crafted for the home
            barista.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton to="/products">
              Shop Coffee <ArrowRight className="h-4 w-4" />
            </LinkButton>
            <LinkButton to="/category/coffee-beans" variant="outline">
              Explore Beans
            </LinkButton>
          </div>
        </div>
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-white shadow-coffee-lg ring-1 ring-warm-200">
          <div className="absolute inset-0 flex items-center justify-center text-coffee-300">
            <Coffee className="h-48 w-48" />
          </div>
        </div>
      </section>
    </div>
  );
}
