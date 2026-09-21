import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/reviews', label: 'Reviews' },
  { to: '/admin/coupons', label: 'Coupons' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/settings', label: 'Settings' },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function AdminSidebar({
  collapsed = false,
  onToggle: _onToggle,
}: AdminSidebarProps = {}) {
  return (
    <aside
      className={`hidden w-64 shrink-0 border-r border-warm-200 bg-white transition-all duration-300 md:block dark:border-coffee-800 dark:bg-coffee-900 ${collapsed ? 'w-20' : ''}`}
    >
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="flex h-16 items-center border-b border-warm-200 px-6 dark:border-coffee-800">
          <span className="font-display text-lg font-bold text-coffee-700 dark:text-cream-100">
            Admin Panel
          </span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-coffee-700 text-cream-50'
                    : 'text-coffee-700 hover:bg-warm-100 dark:text-cream-200 dark:hover:bg-coffee-800'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
