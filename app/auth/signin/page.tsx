'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signIn } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Zap, Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { Turnstile } from '@/components/turnstile';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email?.trim()) {
      toast.error('E-posta adresi gereklidir', {
        duration: 4000,
      });
      return;
    }

    if (!formData.password) {
      toast.error('Şifre gereklidir', {
        duration: 4000,
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim().toLowerCase())) {
      toast.error('Geçerli bir e-posta adresi giriniz', {
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
      const normalizedEmail = formData.email.trim().toLowerCase();
      
      // Sign in
      const result = await signIn(normalizedEmail, formData.password);
      
      // Verify sign-in was successful
      if (!result || !result.user) {
        throw new Error('Giriş başarısız. Lütfen tekrar deneyin.');
      }

      // Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Get user profile to check admin status
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, is_admin')
        .eq('id', result.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      }

      // Determine redirect based on user role
      let finalRedirect = redirectTo;
      
      // If user is admin, redirect to admin dashboard
      if (profile && (profile.role === 'admin' || profile.is_admin)) {
        finalRedirect = '/admin/dashboard';
      } else if (redirectTo === '/dashboard') {
        // Normal user goes to dashboard
        finalRedirect = '/dashboard';
      }

      toast.success('Giriş başarılı!', {
        duration: 3000,
      });
      
      // Force page reload to ensure session is properly established
      // This is especially important for admin accounts
      setTimeout(() => {
        window.location.href = finalRedirect;
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
