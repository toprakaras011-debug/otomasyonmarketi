'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, File, Image, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Global upload tracking to prevent cancellation on unmount
const activeUploads = new Map<string, { promise: Promise<any>; abort: () => void }>();

interface FileUploadProps {
  label: string;
  bucketName: 'automation-images' | 'automation-files' | 'profile-avatars';
  accept: string;
  maxSizeMB?: number;
  onUploadComplete: (path: string) => void;
  currentFile?: string;
  userId: string;
  fileType: 'image' | 'file';
  onUploadingChange?: (uploading: boolean) => void;
}

export function FileUpload({
  label,
  bucketName,
  accept,
  maxSizeMB = 10,
  onUploadComplete,
  currentFile,
  userId,
  fileType,
  onUploadingChange,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(currentFile || null);
  const uploadAbortRef = useRef<(() => void) | null>(null);
  const uploadIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (currentFile) {
      // If it's a full URL or path, use it directly
      if (currentFile.startsWith('http') || currentFile.startsWith('/')) {
        setPreview(currentFile);
      } else if (fileType === 'image') {
        // For images, construct the Supabase URL
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (supabaseUrl && bucketName === 'automation-images') {
          setPreview(`${supabaseUrl}/storage/v1/object/public/${bucketName}/${currentFile}`);
        } else {
          setPreview(currentFile);
        }
      } else {
        setPreview(currentFile);
      }
    } else {
      setPreview(null);
    }
  }, [currentFile, fileType, bucketName]);

  // Cleanup on unmount - but don't cancel upload
  useEffect(() => {
    return () => {
      // Don't cancel upload on unmount - let it continue
      // The upload will complete and call onUploadComplete
    };
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress and resize image to 1:1 square ratio
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          // Calculate square dimensions (use the smaller dimension)
          const size = Math.min(img.width, img.height);
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // Draw image centered and cropped to square
          const sourceX = (img.width - size) / 2;
          const sourceY = (img.height - size) / 2;
          ctx.drawImage(img, sourceX, sourceY, size, size, 0, 0, size, size);

          // Convert to blob with quality optimization
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              // Create new file with compressed image
              const compressedFile = new (globalThis as any).File(
                [blob],
                file.name,
                { type: 'image/jpeg', lastModified: Date.now() }
              ) as File;
              resolve(compressedFile);
            },
            'image/jpeg',
            0.85 // 85% quality for good balance
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Dosya boyutu maksimum ${maxSizeMB}MB olabilir`);
      return;
    }

    // Validate file type
    const acceptedTypes = accept.split(',').map(t => t.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;
    
    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase();
      }
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return mimeType.startsWith(baseType);
      }
      return mimeType === type;
    });

    if (!isAccepted) {
      toast.error(`Geçersiz dosya tipi. İzin verilen: ${accept}`);
      return;
    }

    // Process image for preview and compression
    let fileToUpload = file;
    if (fileType === 'image' && bucketName === 'automation-images') {
      try {
        // Compress and resize to 1:1 square
        fileToUpload = await compressImage(file);
        
        // Show preview of compressed image
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(fileToUpload);
      } catch (error) {
        console.error('Image compression error:', error);
        toast.warning('Görsel sıkıştırma başarısız, orijinal görsel yüklenecek');
        // Fallback to original file
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else if (fileType === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    setUploading(true);
    onUploadingChange?.(true);

    // Use .jpg extension for compressed automation images
    const fileExt = (fileType === 'image' && bucketName === 'automation-images') 
      ? 'jpg' 
      : file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const uploadId = `${userId}-${Date.now()}-${fileName}`;
    uploadIdRef.current = uploadId;

    // Store fileToUpload in a variable accessible to uploadWithTimeout
    const finalFileToUpload = fileToUpload;

    try {
      // Ensure bucket exists before upload
      if (bucketName === 'profile-avatars') {
        try {
          await fetch('/api/storage/profile-avatars', { method: 'POST' });
        } catch (error) {
          console.error('Failed to ensure profile-avatars bucket', error);
        }
      } else if (bucketName === 'automation-files') {
        try {
          await fetch('/api/storage/automation-files', { method: 'POST' });
        } catch (error) {
          console.error('Failed to ensure automation-files bucket', error);
        }
      }

      // Create upload with timeout and progress tracking
      const uploadWithTimeout = async (timeoutMs: number = 300000) => { // 5 minutes timeout
        let progressInterval: NodeJS.Timeout | null = null;
        let timeoutId: NodeJS.Timeout | null = null;
        let isAborted = false;

        const abort = () => {
          isAborted = true;
          if (progressInterval) clearInterval(progressInterval);
          if (timeoutId) clearTimeout(timeoutId);
        };

        uploadAbortRef.current = abort;
        activeUploads.set(uploadId, { promise: Promise.resolve(), abort });

        return Promise.race([
          new Promise<{ data: any; error: any }>((resolve, reject) => {
            if (isAborted) {
              reject(new Error('Upload cancelled'));
              return;
            }

            const uploadPromise = supabase.storage
              .from(bucketName)
              .upload(fileName, finalFileToUpload, {
                cacheControl: '3600',
                upsert: false,
                contentType: finalFileToUpload.type || 'image/jpeg',
              });

            // Track upload progress (Supabase doesn't support progress callback, so we simulate)
            const startTime = Date.now();
            const totalSize = finalFileToUpload.size;
            
            progressInterval = setInterval(() => {
              if (isAborted) {
                if (progressInterval) clearInterval(progressInterval);
                return;
              }
              const elapsed = Date.now() - startTime;
              // Estimate progress based on time (rough estimate)
              const estimatedProgress = Math.min(95, (elapsed / timeoutMs) * 100);
              setUploadProgress(estimatedProgress);
            }, 500);

            uploadPromise.then((result) => {
              if (isAborted) {
                reject(new Error('Upload cancelled'));
                return;
              }
              if (progressInterval) clearInterval(progressInterval);
              setUploadProgress(100);
              resolve(result);
            }).catch((error) => {
              if (progressInterval) clearInterval(progressInterval);
              if (!isAborted) {
                reject(error);
              }
            });
          }),
          new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
              if (!isAborted) {
                reject(new Error(`Dosya yükleme zaman aşımına uğradı (${timeoutMs / 1000} saniye)`));
              }
            }, timeoutMs);
          })
        ]);
      };

      const tryUpload = async (retryCount = 0): Promise<boolean> => {
        try {
          setUploadProgress(10);
          const { data, error: uploadError } = await uploadWithTimeout(300000); // 5 minutes

          if (uploadError) {
            // Check for bucket not found error
            if (uploadError.message?.toLowerCase().includes('bucket was not found') || 
                uploadError.message?.toLowerCase().includes('not found')) {
              // Bucket not found, attempting to create
              try {
                if (bucketName === 'profile-avatars') {
                  await fetch('/api/storage/profile-avatars', { method: 'POST' });
                } else if (bucketName === 'automation-files') {
                  await fetch('/api/storage/automation-files', { method: 'POST' });
                }
                // Wait a bit for bucket to be ready
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Retry upload once
                if (retryCount < 1) {
                  return await tryUpload(retryCount + 1);
                }
              } catch (bucketError) {
                console.error('Failed to ensure bucket:', bucketError);
              }
            }
            
            // More detailed error messages
            let errorMessage = 'Dosya yüklenemedi';
            if (uploadError.message?.includes('File size exceeds')) {
              errorMessage = `Dosya boyutu çok büyük. Maksimum: ${maxSizeMB}MB`;
            } else if (uploadError.message?.includes('duplicate')) {
              errorMessage = 'Bu dosya zaten yüklenmiş. Lütfen farklı bir dosya seçin.';
            } else if (uploadError.message?.includes('permission') || uploadError.message?.includes('unauthorized')) {
              errorMessage = 'Yükleme izni yok. Lütfen giriş yaptığınızdan emin olun.';
            } else {
              errorMessage = uploadError.message || 'Dosya yüklenirken bir hata oluştu';
            }
            
            throw new Error(errorMessage);
          }

          if (!data) {
            throw new Error('Dosya yükleme yanıtı alınamadı');
          }

          setUploadProgress(100);
          return true;
        } catch (error: any) {
          console.error('Upload attempt failed:', error);
          if (retryCount < 1 && !error.message?.includes('zaman aşımı')) {
            // Retry once for non-timeout errors
            // Retrying upload
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
            return await tryUpload(retryCount + 1);
          }
          throw error;
        }
      };

      const uploaded = await tryUpload();
      
      if (!uploaded) {
        throw new Error('Dosya yüklenemedi. Lütfen tekrar deneyin.');
      }

      // Only complete if this is still the active upload
      if (uploadIdRef.current === uploadId) {
        onUploadComplete(fileName);
        if (fileType === 'file') {
          setPreview(fileName);
        }
        toast.success('Dosya başarıyla yüklendi');
      }
    } catch (error: any) {
      // Only show error if this is still the active upload
      if (uploadIdRef.current === uploadId && !error?.message?.includes('cancelled')) {
        console.error('Upload error:', error);
        const errorMessage = error?.message || error?.error?.message || 'Dosya yüklenirken bir hata oluştu';
        toast.error(errorMessage, {
          duration: 5000,
          description: 'Lütfen dosya boyutunu ve formatını kontrol edip tekrar deneyin.',
        });
        setPreview(currentFile || null);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } finally {
      // Only update state if this is still the active upload
      if (uploadIdRef.current === uploadId) {
        setUploading(false);
        setUploadProgress(0);
        onUploadingChange?.(false);
      }
      // Cleanup
      activeUploads.delete(uploadId);
      uploadAbortRef.current = null;
      if (uploadIdRef.current === uploadId) {
        uploadIdRef.current = null;
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        {preview && fileType === 'image' ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="h-32 w-32 object-cover rounded-lg border-2 border-border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : preview && fileType === 'file' ? (
          <div className="flex items-center gap-2 p-4 border-2 border-border rounded-lg">
            <File className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Dosya yüklendi</p>
              <p className="text-xs text-muted-foreground">{preview.split('/').pop()}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="w-full space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yükleniyor... {uploadProgress > 0 && `${Math.round(uploadProgress)}%`}
                </>
              ) : (
                <>
                  {fileType === 'image' ? (
                    <Image className="mr-2 h-4 w-4" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {label} Seç
                </>
              )}
            </Button>
            {uploading && uploadProgress > 0 && (
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      <p className="text-xs text-muted-foreground">
        Maksimum dosya boyutu: {maxSizeMB}MB
      </p>
    </div>
  );
}
