import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  if (!isAdmin) {
    return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 403 });
  }

  return { supabase, user } as const;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const automationId = params.id;

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

  const { error: rpcError } = await supabase.rpc(rpcName, {
    automation_id: automationId,
    admin_id: user.id,
  });

  if (rpcError) {
    return NextResponse.json({ message: rpcError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const automationId = params.id;

  const context = await resolveAuthContext(request, automationId);
  if ('json' in context) {
    return context;
  }
  const { supabase } = context;

  const { error } = await supabase
    .from('automations')
    .delete()
    .eq('id', automationId);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
