/**
 * Storage Bucket Management API
 * 
 * Ensures the automation-files bucket exists in Supabase Storage.
 * Creates the bucket if it doesn't exist, or updates it if it does.
 * 
 * @route /api/storage/automation-files
 * @method POST
 * 
 * @returns { success: boolean } on success
 * @returns { success: false, message: string } on error
 * 
 * @example
 * POST /api/storage/automation-files
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';
import { getErrorMessage, getErrorCategory } from '@/lib/error-messages';

export async function POST(request: Request) {
  try {
    logger.debug('POST request received');
    
    const supabaseAdmin = getSupabaseAdmin();
    const bucketName = 'automation-files';

    logger.debug('Checking bucket existence', { bucketName });

    const { data: existingBucket, error: getError } = await supabaseAdmin.storage.getBucket(bucketName);

    if (getError) {
      logger.error('Get bucket error', getError);
      
      // If bucket not found, that's okay - we'll create it
      if (!getError.message?.toLowerCase().includes('not found')) {
        throw getError;
      }
    }

    if (!existingBucket) {
      logger.debug('Creating bucket', { bucketName });
      
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
        logger.error('Create bucket error', createError);
        throw createError;
      }
      
      logger.info('Bucket created successfully');
    } else {
      logger.debug('Bucket already exists');
      // If bucket exists, ensure the file size limit is updated
      // Note: updateBucket requires 'public' property, but we'll keep existing bucket settings
      // Only update if we can determine the current public status
      try {
        const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucketName, {
          public: existingBucket.public ?? true, // Keep existing public status or default to true
          fileSizeLimit: 100 * 1024 * 1024, // 100 MB
        });
        if (updateError) {
          logger.warn('Failed to update file size limit for bucket', { bucketName, error: updateError.message });
        }
      } catch (updateErr) {
        // Silently fail - bucket exists and works, update is optional
        logger.warn('Bucket update skipped', { error: updateErr instanceof Error ? updateErr.message : String(updateErr) });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('Error caught', errorObj);
    
    const category = getErrorCategory(errorObj);
    return NextResponse.json(
      { 
        success: false, 
        message: getErrorMessage(errorObj, category, 'Bucket operation'),
      },
      { status: 500 }
    );
  }
}

