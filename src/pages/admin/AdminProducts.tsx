import { Plus } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';

export default function AdminProducts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <LinkButton to="/admin/products/create">
          <Plus className="h-4 w-4" /> New Product
        </LinkButton>
      </div>
      <div className="rounded-xl border border-warm-200 bg-white dark:border-coffee-800 dark:bg-coffee-900">
        <div className="p-6 text-center text-sm text-coffee-700 dark:text-cream-300">
          Product list will be rendered here.
        </div>
      </div>
    </div>
  );
}
