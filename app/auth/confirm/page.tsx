'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  MailCheck,
  MailPlus,
  AlertCircle,
  Loader2,
  RefreshCcw,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const RESEND_COOLDOWN_SECONDS = 60;

type VerificationStatus = 'awaiting' | 'verifying' | 'verified' | 'error';

type PendingParams = {
  accessToken?: string;
  refreshToken?: string;
  code?: string;
  token?: string;
  type?: string;
};

const statusConfig: Record<VerificationStatus, { title: string; description: string; icon: React.ReactNode }> = {
  awaiting: {
    title: 'E-posta Doğrulaması Bekleniyor',
    description:
      'Lütfen e-posta kutunuzu kontrol ederek hesabınızı doğrulayın. Doğrulama tamamlanmadan giriş yapılamaz.',
    icon: <MailCheck className="h-9 w-9 text-purple-500" />,
  },
  verifying: {
    title: 'Doğrulama Kontrol Ediliyor',
    description: 'Doğrulama bağlantısı doğrulanıyor. Lütfen birkaç saniye bekleyin.',
    icon: <Loader2 className="h-9 w-9 animate-spin text-blue-500" />,
  },
  verified: {
    title: 'E-posta Doğrulandı',
    description: 'Harika! Artık hesabınıza giriş yapabilirsiniz.',
    icon: <CheckCircle2 className="h-9 w-9 text-green-500" />,
  },
  error: {
    title: 'Doğrulama Tamamlanamadı',
    description:
      'Doğrulama sırasında bir sorun oluştu. Lütfen bağlantının süresinin dolmadığından emin olun veya tekrar deneyin.',
    icon: <AlertCircle className="h-9 w-9 text-red-500" />,
  },
};

const emailProviderUrls: Record<string, string> = {
  'gmail.com': 'https://mail.google.com',
  'outlook.com': 'https://outlook.live.com/mail/0/inbox',
  'hotmail.com': 'https://outlook.live.com/mail/0/inbox',
  'live.com': 'https://outlook.live.com/mail/0/inbox',
  'yahoo.com': 'https://mail.yahoo.com',
  'icloud.com': 'https://www.icloud.com/mail',
  'me.com': 'https://www.icloud.com/mail',
  'mac.com': 'https://www.icloud.com/mail',
  'yandex.com': 'https://mail.yandex.com',
  'yandex.ru': 'https://mail.yandex.ru',
  'proton.me': 'https://mail.proton.me',
  'protonmail.com': 'https://mail.proton.me',
  'zoho.com': 'https://mail.zoho.com',
};

const sanitizeConfirmUrl = (email?: string | null) => {
  if (email) {
    return `/auth/confirm?email=${encodeURIComponent(email)}`;
  }
  return '/auth/confirm';
};

// ConfirmEmailForm component - uses useSearchParams (requires Suspense)
function ConfirmEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsKey = useMemo(() => searchParams.toString(), [searchParams]);
  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<VerificationStatus>('awaiting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [pendingParams, setPendingParams] = useState<PendingParams | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      sessionStorage.setItem('pendingVerificationEmail', emailParam);
      return;
    }

    const storedEmail = sessionStorage.getItem('pendingVerificationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, [searchParamsKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hash);

    const accessToken = hashParams.get('access_token') ?? undefined;
    const refreshToken = hashParams.get('refresh_token') ?? undefined;
    const code = searchParams.get('code') ?? hashParams.get('code') ?? undefined;
    const type = searchParams.get('type') ?? hashParams.get('type') ?? undefined;
    const token =
      searchParams.get('token') ??
      searchParams.get('token_hash') ??
      hashParams.get('token') ??
      hashParams.get('token_hash') ??
      undefined;

    if (accessToken || refreshToken || code || token) {
      setPendingParams({ accessToken, refreshToken, code, token, type });
    }
  }, [searchParamsKey]);

  useEffect(() => {
    if (!pendingParams) return;

    const { accessToken, refreshToken, code, token, type } = pendingParams;
    // For token based verification we need the email value
    if (token && !email) {
      return;
    }

    const verify = async () => {
      if (typeof window === 'undefined') return;

      try {
        setStatus('verifying');
        setErrorMessage(null);

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            throw error;
          }
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            throw error;
          }
        } else if (token && (type === 'signup' || type === 'email')) {
          const targetEmail = email || sessionStorage.getItem('pendingVerificationEmail');
          if (!targetEmail) {
            throw new Error('Doğrulama için e-posta bilgisi bulunamadı.');
          }
          const { error } = await supabase.auth.verifyOtp({
            email: targetEmail,
            token,
            type: 'signup',
          });
          if (error) {
            throw error;
          }
        }

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          throw userError;
        }

        if (userData?.user?.email_confirmed_at) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('pendingVerificationEmail');
            window.location.hash = '';
          }
          setStatus('verified');
          toast.success('E-posta doğrulandı! Giriş yapabilirsiniz.');
          setPendingParams(null);
          router.replace(sanitizeConfirmUrl(userData.user.email ?? email));
          setTimeout(() => {
            router.push('/auth/signin');
          }, 2000);
          return;
        }

        setStatus('awaiting');
      } catch (error: any) {
        // No logging to avoid blocking route
        setStatus('error');
        setPendingParams(null);
        setErrorMessage(
          error?.message || 'E-posta doğrulaması sırasında bir sorun oluştu. Lütfen tekrar deneyin.'
        );
      }
    };

    verify();
  }, [pendingParams, email, router]);

  useEffect(() => {
    if (!cooldown) return;

    const timer = window.setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const providerUrl = useMemo(() => {
    if (!email) return undefined;
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return undefined;
    return emailProviderUrls[domain];
  }, [email]);

  const handleResend = async () => {
    if (!email) {
      toast.error('Kayıtlı e-posta adresi bulunamadı. Lütfen tekrar kayıt olmayı deneyin.');
      return;
    }

    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) {
        throw error;
      }
      toast.success('Doğrulama e-postası tekrar gönderildi.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error: any) {
      // No logging to avoid blocking route
      toast.error(
        error?.message || 'Doğrulama e-postası gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleCheckAgain = async () => {
    if (!email) return;

    try {
      setStatus('verifying');
      const { data: userData, error } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }

      if (userData.user?.email_confirmed_at) {
        sessionStorage.removeItem('pendingVerificationEmail');
        setStatus('verified');
        toast.success('E-posta doğrulandı! Giriş yapabilirsiniz.');
        setTimeout(() => router.push('/auth/signin'), 1500);
      } else {
        setStatus('awaiting');
        toast.info('Doğrulama henüz tamamlanmamış görünüyor. Lütfen e-postanızı kontrol edin.');
      }
    } catch (error: any) {
      // No logging to avoid blocking route
      setStatus('error');
      setErrorMessage(error?.message || 'Kontrol edilirken bir hata oluştu.');
    }
  };

  const statusMeta = statusConfig[status];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
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
        className="relative z-10 w-full max-w-2xl"
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/50">
              {statusMeta.icon}
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-bold">{statusMeta.title}</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {statusMeta.description}
              </CardDescription>
              {email && (
                <p className="text-sm text-muted-foreground">
                  Doğrulama e-postası <span className="font-semibold text-foreground">{email}</span> adresine gönderildi.
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {status === 'error' && errorMessage && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                {errorMessage}
              </div>
            )}

            {status !== 'verified' && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-background/70 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <MailPlus className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold text-sm">Gelen Kutunuzu Kontrol Edin</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    E-posta gelmediyse spam, tanıtım veya gereksiz klasörlerini de kontrol edin.
                  </p>
                </div>
                <div className="rounded-xl border border-border/60 bg-background/70 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-sm">Bağlantı Süresi</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Doğrulama bağlantısı sınırlı bir süre geçerlidir. Süresi dolarsa yeniden e-posta gönderin.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {status === 'verified' ? (
                <Button
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  onClick={() => router.push('/auth/signin')}
                >
                  Giriş Sayfasına Git
                </Button>
              ) : (
                <div className="flex flex-col gap-3 md:flex-row">
                  <Button
                    type="button"
                    className="flex-1 h-11"
                    onClick={handleResend}
                    disabled={resendLoading || cooldown > 0}
                  >
                    {resendLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Gönderiliyor...
                      </span>
                    ) : cooldown > 0 ? (
                      <span className="flex items-center gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        {cooldown} sn sonra tekrar gönder
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <MailPlus className="h-4 w-4" />
                        Doğrulama e-postasını tekrar gönder
                      </span>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={handleCheckAgain}
                  >
                    <span className="flex items-center gap-2">
                      <RefreshCcw className="h-4 w-4" />
                      Doğrulamayı kontrol et
                    </span>
                  </Button>
                </div>
              )}

              {providerUrl && status !== 'verified' && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-11"
                  onClick={() => window.open(providerUrl, '_blank', 'noopener')}
                >
                  <span className="flex items-center justify-center gap-2">
                    <MailCheck className="h-4 w-4" />
                    E-posta sağlayıcınıza git
                  </span>
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="mt-[2px] h-2 w-2 rounded-full bg-purple-500" />
                <p>
                  Doğrulama e-postası hâlâ gelmediyse <Link href="/contact" className="font-medium text-purple-600 hover:text-purple-500">destek
                  ile iletişime geçebilirsiniz</Link>.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-[2px] h-2 w-2 rounded-full bg-blue-500" />
                <p>
                  Yanlış e-posta ile kayıt olduğunuzu düşünüyorsanız{' '}
                  <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">yeniden kayıt olmayı deneyin</Link>.
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Giriş sayfasına dön
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Main page component - wraps ConfirmEmailForm in Suspense
export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-600" />
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    }>
      <ConfirmEmailForm />
    </Suspense>
  );
}
