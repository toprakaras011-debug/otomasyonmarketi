import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

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
  } catch (error: any) {
    console.error('Failed to ensure profile avatars bucket:', error);
    return NextResponse.json(
      { success: false, message: error?.message ?? 'Bucket kontrolü başarısız' },
      { status: 500 }
    );
  }
}
