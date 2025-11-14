import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import { getErrorMessage, getErrorCategory } from '@/lib/error-messages';

/**
 * Fix orphaned profiles - profiles that exist in user_profiles but not in auth.users
 * POST /api/fix-orphaned-profiles?email=user@example.com
 * 
 * This will delete the orphaned profile so user can sign up again
 */
export async function POST(request: NextRequest) {
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

    // Note: We can't directly check auth.users without admin access
    // But we can delete the profile if it exists
    // User will need to sign up again which will create both auth.users and user_profiles

    const result: any = {
      email: normalizedEmail,
      action: 'checking',
      message: '',
      deleted: false,
    };

    // Since user_profiles doesn't have email column, we need to find by other means
    // Actually, we can't find profile by email without admin access
    // So we'll provide SQL script instead
    
    result.message = 'Cannot directly delete orphaned profile without admin access.';
    result.instructions = [
      'To fix orphaned profile, run this SQL in Supabase SQL Editor:',
      '',
      `-- Find orphaned profile (if you know the user_id):`,
      `-- SELECT * FROM user_profiles WHERE id = 'USER_ID_HERE';`,
      '',
      `-- Or find all orphaned profiles (profiles without auth.users entry):`,
      `SELECT up.* FROM user_profiles up`,
      `LEFT JOIN auth.users au ON up.id = au.id`,
      `WHERE au.id IS NULL;`,
      '',
      `-- Delete orphaned profile (replace USER_ID with actual user_id):`,
      `-- DELETE FROM user_profiles WHERE id = 'USER_ID_HERE';`,
      '',
      'After deleting, user can sign up again normally.',
    ];

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('Fix orphaned profiles API error', errorObj);

    const category = getErrorCategory(errorObj);
    const errorMessage = getErrorMessage(errorObj, category, 'Orphaned profile düzeltme başarısız oldu');

    return NextResponse.json(
      {
        error: 'Failed to fix orphaned profile',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

