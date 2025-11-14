'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    setEmail(emailParam);
    
    // Check if user is already verified and logged in
    const checkVerification = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (user && !error) {
          // Check if email is confirmed
          if (user.email_confirmed_at) {
            console.log('[DEBUG] verify-email/page.tsx - User already verified, redirecting', {
              userId: user.id,
              email: user.email,
            });
            
            // Get profile to determine redirect
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('role, is_admin')
              .eq('id', user.id)
              .maybeSingle();
            
            const redirectUrl = (profile && (profile.role === 'admin' || profile.is_admin))
              ? '/admin/dashboard'
              : '/dashboard';
            
            toast.success('E-posta adresiniz zaten doğrulanmış!', {
              duration: 3000,
            });
            
            setTimeout(() => {
              window.location.href = redirectUrl;
            }, 1000);
            return;
          }
        }
      } catch (err) {
        console.error('[DEBUG] verify-email/page.tsx - Check verification error', err);
      }
    };
    
    checkVerification();
  }, [searchParams]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('E-posta adresi bulunamadı', {
        duration: 4000,
      });
      return;
    }

    setIsResending(true);
    
    try {
      console.log('[DEBUG] verify-email/page.tsx - Resending verification email', {
        email,
      });
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('[DEBUG] verify-email/page.tsx - Resend error', {
          message: error.message,
          code: error.code,
        });
        throw error;
      }

      toast.success('Doğrulama e-postası tekrar gönderildi!', {
        duration: 5000,
        description: 'E-posta kutunuzu kontrol edin.',
      });
    } catch (error: any) {
      console.error('[DEBUG] verify-email/page.tsx - Resend error caught', error);
      
      const errorMessage = error?.message || 'E-posta gönderilemedi';
      
      if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
        toast.error('Çok fazla istek yapıldı', {
          duration: 5000,
          description: 'Lütfen birkaç dakika sonra tekrar deneyin.',
        });
      } else {
        toast.error('E-posta gönderilemedi', {
          duration: 5000,
          description: errorMessage,
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-6">
      {/* Background */}
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
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm shadow-xl">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">E-posta Doğrulama</CardTitle>
              <CardDescription className="text-base">
                {email ? (
                  <>
                    <span className="font-medium text-foreground">{email}</span> adresine doğrulama e-postası gönderdik.
                  </>
                ) : (
                  'E-posta adresinizi doğrulamanız gerekiyor.'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">Yapmanız gerekenler:</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>E-posta kutunuzu kontrol edin</li>
                        <li>Gelen e-postadaki "E-postayı Doğrula" butonuna tıklayın</li>
                        <li>Otomatik olarak giriş yapılacaksınız</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-amber-500 flex-shrink-0" />
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-amber-600 dark:text-amber-400">
                        E-postayı bulamadınız mı?
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Spam/Gereksiz klasörünü kontrol edin</li>
                        <li>E-posta adresinin doğru olduğundan emin olun</li>
                        <li>Birkaç dakika bekleyin, e-posta gecikebilir</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending || !email}
                  className="w-full"
                  variant="outline"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      E-postayı Tekrar Gönder
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => router.push('/auth/signin')}
                  variant="ghost"
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Giriş Sayfasına Dön
                </Button>
              </div>

              <div className="pt-4 border-t">
                <p className="text-center text-sm text-muted-foreground">
                  Zaten doğruladınız mı?{' '}
                  <Link
                    href="/auth/signin"
                    className="font-medium text-primary hover:underline"
                  >
                    Giriş yapın
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
