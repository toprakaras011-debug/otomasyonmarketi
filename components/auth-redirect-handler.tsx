'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Handles auth redirects from Supabase
 * - Password reset codes (?code=...)
 * - OAuth callbacks
 * - Error redirects
 * 
 * Wrapped in Suspense to avoid blocking route issues with useSearchParams
 */
function AuthRedirectHandlerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const type = searchParams.get('type');

    // Check URL hash for recovery token (password reset)
    if (typeof window !== 'undefined') {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashAccessToken = hashParams.get('access_token');
      const hashType = hashParams.get('type');
      const hashError = hashParams.get('error');

      // Password reset with hash (most common)
      if (hashAccessToken && hashType === 'recovery') {
        // Redirect to reset password page with hash
        const hash = window.location.hash;
        router.replace(`/auth/reset-password${hash}`);
        return;
      }

      // Password reset with code parameter
      if (code && !error) {
        // Check if this is a recovery code by checking the URL
        // Supabase sends recovery codes to reset-password, but sometimes redirects to home
        // We'll redirect to reset-password with the code
        router.replace(`/auth/reset-password?code=${code}`);
        return;
      }

      // OAuth callback with code
      if (code && !error) {
        // Redirect to callback route
        router.replace(`/auth/callback?code=${code}`);
        return;
      }

      // Error handling
      if (error || hashError) {
        const errorCode = error || hashError;
        const description = errorDescription || hashParams.get('error_description');

        if (errorCode === 'otp_expired' || errorCode === 'access_denied') {
          // Password reset expired
          router.replace(`/auth/reset-password?error=${errorCode}&error_description=${encodeURIComponent(description || 'Link expired')}`);
          return;
        }

        // Other errors - redirect to signin
        router.replace(`/auth/signin?error=${errorCode}&error_description=${encodeURIComponent(description || 'Authentication failed')}`);
        return;
      }
    }
  }, [router, searchParams, mounted]);

  return null; // This component doesn't render anything
}

export function AuthRedirectHandler() {
  return (
    <Suspense fallback={null}>
      <AuthRedirectHandlerForm />
    </Suspense>
  );
}

