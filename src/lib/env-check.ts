// Lightweight runtime env checker for Vite client builds.
// Validates public environment variables (VITE_-prefixed) at startup.
// 
// For server secrets (SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, etc.),
// validation happens separately in Supabase Edge Functions (Deno.env.get) or
// backend services — never in this client-side module.

/**
 * Retrieve a required public environment variable for Vite client builds.
 * @param name - Variable name (typically VITE_-prefixed)
 * @returns The environment variable value
 * @throws Error with the variable name (never logs the value) if missing
 */
export function getRequiredClientEnv(name: string): string {
  const v = import.meta.env[name as keyof ImportMetaEnv];
  if (!v) {
    const msg = `Missing required environment variable: ${name}`;
    // Fail fast in all non-production environments to surface config issues early.
    if (import.meta.env.MODE === 'development' || import.meta.env.MODE === 'test') {
      throw new Error(msg);
    }
    // In production, also throw to avoid running with incomplete configuration.
    throw new Error(msg);
  }
  return v;
}

// Pre-export public Supabase keys for convenient access in client code.
// If you need these values, import them here rather than accessing import.meta.env directly.
export const VITE_SUPABASE_URL = getRequiredClientEnv('VITE_SUPABASE_URL');
export const VITE_SUPABASE_PUBLISHABLE_KEY = getRequiredClientEnv('VITE_SUPABASE_PUBLISHABLE_KEY');
