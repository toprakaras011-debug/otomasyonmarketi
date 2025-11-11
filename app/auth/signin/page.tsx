'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { signIn, signInWithGithub, signInWithGoogle } from '@/lib/auth';
import { toast } from 'sonner';
import { Zap, Github, Mail, ArrowLeft, Sparkles } from 'lucide-react';
import { Turnstile } from '@/components/turnstile';

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
  const oauthError = searchParams.get('error');
  
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  // Show OAuth error if present
  useEffect(() => {
    if (oauthError === 'oauth_failed') {
      toast.error('OAuth girişi başarısız oldu. Lütfen tekrar deneyin.', {
        duration: 6000,
      });
      // Clean URL
      router.replace('/auth/signin');
    }
  }, [oauthError, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation - basic checks only
    const trimmedEmail = formData.email?.trim() || '';
    if (!trimmedEmail) {
      toast.error('E-posta adresi gereklidir', {
        duration: 4000,
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = trimmedEmail.toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      toast.error('Geçerli bir e-posta adresi giriniz', {
        duration: 4000,
      });
      return;
    }

    if (!formData.password || formData.password.trim().length === 0) {
      toast.error('Şifre gereklidir', {
        duration: 4000,
      });
      return;
    }

    // Password length check - but allow if it's just whitespace (let server handle it)
    if (formData.password.trim().length > 0 && formData.password.trim().length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır', {
        duration: 4000,
      });
      return;
    }
    
    // Validate Turnstile token - only if site key is configured
    if (turnstileSiteKey && !turnstileToken) {
      toast.error('Lütfen güvenlik doğrulamasını tamamlayın', {
        duration: 4000,
      });
      return;
    }
    
    setLoading(true);

    try {
      // Normalize email before sending
      const emailToSend = formData.email.trim().toLowerCase();
      const passwordToSend = formData.password; // Don't trim password - preserve original
      
      const result = await signIn(emailToSend, passwordToSend);
      
      // Verify sign-in was successful
      if (!result || !result.user) {
        throw new Error('Giriş başarısız. Lütfen tekrar deneyin.');
      }

      // Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast.success('Giriş başarılı!', {
        duration: 3000,
      });
      
      // Force page reload to ensure session is properly established
      // This is especially important for admin accounts
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 500);
    } catch (error: any) {
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
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    if (oauthLoading) return; // Prevent double clicks
    
    setOauthLoading('github');
    try {
      await signInWithGithub();
      // OAuth redirects, so we don't need to handle success here
    } catch (error: any) {
      const errorMessage = error?.message || 'GitHub ile giriş yapılamadı';
      toast.error(errorMessage, {
        duration: 5000,
        description: 'Lütfen tekrar deneyin veya e-posta ile giriş yapın.',
      });
      setOauthLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    if (oauthLoading) return; // Prevent double clicks
    
    setOauthLoading('google');
    try {
      await signInWithGoogle();
      // OAuth redirects, so we don't need to handle success here
    } catch (error: any) {
      const errorMessage = error?.message || 'Google ile giriş yapılamadı';
      toast.error(errorMessage, {
        duration: 5000,
        description: 'Lütfen tekrar deneyin veya e-posta ile giriş yapın.',
      });
      setOauthLoading(null);
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
                className="w-full h-12 border-2 hover:bg-accent transition-all hover:scale-[1.02]"
                onClick={handleGithubSignIn}
                disabled={oauthLoading !== null}
              >
                <Github className="mr-2 h-5 w-5" />
                {oauthLoading === 'github' ? 'Yönlendiriliyor...' : 'GitHub ile Giriş Yap'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 hover:bg-accent transition-all hover:scale-[1.02]"
                onClick={handleGoogleSignIn}
                disabled={oauthLoading !== null}
              >
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
                {oauthLoading === 'google' ? 'Yönlendiriliyor...' : 'Google ile Giriş Yap'}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">veya e-posta ile</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Şifre
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  className="h-11"
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
                    <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
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
              
              {/* Guest Checkout Option - Only show if coming from cart (has items) */}
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
