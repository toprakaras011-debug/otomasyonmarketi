import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı. Lütfen tekrar giriş yapın.' },
        { status: 401 }
      );
    }

    // Delete user profile first
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Profile deletion error:', profileError);
      }
      return NextResponse.json(
        { message: 'Profil silinirken bir hata oluştu.' },
        { status: 500 }
      );
    }

    // Delete auth user using admin client (requires service role key)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      // If service role key is not available, just sign out the user
      await supabase.auth.signOut();
      return NextResponse.json(
        { 
          message: 'Hesap silme işlemi başlatıldı. Lütfen çıkış yapın.',
          requiresSignOut: true 
        },
        { status: 200 }
      );
    }

    // Use admin client to delete user
    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

    if (deleteError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('User deletion error:', deleteError);
      }
      // Even if admin delete fails, sign out the user
      await supabase.auth.signOut();
      return NextResponse.json(
        { 
          message: 'Hesap silme işlemi tamamlandı. Lütfen çıkış yapın.',
          requiresSignOut: true 
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      message: 'Hesabınız başarıyla silindi.',
      success: true,
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (process.env.NODE_ENV === 'development') {
      console.error('Account deletion error:', error);
    }
    return NextResponse.json(
      { message: err.message || 'Hesap silinirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

