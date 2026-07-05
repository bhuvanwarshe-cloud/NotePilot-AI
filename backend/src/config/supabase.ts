import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient(token?: string) {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required. Check your .env file.');
  }

  const options = token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {};
  return createClient(supabaseUrl, supabaseAnonKey, options);
}
