import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const configured =
  typeof supabaseUrl === 'string' &&
  supabaseUrl.length > 0 &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.length > 0;

if (!configured && import.meta.env.DEV) {
  console.warn(
    '[FETS] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing. Supabase-backed features are disabled. Set them in .env before build or on your host.'
  );
}

/** Null when env vars are missing — always check before calling. */
export const supabase = configured ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isSupabaseConfigured = configured;
