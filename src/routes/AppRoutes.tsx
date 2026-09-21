import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';
import AdminLayout from '@/layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import { Spinner, FullPageSpinner } from '@/components/ui';

const HomePage = lazy(() => import('@/pages/home/HomePage'));
const ProductsPage = lazy(() => import('@/pages/products/ProductsPage'));
const ProductDetailPage = lazy(
  () => import('@/pages/product-detail/ProductDetailPage'),
);
const CategoryPage = lazy(() => import('@/pages/category/CategoryPage'));
const SearchPage = lazy(() => import('@/pages/search/SearchPage'));

const CartPage = lazy(() => import('@/pages/cart/CartPage'));
const WishlistPage = lazy(() => import('@/pages/wishlist/WishlistPage'));

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(
  () => import('@/pages/auth/ForgotPasswordPage'),
);
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const OrdersPage = lazy(() => import('@/pages/orders/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/pages/orders/OrderDetailPage'));
const ReviewsPage = lazy(() => import('@/pages/profile/ReviewsPage'));
const AddressesPage = lazy(() => import('@/pages/profile/AddressesPage'));

const CheckoutPage = lazy(() => import('@/pages/checkout/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('@/pages/checkout/OrderSuccessPage'));

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminProductCreate = lazy(
  () => import('@/pages/admin/AdminProductCreate'),
);
const AdminProductEdit = lazy(() => import('@/pages/admin/AdminProductEdit'));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('@/pages/admin/AdminOrderDetail'));
const AdminCustomers = lazy(() => import('@/pages/admin/AdminCustomers'));
const AdminCustomerDetail = lazy(
  () => import('@/pages/admin/AdminCustomerDetail'),
);
const AdminCoupons = lazy(() => import('@/pages/admin/AdminCoupons'));
const AdminReviews = lazy(() => import('@/pages/admin/AdminReviews'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <Spinner size="lg" />
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public + Customer routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="search" element={<SearchPage />} />

          <Route path="cart" element={<CartPage />} />
          <Route path="wishlist" element={<WishlistPage />} />

          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-success/:id" element={<OrderSuccessPage />} />

          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile/reviews"
            element={
              <ProtectedRoute>
                <ReviewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile/addresses"
            element={
              <ProtectedRoute>
                <AddressesPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Auth routes with AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Admin routes with AdminLayout and AdminRoute guard */}
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/create" element={<AdminProductCreate />} />
          <Route path="products/:id/edit" element={<AdminProductEdit />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="customers/:id" element={<AdminCustomerDetail />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
