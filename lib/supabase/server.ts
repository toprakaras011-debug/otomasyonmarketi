import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Create Supabase server client with cookie-based session management
 * 
 * This client is used in server-side routes and server components.
 * It automatically handles HTTP-only cookies for secure session storage.
 * 
 * Required Environment Variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 
 * @returns Supabase server client instance
 */
export const createClient = async () => {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // @supabase/ssr automatically handles cookie options (httpOnly, secure, sameSite)
            // We just pass through the options from Supabase - don't override
            cookieStore.set({ 
              name, 
              value, 
              ...options,
            });
          } catch (error) {
            // Ignore cookie errors in server components
            // This can happen during static generation or in middleware
            // The error is expected in some contexts (e.g., static generation)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // @supabase/ssr automatically handles cookie options
            // We just pass through the options from Supabase - don't override
            cookieStore.delete({ 
              name, 
              ...options,
            });
          } catch (error) {
            // Ignore cookie errors in server components
            // This can happen during static generation or in middleware
          }
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    }
  );
};
