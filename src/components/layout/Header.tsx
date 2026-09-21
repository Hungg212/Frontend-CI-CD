import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/themeStore';
import { useCartStore } from '@/stores/cartStore';
import { Search, Heart, ShoppingCart, User, Sun, Moon, Menu, X, ChevronDown } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/about', label: 'Về chúng tôi' },
  { href: '/contact', label: 'Liên hệ' },
];

export function Header() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 shadow-sm backdrop-blur-md dark:bg-zinc-900/95'
            : 'bg-transparent'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <svg
                viewBox="0 0 40 40"
                className="h-10 w-10 text-amber-700 dark:text-amber-500"
                fill="currentColor"
              >
                <path d="M8 8h24v4c0 8.837-7.163 16-16 16S0 20.837 0 12V8h8zm0 4v4h24V12H8zm2 8v16c0 6.627 5.373 12 12 12s12-5.373 12-12V20H10z" />
                <circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                Coffee Home Blend
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:items-center lg:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    location.pathname === link.href
                      ? 'text-amber-700 dark:text-amber-500'
                      : 'text-stone-600 hover:text-amber-700 dark:text-stone-300 dark:hover:text-amber-500'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Search */}
              <div className="relative">
                {isSearchOpen ? (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 lg:w-80">
                    <input
                      type="search"
                      placeholder="Tìm kiếm sản phẩm..."
                      className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-4 pr-10 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
                      autoFocus
                      onBlur={() => setIsSearchOpen(false)}
                    />
                    <X
                      className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-stone-500"
                      onClick={() => setIsSearchOpen(false)}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-800 lg:hidden"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="hidden rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-800 lg:block"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-800"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-800"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-800"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 text-xs font-medium text-white dark:bg-amber-600">
                  0
                </span>
              </Link>

              {/* User Menu */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-800"
                >
                  <User className="h-5 w-5" />
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-stone-200 bg-white py-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-700"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-700"
                    >
                      Đăng ký
                    </Link>
                    <hr className="my-2 border-stone-200 dark:border-zinc-700" />
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-700"
                    >
                      Tài khoản
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-700"
                    >
                      Đơn hàng
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-800 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-80 max-w-full bg-white dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 dark:border-zinc-700">
              <span className="font-display text-lg font-semibold text-stone-900 dark:text-stone-100">
                Menu
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-zinc-800"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-2 p-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'rounded-lg px-4 py-3 text-lg font-medium transition-colors',
                    location.pathname === link.href
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-500'
                      : 'text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-800'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-4 border-stone-200 dark:border-zinc-700" />
              <Link
                to="/login"
                className="rounded-lg px-4 py-3 text-lg font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-800"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="rounded-lg px-4 py-3 text-lg font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-800"
              >
                Đăng ký
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
