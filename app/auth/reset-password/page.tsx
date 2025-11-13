'use client';

import { useState, useEffect } from 'react';
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
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  // Check if we have a valid recovery token from hash
  useEffect(() => {
    const checkRecoveryToken = async () => {
      try {
        // Check URL hash for recovery token
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        // Also check query params (fallback)
        const code = searchParams.get('code');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // If there's an error in URL, show it
        if (error) {
          console.error('Password reset error from URL:', {
            error,
            errorDescription,
          });
          
          if (error === 'access_denied' || error === 'otp_expired') {
            setIsValidToken(false);
            toast.error('Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş', {
              duration: 8000,
              description: 'Lütfen yeni bir şifre sıfırlama isteği gönderin.',
            });
            return;
          }
        }

        // If we have access_token in hash, it's a valid recovery link
        if (accessToken && type === 'recovery') {
          // Verify the session is valid
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session) {
            // Try to set the session from the hash
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || '',
            });

            if (setSessionError) {
              console.error('Set session error:', setSessionError);
              setIsValidToken(false);
              toast.error('Şifre sıfırlama bağlantısı geçersiz', {
                duration: 6000,
              });
              return;
            }
          }

          setIsValidToken(true);
        } else if (code) {
          // If we have a code, exchange it for session
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Exchange code error:', exchangeError);
            setIsValidToken(false);
            toast.error('Şifre sıfırlama bağlantısı geçersiz', {
              duration: 6000,
            });
            return;
          }

          setIsValidToken(true);
        } else {
          // No token found - check if user is already authenticated
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            setIsValidToken(true);
          } else {
            setIsValidToken(false);
            toast.error('Şifre sıfırlama bağlantısı bulunamadı', {
              duration: 6000,
              description: 'Lütfen e-postanızdaki bağlantıyı kullanın.',
            });
          }
        }
      } catch (error: any) {
        console.error('Check recovery token error:', error);
        setIsValidToken(false);
        toast.error('Bir hata oluştu', {
          duration: 6000,
        });
      }
    };

    checkRecoveryToken();
  }, [searchParams]);

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
      console.error('Update password error:', error);
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
            {isValidToken === false && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-500/20 bg-red-500/10 p-4"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
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

            {isValidToken === null && (
              <div className="text-center py-4">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Bağlantı kontrol ediliyor...</p>
              </div>
            )}

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
                    <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
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
