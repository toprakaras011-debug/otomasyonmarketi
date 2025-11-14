'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Email verification page - REMOVED
 * This page now immediately redirects to signin since email verification is disabled
 */
export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const email = searchParams.get('email');
    
    // Email verification is disabled - redirect to signin
    if (email) {
      router.replace(`/auth/signin?email=${encodeURIComponent(email)}`);
    } else {
      router.replace('/auth/signin');
    }
  }, [router, searchParams]);

  return null; // Return nothing - page will redirect immediately
}
