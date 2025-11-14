import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';
import { getErrorMessage, getErrorCategory } from '@/lib/error-messages';

// Admin email list
const ADMIN_EMAILS = [
  'ftnakras01@gmail.com',
].map(email => email.toLowerCase());

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'E-posta adresi gereklidir' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Check if user is admin
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim. Giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    const userEmail = currentUser.email?.toLowerCase() || '';
    const isAdminEmail = ADMIN_EMAILS.includes(userEmail);

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, is_admin')
      .eq('id', currentUser.id)
      .maybeSingle();

    const isAdmin =
      profile?.role === 'admin' ||
      profile?.is_admin === true ||
      isAdminEmail;

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim. Admin yetkisi gereklidir.' },
        { status: 403 }
      );
    }

    // 2. Find user by email using admin client
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      logger.error('Failed to list users', listError);
      throw new Error('Kullanıcı listesi alınamadı');
    }

    const targetUser = authUsers.users.find(
      (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
    );

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kullanıcı auth.users tablosunda bulunamadı. Önce Supabase Dashboard\'dan kullanıcıyı oluşturun.',
        },
        { status: 404 }
      );
    }

    const userId = targetUser.id;

    // 3. Check if profile exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileCheckError) {
      logger.error('Profile check error', profileCheckError);
      throw new Error('Profil kontrolü başarısız');
    }

    let profileData;

    if (!existingProfile) {
      // Create profile
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          username: email.split('@')[0],
          full_name: 'Kullanıcı',
          email: email.trim(),
          is_developer: true,
          developer_approved: true,
          role: 'admin',
          is_admin: true,
        })
        .select()
        .single();

      if (createError) {
        logger.error('Profile creation error', createError);
        throw new Error(`Profil oluşturulamadı: ${createError.message}`);
      }

      profileData = newProfile;
      logger.info('Profile created', { userId, email });
    } else {
      // Update profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          is_developer: true,
          developer_approved: true,
          role: 'admin',
          is_admin: true,
          email: email.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        logger.error('Profile update error', updateError);
        throw new Error(`Profil güncellenemedi: ${updateError.message}`);
      }

      profileData = updatedProfile;
      logger.info('Profile updated', { userId, email });
    }

    // 4. Get automations
    const { data: automations, error: automationError } = await supabase
      .from('automations')
      .select('id, title, slug, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (automationError) {
      logger.warn('Automation fetch error', automationError);
    }

    // 5. Return result
    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: email.trim(),
        emailConfirmed: !!targetUser.email_confirmed_at,
      },
      profile: {
        id: profileData.id,
        username: profileData.username,
        full_name: profileData.full_name,
        is_developer: profileData.is_developer,
        developer_approved: profileData.developer_approved,
        role: profileData.role,
        is_admin: profileData.is_admin,
      },
      automations: {
        total: automations?.length || 0,
        list: automations || [],
      },
    });
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('Restore user error', errorObj);

    const category = getErrorCategory(errorObj);
    const errorMessage = getErrorMessage(errorObj, category, 'Kullanıcı geri getirme işlemi başarısız oldu');

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

