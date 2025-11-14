import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getErrorMessage, getErrorCategory } from '@/lib/error-messages';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Processing request

    const { items } = body ?? {};
    if (!items) {
      throw new Error('Items missing!');
    }

    // Items processed
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('Function error', errorObj);

    const category = getErrorCategory(errorObj);
    const errorMessage = getErrorMessage(errorObj, category, 'İşlem başarısız oldu');

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
