import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import type { AuthContextValue } from '@/types/auth';

/**
 * useAuth — typed hook to consume AuthContext.
 * Throws a clear error if used outside <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      'useAuth must be used inside <AuthProvider>. ' +
      'Make sure <AuthProvider> wraps your application in main.tsx or App.tsx.'
    );
  }
  return ctx;
}
