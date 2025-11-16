import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const normalizeUsername = (value: string) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
};

const buildUsernameCandidates = (params: {
  email?: string | null;
  metadata?: Record<string, any>;
}) => {
  const { email, metadata = {} } = params;
  const candidates: string[] = [];

  // Try metadata usernames first (from OAuth providers)
  const metaUsernames = [
    metadata.username,
    metadata.user_name,
    metadata.preferred_username,
    metadata.login, // GitHub username
    metadata.nickname, // Google nickname
    metadata.sub, // OAuth subject
  ]
    .filter(Boolean)
    .map((value: string) => {
      const normalized = normalizeUsername(value);
      return normalized && normalized.length >= 3 ? normalized : null;
    })
    .filter((value): value is string => value !== null);

  candidates.push(...metaUsernames);

  // Try full name from metadata
  const fullName = metadata.full_name || metadata.name;
  if (fullName) {
    const nameParts = fullName.split(' ').filter(Boolean);
    if (nameParts.length > 0) {
      // Try first name + last name initial
      if (nameParts.length >= 2) {
        const firstName = normalizeUsername(nameParts[0]);
        const lastNameInitial = normalizeUsername(nameParts[nameParts.length - 1][0] || '');
        if (firstName && lastNameInitial) {
          candidates.push(`${firstName}${lastNameInitial}`);
        }
      }
      // Try just first name
      const firstName = normalizeUsername(nameParts[0]);
      if (firstName && firstName.length >= 3) {
        candidates.push(firstName);
      }
    }
  }

  // Try email username
  if (email) {
    const emailUser = normalizeUsername(email.split('@')[0] ?? '');
    if (emailUser && emailUser.length >= 3) {
      candidates.push(emailUser);
    }
  }

  // Generate random username as fallback
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  candidates.push(`kullanici${randomSuffix}`);

  return Array.from(new Set(candidates)).filter(Boolean);
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Kullanıcı oturumu bulunamadı.' },
        { status: 401 }
      );
    }

    // Check current profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, username, full_name')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Profile fetch error:', profileError);
      }
      return NextResponse.json(
        { error: 'Profil bilgisi alınamadı.' },
        { status: 500 }
      );
    }

    // If profile doesn't exist, create it
    if (!profile) {
      const candidates = buildUsernameCandidates({
        email: user.email,
        metadata: user.user_metadata ?? {},
      });

      let username = candidates[0] || `kullanici${Math.random().toString(36).slice(2, 8)}`;
      
      for (const candidate of candidates) {
        if (!candidate || candidate.trim() === '') continue;
        
        const { data: sameUsername } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('username', candidate)
          .maybeSingle();

        if (!sameUsername) {
          username = candidate;
          break;
        }
      }

      // Ensure username is not empty
      if (!username || username.trim() === '') {
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
          const randomUsername = `kullanici${Math.random().toString(36).slice(2, 10)}`;
          const { data: existing } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('username', randomUsername)
            .maybeSingle();
          
          if (!existing) {
            username = randomUsername;
            break;
          }
          attempts++;
        }
        
        if (!username || username.trim() === '' || attempts >= maxAttempts) {
          username = `kullanici${Date.now().toString(36)}${Math.random().toString(36).slice(2, 4)}`;
        }
      }

      // Get full name from metadata - try multiple sources
      let fullName: string | null = null;
      
      if (user.user_metadata?.full_name) {
        fullName = user.user_metadata.full_name;
      } else if (user.user_metadata?.name) {
        fullName = user.user_metadata.name;
      } else if (user.user_metadata?.given_name && user.user_metadata?.family_name) {
        fullName = `${user.user_metadata.given_name} ${user.user_metadata.family_name}`.trim();
      } else if (user.user_metadata?.user_name) {
        fullName = user.user_metadata.user_name;
      } else if (user.user_metadata?.display_name) {
        fullName = user.user_metadata.display_name;
      } else if (user.email) {
        fullName = user.email.split('@')[0];
      }

      const phone = user.user_metadata?.phone || null;
      const avatarUrl = 
        user.user_metadata?.avatar_url || 
        user.user_metadata?.picture || 
        user.user_metadata?.avatar || 
        null;

      const { error: insertError } = await supabase.from('user_profiles').insert({
        id: user.id,
        username: username.trim(),
        full_name: fullName,
        phone: phone,
        avatar_url: avatarUrl,
        is_developer: false,
        developer_approved: false,
      });

      if (insertError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Profile creation error:', insertError);
        }
        return NextResponse.json(
          { error: 'Profil oluşturulamadı.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { 
          success: true, 
          username: username.trim(),
          message: 'Kullanıcı adı oluşturuldu.' 
        },
        { status: 200 }
      );
    }

    // If profile exists but username is empty
    if (!profile.username || profile.username.trim() === '') {
      const candidates = buildUsernameCandidates({
        email: user.email,
        metadata: user.user_metadata ?? {},
      });

      let username = candidates[0] || `kullanici${Math.random().toString(36).slice(2, 8)}`;
      
      for (const candidate of candidates) {
        if (!candidate || candidate.trim() === '') continue;
        
        const { data: sameUsername } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('username', candidate)
          .maybeSingle();

        if (!sameUsername) {
          username = candidate;
          break;
        }
      }

      // Ensure username is not empty
      if (!username || username.trim() === '') {
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
          const randomUsername = `kullanici${Math.random().toString(36).slice(2, 10)}`;
          const { data: existing } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('username', randomUsername)
            .maybeSingle();
          
          if (!existing) {
            username = randomUsername;
            break;
          }
          attempts++;
        }
        
        if (!username || username.trim() === '' || attempts >= maxAttempts) {
          username = `kullanici${Date.now().toString(36)}${Math.random().toString(36).slice(2, 4)}`;
        }
      }

      // Also update full_name if it's empty
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.user_metadata?.user_name ||
        user.email?.split('@')[0] ||
        null;

      const updateData: any = { username: username.trim() };
      if (fullName && (!profile.full_name || profile.full_name.trim() === '')) {
        updateData.full_name = fullName;
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Username update error:', updateError);
        }
        return NextResponse.json(
          { error: 'Kullanıcı adı güncellenemedi.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { 
          success: true, 
          username: username.trim(),
          full_name: updateData.full_name || profile.full_name,
          message: 'Kullanıcı adı oluşturuldu.' 
        },
        { status: 200 }
      );
    }

    // Username already exists, but check if full_name is empty
    if (!profile.full_name || profile.full_name.trim() === '') {
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.user_metadata?.user_name ||
        user.email?.split('@')[0] ||
        null;

      if (fullName) {
        await supabase
          .from('user_profiles')
          .update({ full_name: fullName })
          .eq('id', user.id);
        
        return NextResponse.json(
          { 
            success: true, 
            username: profile.username,
            full_name: fullName,
            message: 'Ad soyad güncellendi.' 
          },
          { status: 200 }
        );
      }
    }

    // Username already exists
    return NextResponse.json(
      { 
        success: true, 
        username: profile.username,
        full_name: profile.full_name,
        message: 'Kullanıcı adı zaten mevcut.' 
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Ensure username API error:', error);
    }
    return NextResponse.json(
      { error: error?.message || 'Beklenmeyen bir hata oluştu.' },
      { status: 500 }
    );
  }
}

