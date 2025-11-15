import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { ADMIN_EMAILS } from '@/lib/config';

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

// Note: This route handler uses request.url which requires dynamic rendering
// Route handlers are dynamic by default with cacheComponents: true
// No need for dynamic/runtime exports - they're incompatible with cacheComponents

export async function GET(request: Request) {
  // Bail out of prerendering immediately - this route handler uses request.url
  // This is required for cacheComponents: true compatibility
  if (typeof request.url === 'undefined') {
    return new NextResponse('Route handler cannot be prerendered', { status: 500 });
  }

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

      // Handle different error types with appropriate messages
      let redirectPath = '/auth/signin';
      let errorType = 'oauth_failed';
      let errorMessage = 'Giriş başarısız oldu. Lütfen tekrar deneyin.';

      if (type === 'recovery') {
        redirectPath = '/auth/reset-password';
        errorType = 'invalid_token';
        errorMessage = 'Şifre sıfırlama linki geçersiz veya süresi dolmuş.';
      } else if (type === 'email' || type === 'signup') {
        // Email verification errors
        errorType = 'verification_failed';
        errorMessage = exchangeError.message?.includes('invalid') || exchangeError.message?.includes('expired')
          ? 'E-posta doğrulama linki geçersiz veya süresi dolmuş. Lütfen yeni bir doğrulama e-postası isteyin.'
          : 'E-posta doğrulama başarısız oldu. Lütfen tekrar deneyin.';
      } else {
        // OAuth errors
        errorMessage = exchangeError.message || 'OAuth girişi başarısız oldu. Lütfen tekrar deneyin.';
      }

      const redirectUrl = new URL(redirectPath, requestUrl.origin);
      redirectUrl.searchParams.set('error', errorType);
      redirectUrl.searchParams.set('message', errorMessage);

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
          const isAdmin = ADMIN_EMAILS.includes(userEmail);

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
          // Profile exists - check if user should be admin
          const userEmail = sessionData.user.email?.toLowerCase() || '';
          const shouldBeAdmin = ADMIN_EMAILS.includes(userEmail);
          const isCurrentlyAdmin = profile.role === 'admin' || profile.is_admin === true;
          
          // Update profile if user should be admin but isn't
          if (shouldBeAdmin && !isCurrentlyAdmin) {
            logger.debug('OAuth callback route - Updating existing profile to admin', {
              userId: sessionData.user.id,
              userEmail,
            });
            
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({
                role: 'admin',
                is_admin: true,
              })
              .eq('id', sessionData.user.id);
            
            if (updateError) {
              logger.error('OAuth callback - Failed to update profile to admin', updateError, {
                userId: sessionData.user.id,
                userEmail,
              });
            } else {
              logger.debug('OAuth callback route - Profile updated to admin successfully', {
                userId: sessionData.user.id,
                userEmail,
              });
              // Update local profile object for redirect logic
              profile.role = 'admin';
              profile.is_admin = true;
            }
          }
          
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
        const isAdminEmail = ADMIN_EMAILS.includes(userEmail);
        const isAdmin = 
          (profile && (profile.role === 'admin' || profile.is_admin === true)) ||
          isAdminEmail;

        // Determine final redirect - session is already established
        // For email verification (type=signup or type=email), redirect directly to dashboard
        // The session is already established, so user is already logged in
        const finalRedirect = isAdmin ? '/admin/dashboard' : '/dashboard';
        
        logger.debug('OAuth callback route - Email verification successful, redirecting to dashboard', {
          userId: sessionData.user.id,
          userEmail,
          isAdmin,
          type,
          finalRedirect,
        });

        // Create response with redirect
        // Cookies are already set by the Supabase server client
        // Session is established, so user is already logged in
        const redirectUrl = new URL(finalRedirect, requestUrl.origin);
        
        // Add success message for email verification (optional - can be shown on dashboard)
        if (type === 'signup' || type === 'email') {
          redirectUrl.searchParams.set('verified', 'true');
          redirectUrl.searchParams.set('email', sessionData.user.email || '');
        }
        
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
    const type = requestUrl.searchParams.get('type');
    
    // Use appropriate error message based on callback type
    let errorType = 'oauth_failed';
    let errorMessage = 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
    
    if (type === 'recovery') {
      errorType = 'invalid_token';
      errorMessage = 'Şifre sıfırlama sırasında bir hata oluştu. Lütfen tekrar deneyin.';
    } else if (type === 'signup' || type === 'email') {
      errorType = 'verification_failed';
      errorMessage = 'E-posta doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin veya yeni bir doğrulama e-postası isteyin.';
    } else {
      errorMessage = 'OAuth girişi sırasında beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
    }

    const redirectUrl = new URL('/auth/signin', requestUrl.origin);
    redirectUrl.searchParams.set('error', errorType);
    redirectUrl.searchParams.set('message', errorMessage);

    return NextResponse.redirect(redirectUrl);
  }
}

