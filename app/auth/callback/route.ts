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

  // Try metadata usernames first (from OAuth providers)
  const metaUsernames = [
    metadata.username,
    metadata.user_name,
    metadata.preferred_username,
    metadata.login, // GitHub username
    metadata.nickname, // Google nickname
    metadata.sub, // OAuth subject (unique ID, can be used as fallback)
  ]
    .filter(Boolean)
    .map((value: string) => {
      const normalized = normalizeUsername(value);
      return normalized && normalized.length >= 3 ? normalized : null;
    })
    .filter((value): value is string => value !== null);

  candidates.push(...metaUsernames);

  // Try full name from metadata
  const fullName = metadata.full_name || metadata.name;
  if (fullName) {
    const nameParts = fullName.split(' ').filter(Boolean);
    if (nameParts.length > 0) {
      // Try first name + last name initial
      if (nameParts.length >= 2) {
        const firstName = normalizeUsername(nameParts[0]);
        const lastNameInitial = normalizeUsername(nameParts[nameParts.length - 1][0] || '');
        if (firstName && lastNameInitial) {
          candidates.push(`${firstName}${lastNameInitial}`);
        }
      }
      // Try just first name
      const firstName = normalizeUsername(nameParts[0]);
      if (firstName && firstName.length >= 3) {
        candidates.push(firstName);
      }
    }
  }

  // Try email username
  if (email) {
    const emailUser = normalizeUsername(email.split('@')[0] ?? '');
    if (emailUser && emailUser.length >= 3) {
      candidates.push(emailUser);
    }
  }

  // Generate random username as fallback
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  candidates.push(`kullanici${randomSuffix}`);

  return Array.from(new Set(candidates)).filter(Boolean);
};

const ensureUserProfile = async (supabase: ReturnType<typeof createServerClient>) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ensureUserProfile: No user found');
    }
    return;
  }

  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('id, username')
    .eq('id', user.id)
    .maybeSingle();

  if (existingProfile) {
    // Profile exists, but check if username is empty
    if (!existingProfile.username || existingProfile.username.trim() === '') {
      // Username is empty, generate one
      const candidates = buildUsernameCandidates({
        email: user.email,
        metadata: user.user_metadata ?? {},
      });

      let username = candidates[0] || `kullanici${Math.random().toString(36).slice(2, 8)}`;
      
      for (const candidate of candidates) {
        const { data: sameUsername } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('username', candidate)
          .maybeSingle();

        if (!sameUsername) {
          username = candidate;
          break;
        }
      }

      // Ensure username is not empty
      if (!username || username.trim() === '') {
        username = `kullanici${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      }

      // Update existing profile with username
      await supabase
        .from('user_profiles')
        .update({ username })
        .eq('id', user.id);
    }
    return;
  }

  // Log metadata for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('OAuth user metadata:', {
      email: user.email,
      metadata: user.user_metadata,
      provider: user.app_metadata?.provider,
    });
  }

  const candidates = buildUsernameCandidates({
    email: user.email,
    metadata: user.user_metadata ?? {},
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('Username candidates:', candidates);
  }

  // Find available username from candidates
  let username = candidates[0] || `kullanici${Math.random().toString(36).slice(2, 8)}`;
  
  for (const candidate of candidates) {
    if (!candidate || candidate.trim() === '') continue;
    
    const { data: sameUsername } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', candidate)
      .maybeSingle();

    if (!sameUsername) {
      username = candidate;
      break;
    }
  }

  // Ensure username is not empty
  if (!username || username.trim() === '') {
    // If all candidates are taken, generate a unique one
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
      const randomUsername = `kullanici${Math.random().toString(36).slice(2, 10)}`;
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('username', randomUsername)
        .maybeSingle();
      
      if (!existing) {
        username = randomUsername;
        break;
      }
      attempts++;
    }
    
    // Final fallback with timestamp
    if (!username || username.trim() === '' || attempts >= maxAttempts) {
      username = `kullanici${Date.now().toString(36)}${Math.random().toString(36).slice(2, 4)}`;
    }
  }

  // Final validation - username must not be empty
  if (!username || username.trim() === '') {
    username = `kullanici${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.user_name ||
    user.email?.split('@')[0] ||
    'Yeni Kullanıcı';

  // Get phone from metadata if available
  const phone = user.user_metadata?.phone || null;

  // Get avatar URL from Google
  const avatarUrl = 
    user.user_metadata?.avatar_url || 
    user.user_metadata?.picture || 
    user.user_metadata?.avatar || 
    null;

  const { error: insertError } = await supabase.from('user_profiles').insert({
    id: user.id,
    username: username.trim(),
    full_name: fullName,
    phone: phone,
    avatar_url: avatarUrl,
    is_developer: false,
    developer_approved: false,
  });

  if (insertError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating user profile:', insertError);
    }
    // If insert fails due to duplicate, try to update instead
    if (insertError.code === '23505') {
      await supabase
        .from('user_profiles')
        .update({ username: username.trim() })
        .eq('id', user.id);
    }
  }
};

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
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

  if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code);
      await ensureUserProfile(supabase);
    } catch (error: any) {
      // Log error in development only
      if (process.env.NODE_ENV === 'development') {
        console.error('OAuth callback error:', error);
      }
      
      // Check for specific OAuth errors
      const errorMessage = error?.message || '';
      let errorParam = 'oauth_failed';
      
      if (errorMessage.includes('provider is not enabled') || error?.error_code === 'validation_failed') {
        errorParam = 'provider_not_enabled';
      }
      
      // Redirect to signin with error parameter
      return NextResponse.redirect(new URL(`/auth/signin?error=${errorParam}`, request.url));
    }
  }

  // Check if email is confirmed
  const { data: { user } } = await supabase.auth.getUser();
  
  // URL to redirect to after sign in process completes
  // If email is confirmed, go to dashboard, otherwise go to verify email page
  if (user?.email_confirmed_at) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } else {
    const email = user?.email || '';
    return NextResponse.redirect(new URL(`/auth/verify-email?email=${encodeURIComponent(email)}`, request.url));
  }
}
