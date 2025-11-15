import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * OAuth Callback Route Handler - Server-Side
 * 
 * This route handler processes OAuth callbacks from Supabase Auth.
 * It exchanges the authorization code for a session and sets secure HTTP-only cookies.
 * 
 * Flow:
 * 1. OAuth provider redirects here with ?code=...&type=...
 * 2. Server-side Supabase client exchanges code for session
 * 3. Session is stored in HTTP-only cookies (secure)
 * 4. User is redirected to dashboard or admin panel
 * 
 * Required Environment Variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - NEXT_PUBLIC_SITE_URL (optional, defaults to request origin)
 */
export async function GET(request: Request) {
  try {
    // Verify environment variables first (critical check)
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      logger.error('OAuth callback - Missing Supabase environment variables', new Error('Environment variables not set'));
      
      const requestUrl = new URL(request.url);
      const redirectUrl = new URL('/auth/signin', requestUrl.origin);
      redirectUrl.searchParams.set('error', 'oauth_failed');
      redirectUrl.searchParams.set('message', 'Sunucu yapılandırma hatası. Lütfen yöneticiye bildirin.');
      
      return NextResponse.redirect(redirectUrl);
    }

    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const errorParam = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');
    const type = requestUrl.searchParams.get('type');
    const redirectTo = requestUrl.searchParams.get('redirect') || '/dashboard';

    logger.debug('OAuth callback route - Request received', {
      hasCode: !!code,
      errorParam,
      errorDescription,
      type,
      redirectTo,
      origin: requestUrl.origin,
    });

    // Handle OAuth errors
    if (errorParam && !code) {
      logger.error('OAuth callback error', new Error(errorDescription || errorParam), {
        error: errorParam,
        errorDescription,
        type,
      });

      const redirectPath = type === 'recovery' ? '/auth/reset-password' : '/auth/signin';
      const errorType = type === 'recovery' ? 'invalid_token' : 'oauth_failed';
      const errorMessage = errorDescription || 'Giriş başarısız oldu. Lütfen tekrar deneyin.';

      const redirectUrl = new URL(redirectPath, requestUrl.origin);
      redirectUrl.searchParams.set('error', errorType);
      redirectUrl.searchParams.set('message', errorMessage);

      return NextResponse.redirect(redirectUrl);
    }

    // Validate code
    if (!code) {
      logger.error('OAuth callback - No code provided', new Error('No code parameter'));

      const redirectPath = type === 'recovery' ? '/auth/reset-password' : '/auth/signin';
      const errorType = type === 'recovery' ? 'invalid_token' : 'oauth_failed';

      const redirectUrl = new URL(redirectPath, requestUrl.origin);
      redirectUrl.searchParams.set('error', errorType);
      redirectUrl.searchParams.set('message', 'Giriş kodu bulunamadı. Lütfen tekrar deneyin.');

      return NextResponse.redirect(redirectUrl);
    }

    // Create Supabase server client (handles cookies automatically)
    // This will set HTTP-only cookies for secure session storage
    // @supabase/ssr automatically handles cookie options (httpOnly, secure, sameSite)
    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      const errorObj = clientError instanceof Error ? clientError : new Error(String(clientError));
      logger.error('OAuth callback - Failed to create Supabase client', errorObj);
      
      const redirectUrl = new URL('/auth/signin', requestUrl.origin);
      redirectUrl.searchParams.set('error', 'oauth_failed');
      redirectUrl.searchParams.set('message', 'Sunucu yapılandırma hatası. Lütfen yöneticiye bildirin.');
      
      return NextResponse.redirect(redirectUrl);
    }

    logger.debug('OAuth callback route - Exchanging code for session', {
      codeLength: code.length,
      codePrefix: code.substring(0, 10),
    });

    // Exchange code for session
    // This will automatically set HTTP-only cookies via the server client
    const exchangeStartTime = Date.now();
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    const exchangeDuration = Date.now() - exchangeStartTime;

    logger.debug('OAuth callback route - Code exchange completed', {
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

      const redirectPath = type === 'recovery' ? '/auth/reset-password' : '/auth/signin';
      const errorType = type === 'recovery' 
        ? 'invalid_token' 
        : (type === 'email' || type === 'signup' ? 'verification_failed' : 'oauth_failed');

      const redirectUrl = new URL(redirectPath, requestUrl.origin);
      redirectUrl.searchParams.set('error', errorType);
      redirectUrl.searchParams.set('message', exchangeError.message || 'Giriş başarısız oldu. Lütfen tekrar deneyin.');

      return NextResponse.redirect(redirectUrl);
    }

    // Validate session
    if (!sessionData?.session || !sessionData?.user) {
      logger.error('OAuth callback - No session data', new Error('No session or user data'));

      const redirectPath = type === 'recovery' ? '/auth/reset-password' : '/auth/signin';
      const errorType = type === 'recovery' ? 'invalid_token' : 'oauth_failed';

      const redirectUrl = new URL(redirectPath, requestUrl.origin);
      redirectUrl.searchParams.set('error', errorType);
      redirectUrl.searchParams.set('message', 'Oturum oluşturulamadı. Lütfen tekrar deneyin.');

      return NextResponse.redirect(redirectUrl);
    }

    logger.debug('OAuth callback route - Session established', {
      userId: sessionData.user.id,
      userEmail: sessionData.user.email,
      provider: sessionData.user.app_metadata?.provider,
      type,
    });

    // Handle password recovery - redirect to reset password page
    if (type === 'recovery') {
      logger.debug('OAuth callback route - Password recovery, redirecting to reset password');
      const redirectUrl = new URL('/auth/reset-password', requestUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }

    // Ensure profile exists for ALL OAuth and email signups
    // This includes: OAuth (google, github), email verification, and signup
    const isOAuthProvider = sessionData.user.app_metadata?.provider && 
      sessionData.user.app_metadata.provider !== 'email';
    const needsProfileCheck = isOAuthProvider || type === 'email' || type === 'signup' || !type;
    
    if (needsProfileCheck) {
      try {
        logger.debug('OAuth callback route - Checking profile existence', {
          userId: sessionData.user.id,
          provider: sessionData.user.app_metadata?.provider,
          type,
          isOAuthProvider,
        });

        // Ensure user profile exists
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, role, is_admin')
          .eq('id', sessionData.user.id)
          .maybeSingle();

        if (profileError) {
          logger.warn('OAuth callback - Profile fetch error', profileError);
        }

        if (!profile) {
          logger.debug('OAuth callback route - Profile not found, creating profile', {
            userId: sessionData.user.id,
            email: sessionData.user.email,
            provider: sessionData.user.app_metadata?.provider,
          });

          // Profile doesn't exist - create it
          const userEmail = sessionData.user.email?.toLowerCase() || '';
          const username = userEmail.split('@')[0] || `user-${Date.now()}`;
          const adminEmails = ['ftnakras01@gmail.com'].map(e => e.toLowerCase());
          const isAdmin = adminEmails.includes(userEmail);

          // Get user metadata from OAuth provider
          const fullName = sessionData.user.user_metadata?.full_name || 
            sessionData.user.user_metadata?.name || 
            sessionData.user.user_metadata?.display_name || 
            null;
          const avatarUrl = sessionData.user.user_metadata?.avatar_url || 
            sessionData.user.user_metadata?.picture || 
            sessionData.user.user_metadata?.avatar || 
            null;

          const { error: createError } = await supabase
            .from('user_profiles')
            .insert({
              id: sessionData.user.id,
              username,
              full_name: fullName,
              avatar_url: avatarUrl,
              is_developer: false,
              developer_approved: false,
              role: isAdmin ? 'admin' : 'user',
              is_admin: isAdmin,
            });

          if (createError) {
            logger.error('OAuth callback - Profile creation error', createError, {
              userId: sessionData.user.id,
              username,
              email: userEmail,
            });
            // Continue anyway - trigger might create it, or we can retry
          } else {
            logger.debug('OAuth callback route - Profile created successfully', {
              userId: sessionData.user.id,
              username,
              isAdmin,
            });
          }
        } else {
          logger.debug('OAuth callback route - Profile already exists', {
            userId: sessionData.user.id,
            profileRole: profile.role,
            profileIsAdmin: profile.is_admin,
          });
        }
      } catch (profileError) {
        const errorContext = profileError instanceof Error 
          ? { message: profileError.message, stack: profileError.stack }
          : { error: String(profileError) };
        logger.warn('OAuth callback - Profile handling error', errorContext);
        // Continue anyway - profile creation is not critical for redirect
        // User can still access the site, profile might be created by trigger
      }
    }

    // Determine final redirect based on user role
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, is_admin')
        .eq('id', sessionData.user.id)
        .maybeSingle();

      const userEmail = sessionData.user.email?.toLowerCase() || '';
      const adminEmails = ['ftnakras01@gmail.com'].map(e => e.toLowerCase());
      const isAdminEmail = adminEmails.includes(userEmail);
      const isAdmin = 
        (profile && (profile.role === 'admin' || profile.is_admin === true)) ||
        isAdminEmail;

      const finalRedirect = isAdmin ? '/admin/dashboard' : redirectTo;

      logger.debug('OAuth callback route - Redirecting', {
        finalRedirect,
        isAdmin,
        userEmail,
        type,
      });

      // Create response with redirect
      // Cookies are already set by the Supabase server client
      const redirectUrl = new URL(finalRedirect, requestUrl.origin);
      return NextResponse.redirect(redirectUrl);
    } catch (profileError) {
      // If profile fetch fails, just redirect to default
      const errorContext = profileError instanceof Error 
        ? { message: profileError.message, stack: profileError.stack }
        : { error: String(profileError) };
      logger.warn('OAuth callback - Profile fetch failed, redirecting to default', errorContext);
      const redirectUrl = new URL(redirectTo, requestUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('OAuth callback route - Unexpected error', errorObj);

    const requestUrl = new URL(request.url);
    const redirectUrl = new URL('/auth/signin', requestUrl.origin);
    redirectUrl.searchParams.set('error', 'oauth_failed');
    redirectUrl.searchParams.set('message', 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');

    return NextResponse.redirect(redirectUrl);
  }
}

