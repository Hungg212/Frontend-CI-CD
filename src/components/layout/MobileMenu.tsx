import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/themeStore';
import { X, Home, Package, Heart, ShoppingCart, User, Settings, LogOut } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Trang chủ', icon: Home },
  { href: '/products', label: 'Sản phẩm', icon: Package },
  { href: '/wishlist', label: 'Yêu thích', icon: Heart },
  { href: '/cart', label: 'Giỏ hàng', icon: ShoppingCart },
];

const accountLinks = [
  { href: '/account', label: 'Tài khoản', icon: User },
  { href: '/orders', label: 'Đơn hàng', icon: Package },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div className="absolute inset-y-0 left-0 w-full max-w-xs bg-white dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-zinc-700">
          <Link to="/" onClick={onClose} className="flex items-center gap-2">
            <svg
              viewBox="0 0 40 40"
              className="h-8 w-8 text-amber-700 dark:text-amber-500"
              fill="currentColor"
            >
              <path d="M8 8h24v4c0 8.837-7.163 16-16 16S0 20.837 0 12V8h8zm0 4v4h24V12H8zm2 8v16c0 6.627 5.373 12 12 12s12-5.373 12-12V20H10z" />
              <circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
              Coffee Home Blend
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-zinc-800"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col p-6">
          {/* Main Links */}
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors',
                  location.pathname === link.href
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-500'
                    : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-800'
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
          </div>

          <hr className="my-4 border-stone-200 dark:border-zinc-700" />

          {/* Account Links */}
          <div className="space-y-2">
            <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Tài khoản
            </p>
            {accountLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors',
                  location.pathname === link.href
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-500'
                    : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-800'
                )}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
          </div>

          <hr className="my-4 border-stone-200 dark:border-zinc-700" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-800"
          >
            {theme === 'dark' ? (
              <>
                <Home className="h-5 w-5" />
                Chế độ sáng
              </>
            ) : (
              <>
                <LogOut className="h-5 w-5" />
                Chế độ tối
              </>
            )}
          </button>
        </nav>
      </div>
    </div>
  );
}
