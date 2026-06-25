import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BrandLoader } from '@/components/shared/BrandLoader';

/**
 * GuestRoute — wraps routes that should NOT be accessible when authenticated.
 * (/login, /signup, /forgot-password)
 *
 * While loading: → renders BrandLoader (avoids flashing auth form then redirecting)
 * If authenticated: → redirects to /dashboard
 * If not authenticated: → renders <Outlet />
 */
export function GuestRoute() {
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

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
