'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { resetPassword } from '@/lib/auth';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!email?.trim()) {
      toast.error('E-posta adresi gereklidir', {
        duration: 4000,
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim().toLowerCase())) {
      toast.error('Geçerli bir e-posta adresi giriniz', {
        duration: 4000,
      });
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email.trim().toLowerCase());
      setEmailSent(true);
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi!', {
        duration: 6000,
        description: 'E-postanızı kontrol edin. Spam klasörünü de kontrol etmeyi unutmayın.',
      });
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast.error(error?.message || 'E-posta gönderilemedi', {
        duration: 6000,
        description: error?.message?.includes('bulunamadı')
          ? 'Bu e-posta adresi ile kayıtlı bir kullanıcı yok. Lütfen kayıt olun.'
          : error?.message?.includes('doğrulanmamış')
          ? 'Önce e-posta doğrulama linkine tıklayın.'
          : 'Lütfen tekrar deneyin veya destek ekibiyle iletişime geçin.',
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
              {emailSent ? (
                <CheckCircle2 className="h-8 w-8 text-white" />
              ) : (
                <Mail className="h-8 w-8 text-white" />
              )}
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-bold">
                {emailSent ? 'E-posta Gönderildi' : 'Şifremi Unuttum'}
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                {emailSent
                  ? 'Şifre sıfırlama bağlantısını e-posta adresinize gönderdik'
                  : 'E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim'}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {emailSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">{email}</strong> adresine bir e-posta gönderdik.
                    <br />
                    <br />
                    E-postanızdaki bağlantıya tıklayarak şifrenizi sıfırlayabilirsiniz.
                  </p>
                </div>

                <div className="space-y-2 text-center text-sm text-muted-foreground">
                  <p>E-posta gelmedi mi?</p>
                  <Button
                    variant="outline"
                    onClick={() => setEmailSent(false)}
                    className="w-full"
                  >
                    Tekrar Gönder
                  </Button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    E-posta Adresi
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
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
                      Gönderiliyor...
                    </span>
                  ) : (
                    'Şifre Sıfırlama Bağlantısı Gönder'
                  )}
                </Button>
              </form>
            )}

            <div className="space-y-4 pt-4 border-t">
              <p className="text-center text-sm text-muted-foreground">
                Şifrenizi hatırladınız mı?{' '}
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
