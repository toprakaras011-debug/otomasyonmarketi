import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { username } = body;

    // Validate input
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { available: false, error: 'Kullanıcı adı gereklidir.' },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    
    // Basic validation
    if (trimmedUsername.length < 3) {
      return NextResponse.json(
        { available: false, error: 'Kullanıcı adı en az 3 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    if (trimmedUsername.length > 30) {
      return NextResponse.json(
        { available: false, error: 'Kullanıcı adı en fazla 30 karakter olabilir.' },
        { status: 400 }
      );
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      return NextResponse.json(
        { available: false, error: 'Kullanıcı adı sadece harf, rakam, alt çizgi ve tire içerebilir.' },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const { data: existingUser, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', trimmedUsername)
      .maybeSingle();

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Username check error:', error);
      }
      return NextResponse.json(
        { available: false, error: 'Kullanıcı adı kontrol edilemedi. Lütfen tekrar deneyin.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        available: !existingUser,
        username: trimmedUsername,
        message: existingUser ? 'Bu kullanıcı adı zaten kullanılıyor.' : 'Bu kullanıcı adı kullanılabilir.'
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Check username API error:', error);
    }
    return NextResponse.json(
      { available: false, error: error?.message || 'Beklenmeyen bir hata oluştu.' },
      { status: 500 }
    );
  }
}
