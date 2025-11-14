'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn, signInWithGoogle, signInWithGithub } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Zap, Mail, ArrowLeft, Loader2, Github } from 'lucide-react';
import { Turnstile } from '@/components/turnstile';
import { Separator } from '@/components/ui/separator';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const isFromCart = redirectTo === '/cart';
  
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  // Check for error messages from URL parameters (OAuth errors, etc.)
  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    const verified = searchParams.get('verified');

    console.log('[DEBUG] signin/page.tsx - URL parameters check', {
      error,
      message,
      verified,
    });

    // Show email verification success message
    if (verified === 'true') {
      toast.success('E-posta adresiniz başarıyla doğrulandı!', {
        duration: 6000,
        description: 'Artık giriş yapabilirsiniz.',
      });
      // Clean URL after showing message
      const timer = setTimeout(() => {
        router.replace('/auth/signin');
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Show OAuth or other error messages
    if (error && message) {
      const decodedMessage = decodeURIComponent(message);
      console.log('[DEBUG] signin/page.tsx - Showing error from URL', {
        error,
        decodedMessage,
      });

      if (error === 'oauth_failed') {
        // Check if message suggests user might already exist
        const suggestsUserExists = decodedMessage.includes('zaten oluşturulmuş') || 
                                   decodedMessage.includes('already') ||
                                   decodedMessage.includes('oluşturulmuş olabilir');
        
        if (suggestsUserExists) {
          toast.error('OAuth Girişi Başarısız', {
            duration: 12000,
            description: 'Hesabınız zaten oluşturulmuş ancak giriş bağlantısı geçersiz. OAuth kullanıcıları şifre ile giriş yapamaz. Lütfen OAuth ile tekrar giriş yapın.',
            action: {
              label: 'OAuth ile Tekrar Giriş Yap',
              onClick: () => {
                // Trigger OAuth flow again
                // User can click the OAuth button manually
                // Just scroll to OAuth buttons
                const oauthSection = document.querySelector('[data-oauth-section]');
                if (oauthSection) {
                  oauthSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              },
            },
          });
        } else {
          toast.error('OAuth Girişi Başarısız', {
            duration: 8000,
            description: decodedMessage,
          });
        }
      } else {
        toast.error('Giriş Hatası', {
          duration: 6000,
          description: decodedMessage,
        });
      }

      // Clean URL after showing message
      const timer = setTimeout(() => {
        router.replace('/auth/signin');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('[DEBUG] signin/page.tsx - handleSubmit START', {
      hasEmail: !!formData.email?.trim(),
      hasPassword: !!formData.password,
      emailLength: formData.email?.length || 0,
      passwordLength: formData.password?.length || 0,
      redirectTo,
      isFromCart,
      hasTurnstileToken: !!turnstileToken,
      hasTurnstileSiteKey: !!turnstileSiteKey,
      loading,
      oauthLoading,
    });
    
    // Basic validation
    if (!formData.email?.trim()) {
      console.warn('[DEBUG] signin/page.tsx - Validation failed: email empty');
      toast.error('E-posta adresi gereklidir', {
        duration: 4000,
      });
      return;
    }

    if (!formData.password) {
      console.warn('[DEBUG] signin/page.tsx - Validation failed: password empty');
      toast.error('Şifre gereklidir', {
        duration: 4000,
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = formData.email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      console.warn('[DEBUG] signin/page.tsx - Validation failed: invalid email format', {
        email: normalizedEmail,
      });
      toast.error('Geçerli bir e-posta adresi giriniz', {
        duration: 4000,
      });
      return;
    }
    
    // Validate Turnstile token - only if site key is configured
    if (turnstileSiteKey && !turnstileToken) {
      console.warn('[DEBUG] signin/page.tsx - Validation failed: missing Turnstile token', {
        hasTurnstileSiteKey: !!turnstileSiteKey,
        hasTurnstileToken: !!turnstileToken,
      });
      toast.error('Lütfen güvenlik doğrulamasını tamamlayın', {
        duration: 4000,
      });
      return;
    }
    
    console.log('[DEBUG] signin/page.tsx - Validation passed, setting loading state');
    setLoading(true);

    try {
      console.log('[DEBUG] signin/page.tsx - Calling signIn function', {
        normalizedEmail,
        passwordLength: formData.password.length,
        redirectTo,
      });
      
      // Sign in
      const result = await signIn(normalizedEmail, formData.password);
      
      console.log('[DEBUG] signin/page.tsx - signIn function returned', {
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
        console.error('[DEBUG] signin/page.tsx - Sign in failed: no result or user', {
          hasResult: !!result,
          hasUser: !!result?.user,
        });
        throw new Error('Giriş başarısız. Lütfen tekrar deneyin.');
      }

      console.log('[DEBUG] signin/page.tsx - Waiting for session to be established (200ms)');
      // Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('[DEBUG] signin/page.tsx - Fetching user profile', {
        userId: result.user.id,
      });
      
      // Get user profile to check admin status
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, is_admin')
        .eq('id', result.user.id)
        .maybeSingle();

      console.log('[DEBUG] signin/page.tsx - Profile fetch result', {
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
        console.error('[DEBUG] signin/page.tsx - Profile fetch error:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
          userId: result.user.id,
        });
      }

      // Determine redirect based on user role
      let finalRedirect = redirectTo;
      
      // If user is admin, redirect to admin dashboard
      if (profile && (profile.role === 'admin' || profile.is_admin)) {
        console.log('[DEBUG] signin/page.tsx - User is admin, redirecting to admin dashboard', {
          role: profile.role,
          isAdmin: profile.is_admin,
        });
        finalRedirect = '/admin/dashboard';
      } else if (redirectTo === '/dashboard') {
        // Normal user goes to dashboard
        console.log('[DEBUG] signin/page.tsx - User is normal, redirecting to dashboard', {
          role: profile?.role || 'none',
          isAdmin: profile?.is_admin || false,
        });
        finalRedirect = '/dashboard';
      } else {
        console.log('[DEBUG] signin/page.tsx - Using custom redirect', {
          finalRedirect,
        });
      }

      console.log('[DEBUG] signin/page.tsx - Sign in successful, showing success toast', {
        finalRedirect,
      });

      toast.success('Giriş başarılı!', {
        duration: 3000,
      });
      
      console.log('[DEBUG] signin/page.tsx - Scheduling redirect', {
        finalRedirect,
        delay: 500,
      });
      
      // Force page reload to ensure session is properly established
      // This is especially important for admin accounts
      setTimeout(() => {
        console.log('[DEBUG] signin/page.tsx - Executing redirect', {
          finalRedirect,
        });
        window.location.href = finalRedirect;
      }, 500);
    } catch (error: any) {
      console.error('[DEBUG] signin/page.tsx - Sign in error caught', {
        message: error?.message,
        name: error?.name,
        code: error?.code,
        status: error?.status,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      });
      
      const errorMessage = error?.message || 'Giriş yapılamadı';
      
      toast.error(errorMessage, {
        duration: 6000,
        description: errorMessage.includes('şifre') || errorMessage.includes('e-posta') 
          ? 'Şifrenizi unuttuysanız "Şifremi Unuttum" linkine tıklayın.'
          : undefined,
      });
      
      // Clear password field and reset Turnstile on error for security
      setFormData(prev => ({ ...prev, password: '' }));
      setTurnstileToken(null);
      
      console.log('[DEBUG] signin/page.tsx - Error handled, form reset');
    } finally {
      console.log('[DEBUG] signin/page.tsx - handleSubmit FINALLY: resetting loading state');
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
            <div className="space-y-3" data-oauth-section>
              <Button
                type="button"
                onClick={async () => {
                  console.log('[DEBUG] signin/page.tsx - Google OAuth button clicked');
                  setOauthLoading('google');
                  try {
                    console.log('[DEBUG] signin/page.tsx - Calling signInWithGoogle');
                    await signInWithGoogle();
                    console.log('[DEBUG] signin/page.tsx - signInWithGoogle returned successfully');
                  } catch (error: any) {
                    console.error('[DEBUG] signin/page.tsx - Google OAuth error', {
                      message: error?.message,
                      name: error?.name,
                      code: error?.code,
                      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
                    });
                    toast.error(error.message || 'Google ile giriş başarısız oldu', {
                      duration: 6000,
                    });
                    setOauthLoading(null);
                  }
                }}
                disabled={loading || oauthLoading !== null}
                variant="outline"
                className="w-full h-12 border-border/50 hover:bg-muted/50 transition-all"
              >
                {oauthLoading === 'google' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Google ile giriş yapılıyor...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
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
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={async () => {
                  console.log('[DEBUG] signin/page.tsx - GitHub OAuth button clicked');
                  setOauthLoading('github');
                  try {
                    console.log('[DEBUG] signin/page.tsx - Calling signInWithGithub');
                    await signInWithGithub();
                    console.log('[DEBUG] signin/page.tsx - signInWithGithub returned successfully');
                  } catch (error: any) {
                    console.error('[DEBUG] signin/page.tsx - GitHub OAuth error', {
                      message: error?.message,
                      name: error?.name,
                      code: error?.code,
                      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
                    });
                    toast.error(error.message || 'GitHub ile giriş başarısız oldu', {
                      duration: 6000,
                    });
                    setOauthLoading(null);
                  }
                }}
                disabled={loading || oauthLoading !== null}
                variant="outline"
                className="w-full h-12 border-border/50 hover:bg-muted/50 transition-all"
              >
                {oauthLoading === 'github' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    GitHub ile giriş yapılıyor...
                  </>
                ) : (
                  <>
                    <Github className="mr-2 h-5 w-5" />
                    GitHub ile Giriş Yap
                  </>
                )}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">veya e-posta ile</span>
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
                disabled={loading || oauthLoading !== null || (!!turnstileSiteKey && !turnstileToken)}
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
