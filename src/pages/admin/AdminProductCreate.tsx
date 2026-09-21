export default function AdminProductCreate() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Create Product</h1>
      <form className="space-y-4 rounded-xl border border-warm-200 bg-white p-6 dark:border-coffee-800 dark:bg-coffee-900">
        <input
          placeholder="Product name"
          className="w-full rounded-md border border-warm-300 px-3 py-2 dark:border-coffee-700 dark:bg-coffee-800"
        />
        <textarea
          placeholder="Description"
          rows={4}
          className="w-full rounded-md border border-warm-300 px-3 py-2 dark:border-coffee-700 dark:bg-coffee-800"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            placeholder="Price"
            type="number"
            className="rounded-md border border-warm-300 px-3 py-2 dark:border-coffee-700 dark:bg-coffee-800"
          />
          <input
            placeholder="Stock"
            type="number"
            className="rounded-md border border-warm-300 px-3 py-2 dark:border-coffee-700 dark:bg-coffee-800"
          />
        </div>
      </form>
    </div>
  );
}
