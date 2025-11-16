'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

interface OAuthErrorHandlerProps {
  redirectPath?: string;
}

export function OAuthErrorHandler({ redirectPath = '/auth/signin' }: OAuthErrorHandlerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    const errorDescription = searchParams.get('error_description');

    if (error === 'oauth_failed') {
      const errorMsg = message || errorDescription || 'OAuth girişi başarısız oldu. Lütfen tekrar deneyin.';
      
      toast.error(errorMsg, {
        duration: 8000,
        description: 'Lütfen tekrar deneyin veya e-posta ile giriş yapın.',
      });

      // Clean URL after showing error
      const timer = setTimeout(() => {
        router.replace(redirectPath);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [searchParams, router, redirectPath]);

  return null; // This component doesn't render anything
}
