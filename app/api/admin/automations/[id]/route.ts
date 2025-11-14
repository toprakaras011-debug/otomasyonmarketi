import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Admin email list - matches auth.ts and callback route
const ADMIN_EMAILS = [
  'ftnakras01@gmail.com',
].map(email => email.toLowerCase());

async function resolveAuthContext(request: Request, automationId: string) {
  if (!automationId || automationId === 'undefined' || automationId === 'null') {
    console.error('Invalid automation ID received:', automationId);
    return NextResponse.json({ message: 'Geçersiz otomasyon kimliği' }, { status: 400 });
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(automationId)) {
    console.error('Invalid UUID format for automation ID:', automationId);
    return NextResponse.json({ message: 'Geçersiz otomasyon kimliği formatı' }, { status: 400 });
  }

  const supabase = await createClient();
  const authHeader = request.headers.get('authorization');

  const userResponse = authHeader?.startsWith('Bearer ')
    ? await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    : await supabase.auth.getUser();

  const {
    data: { user },
    error: authError,
  } = userResponse;

  if (authError || !user) {
    return NextResponse.json({ message: 'Oturum doğrulanamadı' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role, is_admin')
    .eq('id', user.id)
    .maybeSingle();

  console.log('[DEBUG] api/admin/automations/[id] - Profile check', {
    userId: user.id,
    userEmail: user.email,
    hasProfile: !!profile,
    profileRole: profile?.role,
    profileIsAdmin: profile?.is_admin,
    profileError: profileError ? {
      message: profileError.message,
      code: profileError.code,
    } : null,
  });

  if (profileError) {
    console.error('[DEBUG] api/admin/automations/[id] - Profile fetch error', {
      userId: user.id,
      error: profileError,
    });
    return NextResponse.json({ message: 'Profil bilgisi alınamadı' }, { status: 500 });
  }

  // Check admin status: role, is_admin flag, or email in ADMIN_EMAILS list
  const userEmail = user.email?.toLowerCase() || '';
  const isAdminEmail = ADMIN_EMAILS.includes(userEmail);
  const isAdmin = 
    profile?.role === 'admin' || 
    profile?.is_admin === true || 
    isAdminEmail;

  console.log('[DEBUG] api/admin/automations/[id] - Admin check', {
    userId: user.id,
    userEmail,
    isAdminEmail,
    profileRole: profile?.role,
    profileIsAdmin: profile?.is_admin,
    finalIsAdmin: isAdmin,
  });

  if (!isAdmin) {
    console.warn('[DEBUG] api/admin/automations/[id] - User is not admin', {
      userId: user.id,
      userEmail,
      isAdminEmail,
      profileRole: profile?.role,
      profileIsAdmin: profile?.is_admin,
    });
    return NextResponse.json({ message: 'Yetkisiz erişim. Admin yetkisi gereklidir.' }, { status: 403 });
  }

  return { supabase, user } as const;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const automationId = resolvedParams.id;

    console.log('[DEBUG] api/admin/automations/[id] - POST request', {
      automationId,
    });

    if (!automationId) {
      return NextResponse.json({ message: 'Otomasyon kimliği bulunamadı' }, { status: 400 });
    }

    const context = await resolveAuthContext(request, automationId);
    if ('json' in context) {
      return context;
    }
    const { supabase, user } = context;

    let payload: { approved?: boolean };

    try {
      payload = await request.json();
    } catch (error) {
      return NextResponse.json({ message: 'Geçersiz istek gövdesi' }, { status: 400 });
    }

    if (typeof payload.approved !== 'boolean') {
      return NextResponse.json({ message: 'approved alanı zorunludur' }, { status: 400 });
    }

    const rpcName = payload.approved ? 'approve_automation' : 'reject_automation';

    console.log('[DEBUG] api/admin/automations/[id] - Calling RPC', {
      automationId,
      rpcName,
      adminId: user.id,
    });

    const { error: rpcError } = await supabase.rpc(rpcName, {
      automation_id: automationId,
      admin_id: user.id,
    });

    if (rpcError) {
      console.error('[DEBUG] api/admin/automations/[id] - RPC error', {
        automationId,
        rpcName,
        error: rpcError.message,
        code: rpcError.code,
      });
      return NextResponse.json({ message: rpcError.message }, { status: 400 });
    }

    console.log('[DEBUG] api/admin/automations/[id] - Success', {
      automationId,
      rpcName,
      adminId: user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'İşlem başarısız oldu';
    const errorStack = error instanceof Error && process.env.NODE_ENV === 'development' ? error.stack : undefined;
    
    console.error('[DEBUG] api/admin/automations/[id] - POST error', {
      message: errorMessage,
      stack: errorStack,
    });
    
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const automationId = resolvedParams.id;

    console.log('[DEBUG] api/admin/automations/[id] - DELETE request', {
      automationId,
    });

    if (!automationId) {
      return NextResponse.json({ message: 'Otomasyon kimliği bulunamadı' }, { status: 400 });
    }

    const context = await resolveAuthContext(request, automationId);
    if ('json' in context) {
      return context;
    }
    const { supabase, user } = context;

    console.log('[DEBUG] api/admin/automations/[id] - Deleting automation', {
      automationId,
      adminId: user.id,
    });

    const { error } = await supabase
      .from('automations')
      .delete()
      .eq('id', automationId);

    if (error) {
      console.error('[DEBUG] api/admin/automations/[id] - Delete error', {
        automationId,
        error: error.message,
        code: error.code,
      });
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.log('[DEBUG] api/admin/automations/[id] - Delete success', {
      automationId,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Silme işlemi başarısız oldu';
    const errorStack = error instanceof Error && process.env.NODE_ENV === 'development' ? error.stack : undefined;
    
    console.error('[DEBUG] api/admin/automations/[id] - DELETE error', {
      message: errorMessage,
      stack: errorStack,
    });
    
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
