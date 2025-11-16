'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
    console.error('Global error:', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-destructive/20 bg-card p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">Bir Şeyler Yanlış Gitti</h1>
          <p className="text-muted-foreground">
            Beklenmeyen bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
          </p>
          {error.message && (
            <details className="mt-4 rounded-lg bg-muted p-4 text-left text-sm">
              <summary className="cursor-pointer font-medium">Hata Detayları</summary>
              <p className="mt-2 text-xs text-muted-foreground">{error.message}</p>
            </details>
          )}
        </div>

        <div className="flex gap-3">
          <Button onClick={reset} className="flex-1" variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tekrar Dene
          </Button>
          <Button onClick={() => window.location.href = '/'} className="flex-1" variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Ana Sayfa
          </Button>
        </div>
      </div>
    </div>
  );
}
