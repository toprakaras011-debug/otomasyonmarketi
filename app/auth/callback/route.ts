/**
 * OAuth Callback Route - Sıfırdan Yazılmış
 * Hatasız, robust OAuth callback implementasyonu
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin email list
const ADMIN_EMAILS = [
  'ftnakras01@gmail.com',
].map(email => email.toLowerCase());

/**
 * Normalize username from email or metadata
 */
function normalizeUsername(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

/**
 * Build username candidates from email and metadata
 */
function buildUsernameCandidates(params: {
  email?: string | null;
  metadata?: Record<string, any>;
}): string[] {
  const { email, metadata = {} } = params;
  const candidates: string[] = [];

  // Try metadata usernames first
  const metaUsernames = [
    metadata.username,
    metadata.user_name,
    metadata.preferred_username,
    metadata.full_name,
    metadata.name,
  ]
    .filter(Boolean)
    .map((value: string) => normalizeUsername(value));

  candidates.push(...metaUsernames.filter(Boolean));

  // Try email username
  if (email) {
    const emailUser = normalizeUsername(email.split('@')[0] ?? '');
    if (emailUser) {
      candidates.push(emailUser);
    }
  }

  // Fallback: random username
  candidates.push(`kullanici-${Math.random().toString(36).slice(2, 8)}`);

  return Array.from(new Set(candidates)).filter(Boolean);
}

/**
 * Ensure user profile exists in user_profiles table
 * Handles admin role assignment automatically
 */
async function ensureUserProfile(supabase: ReturnType<typeof createServerClient>): Promise<void> {
  try {
    console.log('[DEBUG] callback/route.ts - ensureUserProfile START');

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('[DEBUG] callback/route.ts - Get user error', {
        message: userError.message,
        status: userError.status,
        code: (userError as any).code,
      });
      throw userError;
    }

    if (!user) {
      console.warn('[DEBUG] callback/route.ts - No user found');
      return;
    }

    const userEmail = user.email?.toLowerCase() || '';
    const isAdminEmail = ADMIN_EMAILS.includes(userEmail);

    console.log('[DEBUG] callback/route.ts - User info', {
      userId: user.id,
      userEmail,
      isAdminEmail,
      provider: user.app_metadata?.provider,
    });

    // Check if profile already exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('id, role, is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (profileCheckError) {
      console.error('[DEBUG] callback/route.ts - Profile check error', {
        message: profileCheckError.message,
        code: profileCheckError.code,
        userId: user.id,
      });
      throw profileCheckError;
    }

    // If profile exists and user is admin email, ensure admin role
    if (existingProfile && isAdminEmail) {
      const needsAdminUpdate = 
        existingProfile.role !== 'admin' || 
        existingProfile.is_admin !== true;
      
      if (needsAdminUpdate) {
        console.log('[DEBUG] callback/route.ts - Updating profile to admin', {
          userId: user.id,
          userEmail,
        });

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            role: 'admin',
            is_admin: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('[DEBUG] callback/route.ts - Admin update error', {
            message: updateError.message,
            code: updateError.code,
            userId: user.id,
          });
          // Don't throw - continue with existing profile
        } else {
          console.log('[DEBUG] callback/route.ts - Profile updated to admin successfully');
        }
      }
      return;
    }

    // If profile exists but not admin email, just return
    if (existingProfile) {
      console.log('[DEBUG] callback/route.ts - Profile already exists', {
        userId: user.id,
        userEmail,
        role: existingProfile.role,
        isAdmin: existingProfile.is_admin,
      });
      return;
    }

    // Build username candidates
    const candidates = buildUsernameCandidates({
      email: user.email,
      metadata: user.user_metadata ?? {},
    });

    // Find available username
    let username = candidates[0];
    for (const candidate of candidates) {
      const { data: sameUsername, error: usernameCheckError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', candidate)
        .maybeSingle();

      if (usernameCheckError) {
        console.error('[DEBUG] callback/route.ts - Username check error', {
          message: usernameCheckError.message,
          code: usernameCheckError.code,
          candidate,
        });
        continue;
      }

      if (!sameUsername) {
        username = candidate;
        break;
      }
    }

    if (!username) {
      username = `kullanici-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.user_name ||
      user.email?.split('@')[0] ||
      'Yeni Kullanıcı';

    // Prepare profile data
    const profileData: any = {
      id: user.id,
      username,
      full_name: fullName,
      avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
      is_developer: false,
      developer_approved: false,
    };

    // Set admin role if email is in admin list
    if (isAdminEmail) {
      profileData.role = 'admin';
      profileData.is_admin = true;
      console.log('[DEBUG] callback/route.ts - Creating admin profile', {
        userEmail,
        userId: user.id,
        username,
        fullName,
      });
    }

    // Create profile
    const { data: insertedProfile, error: insertError } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[DEBUG] callback/route.ts - Profile insert error', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
        userId: user.id,
        userEmail,
        profileData,
      });
      throw insertError;
    }

    console.log('[DEBUG] callback/route.ts - Profile created successfully', {
      userId: user.id,
      userEmail,
      username,
      isAdmin: isAdminEmail,
      role: isAdminEmail ? 'admin' : 'user',
    });
  } catch (error: any) {
    console.error('[DEBUG] callback/route.ts - ensureUserProfile error', {
      message: error?.message,
      name: error?.name,
      code: (error as any)?.code,
      status: (error as any)?.status,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
    // Don't throw - let the callback continue
    // Profile can be created later if needed
  }
}

/**
 * Main GET handler for OAuth callback
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('[DEBUG] callback/route.ts - GET request received', {
    pathname: requestUrl.pathname,
    code: code ? `${code.substring(0, 10)}...` : null,
    codeLength: code?.length || 0,
    type,
    error,
    errorDescription,
    origin: requestUrl.origin,
    fullUrl: requestUrl.toString(),
    searchParams: Object.fromEntries(requestUrl.searchParams.entries()),
    timestamp: new Date().toISOString(),
  });

  // ============================================
  // STEP 1: Handle OAuth errors (NO CODE)
  // ============================================
  if (error && !code) {
    console.error('[DEBUG] callback/route.ts - OAuth error (no code)', {
      error,
      errorDescription,
      url: requestUrl.toString(),
      fullUrl: requestUrl.toString(),
      allParams: Object.fromEntries(requestUrl.searchParams.entries()),
      timestamp: new Date().toISOString(),
    });
    
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('error', 'oauth_failed');
    const errorMsg = errorDescription || error || 'OAuth girişi başarısız oldu. Lütfen tekrar deneyin.';
    signinUrl.searchParams.set('message', encodeURIComponent(errorMsg));
    console.log('[DEBUG] callback/route.ts - Redirecting to signin with OAuth error', {
      error,
      errorDescription,
      redirectUrl: signinUrl.toString(),
    });
    return NextResponse.redirect(signinUrl);
  }

  // ============================================
  // STEP 2: Validate environment variables
  // ============================================
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[DEBUG] callback/route.ts - Missing environment variables', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
    
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('error', 'oauth_failed');
    signinUrl.searchParams.set('message', 'Sunucu yapılandırma hatası. Lütfen yöneticiye bildirin.');
    return NextResponse.redirect(signinUrl);
  }

  // ============================================
  // STEP 3: Handle code exchange
  // ============================================
  if (!code) {
    console.warn('[DEBUG] callback/route.ts - No code provided', {
      hasError: !!error,
      error,
      errorDescription,
      type,
      fullUrl: requestUrl.toString(),
      allParams: Object.fromEntries(requestUrl.searchParams.entries()),
      timestamp: new Date().toISOString(),
    });
    
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('error', 'oauth_failed');
    const errorMsg = errorDescription || error || 'Giriş kodu bulunamadı. Lütfen tekrar deneyin.';
    signinUrl.searchParams.set('message', encodeURIComponent(errorMsg));
    console.log('[DEBUG] callback/route.ts - Redirecting to signin (no code)', {
      redirectUrl: signinUrl.toString(),
    });
    return NextResponse.redirect(signinUrl);
  }

  // Validate code format
  if (code.length < 10) {
    console.error('[DEBUG] callback/route.ts - Invalid code format', {
      codeLength: code.length,
      codePreview: code.substring(0, 10),
    });
    
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('error', 'oauth_failed');
    signinUrl.searchParams.set('message', 'Geçersiz giriş kodu. Lütfen tekrar deneyin.');
    return NextResponse.redirect(signinUrl);
  }

  // Create Supabase client
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options });
        },
      },
    }
  );

  try {
    console.log('[DEBUG] callback/route.ts - Exchanging code for session', {
      codeLength: code.length,
      codePreview: code.substring(0, 20) + '...',
      type: type || 'oauth',
    });

    // Exchange code for session
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('[DEBUG] callback/route.ts - Code exchange error', {
        message: exchangeError.message,
        status: exchangeError.status,
        name: exchangeError.name,
        code: (exchangeError as any).code,
        codeLength: code.length,
        type,
        timestamp: new Date().toISOString(),
      });
      
      // Handle recovery type separately
      if (type === 'recovery') {
        console.log('[DEBUG] callback/route.ts - Recovery error, redirecting to reset-password');
        return NextResponse.redirect(new URL('/auth/reset-password?error=invalid_token', request.url));
      }
      
      // Determine user-friendly error message based on type
      const errorMessage = exchangeError.message?.toLowerCase() || '';
      let userFriendlyMessage = 'Giriş başarısız oldu. Lütfen tekrar deneyin.';
      let errorType = 'oauth_failed';
      
      // Check if this is actually an OAuth callback by looking at the provider
      // Note: sessionData might be null if exchange failed, so we check type parameter instead
      const isOAuthType = type === 'oauth' || !type || type === '';
      const providerFromError = errorMessage.includes('google') ? 'google' : errorMessage.includes('github') ? 'github' : null;
      
      console.log('[DEBUG] callback/route.ts - Determining error type', {
        type,
        isOAuthType,
        providerFromError,
        errorMessage,
        hasSessionData: !!sessionData,
      });
      
      if (type === 'recovery') {
        // Already handled above
        return NextResponse.redirect(new URL('/auth/reset-password?error=invalid_token', request.url));
      } else if (type === 'email' || type === 'signup') {
        // Email verification error
        if (errorMessage.includes('expired') || errorMessage.includes('invalid') || errorMessage.includes('already used')) {
          userFriendlyMessage = 'E-posta doğrulama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir doğrulama e-postası isteyin.';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          userFriendlyMessage = 'Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.';
        }
        errorType = 'verification_failed';
      } else if (isOAuthType || providerFromError) {
        // OAuth error - this is the most common case for OAuth callbacks
        // If type is missing or empty, treat as OAuth error (default for OAuth callbacks)
        if (errorMessage.includes('expired') || errorMessage.includes('invalid') || errorMessage.includes('already used')) {
          userFriendlyMessage = 'OAuth giriş bağlantısı geçersiz veya süresi dolmuş. Lütfen tekrar deneyin.';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          userFriendlyMessage = 'Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.';
        } else if (errorMessage.includes('provider') || errorMessage.includes('oauth')) {
          userFriendlyMessage = 'OAuth girişi başarısız oldu. Lütfen tekrar deneyin.';
        } else {
          userFriendlyMessage = 'OAuth girişi başarısız oldu. Lütfen tekrar deneyin.';
        }
        errorType = 'oauth_failed';
      } else {
        // Unknown error type - default to OAuth failed
        if (errorMessage.includes('expired') || errorMessage.includes('invalid') || errorMessage.includes('already used')) {
          userFriendlyMessage = 'Giriş bağlantısı geçersiz veya süresi dolmuş. Lütfen tekrar deneyin.';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          userFriendlyMessage = 'Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.';
        }
        errorType = 'oauth_failed';
      }
      
      // Email verification is disabled - redirect all errors to signin
      const signinUrl = new URL('/auth/signin', request.url);
      signinUrl.searchParams.set('error', errorType === 'verification_failed' ? 'oauth_failed' : errorType);
      signinUrl.searchParams.set('message', userFriendlyMessage);
      console.log('[DEBUG] callback/route.ts - Redirecting to signin with error', {
        errorType,
        userFriendlyMessage,
      });
      return NextResponse.redirect(signinUrl);
    }

    // Validate session data
    if (!sessionData?.user) {
      console.error('[DEBUG] callback/route.ts - No user in session data', {
        hasSessionData: !!sessionData,
        hasUser: !!sessionData?.user,
        hasSession: !!sessionData?.session,
        type,
      });
      
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/auth/reset-password?error=invalid_token', request.url));
      }
      
      // Email verification is disabled - redirect all errors to signin
      const errorType = 'oauth_failed';
      const errorMessage = 'Oturum oluşturulamadı. Lütfen tekrar deneyin.';
      
      const signinUrl = new URL('/auth/signin', request.url);
      signinUrl.searchParams.set('error', errorType);
      signinUrl.searchParams.set('message', errorMessage);
      console.log('[DEBUG] callback/route.ts - No user in session, redirecting to signin', {
        errorType,
        errorMessage,
      });
      return NextResponse.redirect(signinUrl);
    }

    console.log('[DEBUG] callback/route.ts - Session exchanged successfully', {
      userId: sessionData.user.id,
      userEmail: sessionData.user.email,
      hasSession: !!sessionData.session,
      sessionExpiresAt: sessionData.session?.expires_at,
      provider: sessionData.user.app_metadata?.provider,
      emailConfirmed: !!sessionData.user.email_confirmed_at,
      userMetadata: sessionData.user.user_metadata,
      appMetadata: sessionData.user.app_metadata,
      timestamp: new Date().toISOString(),
    });

    // ============================================
    // STEP 4: Handle Password Reset (Recovery)
    // ============================================
    if (type === 'recovery') {
      console.log('[DEBUG] callback/route.ts - Recovery type, redirecting to reset-password');
      return NextResponse.redirect(new URL('/auth/reset-password', request.url));
    }

    // ============================================
    // STEP 5: Handle Email Verification (Signup/Email) - DISABLED
    // ============================================
    // Email verification is now optional - users can login immediately
    // If this is an email verification callback, just ensure profile and redirect to dashboard
    const provider = sessionData.user.app_metadata?.provider;
    const isEmailVerification = 
      type === 'email' || 
      type === 'signup' || 
      (!type && (!provider || provider === 'email'));

    if (isEmailVerification) {
      console.log('[DEBUG] callback/route.ts - Email verification type (verification disabled, redirecting to dashboard)', {
        userId: sessionData.user.id,
        userEmail: sessionData.user.email,
        emailConfirmed: !!sessionData.user.email_confirmed_at,
        type,
        provider,
      });

      // Ensure user profile exists
      await ensureUserProfile(supabase);

      // Email verification is disabled - redirect directly to dashboard
      // Get user profile to determine redirect
      let profile = null;
      let retries = 3;
      
      while (retries > 0 && !profile) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role, is_admin')
          .eq('id', sessionData.user.id)
          .maybeSingle();
        
        if (!error && data) {
          profile = data;
          break;
        }
        
        if (retries > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        retries--;
      }

      // Check admin status
      const userEmail = sessionData.user.email?.toLowerCase() || '';
      const isAdminEmail = ADMIN_EMAILS.includes(userEmail);
      const isAdmin = 
        (profile && (profile.role === 'admin' || profile.is_admin === true)) ||
        isAdminEmail;

      // Determine redirect URL
      const redirectUrl = isAdmin ? '/admin/dashboard' : '/dashboard';

      console.log('[DEBUG] callback/route.ts - Email verified, redirecting to dashboard', {
        redirectUrl,
        userId: sessionData.user.id,
        userEmail,
        isAdmin,
        hasSession: !!sessionData.session,
      });

      // Email is verified, session is active - redirect directly to dashboard
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // ============================================
    // STEP 6: Handle OAuth (Google/GitHub)
    // ============================================
    // OAuth providers (Google, GitHub) - redirect to dashboard after profile creation
    const isOAuthProvider = provider && provider !== 'email' && (provider === 'google' || provider === 'github');
    
    console.log('[DEBUG] callback/route.ts - Checking OAuth provider', {
      provider,
      isOAuthProvider,
      providerType: typeof provider,
      userId: sessionData.user.id,
      userEmail: sessionData.user.email,
    });
    
    if (isOAuthProvider) {
      console.log('[DEBUG] callback/route.ts - OAuth provider detected - starting profile creation', {
        userId: sessionData.user.id,
        userEmail: sessionData.user.email,
        provider,
        hasSession: !!sessionData.session,
        sessionExpiresAt: sessionData.session?.expires_at,
        timestamp: new Date().toISOString(),
      });

      try {
        // Ensure user profile exists
        console.log('[DEBUG] callback/route.ts - Calling ensureUserProfile for OAuth user');
        const profileStartTime = Date.now();
        await ensureUserProfile(supabase);
        const profileDuration = Date.now() - profileStartTime;
        console.log('[DEBUG] callback/route.ts - ensureUserProfile completed', {
          duration: `${profileDuration}ms`,
          userId: sessionData.user.id,
        });

        // Get user profile to determine redirect
        let profile = null;
        let retries = 3;
        const profileFetchStartTime = Date.now();
        
        console.log('[DEBUG] callback/route.ts - Fetching user profile', {
          userId: sessionData.user.id,
          retries,
        });
        
        while (retries > 0 && !profile) {
          const fetchStartTime = Date.now();
          const { data, error } = await supabase
            .from('user_profiles')
            .select('role, is_admin')
            .eq('id', sessionData.user.id)
            .maybeSingle();
          const fetchDuration = Date.now() - fetchStartTime;
          
          console.log('[DEBUG] callback/route.ts - Profile fetch attempt', {
            retry: 4 - retries,
            hasData: !!data,
            hasError: !!error,
            error: error ? {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
            } : null,
            duration: `${fetchDuration}ms`,
          });
          
          if (!error && data) {
            profile = data;
            console.log('[DEBUG] callback/route.ts - Profile found', {
              role: profile.role,
              isAdmin: profile.is_admin,
            });
            break;
          }
          
          if (retries > 1) {
            console.log('[DEBUG] callback/route.ts - Waiting before retry', {
              remainingRetries: retries - 1,
            });
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          retries--;
        }
        
        const profileFetchDuration = Date.now() - profileFetchStartTime;
        console.log('[DEBUG] callback/route.ts - Profile fetch completed', {
          totalDuration: `${profileFetchDuration}ms`,
          hasProfile: !!profile,
          profileRole: profile?.role,
          profileIsAdmin: profile?.is_admin,
        });

        // Check admin status
        const userEmail = sessionData.user.email?.toLowerCase() || '';
        const isAdminEmail = ADMIN_EMAILS.includes(userEmail);
        const isAdmin = 
          (profile && (profile.role === 'admin' || profile.is_admin === true)) ||
          isAdminEmail;

        console.log('[DEBUG] callback/route.ts - Admin check', {
          userEmail,
          isAdminEmail,
          profileRole: profile?.role,
          profileIsAdmin: profile?.is_admin,
          finalIsAdmin: isAdmin,
        });

        // Get redirect URL from query params or use default
        const redirectParam = requestUrl.searchParams.get('redirect');
        const redirectUrl = redirectParam || (isAdmin ? '/admin/dashboard' : '/dashboard');

        console.log('[DEBUG] callback/route.ts - OAuth success, redirecting', {
          redirectUrl,
          redirectParam,
          userId: sessionData.user.id,
          userEmail,
          provider,
          isAdmin,
          hasProfile: !!profile,
          timestamp: new Date().toISOString(),
        });

        return NextResponse.redirect(new URL(redirectUrl, request.url));
      } catch (profileError: unknown) {
        const errorObj = profileError instanceof Error ? profileError : new Error(String(profileError));
        console.error('[DEBUG] callback/route.ts - OAuth profile creation error', {
          error: errorObj.message,
          errorStack: errorObj.stack,
          userId: sessionData.user.id,
          provider,
          timestamp: new Date().toISOString(),
        });
        
        // Even if profile creation fails, redirect to dashboard
        // Profile might be created by trigger
        const redirectParam = requestUrl.searchParams.get('redirect');
        const redirectUrl = redirectParam || '/dashboard';
        
        console.log('[DEBUG] callback/route.ts - OAuth redirecting despite profile error', {
          redirectUrl,
          error: errorObj.message,
        });
        
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    } else {
      console.log('[DEBUG] callback/route.ts - Not an OAuth provider', {
        provider,
        isEmail: provider === 'email',
        isOAuth: provider === 'google' || provider === 'github',
      });
    }

    // ============================================
    // STEP 7: Default - Email/Password User
    // ============================================
    console.log('[DEBUG] callback/route.ts - Handling default flow (email/password)', {
      userId: sessionData.user.id,
      userEmail: sessionData.user.email,
      emailConfirmed: !!sessionData.user.email_confirmed_at,
    });

    // Ensure user profile exists
    await ensureUserProfile(supabase);

    // Get user profile to determine redirect
    let profile = null;
    let retries = 3;
    
    while (retries > 0 && !profile) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role, is_admin')
        .eq('id', sessionData.user.id)
        .maybeSingle();
      
      if (!error && data) {
        profile = data;
        break;
      }
      
      if (retries > 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      retries--;
    }

    // Check admin status
    const userEmail = sessionData.user.email?.toLowerCase() || '';
    const isAdminEmail = ADMIN_EMAILS.includes(userEmail);
    const isAdmin = 
      (profile && (profile.role === 'admin' || profile.is_admin === true)) ||
      isAdminEmail;

    console.log('[DEBUG] callback/route.ts - Admin check', {
      userEmail,
      isAdminEmail,
      profileRole: profile?.role,
      profileIsAdmin: profile?.is_admin,
      isAdmin,
    });

    // Determine redirect URL
    const redirectUrl = isAdmin ? '/admin/dashboard' : '/dashboard';

    console.log('[DEBUG] callback/route.ts - Redirecting', {
      redirectUrl,
      userId: sessionData.user.id,
      userEmail,
      isAdmin,
    });

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error: any) {
    console.error('[DEBUG] callback/route.ts - Unexpected error', {
      message: error?.message,
      name: error?.name,
      code: (error as any)?.code,
      status: (error as any)?.status,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
    
    if (type === 'recovery') {
      return NextResponse.redirect(new URL('/auth/reset-password?error=invalid_token', request.url));
    }
    
    // Determine error type based on callback type
    const errorType = (type === 'email' || type === 'signup') ? 'verification_failed' : 'oauth_failed';
    const errorMessage = (type === 'email' || type === 'signup')
      ? 'E-posta doğrulama sırasında bir hata oluştu. Lütfen yeni bir doğrulama e-postası isteyin.'
      : (error?.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
    
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('error', errorType);
    signinUrl.searchParams.set('message', errorMessage);
    return NextResponse.redirect(signinUrl);
  }
}
