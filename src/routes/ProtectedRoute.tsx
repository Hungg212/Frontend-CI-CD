import { Navigate, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'customer' | 'admin';
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
