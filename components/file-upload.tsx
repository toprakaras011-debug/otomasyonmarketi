'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, File, Image } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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
  const [preview, setPreview] = useState<string | null>(currentFile || null);

  useEffect(() => {
    if (currentFile) {
      setPreview(currentFile);
    } else {
      setPreview(null);
    }
  }, [currentFile]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (fileType === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    setUploading(true);
    onUploadingChange?.(true);

    try {
      if (bucketName === 'profile-avatars') {
        try {
          await fetch('/api/storage/profile-avatars', { method: 'POST' });
        } catch (error) {
          console.error('Failed to ensure profile-avatars bucket', error);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const tryUpload = async () => {
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          if (bucketName === 'profile-avatars' && uploadError.message?.toLowerCase().includes('bucket was not found')) {
            try {
              await fetch('/api/storage/profile-avatars', { method: 'POST' });
            } catch (error) {
              console.error('Failed to ensure profile-avatars bucket', error);
              throw uploadError;
            }
            return false;
          }
          throw uploadError;
        }

        return true;
      };

      let uploaded = await tryUpload();
      if (!uploaded) {
        uploaded = await tryUpload();
      }

      if (!uploaded) {
        throw new Error('Dosya yüklenemedi. Lütfen tekrar deneyin.');
      }

      onUploadComplete(fileName);
      if (fileType === 'file') {
        setPreview(fileName);
      }
      toast.success('Dosya başarıyla yüklendi');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Dosya yüklenirken bir hata oluştu');
      setPreview(currentFile || null);
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
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
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              'Yükleniyor...'
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
