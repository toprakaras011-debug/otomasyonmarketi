import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    console.log('[DEBUG] api/storage/automation-files - POST request received');
    
    const supabaseAdmin = getSupabaseAdmin();
    const bucketName = 'automation-files';

    console.log('[DEBUG] api/storage/automation-files - Checking bucket existence', {
      bucketName,
    });

    const { data: existingBucket, error: getError } = await supabaseAdmin.storage.getBucket(bucketName);

    if (getError) {
      console.error('[DEBUG] api/storage/automation-files - Get bucket error', {
        error: getError.message,
        name: getError.name,
      });
      
      // If bucket not found, that's okay - we'll create it
      if (!getError.message?.toLowerCase().includes('not found')) {
        throw getError;
      }
    }

    if (!existingBucket) {
      console.log('[DEBUG] api/storage/automation-files - Creating bucket', {
        bucketName,
      });
      
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
        console.error('[DEBUG] api/storage/automation-files - Create bucket error', {
          error: createError.message,
          name: createError.name,
        });
        throw createError;
      }
      
      console.log('[DEBUG] api/storage/automation-files - Bucket created successfully');
    } else {
      console.log('[DEBUG] api/storage/automation-files - Bucket already exists');
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
    console.error('[DEBUG] api/storage/automation-files - Error caught', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      statusCode: error?.statusCode,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: error?.message ?? 'Bucket kontrolü başarısız',
        error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}

