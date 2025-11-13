'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  // Get email from URL or session
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Try to get email from session
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user && user.email) {
          setEmail(user.email);
          // Check if already verified
          if (user.email_confirmed_at) {
            setIsVerified(true);
          }
        }
      });
    }
  }, [searchParams]);

  // Check for email verification token in URL
  useEffect(() => {
    const checkVerification = async () => {
      // Check URL hash for verification token
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const hashType = hashParams.get('type');
      const code = searchParams.get('code');
      const queryType = searchParams.get('type');

      // Skip if this is a recovery token (password reset)
      if (queryType === 'recovery' || hashType === 'recovery') {
        console.log('[DEBUG] verify-email/page.tsx - Recovery token detected, redirecting to reset-password');
        router.push(`/auth/reset-password?code=${code || ''}&type=recovery`);
        return;
      }

      // If we have a verification token, verify it
      if ((accessToken && (hashType === 'email' || hashType === 'signup')) || (code && (queryType === 'email' || queryType === 'signup' || !queryType))) {
        setLoading(true);
        try {
          console.log('[DEBUG] verify-email/page.tsx - Processing verification token:', {
            hasCode: !!code,
            hasAccessToken: !!accessToken,
            hashType,
            queryType,
          });
          
          if (code) {
            // Exchange code for session
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
            
            if (data?.user?.email_confirmed_at) {
              setIsVerified(true);
              toast.success('E-posta adresiniz başarıyla doğrulandı!', {
                duration: 5000,
              });
              
              // Redirect to signin after 2 seconds
              setTimeout(() => {
                router.push('/auth/signin?verified=true');
              }, 2000);
            }
          } else if (accessToken) {
            // Set session from hash
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || '',
            });
            
            if (error) throw error;
            
            if (data?.user?.email_confirmed_at) {
              setIsVerified(true);
              toast.success('E-posta adresiniz başarıyla doğrulandı!', {
                duration: 5000,
              });
              
              // Clear hash from URL
              window.history.replaceState(null, '', '/auth/verify-email');
              
              // Redirect to signin after 2 seconds
              setTimeout(() => {
                router.push('/auth/signin?verified=true');
              }, 2000);
            }
          }
        } catch (error: any) {
          console.error('[DEBUG] verify-email/page.tsx - Verification error:', error);
          toast.error('E-posta doğrulama başarısız oldu', {
            duration: 6000,
            description: error?.message || 'Lütfen tekrar deneyin veya yeni bir doğrulama e-postası isteyin.',
          });
        } finally {
          setLoading(false);
        }
      }
    };

    checkVerification();
  }, [router, searchParams]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('E-posta adresi bulunamadı');
      return;
    }

    setResending(true);
    try {
      console.log('[DEBUG] verify-email/page.tsx - Resending verification email:', email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });

      if (error) {
        console.error('[DEBUG] verify-email/page.tsx - Resend error:', error);
        throw error;
      }

      toast.success('Doğrulama e-postası tekrar gönderildi!', {
        duration: 6000,
        description: 'E-posta kutunuzu kontrol edin. Spam klasörünü de kontrol etmeyi unutmayın.',
      });
    } catch (error: any) {
      console.error('[DEBUG] verify-email/page.tsx - Resend exception:', error);
      toast.error('E-posta gönderilemedi', {
        duration: 6000,
        description: error?.message || 'Lütfen tekrar deneyin.',
      });
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (user?.email_confirmed_at) {
        setIsVerified(true);
        toast.success('E-posta adresiniz zaten doğrulanmış!', {
          duration: 5000,
        });
        
        setTimeout(() => {
          router.push('/auth/signin?verified=true');
        }, 2000);
      } else {
        toast.info('E-posta adresiniz henüz doğrulanmamış', {
          duration: 5000,
          description: 'Lütfen e-posta kutunuzu kontrol edin.',
        });
      }
    } catch (error: any) {
      console.error('[DEBUG] verify-email/page.tsx - Check verification error:', error);
      toast.error('Doğrulama durumu kontrol edilemedi', {
        duration: 6000,
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
              {isVerified ? (
                <CheckCircle2 className="h-8 w-8 text-white" />
              ) : loading ? (
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              ) : (
                <Mail className="h-8 w-8 text-white" />
              )}
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-bold">
                {isVerified ? 'E-posta Doğrulandı!' : 'E-posta Doğrulama'}
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                {isVerified
                  ? 'E-posta adresiniz başarıyla doğrulandı. Giriş yapabilirsiniz.'
                  : email
                  ? `${email} adresine gönderilen doğrulama linkine tıklayın`
                  : 'E-posta adresinizi doğrulamanız gerekiyor'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {loading && !isVerified ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Doğrulama kontrol ediliyor...</p>
              </div>
            ) : isVerified ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground mb-2">
                    E-posta adresiniz başarıyla doğrulandı!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Giriş sayfasına yönlendiriliyorsunuz...
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {email && (
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground mb-1">
                          Doğrulama e-postası gönderildi
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong className="text-foreground">{email}</strong> adresine bir doğrulama e-postası gönderdik.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-3">
                  <p className="text-sm font-medium text-foreground">Yapmanız gerekenler:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>E-posta kutunuzu kontrol edin</li>
                    <li>Spam klasörünü de kontrol edin</li>
                    <li>E-postadaki "E-postayı Doğrula" butonuna tıklayın</li>
                    <li>Otomatik olarak giriş sayfasına yönlendirileceksiniz</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleCheckVerification}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Kontrol Ediliyor...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Doğrulama Durumunu Kontrol Et
                      </>
                    )}
                  </Button>

                  {email && (
                    <Button
                      onClick={handleResendEmail}
                      disabled={resending}
                      variant="outline"
                      className="w-full"
                    >
                      {resending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Doğrulama E-postasını Tekrar Gönder
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                        Önemli
                      </p>
                      <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80">
                        E-posta adresinizi doğrulamadan giriş yapamazsınız. E-posta gelmediyse spam klasörünü kontrol edin veya tekrar gönder butonunu kullanın.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t">
              <p className="text-center text-sm text-muted-foreground">
                Zaten hesabınız var mı?{' '}
                <Link href="/auth/signin" className="font-semibold text-purple-600 hover:text-purple-500 transition-colors">
                  Giriş Yap
                </Link>
              </p>
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

