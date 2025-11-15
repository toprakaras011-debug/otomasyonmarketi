'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { updatePassword } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Lock, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

// ResetPasswordForm component - uses useSearchParams (requires Suspense)
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  // ============================================
  // STEP 1: Check for OAuth errors FIRST
  // ============================================
  // OAuth errors should NEVER reach this page
  useEffect(() => {
    const error = searchParams.get('error');
    
    // If there's an error and it's not a recovery-specific error, redirect to signin
    if (error && typeof window !== 'undefined') {
      // Check if this is an OAuth error (not a recovery error)
      const isOAuthError = 
        error === 'oauth_failed' ||
        error === 'access_denied' ||
        (error === 'invalid_token' && !window.location.hash.includes('access_token'));
      
      // Check referrer to see if we came from OAuth callback
      const referrer = document.referrer;
      const isFromOAuthCallback = referrer.includes('/auth/callback');
      
      // Additional check: if URL contains oauth-related parameters
      const hasOAuthParams = window.location.search.includes('code=') && 
                           !window.location.search.includes('type=recovery');
      
      if (isOAuthError || isFromOAuthCallback || hasOAuthParams) {
        console.log('[DEBUG] reset-password/page.tsx - OAuth error detected, redirecting to signin', {
          error,
          isOAuthError,
          isFromOAuthCallback,
          hasOAuthParams,
          referrer: typeof document !== 'undefined' ? document.referrer : 'N/A',
          url: typeof window !== 'undefined' ? window.location.href : 'N/A',
        });
        router.replace('/auth/signin?error=oauth_failed&message=OAuth girişi başarısız oldu. Lütfen tekrar deneyin.');
        return;
      }
    }
  }, [searchParams, router]);

  // ============================================
  // STEP 2: Check for recovery token
  // ============================================
  useEffect(() => {
    const checkRecoveryToken = async () => {
      try {
        // Skip if we already detected an OAuth error
        const error = searchParams.get('error');
        if (error === 'oauth_failed' || error === 'access_denied') {
          return; // Will be handled by previous useEffect
        }

        // Check URL hash for recovery token (most common for password reset)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        const hashError = hashParams.get('error');

        // Check query params for code (server-side handled)
        const code = searchParams.get('code');

        // If we have code parameter, it should have been handled by callback
        // But if we're here, redirect to callback to handle it
        if (code) {
          console.log('[DEBUG] reset-password/page.tsx - Code parameter found, redirecting to callback', {
            code: `${code.substring(0, 10)}...`,
            codeLength: code.length,
            type: searchParams.get('type'),
          });
          router.replace(`/auth/callback?code=${code}&type=recovery`);
          return;
        }

        // If there's an error in hash, handle it
        if (hashError) {
          const errorCode = hashError;
          
          console.error('[DEBUG] reset-password/page.tsx - Password reset error from hash', {
            error: errorCode,
            hashError,
            type,
            hasAccessToken: !!accessToken,
            url: window.location.href.substring(0, 100) + '...',
          });
          
          setIsValidToken(false);
          
          if (errorCode === 'access_denied' || errorCode === 'otp_expired' || errorCode === 'invalid_token') {
            toast.error('Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş', {
              duration: 8000,
              description: 'Lütfen yeni bir şifre sıfırlama isteği gönderin.',
            });
          } else {
            toast.error('Şifre sıfırlama bağlantısında hata var', {
              duration: 6000,
              description: 'Lütfen yeni bir şifre sıfırlama isteği gönderin.',
            });
          }
          return;
        }

        // If we have access_token in hash with type=recovery, it's a valid recovery link
        if (accessToken && type === 'recovery') {
          console.log('Recovery token found in hash');
          
          // Try to set the session from the hash
          const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });

            if (setSessionError) {
              console.error('[DEBUG] reset-password/page.tsx - Set session error', {
                message: setSessionError.message,
                status: setSessionError.status,
                code: (setSessionError as any).code,
                details: (setSessionError as any).details,
                hint: (setSessionError as any).hint,
              });
              setIsValidToken(false);
            toast.error('Şifre sıfırlama bağlantısı geçersiz', {
              duration: 6000,
              description: 'Lütfen yeni bir şifre sıfırlama isteği gönderin.',
            });
            return;
          }

          // Verify session was set
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session) {
            console.error('Session verification failed:', sessionError);
            setIsValidToken(false);
            toast.error('Oturum oluşturulamadı', {
              duration: 6000,
            });
            return;
          }

          console.log('Recovery session set successfully');
          setIsValidToken(true);
          
          // Clear hash from URL for security
          window.history.replaceState(null, '', '/auth/reset-password');
        } else {
          // No token found - check if user is already authenticated (might have valid session)
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
        if (sessionError) {
          console.error('[DEBUG] reset-password/page.tsx - Get session error', {
            message: sessionError.message,
            status: sessionError.status,
            code: (sessionError as any).code,
          });
        }
          
          if (session) {
            console.log('User already has a session - allowing password reset');
            setIsValidToken(true);
          } else {
            console.log('No recovery token or session found');
            setIsValidToken(false);
            toast.error('Şifre sıfırlama bağlantısı bulunamadı', {
              duration: 6000,
              description: 'Lütfen e-postanızdaki bağlantıyı kullanın.',
            });
          }
        }
      } catch (error: any) {
        console.error('[DEBUG] reset-password/page.tsx - Check recovery token error', {
          message: error?.message,
          name: error?.name,
          stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
        });
        setIsValidToken(false);
        toast.error('Bir hata oluştu', {
          duration: 6000,
          description: error?.message || 'Lütfen tekrar deneyin.',
        });
      }
    };

    // Small delay to ensure OAuth check runs first
    const timer = setTimeout(checkRecoveryToken, 100);
    return () => clearTimeout(timer);
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidToken) {
      toast.error('Şifre sıfırlama bağlantısı geçersiz', {
        duration: 6000,
        description: 'Lütfen yeni bir şifre sıfırlama isteği gönderin.',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Şifre en az 8 karakter olmalıdır');
      return;
    }

    // Strong password validation
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      toast.error('Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir', {
        duration: 6000,
      });
      return;
    }

    setLoading(true);

    try {
      await updatePassword(formData.password);
      toast.success('Şifreniz başarıyla güncellendi!', {
        duration: 5000,
        description: 'Yeni şifrenizle giriş yapabilirsiniz.',
      });
      
      // Clear the hash from URL
      window.history.replaceState(null, '', '/auth/reset-password');
      
      // Redirect to signin after a short delay
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    } catch (error: any) {
      console.error('[DEBUG] reset-password/page.tsx - Update password error', {
        message: error?.message,
        name: error?.name,
        code: error?.code,
        status: error?.status,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      });
      toast.error(error.message || 'Şifre güncellenemedi', {
        duration: 6000,
        description: 'Lütfen tekrar deneyin veya yeni bir şifre sıfırlama isteği gönderin.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Advanced Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
        <motion.div
          className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-600/30 blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-600/30 blur-[120px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/50"
            >
              <Lock className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-bold">Yeni Şifre Belirleyin</CardTitle>
              <CardDescription className="mt-2 text-base">
                Hesabınız için yeni bir şifre oluşturun
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error State */}
            {isValidToken === false && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-500/20 bg-red-500/10 p-4"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş
                    </p>
                    <p className="text-xs text-red-500/80 dark:text-red-400/80 mt-1">
                      Lütfen yeni bir şifre sıfırlama isteği gönderin.
                    </p>
                    <Link
                      href="/auth/forgot-password"
                      className="mt-3 inline-block text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
                    >
                      Yeni şifre sıfırlama isteği gönder →
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {isValidToken === null && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Bağlantı kontrol ediliyor...</p>
              </div>
            )}

            {/* Form State */}
            {isValidToken === true && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Yeni Şifre
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="En az 8 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                    className="h-11"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Yeni Şifre (Tekrar)
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Şifrenizi tekrar girin"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={8}
                    className="h-11"
                    disabled={loading}
                  />
                </div>

                <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-2">Şifre Gereksinimleri:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>En az 8 karakter uzunluğunda olmalı</li>
                    <li>En az bir büyük harf (A-Z)</li>
                    <li>En az bir küçük harf (a-z)</li>
                    <li>En az bir rakam (0-9)</li>
                    <li>En az bir özel karakter (!@#$%^&*...)</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg shadow-purple-500/50 transition-all hover:scale-[1.02]"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Güncelleniyor...
                    </span>
                  ) : (
                    'Şifreyi Güncelle'
                  )}
                </Button>
              </form>
            )}

            <div className="space-y-4 pt-4 border-t">
              <Link
                href="/auth/signin"
                className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Giriş Sayfasına Dön
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Main page component - wraps ResetPasswordForm in Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-600" />
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
