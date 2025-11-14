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
    // Email verification is completely disabled
    // Immediately redirect to signin page
    // If email is provided in query, pass it to signin
    const email = searchParams.get('email');
    
    if (email) {
      // Redirect to signin with email pre-filled
      router.replace(`/auth/signin?email=${encodeURIComponent(email)}`);
    } else {
      // Just redirect to signin
      router.replace('/auth/signin');
    }
  }, [router, searchParams]);

  // Return nothing - page will redirect immediately
  return null;
}
