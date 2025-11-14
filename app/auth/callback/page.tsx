'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

/**
 * OAuth Callback Page - Client-Side Handler
 * 
 * This page handles OAuth callbacks on the client-side to ensure
 * PKCE code_verifier can be accessed from localStorage.
 * 
 * The flow:
 * 1. OAuth provider redirects here with ?code=...
 * 2. Client-side Supabase client exchanges code for session
 * 3. Code_verifier is read from localStorage (where it was stored during signInWithOAuth)
 * 4. Session is established and user is redirected
 */
export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const type = searchParams.get('type');

        logger.debug('OAuth callback page - Starting client-side callback', {
          hasCode: !!code,
          errorParam,
          type,
        });

        // Handle OAuth errors
        if (errorParam && !code) {
          logger.error('OAuth callback error', new Error(errorDescription || errorParam), {
            error: errorParam,
            errorDescription,
          });
          
          setError(errorDescription || 'OAuth girişi başarısız oldu. Lütfen tekrar deneyin.');
          setLoading(false);
          
          // Redirect to signin after a delay
          setTimeout(() => {
            router.push(`/auth/signin?error=oauth_failed&message=${encodeURIComponent(errorDescription || 'OAuth girişi başarısız oldu. Lütfen tekrar deneyin.')}`);
          }, 2000);
          return;
        }

        // Validate code
        if (!code) {
          logger.error('OAuth callback - No code provided', new Error('No code parameter'));
          setError('Giriş kodu bulunamadı. Lütfen tekrar deneyin.');
          setLoading(false);
          setTimeout(() => {
            router.push('/auth/signin?error=oauth_failed&message=Giriş kodu bulunamadı. Lütfen tekrar deneyin.');
          }, 2000);
          return;
        }

        // Exchange code for session - This will use code_verifier from localStorage
        logger.debug('OAuth callback - Exchanging code for session', {
          codeLength: code.length,
          codePrefix: code.substring(0, 10),
        });

        const exchangeStartTime = Date.now();
        const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        const exchangeDuration = Date.now() - exchangeStartTime;

        logger.debug('OAuth callback - Code exchange completed', {
          duration: `${exchangeDuration}ms`,
          hasSession: !!sessionData?.session,
          hasUser: !!sessionData?.user,
          hasError: !!exchangeError,
          errorMessage: exchangeError?.message,
        });

        if (exchangeError) {
          logger.error('OAuth callback - Code exchange error', exchangeError, {
            codeLength: code.length,
            type,
          });
          
          setError(exchangeError.message || 'Giriş başarısız oldu. Lütfen tekrar deneyin.');
          setLoading(false);
          
          setTimeout(() => {
            router.push(`/auth/signin?error=oauth_failed&message=${encodeURIComponent(exchangeError.message || 'Giriş başarısız oldu. Lütfen tekrar deneyin.')}`);
          }, 2000);
          return;
        }

        // Validate session
        if (!sessionData?.session || !sessionData?.user) {
          logger.error('OAuth callback - No session data', new Error('No session or user data'));
          setError('Oturum oluşturulamadı. Lütfen tekrar deneyin.');
          setLoading(false);
          setTimeout(() => {
            router.push('/auth/signin?error=oauth_failed&message=Oturum oluşturulamadı. Lütfen tekrar deneyin.');
          }, 2000);
          return;
        }

        logger.debug('OAuth callback - Session established', {
          userId: sessionData.user.id,
          userEmail: sessionData.user.email,
          provider: sessionData.user.app_metadata?.provider,
        });

        // Get redirect URL from query params or default to dashboard
        const redirectTo = searchParams.get('redirect') || '/dashboard';

        // Determine final redirect based on user role
        // First, try to get user profile to check admin status
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role, is_admin')
            .eq('id', sessionData.user.id)
            .maybeSingle();

          const userEmail = sessionData.user.email?.toLowerCase() || '';
          const isAdminEmail = ['ftnakras01@gmail.com'].includes(userEmail);
          const isAdmin = 
            (profile && (profile.role === 'admin' || profile.is_admin === true)) ||
            isAdminEmail;

          const finalRedirect = isAdmin ? '/admin/dashboard' : redirectTo;

          logger.debug('OAuth callback - Redirecting', {
            finalRedirect,
            isAdmin,
            userEmail,
          });

          // Redirect to final destination
          router.push(finalRedirect);
        } catch (profileError) {
          // If profile fetch fails, just redirect to default
          logger.warn('OAuth callback - Profile fetch failed, redirecting to default', profileError);
          router.push(redirectTo);
        }
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        logger.error('OAuth callback - Unexpected error', errorObj);
        
        setError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
        setLoading(false);
        
        setTimeout(() => {
          router.push('/auth/signin?error=oauth_failed&message=Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
        }, 2000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Giriş yapılıyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-muted-foreground text-sm">Yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return null;
}

