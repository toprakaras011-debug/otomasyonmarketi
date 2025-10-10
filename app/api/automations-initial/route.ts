import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  // Prefer service role on the server to avoid RLS blocking public list, but NEVER expose it to clients
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(url, service || anon);

  try {
    const [automationsResp, categoriesResp] = await Promise.all([
      supabase
        .from('automations')
        .select(`
          *,
          category:categories(*),
          developer:user_profiles(*)
        `)
                        .eq('is_published', true)
        .eq('admin_approved', true)
        .order('created_at', { ascending: false }),
      supabase
        .from('categories')
        .select('*')
        .order('name')
    ]);

    const debug = {
      env_ok: Boolean(url && anon),
      using_service_role: Boolean(service),
      automations_error: (automationsResp as any)?.error?.message || null,
      categories_error: (categoriesResp as any)?.error?.message || null,
      automations_count: (automationsResp as any)?.data?.length ?? 0,
      categories_count: (categoriesResp as any)?.data?.length ?? 0,
    };

    return NextResponse.json(
      {
        automations: automationsResp.data || [],
        categories: categoriesResp.data || [],
        debug,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}
