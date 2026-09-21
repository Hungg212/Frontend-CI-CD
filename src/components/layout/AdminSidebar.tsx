import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Star,
  MessageSquare,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
} from 'lucide-react';

const adminNavItems = [
  { href: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Khách hàng', icon: Users },
  { href: '/admin/reviews', label: 'Đánh giá', icon: Star },
  { href: '/admin/messages', label: 'Tin nhắn', icon: MessageSquare },
  { href: '/admin/analytics', label: 'Thống kê', icon: BarChart3 },
  { href: '/admin/settings', label: 'Cài đặt', icon: Settings },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col bg-stone-900 transition-all duration-300 dark:bg-zinc-950',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-stone-800 px-4 dark:border-zinc-800">
        {!collapsed && (
          <Link to="/admin" className="flex items-center gap-2">
            <svg
              viewBox="0 0 40 40"
              className="h-8 w-8 text-amber-500"
              fill="currentColor"
            >
              <path d="M8 8h24v4c0 8.837-7.163 16-16 16S0 20.837 0 12V8h8zm0 4v4h24V12H8zm2 8v16c0 6.627 5.373 12 12 12s12-5.373 12-12V20H10z" />
              <circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="font-display text-lg font-bold text-white">Admin</span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {adminNavItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-amber-700 text-white'
                      : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-stone-800 p-4 dark:border-zinc-800">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-400 transition-colors hover:bg-stone-800 hover:text-white"
          title={collapsed ? 'Quay về trang chính' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Quay về trang chính</span>}
        </Link>
      </div>
    </aside>
  );
}
