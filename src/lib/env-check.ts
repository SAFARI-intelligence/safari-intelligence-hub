// Lightweight runtime env checker for local/dev/test
// Place this file at src/lib/env-check.ts

export function getRequiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    const msg = `Missing required environment variable: ${name}`;
    // Fail fast in development and test to surface missing configuration early.
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      throw new Error(msg);
    }
    // In production we also throw to avoid running with missing secrets. Change to console.warn if you prefer.
    throw new Error(msg);
  }
  return v;
}

// Example exports you can enable if you want central access to env vars in server code.
export const SUPABASE_URL = getRequiredEnv('SUPABASE_URL');
export const SUPABASE_PUBLISHABLE_KEY = getRequiredEnv('SUPABASE_PUBLISHABLE_KEY');
// VITE_* keys are intended for client builds and are usually accessed via import.meta.env in Vite.
// Uncomment below if you want to centralize them here for node-side usage (not recommended for client-only keys).
// export const VITE_SUPABASE_URL = getRequiredEnv('VITE_SUPABASE_URL');
// export const VITE_SUPABASE_PUBLISHABLE_KEY = getRequiredEnv('VITE_SUPABASE_PUBLISHABLE_KEY');

// Optional server-only values (keep commented if not used immediately)
// export const SUPABASE_SERVICE_ROLE_KEY = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
// export const LOVABLE_API_KEY = getRequiredEnv('LOVABLE_API_KEY');
