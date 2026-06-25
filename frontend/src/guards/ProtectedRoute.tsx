import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BrandLoader } from '@/components/shared/BrandLoader';

/**
 * ProtectedRoute — wraps routes that require authentication.
 *
 * While loading (session check in progress):  → renders BrandLoader full-screen
 * If not authenticated:                        → redirects to /login
 * If authenticated:                            → renders <Outlet />
 */
export function ProtectedRoute() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100%',
          background: 'var(--np-bg-primary)',
        }}
      >
        <BrandLoader className="w-20 h-20" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
