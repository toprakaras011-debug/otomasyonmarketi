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

const ensureUserProfile = async (supabase: ReturnType<typeof createServerClient>) => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('OAuth callback - Get user error:', userError);
      throw userError;
    }

    if (!user) {
      console.warn('OAuth callback - No user found');
      return;
    }

    // Check if profile already exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (profileCheckError) {
      console.error('OAuth callback - Profile check error:', profileCheckError);
      throw profileCheckError;
    }

    if (existingProfile) {
      console.log('OAuth callback - Profile already exists for user:', user.id);
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
        console.error('OAuth callback - Username check error:', usernameCheckError);
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

    // Use upsert to handle race conditions
    const { data: insertedProfile, error: insertError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        username,
        full_name: fullName,
        avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
        is_developer: false,
        developer_approved: false,
      }, {
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
      });
      throw insertError;
    }

    console.log('OAuth callback - Profile created successfully:', {
      userId: user.id,
      username,
      profileId: insertedProfile?.id,
    });
  } catch (error: any) {
    console.error('OAuth callback - ensureUserProfile error:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    throw error;
  }
};

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type'); // 'recovery' for password reset
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('OAuth Callback - Request details:', {
    code: code ? `${code.substring(0, 10)}...` : null,
    type,
    error,
    errorDescription,
    url: requestUrl.toString(),
  });

  // ============================================
  // STEP 1: Handle OAuth errors (NO CODE)
  // ============================================
  // If there's an error parameter but no code, this is an OAuth error
  // (user cancelled, access denied, etc.)
  if (error && !code) {
    console.error('OAuth error in callback (no code):', {
      error,
      errorDescription,
      url: requestUrl.toString(),
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
      // Exchange code for session
      const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Callback - Exchange code error:', {
          error: exchangeError,
          code: code.substring(0, 10) + '...',
          type,
        });
        
        // If this is a recovery type, redirect to reset-password with error
        if (type === 'recovery') {
          console.log('Recovery callback error - redirecting to reset-password');
          return NextResponse.redirect(new URL('/auth/reset-password?error=invalid_token', request.url));
        }
        
        // For OAuth errors, redirect to signin with detailed error
        const signinUrl = new URL('/auth/signin', request.url);
        signinUrl.searchParams.set('error', 'oauth_failed');
        signinUrl.searchParams.set('message', 'OAuth girişi başarısız oldu. Lütfen tekrar deneyin.');
        return NextResponse.redirect(signinUrl);
      }

      if (!sessionData?.user) {
        console.error('Callback - No user in session data');
        
        if (type === 'recovery') {
          return NextResponse.redirect(new URL('/auth/reset-password?error=invalid_token', request.url));
        }
        
        const signinUrl = new URL('/auth/signin', request.url);
        signinUrl.searchParams.set('error', 'oauth_failed');
        return NextResponse.redirect(signinUrl);
      }

      console.log('Callback - Session exchanged successfully:', {
        userId: sessionData.user.id,
        email: sessionData.user.email,
        type: type || 'oauth',
      });

      // ============================================
      // STEP 3: Handle Password Reset (Recovery)
      // ============================================
      if (type === 'recovery') {
        console.log('Password reset callback - redirecting to reset-password');
        // Redirect to reset-password page - it will handle the session
        return NextResponse.redirect(new URL('/auth/reset-password', request.url));
      }

      // ============================================
      // STEP 4: Handle OAuth (Google/GitHub)
      // ============================================
      // Ensure user profile exists
      try {
        await ensureUserProfile(supabase);
      } catch (profileError: any) {
        console.error('OAuth callback - Profile creation failed:', profileError);
        // Continue anyway - profile might already exist
      }
      
      // Get user profile to check admin status for redirect
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, is_admin')
        .eq('id', sessionData.user.id)
        .maybeSingle();

      // Determine redirect based on user role
      let redirectUrl = '/dashboard';
      
      // If user is admin, redirect to admin dashboard
      if (profile && (profile.role === 'admin' || profile.is_admin === true)) {
        redirectUrl = '/admin/dashboard';
      }
      
      console.log('OAuth callback - Process completed successfully', {
        userId: sessionData.user.id,
        email: sessionData.user.email,
        isAdmin: profile?.role === 'admin' || profile?.is_admin === true,
        redirectTo: redirectUrl,
      });
      
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    } catch (error: any) {
      // Log error in all environments for debugging
      console.error('Callback error:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        type,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      });
      
      // If recovery type, redirect to reset-password with error
      if (type === 'recovery') {
        console.log('Recovery callback error - redirecting to reset-password');
        return NextResponse.redirect(new URL('/auth/reset-password?error=invalid_token', request.url));
      }
      
      // For OAuth errors, ALWAYS redirect to signin (never reset-password)
      console.log('OAuth callback error - redirecting to signin');
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
  console.warn('Callback - No code and no error, redirecting to dashboard');
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
