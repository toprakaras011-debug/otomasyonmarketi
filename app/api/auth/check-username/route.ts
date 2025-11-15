import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * API endpoint to check if a username is available
 * GET /api/auth/check-username?username=testuser
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username')?.trim();

    if (!username) {
      return NextResponse.json(
        { available: false, error: 'Kullanıcı adı gereklidir.' },
        { status: 400 }
      );
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { available: false, error: 'Geçersiz kullanıcı adı formatı.' },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { available: false, error: 'Kullanıcı adı 3-30 karakter arasında olmalıdır.' },
        { status: 400 }
      );
    }

    // Check if username exists (case-insensitive)
    // Use ilike for case-insensitive comparison
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, username')
      .ilike('username', username)
      .maybeSingle();

    if (error) {
      // If it's a RLS error, we can't check - assume available to allow signup
      if (error.code === 'PGRST301' || error.code === '42501') {
        return NextResponse.json({ 
          available: true,
          message: 'Kullanıcı adı kullanılabilir.' 
        });
      }
      
      // For other errors, log but assume available to not block signup
      // The actual signup will fail if username is truly taken
      return NextResponse.json({ 
        available: true,
        message: 'Kullanıcı adı kontrol edilemedi, ancak kayıt denenebilir.' 
      });
    }

    // Username is available if no data is returned
    const available = !data;

    return NextResponse.json({
      available,
      message: available
        ? 'Kullanıcı adı kullanılabilir.'
        : 'Bu kullanıcı adı zaten kullanılıyor.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { available: false, error: 'Bir hata oluştu.' },
      { status: 500 }
    );
  }
}

