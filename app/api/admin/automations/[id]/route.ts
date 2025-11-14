/**
 * Admin Automation Management API
 * 
 * Handles approval, rejection, and deletion of automations by admin users.
 * 
 * @route /api/admin/automations/[id]
 * @method POST - Approve or reject an automation
 * @method DELETE - Delete an automation
 * 
 * @requires Admin role or email in ADMIN_EMAILS list
 * @returns { success: boolean } on success
 * @returns { message: string } on error
 * 
 * @example
 * POST /api/admin/automations/123
 * Body: { approved: true }
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { getErrorMessage, getErrorCategory, sanitizeError } from '@/lib/error-messages';

// Admin email list - matches auth.ts and callback route
const ADMIN_EMAILS = [
  'ftnakras01@gmail.com',
].map(email => email.toLowerCase());

/**
 * Resolve authentication context and verify admin access
 * 
 * @param request - The incoming request
 * @param automationId - The automation ID to validate
 * @returns User context or error response
 */
async function resolveAuthContext(request: Request, automationId: string) {
  if (!automationId || automationId === 'undefined' || automationId === 'null') {
    logger.error('Invalid automation ID received', { automationId });
    return NextResponse.json({ message: getErrorMessage(new Error('Invalid automation ID'), 'validation') }, { status: 400 });
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(automationId)) {
    logger.error('Invalid UUID format for automation ID', { automationId });
    return NextResponse.json({ message: getErrorMessage(new Error('Invalid UUID format'), 'validation') }, { status: 400 });
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
      const error = authError || new Error('User not authenticated');
      const category = getErrorCategory(error);
      return NextResponse.json({ message: getErrorMessage(error, category, 'Authentication') }, { status: 401 });
    }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('role, is_admin')
    .eq('id', user.id)
    .maybeSingle();

  logger.debug('Profile check', {
    userId: user.id,
    userEmail: user.email,
    hasProfile: !!profile,
    profileRole: profile?.role,
    profileIsAdmin: profile?.is_admin,
    profileError: profileError ? sanitizeError(profileError) : null,
  });

  if (profileError) {
    logger.error('Profile fetch error', profileError, {
      userId: user.id,
    });
    const category = getErrorCategory(profileError);
    return NextResponse.json({ message: getErrorMessage(profileError, category, 'Profile fetch') }, { status: 500 });
  }

  // Check admin status: role, is_admin flag, or email in ADMIN_EMAILS list
  const userEmail = user.email?.toLowerCase() || '';
  const isAdminEmail = ADMIN_EMAILS.includes(userEmail);
  const isAdmin = 
    profile?.role === 'admin' || 
    profile?.is_admin === true || 
    isAdminEmail;

  logger.debug('Admin check', {
    userId: user.id,
    userEmail,
    isAdminEmail,
    profileRole: profile?.role,
    profileIsAdmin: profile?.is_admin,
    finalIsAdmin: isAdmin,
  });

  if (!isAdmin) {
    logger.warn('User is not admin', {
      userId: user.id,
      userEmail,
      isAdminEmail,
      profileRole: profile?.role,
      profileIsAdmin: profile?.is_admin,
    });
    return NextResponse.json({ message: getErrorMessage(new Error('Unauthorized access'), 'permission') }, { status: 403 });
  }

  return { supabase, user } as const;
}

/**
 * Approve or reject an automation
 * 
 * @param request - The incoming request with { approved: boolean } in body
 * @param params - Route parameters containing automation ID
 * @returns Success or error response
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const automationId = resolvedParams.id;

    logger.debug('POST request', { automationId });

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
      const errorObj = error instanceof Error ? error : new Error(String(error));
      return NextResponse.json({ message: getErrorMessage(errorObj, 'validation', 'Request body parsing') }, { status: 400 });
    }

    if (typeof payload.approved !== 'boolean') {
      return NextResponse.json({ message: getErrorMessage(new Error('approved field is required'), 'validation') }, { status: 400 });
    }

    const rpcName = payload.approved ? 'approve_automation' : 'reject_automation';

    logger.debug('Calling RPC', {
      automationId,
      rpcName,
      adminId: user.id,
    });

    const { error: rpcError } = await supabase.rpc(rpcName, {
      automation_id: automationId,
      admin_id: user.id,
    });

    if (rpcError) {
      logger.error('RPC error', rpcError, {
        automationId,
        rpcName,
      });
      const category = getErrorCategory(rpcError);
      return NextResponse.json({ message: getErrorMessage(rpcError, category, 'Automation update') }, { status: 400 });
    }

    logger.info('Success', {
      automationId,
      rpcName,
      adminId: user.id,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('POST error', errorObj);
    
    const category = getErrorCategory(errorObj);
    return NextResponse.json(
      { message: getErrorMessage(errorObj, category, 'Automation operation') },
      { status: 500 }
    );
  }
}

/**
 * Delete an automation
 * 
 * @param request - The incoming request
 * @param params - Route parameters containing automation ID
 * @returns Success or error response
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const automationId = resolvedParams.id;

    logger.debug('DELETE request', { automationId });

    if (!automationId) {
      return NextResponse.json({ message: 'Otomasyon kimliği bulunamadı' }, { status: 400 });
    }

    const context = await resolveAuthContext(request, automationId);
    if ('json' in context) {
      return context;
    }
    const { supabase, user } = context;

    logger.debug('Deleting automation', {
      automationId,
      adminId: user.id,
    });

    const { error } = await supabase
      .from('automations')
      .delete()
      .eq('id', automationId);

    if (error) {
      logger.error('Delete error', error, {
        automationId,
      });
      const category = getErrorCategory(error);
      return NextResponse.json({ message: getErrorMessage(error, category, 'Automation deletion') }, { status: 400 });
    }

    logger.info('Delete success', {
      automationId,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('DELETE error', errorObj);
    
    const category = getErrorCategory(errorObj);
    return NextResponse.json(
      { message: getErrorMessage(errorObj, category, 'Automation deletion') },
      { status: 500 }
    );
  }
}
