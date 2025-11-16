'use client';

import { useState, useEffect } from 'react';
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
import { getErrorMessage, getErrorCategory } from '@/lib/error-messages';

// SignInForm component - uses useSearchParams (requires Suspense)
// This component must be wrapped in Suspense boundary in parent component
export function SignInForm() {
  const router = useRouter();
  // useSearchParams() can be used directly in client components when wrapped in Suspense
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string>('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  // Move searchParams values to state to avoid accessing uncached data during render
  const [redirectTo, setRedirectTo] = useState<string>('/dashboard');
  const [isFromCart, setIsFromCart] = useState(false);
  const [emailParam, setEmailParam] = useState<string | null>(null);
  const [verifiedParam, setVerifiedParam] = useState<string | null>(null);

  // Move process.env access to useEffect to avoid blocking route
  useEffect(() => {
    setMounted(true);
    // Access process.env only after component mounts (client-side)
    if (typeof window !== 'undefined') {
      setTurnstileSiteKey(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '');
    }
  }, []);

  // Initialize searchParams values in useEffect to avoid blocking route
  useEffect(() => {
    if (!mounted) return;

    const redirect = searchParams.get('redirect') || '/dashboard';
    const email = searchParams.get('email');
    const verified = searchParams.get('verified');
    
    setRedirectTo(redirect);
    setIsFromCart(redirect === '/cart');
    setEmailParam(email);
    setVerifiedParam(verified);
    
    // Set email in form if provided
    if (email) {
      setFormData(prev => ({ ...prev, email: email.trim().toLowerCase() }));
    }
    
    // Show success message if verified
    if (verified === 'true') {
      toast.success('E-posta adresiniz başarıyla doğrulandı!', {
        duration: 5000,
        description: 'Artık giriş yapabilirsiniz.',
      });
      
      // Clean URL
      setTimeout(() => {
        router.replace('/auth/signin');
      }, 2000);
    }
  }, [searchParams, router, mounted]);

  // Check for error messages from URL parameters
  useEffect(() => {
    if (!mounted) return;

    const error = searchParams.get('error');
    const message = searchParams.get('message');

    // No logging to avoid blocking route

    // Show error messages
    if (error && message) {
      const decodedMessage = decodeURIComponent(message);

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
  }, [searchParams, router, mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // No logging to avoid blocking route
    
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
    const normalizedEmail = formData.email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
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
      // No logging to avoid blocking route
      
      // Sign in
      const result = await signIn(normalizedEmail, formData.password);
      
      // Verify sign-in was successful
      if (!result || !result.user) {
        throw new Error('Giriş başarısız. Lütfen tekrar deneyin.');
      }

      // Wait longer for session to be fully established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify session is established
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (!currentSession) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Get user profile to check admin status
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, is_admin')
        .eq('id', result.user.id)
        .maybeSingle();

      // Determine redirect based on user role
      let finalRedirect = redirectTo;
      
      // If user is admin, redirect to admin dashboard
      if (profile && ((profile as any).role === 'admin' || (profile as any).is_admin)) {
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
      // Use window.location.replace to prevent back button issues
      
      // Small delay to ensure all state is saved
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use replace instead of href to prevent redirect loops
      window.location.replace(finalRedirect);
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      // No logging to avoid blocking route
      
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
    } finally {
      setLoading(false);
    }
  };

  // Don't render until mounted (client-side only)
  if (!mounted) {
    return null;
  }

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
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-600/30 blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 border-purple-500/20 bg-background/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Giriş Yap
            </CardTitle>
            <CardDescription className="text-base">
              Hesabınıza giriş yaparak otomasyon dünyasına katılın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  E-posta
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  disabled={loading}
                  required
                  className="h-12 border-2 border-purple-500/20 focus:border-purple-500 transition-colors"
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  disabled={loading}
                  required
                  className="h-12 border-2 border-purple-500/20 focus:border-purple-500 transition-colors"
                />
              </div>

              {turnstileSiteKey && (
                <div className="space-y-2">
                  <Turnstile
                    siteKey={turnstileSiteKey}
                    onVerify={setTurnstileToken}
                    onError={() => setTurnstileToken(null)}
                    onExpire={() => setTurnstileToken(null)}
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <Link
                  href="/auth/forgot-password"
                  className="text-purple-600 hover:text-purple-700 hover:underline transition-colors"
                >
                  Şifremi Unuttum
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
                >
                  Hesabınız yok mu? Kayıt olun
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading || (turnstileSiteKey ? !turnstileToken : false)}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Giriş Yap
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
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

