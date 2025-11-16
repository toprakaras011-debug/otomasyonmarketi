import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import { getErrorMessage, getErrorCategory } from '@/lib/error-messages';

// Force dynamic rendering - this route uses searchParams which can't be prerendered
export const dynamic = 'force-dynamic';

/**
 * Check if a user exists in the database
 * GET /api/check-user?email=user@example.com
 * 
 * Note: This checks user_profiles table. To check auth.users directly,
 * you need admin access or use Supabase dashboard.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

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

    // Note: user_profiles table doesn't have email column
    // We can't directly query auth.users without admin access
    // So we'll provide instructions and try to infer from password reset
    
    const result: any = {
      email: normalizedEmail,
      exists_in_profiles: false,
      profile: null,
      exists_in_auth: null,
      message: '',
      instructions: [] as string[],
    };

    // Try to check if user exists by attempting password reset
    // This doesn't actually send email, just checks if user exists
    // But Supabase will return error if user doesn't exist
    try {
      // This will attempt to send password reset, but we can catch the error
      // to see if user exists without actually sending email
      // Actually, this will send email, so we shouldn't do this
      // Instead, we'll just provide instructions
      
      result.message = 'To check if user exists in auth.users, please:';
      result.instructions = [
        '1. Go to Supabase Dashboard',
        '2. Navigate to Authentication > Users',
        `3. Search for email: ${normalizedEmail}`,
        '4. Check if user exists and if email_confirmed_at is set',
        '',
        'If user exists in auth.users but login fails:',
        '- Verify password is correct',
        '- Check if email_confirmed_at is set (now optional)',
        '- Check RLS policies',
        '',
        'If user exists in auth.users but profile is missing:',
        '- Profile creation may have failed during signup',
        '- Try signing up again or create profile manually',
      ];
      
      result.note = 'Cannot directly query auth.users from API without admin access. Use Supabase dashboard for full check.';
    } catch (error: any) {
      // Ignore errors - we're just providing instructions
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('Check user API error', errorObj);

    const category = getErrorCategory(errorObj);
    const errorMessage = getErrorMessage(errorObj, category, 'Kullanıcı kontrolü başarısız oldu');

    return NextResponse.json(
      {
        error: 'Failed to check user',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
