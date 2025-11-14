import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';
import { getErrorMessage, getErrorCategory } from '@/lib/error-messages';

export async function POST() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const bucketName = 'profile-avatars';

    const { data: existingBucket, error: getError } = await supabaseAdmin.storage.getBucket(bucketName);

    if (getError && !getError.message?.toLowerCase().includes('not found')) {
      throw getError;
    }

    if (!existingBucket) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
      });

      if (createError) {
        throw createError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('Failed to ensure profile avatars bucket', errorObj);

    const category = getErrorCategory(errorObj);
    const errorMessage = getErrorMessage(errorObj, category, 'Bucket kontrolü başarısız');

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
