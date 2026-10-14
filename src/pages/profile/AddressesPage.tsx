import { Button } from '@/components/ui/Button';

export default function AddressesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">Saved Addresses</h2>
        <Button size="sm">+ Add Address</Button>
      </div>
      <p className="text-sm text-coffee-700 dark:text-cream-300">
        You haven't saved any addresses yet.
      </p>
    </div>
  );
}
