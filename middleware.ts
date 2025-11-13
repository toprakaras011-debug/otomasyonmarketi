import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Note: In Next.js 16+, middleware is still supported but proxy is recommended for future
// This middleware adds security and performance headers + handles Supabase session
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // ============================================
  // STEP 1: Handle OAuth redirect issues
  // ============================================
  const url = request.nextUrl;
  
  // Prevent OAuth errors from reaching reset-password page
  if (url.pathname === '/auth/reset-password') {
    const error = url.searchParams.get('error');
    const code = url.searchParams.get('code');
    const type = url.searchParams.get('type');
    
    // If there's an OAuth error or code without recovery type, redirect to signin
    if ((error && error !== 'invalid_token') || (code && type !== 'recovery')) {
      const signinUrl = new URL('/auth/signin', request.url);
      signinUrl.searchParams.set('error', 'oauth_failed');
      signinUrl.searchParams.set('message', 'OAuth girişi başarısız oldu. Lütfen tekrar deneyin.');
      return NextResponse.redirect(signinUrl);
    }
  }

  // Create Supabase client for session management
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if needed (this updates cookies automatically)
  await supabase.auth.getSession();

  // Security headers (Enhanced)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Performance headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  // HSTS (HTTP Strict Transport Security) for HTTPS enforcement
  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.webmanifest (PWA manifest)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml).*)',
  ],
};
