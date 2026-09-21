import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  Package,
  MapPin,
  Star,
  Settings,
  ChevronRight,
  LogOut,
  Heart,
  ShoppingBag,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useOrderStore } from '@/stores/orderStore';
import { useReviewStore } from '@/stores/reviewStore';

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

const ProfilePage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const orders = useOrderStore((s) => s.orders);
  const reviews = useReviewStore((s) => s.reviews);

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  const userReviews = reviews.filter((r) => r.userId === user.id);
  const orderCount = orders.length;

  const quickLinks = [
    {
      to: '/orders',
      icon: <Package className="h-5 w-5" />,
      label: 'Đơn hàng của tôi',
      description: `${orderCount} đơn hàng`,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      to: '/profile/addresses',
      icon: <MapPin className="h-5 w-5" />,
      label: 'Sổ địa chỉ',
      description: `${user.addresses.length} địa chỉ`,
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    {
      to: '/profile/reviews',
      icon: <Star className="h-5 w-5" />,
      label: 'Đánh giá của tôi',
      description: `${userReviews.length} đánh giá`,
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500',
    },
    {
      to: '/wishlist',
      icon: <Heart className="h-5 w-5" />,
      label: 'Danh sách yêu thích',
      description: 'Sản phẩm yêu thích',
      color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    },
    {
      to: '/profile/settings',
      icon: <Settings className="h-5 w-5" />,
      label: 'Cài đặt tài khoản',
      description: 'Thông tin cá nhân',
      color: 'bg-stone-100 text-stone-600 dark:bg-zinc-700 dark:text-stone-300',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 py-8 dark:bg-zinc-900">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold text-stone-800 dark:text-stone-100">
          Tài Khoản Của Tôi
        </h1>

        <Card padding="md" className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-2xl font-bold text-white">
                {getInitials(user.name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">{user.name}</h2>
              <div className="mt-1 space-y-1 text-sm text-stone-600 dark:text-stone-400">
                <p className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
                {user.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    {user.phone}
                  </p>
                )}
              </div>
            </div>
            <Link to="/profile/settings">
              <Button variant="outline" size="sm">
                Chỉnh sửa
              </Button>
            </Link>
          </div>
          <div className="mt-4 border-t border-stone-200 pt-4 dark:border-zinc-700">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              <UserIcon className="mr-1 inline h-3.5 w-3.5" />
              Thành viên từ {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
            </p>
          </div>
        </Card>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.slice(0, 3).map((link) => (
            <Link key={link.to} to={link.to}>
              <Card padding="md" hover className="h-full">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${link.color}`}
                  >
                    {link.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-800 dark:text-stone-100">{link.label}</p>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                      {link.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-stone-400" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickLinks.slice(3).map((link) => (
            <Link key={link.to} to={link.to}>
              <Card padding="md" hover>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${link.color}`}
                  >
                    {link.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-800 dark:text-stone-100">{link.label}</p>
                    <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                      {link.description}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-stone-400" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <Card padding="md">
          <h3 className="mb-4 font-semibold text-stone-800 dark:text-stone-100">Hành động nhanh</h3>
          <div className="space-y-2">
            <Link
              to="/products"
              className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-stone-50 dark:hover:bg-zinc-700/50"
            >
              <span className="flex items-center gap-3 text-stone-700 dark:text-stone-300">
                <ShoppingBag className="h-5 w-5" />
                Tiếp tục mua sắm
              </span>
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-between rounded-lg p-3 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <span className="flex items-center gap-3">
                <LogOut className="h-5 w-5" />
                Đăng xuất
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
