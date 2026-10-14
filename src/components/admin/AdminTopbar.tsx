import { Bell, Search, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export default function AdminTopbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-warm-200 bg-white px-6 dark:border-coffee-800 dark:bg-coffee-900">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-coffee-500" />
        <input
          type="search"
          placeholder="Search..."
          className="h-10 w-full rounded-md border border-warm-200 bg-warm-50 pl-9 pr-4 text-sm focus:border-coffee-500 focus:outline-none focus:ring-1 focus:ring-coffee-500 dark:border-coffee-700 dark:bg-coffee-800"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="relative rounded-md p-2 hover:bg-warm-100 dark:hover:bg-coffee-800"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <Link
          to="/"
          className="hidden text-sm font-medium text-coffee-700 hover:underline sm:block dark:text-cream-200"
        >
          View Store →
        </Link>
        <div className="flex items-center gap-2 border-l border-warm-200 pl-3 dark:border-coffee-800">
          <div className="h-9 w-9 rounded-full bg-coffee-gradient" />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold">{user?.name ?? 'Administrator'}</p>
            <p className="text-xs text-coffee-500 dark:text-cream-300">
              {user?.email ?? 'admin@coffeehomeblend.com'}
            </p>
          </div>
          <button
            onClick={logout}
            aria-label="Sign out"
            className="rounded-md p-2 hover:bg-warm-100 dark:hover:bg-coffee-800"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
