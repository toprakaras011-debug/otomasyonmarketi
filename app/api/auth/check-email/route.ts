import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { email } = body;

    // Validate input
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { available: false, error: 'E-posta adresi gereklidir.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { available: false, error: 'Geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      );
    }

    // Check if email is already registered using Supabase Auth Admin API
    // We need to use the service role key to check auth.users table
    const { createClient: createAdminClient } = await import('@supabase/supabase-js');
    
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Try to get user by email (more efficient than listing all users)
    let emailExists = false;
    try {
      // Use admin API to check if user exists with this email
      // We'll use a more efficient approach: try to get user by email
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });

      if (!authError && authUsers?.users) {
        // Search through users (unfortunately Supabase doesn't have a direct email lookup)
        // But we can optimize by checking only first page and using a more targeted approach
        const { data: allUsers } = await supabaseAdmin.auth.admin.listUsers();
        emailExists = allUsers?.users?.some(user => 
          user.email?.toLowerCase() === trimmedEmail
        ) || false;
      } else {
        // Fallback: try checking user_profiles table
        const { data: profileUser } = await supabase
          .from('user_profiles')
          .select('id')
          .maybeSingle();
        
        emailExists = !!profileUser;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Email check error:', error);
      }
      // Fallback: try checking user_profiles table
      const { data: profileUser } = await supabase
        .from('user_profiles')
        .select('id')
        .maybeSingle();
      
      emailExists = !!profileUser;
    }

    return NextResponse.json(
      { 
        available: !emailExists,
        email: trimmedEmail,
        message: emailExists ? 'Bu e-posta adresi zaten kayıtlı.' : 'Bu e-posta adresi kullanılabilir.'
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Check email API error:', error);
    }
    return NextResponse.json(
      { available: false, error: error?.message || 'Beklenmeyen bir hata oluştu.' },
      { status: 500 }
    );
  }
}

