import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { Search, Heart, ShoppingCart, User, Menu, X, ChevronDown, LogOut } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Trang chủ' },
  { href: '/products', label: 'Sản phẩm' },
];

export function Header() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { items } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed left-0 right-0 top-0 z-40 transition-all duration-300 bg-white',
          isScrolled ? 'shadow-sm' : ''
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <svg
                viewBox="0 0 40 40"
                className="h-10 w-10 text-amber-600"
                fill="currentColor"
              >
                <path d="M8 8h24v4c0 8.837-7.163 16-16 16S0 20.837 0 12V8h8zm0 4v4h24V12H8zm2 8v16c0 6.627 5.373 12 12 12s12-5.373 12-12V20H10z" />
                <circle cx="20" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="font-display text-xl font-bold text-coffee-900">
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
                      ? 'text-amber-700'
                      : 'text-stone-600 hover:text-amber-700'
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
                  <form onSubmit={handleSearch} className="absolute right-0 top-1/2 -translate-y-1/2 lg:w-80">
                    <input
                      type="search"
                      placeholder="Tìm kiếm sản phẩm..."
                      className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-4 pr-10 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    <X
                      className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 cursor-pointer text-stone-500"
                      onClick={() => setIsSearchOpen(false)}
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative rounded-lg p-2 text-stone-600 hover:bg-stone-100"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 text-xs font-medium text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 rounded-lg p-2 text-stone-600 hover:bg-stone-100"
                >
                  <User className="h-5 w-5" />
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-stone-200 bg-white py-2 shadow-lg">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 border-b border-stone-100">
                          <p className="font-medium text-stone-800">{user?.name}</p>
                          <p className="text-xs text-stone-500">{user?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"
                        >
                          Tài khoản
                        </Link>
                        <Link
                          to="/profile/orders"
                          className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"
                        >
                          Đơn hàng
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-amber-700 hover:bg-stone-100"
                          >
                            Quản trị
                          </Link>
                        )}
                        <hr className="my-2 border-stone-200" />
                        <button
                          onClick={logout}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"
                        >
                          <LogOut className="h-4 w-4" />
                          Đăng xuất
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"
                        >
                          Đăng nhập
                        </Link>
                        <Link
                          to="/register"
                          className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"
                        >
                          Đăng ký
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 lg:hidden"
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
          <div className="absolute inset-y-0 right-0 w-80 max-w-full bg-white">
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
              <span className="font-display text-lg font-semibold text-stone-900">
                Menu
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"
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
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-stone-700 hover:bg-stone-100'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-4 border-stone-200" />
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="rounded-lg px-4 py-3 text-lg font-medium text-stone-700 hover:bg-stone-100"
                  >
                    Tài khoản
                  </Link>
                  <Link
                    to="/cart"
                    className="rounded-lg px-4 py-3 text-lg font-medium text-stone-700 hover:bg-stone-100"
                  >
                    Giỏ hàng ({cartCount})
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="rounded-lg px-4 py-3 text-lg font-medium text-amber-700 hover:bg-stone-100"
                    >
                      Quản trị
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="rounded-lg px-4 py-3 text-left text-lg font-medium text-stone-700 hover:bg-stone-100"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-lg px-4 py-3 text-lg font-medium text-stone-700 hover:bg-stone-100"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg px-4 py-3 text-lg font-medium text-stone-700 hover:bg-stone-100"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-20" />
    </>
  );
}

export default Header;
