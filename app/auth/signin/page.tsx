import { Suspense } from 'react';
import { SignInForm } from './signin-form';

// Main page component - wraps SignInForm in Suspense
// This is a Server Component that wraps the Client Component in Suspense
export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
