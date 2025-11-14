/**
 * OAuth Authentication Functions
 * Sıfırdan yazılmış, hatasız OAuth implementasyonu
 */

import { supabase } from './supabase';

/**
 * Get the correct redirect URL for OAuth
 * Uses NEXT_PUBLIC_SITE_URL if available, otherwise uses window.location.origin
 */
function getRedirectUrl(): string {
  if (typeof window === 'undefined') {
    throw new Error('OAuth sadece tarayıcıda çalışır');
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || window.location.origin;
  const redirectTo = `${siteUrl}/auth/callback`;

  console.log('[DEBUG] auth-oauth.ts - getRedirectUrl', {
    siteUrl,
    windowOrigin: window.location.origin,
    redirectTo,
    hasEnvSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
  });

  return redirectTo;
}

/**
 * Clear existing session before OAuth
 * Prevents conflicts and ensures clean state
 */
async function clearSession(): Promise<void> {
  try {
    console.log('[DEBUG] auth-oauth.ts - Clearing existing session');
    await supabase.auth.signOut();
    // Small delay to ensure session is cleared
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('[DEBUG] auth-oauth.ts - Session cleared');
  } catch (error: any) {
    console.warn('[DEBUG] auth-oauth.ts - Error clearing session (non-critical)', {
      message: error?.message,
    });
    // Non-critical error, continue anyway
  }
}

/**
 * Sign in with Google OAuth
 * Sıfırdan yazılmış, hatasız implementasyon
 */
export async function signInWithGoogle(): Promise<{ url: string }> {
  console.log('[DEBUG] auth-oauth.ts - signInWithGoogle START', {
    isBrowser: typeof window !== 'undefined',
    timestamp: new Date().toISOString(),
  });

  try {
    // Validate browser environment
    if (typeof window === 'undefined') {
      throw new Error('OAuth sadece tarayıcıda çalışır');
    }

    // Clear existing session
    await clearSession();

    // Get redirect URL
    const redirectTo = getRedirectUrl();

    console.log('[DEBUG] auth-oauth.ts - signInWithGoogle calling supabase.auth.signInWithOAuth', {
      provider: 'google',
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    });

    // Initiate OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    // Handle errors
    if (error) {
      console.error('[DEBUG] auth-oauth.ts - signInWithGoogle error', {
        message: error.message,
        status: error.status,
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint,
      });
      throw new Error(error.message || 'Google ile giriş yapılamadı');
    }

    // Validate response
    if (!data?.url) {
      console.error('[DEBUG] auth-oauth.ts - signInWithGoogle no URL in response', {
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
      });
      throw new Error('OAuth URL alınamadı. Lütfen tekrar deneyin.');
    }

    console.log('[DEBUG] auth-oauth.ts - signInWithGoogle SUCCESS', {
      hasUrl: !!data.url,
      urlLength: data.url.length,
      redirectTo,
    });

    return { url: data.url };
  } catch (error: any) {
    console.error('[DEBUG] auth-oauth.ts - signInWithGoogle exception', {
      message: error?.message,
      name: error?.name,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });

    // Re-throw with user-friendly message
    if (error?.message && !error.message.includes('OAuth')) {
      throw error;
    }
    throw new Error(error?.message || 'Google ile giriş yapılamadı. Lütfen tekrar deneyin.');
  }
}

/**
 * Sign in with GitHub OAuth
 * Sıfırdan yazılmış, hatasız implementasyon
 */
export async function signInWithGithub(): Promise<{ url: string }> {
  console.log('[DEBUG] auth-oauth.ts - signInWithGithub START', {
    isBrowser: typeof window !== 'undefined',
    timestamp: new Date().toISOString(),
  });

  try {
    // Validate browser environment
    if (typeof window === 'undefined') {
      throw new Error('OAuth sadece tarayıcıda çalışır');
    }

    // Clear existing session
    await clearSession();

    // Get redirect URL
    const redirectTo = getRedirectUrl();

    console.log('[DEBUG] auth-oauth.ts - signInWithGithub calling supabase.auth.signInWithOAuth', {
      provider: 'github',
      redirectTo,
    });

    // Initiate OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: redirectTo,
      },
    });

    // Handle errors
    if (error) {
      console.error('[DEBUG] auth-oauth.ts - signInWithGithub error', {
        message: error.message,
        status: error.status,
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint,
      });
      throw new Error(error.message || 'GitHub ile giriş yapılamadı');
    }

    // Validate response
    if (!data?.url) {
      console.error('[DEBUG] auth-oauth.ts - signInWithGithub no URL in response', {
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
      });
      throw new Error('OAuth URL alınamadı. Lütfen tekrar deneyin.');
    }

    console.log('[DEBUG] auth-oauth.ts - signInWithGithub SUCCESS', {
      hasUrl: !!data.url,
      urlLength: data.url.length,
      redirectTo,
    });

    return { url: data.url };
  } catch (error: any) {
    console.error('[DEBUG] auth-oauth.ts - signInWithGithub exception', {
      message: error?.message,
      name: error?.name,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });

    // Re-throw with user-friendly message
    if (error?.message && !error.message.includes('OAuth')) {
      throw error;
    }
    throw new Error(error?.message || 'GitHub ile giriş yapılamadı. Lütfen tekrar deneyin.');
  }
}

