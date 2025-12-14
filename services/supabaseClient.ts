import { createClient } from '@supabase/supabase-js';

// Helper to safely access environment variables without crashing
const getEnv = (key: string) => {
  try {
    // Check if import.meta exists (Vite)
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key];
    }
  } catch (e) {
    console.warn('Error accessing environment variable:', key);
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Initialize client only if keys are present, otherwise use placeholders to prevent crash on load.
// The app logic (isUsingSupabase flag) will prevent actual calls if keys are missing.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);