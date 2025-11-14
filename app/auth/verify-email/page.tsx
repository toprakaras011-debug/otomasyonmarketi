'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Email verification page - DISABLED
 * This page now redirects directly to dashboard since email verification is optional
 */
export default function VerifyEmailPage() {
  const router = useRouter();

  useEffect(() => {
    // Email verification is disabled - redirect to dashboard
    // If user is logged in, redirect to dashboard
    // Otherwise redirect to signin
    const checkAndRedirect = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // User is logged in, redirect to dashboard
          router.push('/dashboard');
        } else {
          // User is not logged in, redirect to signin
          router.push('/auth/signin');
        }
      } catch (error) {
        // On error, redirect to signin
        router.push('/auth/signin');
      }
    };

    checkAndRedirect();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
        <p className="text-sm text-muted-foreground">Yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
}
