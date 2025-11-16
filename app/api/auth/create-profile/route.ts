import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username, fullName, phone } = body;

    // Validate inputs
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Kullanıcı adı gereklidir.' },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      return NextResponse.json(
        { error: 'Kullanıcı adı en az 3 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    if (trimmedUsername.length > 30) {
      return NextResponse.json(
        { error: 'Kullanıcı adı en fazla 30 karakter olabilir.' },
        { status: 400 }
      );
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      return NextResponse.json(
        { error: 'Kullanıcı adı sadece harf, rakam, alt çizgi ve tire içerebilir.' },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profil zaten mevcut.' },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const { data: usernameTaken } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', trimmedUsername)
      .maybeSingle();

    if (usernameTaken) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı zaten kullanılıyor. Lütfen farklı bir kullanıcı adı seçin.' },
        { status: 400 }
      );
    }

    // Normalize phone if provided
    let normalizedPhone = phone?.trim() || null;
    if (normalizedPhone) {
      normalizedPhone = normalizedPhone.replace(/\D/g, '');
      if (normalizedPhone.length !== 10 && normalizedPhone.length !== 11) {
        return NextResponse.json(
          { error: 'Geçerli bir telefon numarası giriniz (10 veya 11 haneli).' },
          { status: 400 }
        );
      }
      if (normalizedPhone.length === 11 && normalizedPhone.startsWith('0')) {
        normalizedPhone = normalizedPhone.substring(1);
      }
    }

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        username: trimmedUsername,
        full_name: fullName?.trim() || null,
        phone: normalizedPhone || null,
      })
      .select()
      .single();

    if (profileError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Profile creation error:', profileError);
      }

      // Check for specific errors
      const errorMessage = profileError.message?.toLowerCase() || '';
      const errorCode = profileError.code;

      // Username already exists (race condition)
      if (
        errorCode === '23505' ||
        errorMessage.includes('unique') ||
        errorMessage.includes('duplicate') ||
        errorMessage.includes('already exists')
      ) {
        return NextResponse.json(
          { error: 'Bu kullanıcı adı zaten kullanılıyor. Lütfen farklı bir kullanıcı adı seçin.' },
          { status: 400 }
        );
      }

      // RLS policy error
      if (errorCode === '42501' || errorMessage.includes('permission denied') || errorMessage.includes('policy')) {
        return NextResponse.json(
          { error: 'Profil oluşturma izni yok. Lütfen destek ekibiyle iletişime geçin.' },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: `Profil oluşturulamadı: ${profileError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        profile: profileData,
        message: 'Profil başarıyla oluşturuldu.' 
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Create profile API error:', error);
    }
    return NextResponse.json(
      { error: error?.message || 'Beklenmeyen bir hata oluştu.' },
      { status: 500 }
    );
  }
}

