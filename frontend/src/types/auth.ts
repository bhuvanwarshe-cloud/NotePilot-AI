import type { User, Session } from '@supabase/supabase-js';

// ─── Database row shape ───────────────────────────────────────────────────────
export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: 'student' | 'admin' | string;
  plan: 'Free' | 'Pro' | 'Enterprise' | string;
  created_at: string;
  updated_at: string;
}

// ─── Auth context value ───────────────────────────────────────────────────────
export interface AuthContextValue {
  // State
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Methods
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}
