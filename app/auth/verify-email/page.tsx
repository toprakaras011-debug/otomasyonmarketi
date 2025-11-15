'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * Email verification page
 * 
 * This page is shown after user signs up, instructing them to check their email
 * for the verification link. The actual verification happens via /auth/callback
 * when the user clicks the link in the email.
 */
function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // No email provided - redirect to signup
      router.replace('/auth/signup');
    }
  }, [searchParams, router]);

  const handleResendEmail = async () => {
    if (!email) return;

    setResending(true);
    try {
      // Resend verification email via Supabase
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        toast.error('E-posta gönderilemedi', {
          description: error.message || 'Lütfen tekrar deneyin.',
        });
      } else {
        toast.success('Doğrulama e-postası tekrar gönderildi!', {
          description: 'E-posta adresinizi kontrol edin.',
        });
      }
    } catch (error: any) {
      toast.error('Bir hata oluştu', {
        description: error.message || 'Lütfen tekrar deneyin.',
      });
    } finally {
      setResending(false);
    }
  };

  if (!email) {
    return null; // Will redirect
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
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
              <Mail className="h-8 w-8 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-bold">E-postanızı Doğrulayın</CardTitle>
              <CardDescription className="mt-2 text-base">
                Hesabınızı aktifleştirmek için e-posta adresinize gönderilen doğrulama linkine tıklayın.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground mb-2">Doğrulama linki gönderildi:</p>
                <p className="font-medium text-foreground">{email}</p>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">Önemli:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                    <li>E-postanızı (spam klasörü dahil) kontrol edin</li>
                    <li>Link 24 saat geçerlidir</li>
                    <li>E-posta gelmediyse "Tekrar Gönder" butonunu kullanın</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={resending}
                variant="outline"
                className="w-full border-purple-500/50 hover:bg-purple-500/10 hover:border-purple-500"
              >
                {resending ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Gönderiliyor...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    Doğrulama E-postasını Tekrar Gönder
                  </span>
                )}
              </Button>

              <Link
                href="/auth/signin"
                className="flex items-center justify-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Giriş sayfasına dön
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-600" />
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
