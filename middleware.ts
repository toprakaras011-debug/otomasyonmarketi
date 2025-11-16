import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// --- Configuration ---
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds
const RATE_LIMIT_MAX_REQUESTS = 100; // Max 100 requests per window per IP
const BLOCKED_USER_AGENTS = ['BadBot', 'AhrefsBot', 'SemrushBot', 'MJ12bot']; // Example bot names
const BLOCKED_COUNTRIES = ['KP', 'IR', 'SY']; // Block North Korea, Iran, Syria (example)

// In-memory store for rate limiting (for demonstration; use Redis/Upstash in production)
const ipRequestCounts = new Map<string, { count: number; timestamp: number }>();

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
  const userAgent = request.headers.get('user-agent') ?? '';
  const country = request.headers.get('x-vercel-ip-country') ?? '';

  // --- Security Checks ---

  // 1. Bot Detection
  if (BLOCKED_USER_AGENTS.some(bot => userAgent.toLowerCase().includes(bot.toLowerCase()))) {
    console.warn(`Blocked bot detected: ${userAgent}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2. Geo-blocking
  if (BLOCKED_COUNTRIES.includes(country)) {
    console.warn(`Blocked country detected: ${country}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 3. Rate Limiting
  const now = Date.now();
  const record = ipRequestCounts.get(ip);

  if (record && now - record.timestamp < RATE_LIMIT_WINDOW) {
    if (record.count > RATE_LIMIT_MAX_REQUESTS) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return new NextResponse('Too Many Requests', { status: 429 });
    }
    ipRequestCounts.set(ip, { count: record.count + 1, timestamp: record.timestamp });
  } else {
    ipRequestCounts.set(ip, { count: 1, timestamp: now });
  }

  // Clean up old entries from the map to prevent memory leaks
  for (const [key, value] of ipRequestCounts.entries()) {
    if (now - value.timestamp > RATE_LIMIT_WINDOW) {
      ipRequestCounts.delete(key);
    }
  }

  // --- Supabase Session Management ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: CookieOptions) => {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  await supabase.auth.getSession();
  
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
