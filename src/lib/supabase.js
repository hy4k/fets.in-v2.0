import { createClient } from '@supabase/supabase-js';

// Supabase anon keys are public by design — safe to embed in client-side code.
// VITE_ env vars are used when set (dev / CI with secrets); otherwise fall back
// to the project credentials so the deployed build always works.
const SUPABASE_URL     = import.meta.env.VITE_SUPABASE_URL     || 'https://drhykmgwtxhghvzodwhz.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaHlrbWd3dHhoZ2h2em9kd2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MzAxNjYsImV4cCI6MjA4MzEwNjE2Nn0.SCLjMX6uYnXpEkCSQIz0xFxJMBFJ7J-jvMTybQMagk4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const isSupabaseConfigured = true;
