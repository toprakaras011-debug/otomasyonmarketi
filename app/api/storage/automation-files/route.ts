import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST() {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const bucketName = 'automation-files';

    const { data: existingBucket, error: getError } = await supabaseAdmin.storage.getBucket(bucketName);

    if (getError && !getError.message?.toLowerCase().includes('not found')) {
      throw getError;
    }

    if (!existingBucket) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true, // Automation files are public for download
        fileSizeLimit: 100 * 1024 * 1024, // 100 MB limit
        allowedMimeTypes: [
          'application/zip',
          'application/x-rar-compressed',
          'application/x-7z-compressed',
          'application/json',
          'application/javascript',
          'text/x-python',
          'application/x-php',
          'text/plain',
          'text/markdown',
        ],
      });

      if (createError) {
        throw createError;
      }
    } else {
      // If bucket exists, ensure the file size limit is updated
      // Note: updateBucket requires 'public' property, but we'll keep existing bucket settings
      // Only update if we can determine the current public status
      try {
        const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucketName, {
          public: existingBucket.public ?? true, // Keep existing public status or default to true
          fileSizeLimit: 100 * 1024 * 1024, // 100 MB
        });
        if (updateError) {
          console.warn(`Failed to update file size limit for bucket ${bucketName}:`, updateError);
        }
      } catch (updateErr) {
        // Silently fail - bucket exists and works, update is optional
        console.warn('Bucket update skipped:', updateErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to ensure automation-files bucket:', error);
    return NextResponse.json(
      { success: false, message: error?.message ?? 'Bucket kontrolü başarısız' },
      { status: 500 }
    );
  }
}

