import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Local storage override keys (allows users/evaluators to configure connection live in settings UI)
const STORAGE_URL_KEY = 'vybe_supabase_url';
const STORAGE_ANON_KEY = 'vybe_supabase_anon_key';

export function getSupabaseCredentials() {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_ANON_KEY) : null;

  const url = (localUrl || envUrl || '').trim();
  const key = (localKey || envKey || '').trim();

  const isConfigured = Boolean(
    url && 
    key && 
    url.startsWith('https://') && 
    !url.includes('your-project') &&
    key.length > 20
  );

  return { url, key, isConfigured };
}

export function saveSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_URL_KEY, url.trim());
    else localStorage.removeItem(STORAGE_URL_KEY);

    if (key) localStorage.setItem(STORAGE_ANON_KEY, key.trim());
    else localStorage.removeItem(STORAGE_ANON_KEY);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

// Reset instance when credentials change
export function resetSupabaseClient() {
  supabaseInstance = null;
  return getSupabase();
}
