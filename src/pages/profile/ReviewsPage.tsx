import { Rating } from '@/components/ui/Rating';

const stubReviews = [
  { id: 'r1', product: 'Ethiopian Yirgacheffe', rating: 5, text: 'Amazing flavor notes.' },
  { id: 'r2', product: 'Italian Espresso Blend', rating: 4, text: 'Bold and rich.' },
];

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold">My Reviews</h2>
      <div className="space-y-4">
        {stubReviews.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border border-warm-200 bg-cream-100 p-4 dark:border-coffee-800 dark:bg-coffee-900"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold">{r.product}</p>
              <Rating value={r.rating} readonly size="sm" />
            </div>
            <p className="text-sm text-coffee-700 dark:text-cream-300">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
