import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const normalizeUsername = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
};

const buildUsernameCandidates = (params: {
  email?: string | null;
  metadata?: Record<string, any>;
}) => {
  const { email, metadata = {} } = params;
  const candidates: string[] = [];

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

  if (email) {
    const emailUser = normalizeUsername(email.split('@')[0] ?? '');
    if (emailUser) {
      candidates.push(emailUser);
    }
  }

  candidates.push(`kullanici-${Math.random().toString(36).slice(2, 8)}`);

  return Array.from(new Set(candidates)).filter(Boolean);
};

// Admin email list - emails that should automatically get admin role
const ADMIN_EMAILS = [
  'ftnakras01@gmail.com',
  // Add more admin emails here if needed
].map(email => email.toLowerCase());

const ensureUserProfile = async (supabase: ReturnType<typeof createServerClient>) => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('[DEBUG] callback/route.ts - OAuth callback Get user error:', {
        message: userError.message,
        status: userError.status,
        code: (userError as any).code,
        details: (userError as any).details,
        hint: (userError as any).hint,
      });
      throw userError;
    }

    if (!user) {
      console.warn('[DEBUG] callback/route.ts - OAuth callback No user found');
      return;
    }

    // Check if user email is admin
    const userEmail = user.email?.toLowerCase() || '';
    const isAdminEmail = ADMIN_EMAILS.includes(userEmail);

    // Check if profile already exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('id, role, is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (profileCheckError) {
      console.error('[DEBUG] callback/route.ts - OAuth callback Profile check error:', {
        message: profileCheckError.message,
        code: profileCheckError.code,
        details: profileCheckError.details,
        hint: profileCheckError.hint,
        userId: user.id,
      });
      throw profileCheckError;
    }

    // If profile exists and user is admin email, ensure admin role is set
    if (existingProfile && isAdminEmail) {
      const needsAdminUpdate = 
        existingProfile.role !== 'admin' || 
        existingProfile.is_admin !== true;
      
      if (needsAdminUpdate) {
        console.log('OAuth callback - Updating existing profile to admin:', user.id);
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            role: 'admin',
            is_admin: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
        
        if (updateError) {
          console.error('[DEBUG] callback/route.ts - OAuth callback Admin update error:', {
            message: updateError.message,
            code: updateError.code,
            details: updateError.details,
            hint: updateError.hint,
            userId: user.id,
          });
          // Don't throw - continue with existing profile
        } else {
          console.log('[DEBUG] callback/route.ts - OAuth callback Profile updated to admin successfully', {
            userId: user.id,
            userEmail,
          });
        }
      }
      return;
    }

    // If profile exists but not admin email, just return
    if (existingProfile) {
      console.log('[DEBUG] callback/route.ts - OAuth callback Profile already exists for user', {
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
        console.error('[DEBUG] callback/route.ts - OAuth callback Username check error:', {
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

    // Prepare profile data with admin role if applicable
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
      console.log('[DEBUG] callback/route.ts - OAuth callback Creating admin profile', {
        userEmail,
        userId: user.id,
        username,
        fullName,
      });
    }

    // Use upsert to handle race conditions
    const { data: insertedProfile, error: insertError } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (insertError) {
      console.error('OAuth callback - Profile insert error:', {
        error: insertError,
        userId: user.id,
        username,
        fullName,
        isAdmin: isAdminEmail,
      });
      throw insertError;
    }

    console.log('OAuth callback - Profile created successfully:', {
      userId: user.id,
      username,
      profileId: insertedProfile?.id,
      isAdmin: isAdminEmail,
    });
  } catch (error: any) {
    console.error('OAuth callback - ensureUserProfile error:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    // Don't throw - let the flow continue even if profile creation fails
    // The user can still log in and profile can be created later
  }
};

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type'); // 'recovery' for password reset
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Log all parameters for debugging
  console.log('[DEBUG] callback/route.ts - Request details:', {
    pathname: requestUrl.pathname,
    code: code ? `${code.substring(0, 10)}...` : null,
    codeLength: code?.length || 0,
    type,
    error,
    errorDescription,
    url: requestUrl.toString(),
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    origin: requestUrl.origin,
    searchParams: Object.fromEntries(requestUrl.searchParams.entries()),
  });

  // ============================================
  // STEP 1: Handle OAuth errors (NO CODE)
  // ============================================
  // If there's an error parameter but no code, this is an OAuth error
  // (user cancelled, access denied, etc.)
  if (error && !code) {
    console.error('[DEBUG] callback/route.ts - OAuth error in callback (no code):', {
      error,
      errorDescription,
      url: requestUrl.toString(),
      pathname: requestUrl.pathname,
      hasCode: !!code,
      type,
    });
    
    // NEVER redirect to reset-password for OAuth errors
    const signinUrl = new URL('/auth/signin', request.url);
    signinUrl.searchParams.set('error', 'oauth_failed');
    signinUrl.searchParams.set('message', errorDescription || 'OAuth girişi başarısız oldu');
    return NextResponse.redirect(signinUrl);
  }

  // ============================================
  // STEP 2: Handle code exchange (OAuth or Recovery)
  // ============================================
  if (code) {
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
      // Validate environment variables
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('[DEBUG] callback/route.ts - Missing Supabase environment variables', {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          code: code ? `${code.substring(0, 10)}...` : null,
          type,
        });
        const signinUrl = new URL('/auth/signin', request.url);
        signinUrl.searchParams.set('error', 'oauth_failed');
        signinUrl.searchParams.set('message', 'Sunucu yapılandırma hatası. Lütfen yöneticiye bildirin.');
        return NextResponse.redirect(signinUrl);
      }

      // Validate code
      if (!code || code.length < 10) {
        console.error('[DEBUG] callback/route.ts - Invalid code:', {
          code: code ? `${code.substring(0, 10)}...` : 'null',
          codeLength: code?.length || 0,
          type,
        });
        const signinUrl = new URL('/auth/signin', request.url);
        signinUrl.searchParams.set('error', 'oauth_failed');
        signinUrl.searchParams.set('message', 'Geçersiz giriş kodu. Lütfen tekrar deneyin.');
        return NextResponse.redirect(signinUrl);
      }

      console.log('[DEBUG] callback/route.ts - Attempting code exchange...', {
        codeLength: code.length,
        codePreview: code.substring(0, 20) + '...',
        type: type || 'oauth',
        hasError: !!error,
      });

      // Exchange code for session
      const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('[DEBUG] callback/route.ts - Exchange code error:', {
          error: exchangeError,
          message: exchangeError.message,
          status: exchangeError.status,
          name: exchangeError.name,
          code: code.substring(0, 10) + '...',
          codeLength: code.length,
          type,
          fullError: JSON.stringify(exchangeError, null, 2),
        });
        
        // If this is a recovery type, redirect to reset-password with error
        if (type === 'recovery') {
          console.log('[DEBUG] callback/route.ts - Recovery callback error - redirecting to reset-password', {
            error: exchangeError.message,
            status: exchangeError.status,
            type,
          });
          return NextResponse.redirect(new URL('/auth/reset-password?error=invalid_token', request.url));
        }
        
        // Check for specific OAuth errors
        const errorMessage = exchangeError.message?.toLowerCase() || '';
        let userFriendlyMessage = 'OAuth girişi başarısız oldu. Lütfen tekrar deneyin.';
        
        if (errorMessage.includes('expired') || errorMessage.includes('invalid')) {
          userFriendlyMessage = 'Giriş bağlantısı geçersiz veya süresi dolmuş. Lütfen tekrar deneyin.';
        } else if (errorMessage.includes('already used')) {
          userFriendlyMessage = 'Bu giriş bağlantısı zaten kullanılmış. Lütfen tekrar deneyin.';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          userFriendlyMessage = 'Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.';
        }
        
        // For OAuth errors, redirect to signin with detailed error
        const signinUrl = new URL('/auth/signin', request.url);
        signinUrl.searchParams.set('error', 'oauth_failed');
        signinUrl.searchParams.set('message', userFriendlyMessage);
        return NextResponse.redirect(signinUrl);
      }

      if (!sessionData?.user) {
        console.error('[DEBUG] callback/route.ts - No user in session data', {
          hasSessionData: !!sessionData,
          hasUser: !!sessionData?.user,
          hasSession: !!sessionData?.session,
          type,
        });
        
        if (type === 'recovery') {
          console.log('[DEBUG] callback/route.ts - No user, redirecting to reset-password (recovery)');
          return NextResponse.redirect(new URL('/auth/reset-password?error=invalid_token', request.url));
        }
        
        console.log('[DEBUG] callback/route.ts - No user, redirecting to signin (OAuth)');
        const signinUrl = new URL('/auth/signin', request.url);
        signinUrl.searchParams.set('error', 'oauth_failed');
        return NextResponse.redirect(signinUrl);
      }

      console.log('[DEBUG] callback/route.ts - Session exchanged successfully:', {
        userId: sessionData.user.id,
        userEmail: sessionData.user.email,
        hasSession: !!sessionData.session,
        type: type || 'oauth',
        emailConfirmed: !!sessionData.user.email_confirmed_at,
        provider: sessionData.user.app_metadata?.provider,
      });

      // ============================================
      // STEP 3: Handle Password Reset (Recovery)
      // ============================================
      if (type === 'recovery') {
        console.log('[DEBUG] callback/route.ts - Password reset callback - redirecting to reset-password', {
          userId: sessionData.user.id,
          userEmail: sessionData.user.email,
          hasSession: !!sessionData.session,
        });
        // Redirect to reset-password page - it will handle the session
        return NextResponse.redirect(new URL('/auth/reset-password', request.url));
      }

      // ============================================
      // STEP 4: Handle OAuth (Google/GitHub)
      // ============================================
      console.log('[DEBUG] callback/route.ts - Handling OAuth flow', {
        userId: sessionData.user.id,
        userEmail: sessionData.user.email,
        provider: sessionData.user.app_metadata?.provider,
      });
      
      // Ensure user profile exists (with admin role if applicable)
      console.log('[DEBUG] callback/route.ts - Ensuring user profile exists');
      await ensureUserProfile(supabase);
      
      // Get user profile to check admin status for redirect
      // Retry a few times in case profile was just created
      console.log('[DEBUG] callback/route.ts - Fetching user profile (with retry)');
      let profile = null;
      let retries = 3;
      while (retries > 0 && !profile) {
        console.log('[DEBUG] callback/route.ts - Profile fetch attempt', {
          attempt: 4 - retries,
          maxRetries: 3,
          userId: sessionData.user.id,
        });
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role, is_admin')
          .eq('id', sessionData.user.id)
          .maybeSingle();
        
        console.log('[DEBUG] callback/route.ts - Profile fetch result', {
          hasData: !!data,
          hasError: !!error,
          error: error ? {
            message: error.message,
            code: error.code,
          } : null,
          role: data?.role,
          isAdmin: data?.is_admin,
          retriesLeft: retries - 1,
        });
        
        if (!error && data) {
          profile = data;
          console.log('[DEBUG] callback/route.ts - Profile found', {
            role: profile.role,
            isAdmin: profile.is_admin,
          });
          break;
        }
        
        // Wait a bit before retrying
        if (retries > 1) {
          console.log('[DEBUG] callback/route.ts - Waiting before retry (500ms)');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        retries--;
      }

      // Also check if email is in admin list (fallback)
      const userEmail = sessionData.user.email?.toLowerCase() || '';
      const isAdminEmail = ADMIN_EMAILS.includes(userEmail);

      console.log('[DEBUG] callback/route.ts - Admin check', {
        userEmail,
        isAdminEmail,
        profileRole: profile?.role,
        profileIsAdmin: profile?.is_admin,
        adminEmails: ADMIN_EMAILS,
      });

      // Determine redirect based on user role
      let redirectUrl = '/dashboard';
      
      // If user is admin (by profile or email), redirect to admin dashboard
      const isAdmin = 
        (profile && (profile.role === 'admin' || profile.is_admin === true)) ||
        isAdminEmail;
      
      if (isAdmin) {
        redirectUrl = '/admin/dashboard';
        console.log('[DEBUG] callback/route.ts - User is admin, redirecting to admin dashboard', {
          userId: sessionData.user.id,
          userEmail,
          profileRole: profile?.role,
          profileIsAdmin: profile?.is_admin,
          isAdminEmail,
        });
      } else {
        console.log('[DEBUG] callback/route.ts - User is normal, redirecting to dashboard', {
          userId: sessionData.user.id,
          userEmail,
          profileRole: profile?.role || 'none',
          profileIsAdmin: profile?.is_admin || false,
          isAdminEmail,
        });
      }
      
      console.log('[DEBUG] callback/route.ts - OAuth callback process completed successfully', {
        userId: sessionData.user.id,
        email: sessionData.user.email,
        isAdmin,
        redirectUrl,
        profileRole: profile?.role,
        profileIsAdmin: profile?.is_admin,
        isAdminEmail,
        redirectTo: redirectUrl,
      });
      
      console.log('[DEBUG] callback/route.ts - Redirecting to final destination', {
        redirectUrl,
        userId: sessionData.user.id,
        userEmail: sessionData.user.email,
        isAdmin,
      });
      
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    } catch (error: any) {
      // Log error in all environments for debugging
      console.error('[DEBUG] callback/route.ts - Callback error:', {
        message: error?.message,
        name: error?.name,
        errorCode: (error as any)?.code,
        status: (error as any)?.status,
        details: (error as any)?.details,
        hint: (error as any)?.hint,
        type,
        code: code ? `${code.substring(0, 10)}...` : null,
        codeLength: code?.length || 0,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      });
      
      // If recovery type, redirect to reset-password with error
      if (type === 'recovery') {
        console.log('[DEBUG] callback/route.ts - Recovery callback error - redirecting to reset-password', {
          error: error?.message,
        });
        return NextResponse.redirect(new URL('/auth/reset-password?error=invalid_token', request.url));
      }
      
      // For OAuth errors, ALWAYS redirect to signin (never reset-password)
      console.log('[DEBUG] callback/route.ts - OAuth callback error - redirecting to signin', {
        error: error?.message,
        type,
      });
      const signinUrl = new URL('/auth/signin', request.url);
      signinUrl.searchParams.set('error', 'oauth_failed');
      if (error?.message) {
        signinUrl.searchParams.set('error_description', error.message);
      }
      return NextResponse.redirect(signinUrl);
    }
  }

  // ============================================
  // STEP 5: Fallback (No code, no error)
  // ============================================
  // If no code and no error, redirect to dashboard
  // This should rarely happen
  console.warn('[DEBUG] callback/route.ts - No code and no error, redirecting to dashboard', {
    pathname: requestUrl.pathname,
    searchParams: Object.fromEntries(requestUrl.searchParams.entries()),
    hasError: !!error,
    hasCode: !!code,
    type,
  });
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
