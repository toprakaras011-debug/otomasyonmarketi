import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API Authentication Middleware
 * Checks if user is authenticated before allowing API access
 */
export async function requireAuth(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    return { session, user: session.user };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Kimlik doğrulama hatası.' },
      { status: 500 }
    );
  }
}

/**
 * Require Admin Role
 * Checks if user is admin before allowing access
 */
export async function requireAdmin(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Return error response
  }

  const { user } = authResult;
  
  try {
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('is_admin, role')
      .eq('id', user.id)
      .single();

    if (error || !profile || (!profile.is_admin && profile.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Bu işlem için admin yetkisi gerekiyor.' },
        { status: 403 }
      );
    }

    return { ...authResult, profile };
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Yetki kontrolü hatası.' },
      { status: 500 }
    );
  }
}

/**
 * Require Developer Role
 * Checks if user is developer before allowing access
 */
export async function requireDeveloper(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult; // Return error response
  }

  const { user } = authResult;
  
  try {
    const supabase = await createClient();
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('is_developer, developer_approved')
      .eq('id', user.id)
      .single();

    if (error || !profile || !profile.is_developer) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Bu işlem için geliştirici hesabı gerekiyor.' },
        { status: 403 }
      );
    }

    if (!profile.developer_approved) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'Geliştirici hesabınız henüz onaylanmamış.' },
        { status: 403 }
      );
    }

    return { ...authResult, profile };
  } catch (error) {
    console.error('Developer check error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Yetki kontrolü hatası.' },
      { status: 500 }
    );
  }
}

/**
 * Rate Limiting Helper
 * Simple in-memory rate limiting (for production use Redis or similar)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Get client IP address
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Validate request body
 */
export function validateRequestBody<T>(
  body: any,
  requiredFields: string[]
): { valid: boolean; error?: string; data?: T } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  for (const field of requiredFields) {
    if (!(field in body) || body[field] === null || body[field] === undefined) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  return { valid: true, data: body as T };
}

/**
 * Error response helper
 */
export function errorResponse(
  message: string,
  status: number = 400,
  details?: any
) {
  return NextResponse.json(
    {
      error: true,
      message,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Success response helper
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}
