import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';

const stats = [
  { label: 'Revenue', value: '$24,580', trend: '+12.5%', icon: DollarSign },
  { label: 'Orders', value: '342', trend: '+8.1%', icon: ShoppingBag },
  { label: 'Customers', value: '1,205', trend: '+3.4%', icon: Users },
  { label: 'Conversion', value: '3.2%', trend: '+0.5%', icon: TrendingUp },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-warm-200 bg-white p-6 dark:border-coffee-800 dark:bg-coffee-900"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-coffee-700 dark:text-cream-300">
                {s.label}
              </span>
              <s.icon className="h-5 w-5 text-coffee-500" />
            </div>
            <p className="font-display text-2xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs text-green-600">{s.trend}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-warm-200 bg-white p-6 dark:border-coffee-800 dark:bg-coffee-900">
        <h2 className="mb-4 font-display text-lg font-semibold">Recent Activity</h2>
        <p className="text-sm text-coffee-700 dark:text-cream-300">
          No recent activity to display.
        </p>
      </div>
    </div>
  );
}
