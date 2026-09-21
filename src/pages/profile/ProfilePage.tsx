import { useAuthStore } from '@/stores/authStore';
import { NavLink, Outlet } from 'react-router-dom';
import { User, Package, Star, MapPin } from 'lucide-react';
import { cn } from '@/utils/cn';

const tabs = [
  { to: '/profile', label: 'Account', icon: User, end: true },
  { to: '/profile/orders', label: 'Orders', icon: Package },
  { to: '/profile/reviews', label: 'Reviews', icon: Star },
  { to: '/profile/addresses', label: 'Addresses', icon: MapPin },
];

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="container mx-auto px-4 py-10 lg:px-8">
      <h1 className="font-display text-3xl font-bold">{user?.name ?? 'My Profile'}</h1>
      <p className="mt-1 text-coffee-700 dark:text-cream-300">
        Manage your account and preferences
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside>
          <nav className="flex gap-2 overflow-x-auto rounded-xl border border-warm-200 bg-cream-100 p-2 lg:flex-col dark:border-coffee-800 dark:bg-coffee-900">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-coffee-700 text-cream-50'
                      : 'text-coffee-700 hover:bg-cream-200 dark:text-cream-200 dark:hover:bg-coffee-800'
                  )
                }
              >
                <tab.icon className="h-4 w-4" /> {tab.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
