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
        // Continue to next candidate
        continue;
      }

      if (!sameUsername) {
        username = candidate;
        break;
      }
    }

    if (!username) {
      // Fallback username if all candidates are taken
      username = `kullanici-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.user_name ||
      user.email?.split('@')[0] ||
      'Yeni Kullanıcı';

    // Insert user profile
    const { data: insertedProfile, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        username,
        full_name: fullName,
        avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
        is_developer: false,
        developer_approved: false,
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
    // Re-throw to be caught by the calling function
    throw error;
  }
};

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

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
        console.error('OAuth callback - Exchange code error:', exchangeError);
        throw exchangeError;
      }

      console.log('OAuth callback - Session exchanged successfully:', {
        userId: sessionData?.user?.id,
        email: sessionData?.user?.email,
      });

      // Ensure user profile exists
      await ensureUserProfile(supabase);
      
      console.log('OAuth callback - Process completed successfully');
    } catch (error: any) {
      // Log error in all environments for debugging
      console.error('OAuth callback error:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      });
      
      // Redirect to signin with error parameter
      return NextResponse.redirect(new URL('/auth/signin?error=oauth_failed', request.url));
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
