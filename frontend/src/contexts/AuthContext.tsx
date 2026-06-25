import {
  createContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import * as authService from '@/services/auth.service';
import type { AuthContextValue, Profile } from '@/types/auth';

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // true until session check completes

  // ── On mount: restore session, then subscribe to auth state changes ──────────
  useEffect(() => {
    let mounted = true;

    // Step 1: Restore persisted session immediately
    authService.getSession().then(async (existingSession) => {
      if (!mounted) return;

      if (existingSession) {
        setSession(existingSession);
        setUser(existingSession.user);
        // Fetch profile — upsert handles OAuth users who may not have a row yet
        const p = await authService.upsertProfile(existingSession.user);
        if (mounted) setProfile(p);
      }
      // ✅ Session check complete — never flash login page again
      if (mounted) setLoading(false);
    });

    // Step 2: Subscribe to future auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // SIGNED_IN covers both email login and OAuth callback
          const p = await authService.upsertProfile(newSession.user);
          if (mounted) setProfile(p);
        } else {
          setProfile(null);
        }

        // After the initial getSession resolves, subsequent events never need
        // to set loading back to true (token refreshes are transparent)
        if (event === 'INITIAL_SESSION') {
          if (mounted) setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Auth methods ─────────────────────────────────────────────────────────────

  const signUp = useCallback(
    (email: string, password: string, fullName: string) =>
      authService.signUp(email, password, fullName),
    []
  );

  const signIn = useCallback(
    (email: string, password: string) => authService.signIn(email, password),
    []
  );

  const signInWithGoogle = useCallback(() => authService.signInWithGoogle(), []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  }, []);

  const resetPassword = useCallback(
    (email: string) => authService.resetPassword(email),
    []
  );

  // ── Value ────────────────────────────────────────────────────────────────────

  const value: AuthContextValue = {
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Raw context export (consumed by useAuth hook) ───────────────────────────

export { AuthContext };
