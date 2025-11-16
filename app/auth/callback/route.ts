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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (existingProfile) return;

  const candidates = buildUsernameCandidates({
    email: user.email,
    metadata: user.user_metadata ?? {},
  });

  let username = candidates[0];
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

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.user_name ||
    user.email?.split('@')[0] ||
    'Yeni Kullanıcı';

  await supabase.from('user_profiles').insert({
    id: user.id,
    username,
    full_name: fullName,
    avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
    is_developer: false,
    developer_approved: false,
  });
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
