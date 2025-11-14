'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn, signInWithOAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Zap, Mail, ArrowLeft, Loader2, Github } from 'lucide-react';
import { Turnstile } from '@/components/turnstile';
import { logger } from '@/lib/logger';
import { getErrorMessage, getErrorCategory } from '@/lib/error-messages';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const isFromCart = redirectTo === '/cart';
  
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  // Check for error messages from URL parameters
  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    logger.debug('URL parameters check', {
      error,
      message,
    });

    // Show error messages
    if (error && message) {
      const decodedMessage = decodeURIComponent(message);
      logger.debug('Showing error from URL', {
        error,
        decodedMessage,
      });

      toast.error('Giriş Hatası', {
        duration: 6000,
        description: decodedMessage,
      });

      // Clean URL after showing message
      const timer = setTimeout(() => {
        router.replace('/auth/signin');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      logger.debug('OAuth sign in initiated', { provider, redirectTo });
      
      await signInWithOAuth(provider, redirectTo);
      
      // OAuth redirect will happen automatically
      // No need to handle redirect here as Supabase handles it
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error('OAuth sign in error', errorObj, { provider });
      
      const category = getErrorCategory(errorObj);
      const errorMessage = getErrorMessage(errorObj, category, `${provider === 'google' ? 'Google' : 'GitHub'} ile giriş yapılamadı. Lütfen tekrar deneyin.`);
      
      toast.error(errorMessage, {
        duration: 5000,
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    logger.debug('Sign in form submit started', {
      hasEmail: !!formData.email?.trim(),
      hasPassword: !!formData.password,
      emailLength: formData.email?.length || 0,
      passwordLength: formData.password?.length || 0,
      redirectTo,
      isFromCart,
      hasTurnstileToken: !!turnstileToken,
      hasTurnstileSiteKey: !!turnstileSiteKey,
      loading,
    });
    
    // Basic validation
    if (!formData.email?.trim()) {
      logger.warn('Validation failed: email empty');
      toast.error('E-posta adresi gereklidir', {
        duration: 4000,
      });
      return;
    }

    if (!formData.password) {
      logger.warn('Validation failed: password empty');
      toast.error('Şifre gereklidir', {
        duration: 4000,
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = formData.email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      logger.warn('Validation failed: invalid email format', {
        email: normalizedEmail,
      });
      toast.error('Geçerli bir e-posta adresi giriniz', {
        duration: 4000,
      });
      return;
    }
    
    // Validate Turnstile token - only if site key is configured
    if (turnstileSiteKey && !turnstileToken) {
      logger.warn('Validation failed: missing Turnstile token', {
        hasTurnstileSiteKey: !!turnstileSiteKey,
        hasTurnstileToken: !!turnstileToken,
      });
      toast.error('Lütfen güvenlik doğrulamasını tamamlayın', {
        duration: 4000,
      });
      return;
    }
    
    logger.debug('Validation passed, setting loading state');
    setLoading(true);

    try {
      logger.debug('Calling signIn function', {
        normalizedEmail,
        passwordLength: formData.password.length,
        redirectTo,
      });
      
      // Sign in
      const result = await signIn(normalizedEmail, formData.password);
      
      logger.debug('signIn function returned', {
        hasResult: !!result,
        hasUser: !!result?.user,
        userId: result?.user?.id,
        userEmail: result?.user?.email,
        hasSession: !!result?.session,
        emailConfirmed: result?.user?.email_confirmed_at,
        provider: result?.user?.app_metadata?.provider,
      });
      
      // Verify sign-in was successful
      if (!result || !result.user) {
        logger.error('Sign in failed: no result or user', {
          hasResult: !!result,
          hasUser: !!result?.user,
        });
        throw new Error('Giriş başarısız. Lütfen tekrar deneyin.');
      }

      logger.debug('Waiting for session to be established (500ms)');
      // Wait longer for session to be fully established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify session is established
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      logger.debug('Session check after signin', {
        hasSession: !!currentSession,
        hasUser: !!currentSession?.user,
        sessionError: sessionError ? {
          message: sessionError.message,
          code: sessionError.code,
        } : null,
      });
      
      if (!currentSession) {
        logger.warn('No session after signin, waiting more...');
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      logger.debug('Fetching user profile', {
        userId: result.user.id,
      });
      
      // Get user profile to check admin status
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, is_admin')
        .eq('id', result.user.id)
        .maybeSingle();

      logger.debug('Profile fetch result', {
        hasProfile: !!profile,
        profileError: profileError ? {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
        } : null,
        role: profile?.role,
        isAdmin: profile?.is_admin,
      });

      if (profileError) {
        logger.error('Profile fetch error', profileError, {
          userId: result.user.id,
        });
      }

      // Determine redirect based on user role
      let finalRedirect = redirectTo;
      
      // If user is admin, redirect to admin dashboard
      if (profile && (profile.role === 'admin' || profile.is_admin)) {
        logger.debug('User is admin, redirecting to admin dashboard', {
          role: profile.role,
          isAdmin: profile.is_admin,
        });
        finalRedirect = '/admin/dashboard';
      } else if (redirectTo === '/dashboard') {
        // Normal user goes to dashboard
        logger.debug('User is normal, redirecting to dashboard', {
          role: profile?.role || 'none',
          isAdmin: profile?.is_admin || false,
        });
        finalRedirect = '/dashboard';
      } else {
        logger.debug('Using custom redirect', {
          finalRedirect,
        });
      }

      logger.info('Sign in successful', {
        finalRedirect,
        userId: result.user.id,
        userEmail: result.user.email,
      });

      toast.success('Giriş başarılı!', {
        duration: 3000,
      });
      
      logger.debug('Scheduling redirect', {
        finalRedirect,
        delay: 300,
      });
      
      // Force page reload to ensure session is properly established
      // This is especially important for admin accounts
      // Use window.location.replace to prevent back button issues
      logger.debug('Executing redirect with replace', {
        finalRedirect,
        timestamp: new Date().toISOString(),
      });
      
      // Small delay to ensure all state is saved
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use replace instead of href to prevent redirect loops
      window.location.replace(finalRedirect);
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      logger.error('Sign in error caught', errorObj);
      
      const category = getErrorCategory(errorObj);
      const errorMessage = getErrorMessage(errorObj, category, 'Giriş yapılamadı');
      
      // More helpful error messages
      let description: string | undefined = undefined;
      if (errorMessage.includes('şifre') || errorMessage.includes('e-posta')) {
        description = 'Şifrenizi unuttuysanız "Şifremi Unuttum" linkine tıklayın.';
      } else if (errorMessage.includes('kayıtlı bir hesap bulunamadı') || errorMessage.includes('hesap geçersiz')) {
        description = 'Eğer daha önce kayıt olduysanız, hesabınız silinmiş olabilir. Lütfen yeniden kayıt olun.';
      }
      
      toast.error(errorMessage, {
        duration: 8000,
        description,
      });
      
      // Clear password field and reset Turnstile on error for security
      setFormData(prev => ({ ...prev, password: '' }));
      setTurnstileToken(null);
      
      logger.debug('Error handled, form reset');
    } finally {
      logger.debug('handleSubmit FINALLY: resetting loading state');
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
              <Zap className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-bold">Tekrar Hoş Geldiniz</CardTitle>
              <CardDescription className="mt-2 text-base">
                Hesabınıza giriş yapın ve otomasyonlarınızı yönetin
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* OAuth Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-2 hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => handleOAuthSignIn('google')}
                disabled={loading}
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google ile Giriş Yap
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-2 hover:bg-gray-50 dark:hover:bg-gray-900"
                onClick={() => handleOAuthSignIn('github')}
                disabled={loading}
              >
                <Github className="mr-3 h-5 w-5" />
                GitHub ile Giriş Yap
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">veya</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  E-posta
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onBlur={(e) => setFormData({ ...formData, email: e.target.value.trim().toLowerCase() })}
                  required
                  autoComplete="email"
                  className="h-11"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Şifre
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  className="h-11"
                  disabled={loading}
                />
                <div className="flex justify-end">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-purple-600 hover:text-purple-500 transition-colors"
                  >
                    Şifremi Unuttum?
                  </Link>
                </div>
              </div>
              
              {/* Cloudflare Turnstile */}
              {turnstileSiteKey && (
                <div className="py-2">
                  <Turnstile
                    siteKey={turnstileSiteKey}
                    onVerify={(token) => setTurnstileToken(token)}
                    onError={() => {
                      setTurnstileToken(null);
                      toast.error('Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin.');
                    }}
                    onExpire={() => {
                      setTurnstileToken(null);
                      toast.warning('Güvenlik doğrulaması süresi doldu. Lütfen tekrar doğrulayın.');
                    }}
                    theme="auto"
                    size="normal"
                  />
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg shadow-purple-500/50 transition-all hover:scale-[1.02]"
                disabled={loading || (!!turnstileSiteKey && !turnstileToken)}
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Giriş yapılıyor...
                  </span>
                ) : (
                  'Giriş Yap'
                )}
              </Button>
            </form>

            <div className="space-y-4 pt-4 border-t">
              <p className="text-center text-sm text-muted-foreground">
                Hesabınız yok mu?{' '}
                <Link href="/auth/signup" className="font-semibold text-purple-600 hover:text-purple-500 transition-colors">
                  Kayıt Ol
                </Link>
              </p>
              
              {/* Guest Checkout Option - Only show if coming from cart */}
              {isFromCart && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-500"
                >
                  <Link href="/checkout/guest">
                    Üye Olmadan Devam Et
                  </Link>
                </Button>
              )}
              
              <Link
                href="/"
                className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ana Sayfaya Dön
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
