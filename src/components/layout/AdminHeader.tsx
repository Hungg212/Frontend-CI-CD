import { Link } from 'react-router-dom';
import { Bell, Search, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface AdminHeaderProps {
  sidebarCollapsed?: boolean;
}

export function AdminHeader({ sidebarCollapsed }: AdminHeaderProps) {
  const { user } = useAuthStore();

  return (
    <header
      className={`fixed right-0 top-0 z-20 flex h-16 items-center justify-between border-b border-stone-200 bg-white px-6 transition-all dark:border-zinc-800 dark:bg-zinc-900 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            placeholder="Tìm kiếm..."
            className="w-64 rounded-lg border border-stone-300 bg-stone-50 py-2 pl-10 pr-4 text-sm focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-zinc-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User Menu */}
        <Link
          to="/admin/profile"
          className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-stone-100 dark:hover:bg-zinc-800"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
              {user?.name || 'Admin'}
            </p>
            <p className="text-xs text-stone-500">{user?.email || 'admin@coffee.com'}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
