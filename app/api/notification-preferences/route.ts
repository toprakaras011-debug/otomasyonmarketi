import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { getErrorMessage, getErrorCategory } from '@/lib/error-messages';

const DEFAULT_NOTIFICATION_PREFS = {
  email: true,
  purchases: true,
  updates: true,
  sms: false,
};

type NotificationPrefs = typeof DEFAULT_NOTIFICATION_PREFS;

type RawNotificationPrefs = Partial<Record<keyof NotificationPrefs, any>>;

const sanitizePrefs = (prefs: RawNotificationPrefs = {}): NotificationPrefs => ({
  email: typeof prefs.email === 'boolean' ? prefs.email : DEFAULT_NOTIFICATION_PREFS.email,
  purchases:
    typeof prefs.purchases === 'boolean' ? prefs.purchases : DEFAULT_NOTIFICATION_PREFS.purchases,
  updates: typeof prefs.updates === 'boolean' ? prefs.updates : DEFAULT_NOTIFICATION_PREFS.updates,
  sms: typeof prefs.sms === 'boolean' ? prefs.sms : DEFAULT_NOTIFICATION_PREFS.sms,
});

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('notification_prefs')
      .select('email, purchases, updates, sms')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      logger.error('Bildirim tercihleri okunamadı', error);
      const category = getErrorCategory(error);
      const errorMessage = getErrorMessage(error, category, 'Tercihler alınamadı');
      return NextResponse.json({ message: errorMessage }, { status: 500 });
    }

    const prefs = sanitizePrefs(data ?? undefined);

    return NextResponse.json({ data: prefs });
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('Bildirim tercihleri GET hatası', errorObj);
    const category = getErrorCategory(errorObj);
    const errorMessage = getErrorMessage(errorObj, category, 'Beklenmeyen bir hata oluştu');
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 401 });
    }

    let body: RawNotificationPrefs;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({ message: 'Geçersiz istek gövdesi' }, { status: 400 });
    }

    const prefs = sanitizePrefs(body);

    const { error } = await supabase
      .from('notification_prefs')
      .upsert(
        {
          user_id: user.id,
          ...prefs,
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      logger.error('Bildirim tercihleri kaydedilemedi', error);
      const category = getErrorCategory(error);
      const errorMessage = getErrorMessage(error, category, 'Tercihler kaydedilemedi');
      return NextResponse.json({ message: errorMessage }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: prefs });
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('Bildirim tercihleri PUT hatası', errorObj);
    const category = getErrorCategory(errorObj);
    const errorMessage = getErrorMessage(errorObj, category, 'Beklenmeyen bir hata oluştu');
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
