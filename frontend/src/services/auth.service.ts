/**
 * auth.service.ts
 *
 * All Supabase auth calls are isolated here.
 * UI components NEVER import from @/lib/supabase directly.
 */
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/auth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Maps Supabase error codes → human-friendly messages */
function friendlyError(message: string): string {
  if (message.includes('Invalid login credentials'))
    return 'Incorrect email or password. Please try again.';
  if (message.includes('Email not confirmed'))
    return 'Please verify your email before logging in.';
  if (message.includes('User already registered'))
    return 'An account with this email already exists. Try logging in.';
  if (message.includes('Password should be at least'))
    return 'Password must be at least 6 characters long.';
  if (message.includes('Unable to validate email address'))
    return 'Please enter a valid email address.';
  if (message.includes('Email rate limit exceeded'))
    return 'Too many attempts. Please wait a moment and try again.';
  if (message.includes('Failed to fetch') || message.includes('NetworkError'))
    return 'Network error. Check your connection and try again.';
  return message;
}

// ─── Session ─────────────────────────────────────────────────────────────────

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

/**
 * Fetch a profile row by user ID.
 * Returns null if the row doesn't exist yet.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as Profile;
}

/**
 * Idempotent profile upsert — safe to call on every sign-in.
 * Only overwrites non-null fields when inserting for the first time.
 */
export async function upsertProfile(user: User, fullName?: string): Promise<Profile | null> {
  const profileData = {
    id: user.id,
    email: user.email ?? null,
    full_name:
      fullName ??
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
    role: 'student',
    plan: 'Free',
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(profileData, {
      onConflict: 'id',
      ignoreDuplicates: false, // allow updating metadata on re-login
    })
    .select()
    .single();

  if (error) {
    console.error('[auth.service] upsertProfile error:', error.message);
    return null;
  }
  return data as Profile;
}

// ─── Email Sign Up ────────────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<{ error: string | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) return { error: friendlyError(error.message) };

  // If auto-confirm is off, Supabase returns a user but no session yet.
  // Profile creation will happen in onAuthStateChange when they verify + log in.
  // If auto-confirm is on, create the profile immediately.
  if (data.user && data.session) {
    await upsertProfile(data.user, fullName);
  }

  return { error: null };
}

// ─── Email Sign In ────────────────────────────────────────────────────────────

export async function signIn(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: friendlyError(error.message) };
  return { error: null };
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
  if (error) return { error: friendlyError(error.message) };
  return { error: null };
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export async function resetPassword(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) return { error: friendlyError(error.message) };
  return { error: null };
}
