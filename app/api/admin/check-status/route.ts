import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';


// Admin email list - matches auth.ts and callback route
const ADMIN_EMAILS = [
  'ftnakras01@gmail.com',
].map(email => email.toLowerCase());

export async function GET() {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { 
          authenticated: false,
          message: 'Oturum doğrulanamadı',
          error: authError?.message 
        },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, username, role, is_admin, email')
      .eq('id', user.id)
      .maybeSingle();

    const userEmail = user.email?.toLowerCase() || '';
    const isAdminEmail = ADMIN_EMAILS.includes(userEmail);
    const isAdmin = 
      profile?.role === 'admin' || 
      profile?.is_admin === true || 
      isAdminEmail;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        emailConfirmed: !!user.email_confirmed_at,
      },
      profile: profile ? {
        id: profile.id,
        username: profile.username,
        role: profile.role,
        is_admin: profile.is_admin,
      } : null,
      adminCheck: {
        isAdminEmail,
        profileRole: profile?.role,
        profileIsAdmin: profile?.is_admin,
        finalIsAdmin: isAdmin,
      },
      profileError: profileError ? {
        message: profileError.message,
        code: profileError.code,
      } : null,
    });
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('Admin check status error', errorObj);
    
    const errorMessage = errorObj.message;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        authenticated: false,
      },
      { status: 500 }
    );
  }
}

