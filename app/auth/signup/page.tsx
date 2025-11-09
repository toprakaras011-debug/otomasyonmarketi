'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { signUp, signInWithGithub, signInWithGoogle } from '@/lib/auth';
import { toast } from 'sonner';
import { Zap, Github, ArrowLeft, Sparkles, Shield } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
    phone: '',
    role: 'user' as 'user' | 'developer',
    terms: false,
    kvkk: false,
    developerTerms: false,
    commission: false,
    newsletter: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    if (!formData.terms) {
      toast.error('Kullanım Koşulları\'nı kabul etmelisiniz');
      return;
    }

    if (!formData.kvkk) {
      toast.error('KVKK Aydınlatma Metni\'ni okumalişınız');
      return;
    }

    if (formData.role === 'developer') {
      if (!formData.developerTerms) {
        toast.error('Geliştirici Sözleşmesi\'ni kabul etmelisiniz');
        return;
      }
      if (!formData.commission) {
        toast.error('%15 komisyon sistemini kabul etmelisiniz');
        return;
      }
    }

    setLoading(true);

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.username,
        formData.fullName,
        formData.phone
      );
      toast.success('Hesabınız oluşturuldu! Giriş yapabilirsiniz.');
      router.push('/auth/signin');
    } catch (error: any) {
      toast.error(error.message || 'Kayıt oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setOauthLoading('github');
    try {
      await signInWithGithub();
    } catch (error: any) {
      toast.error(error.message || 'GitHub ile kayıt yapılamadı');
      setOauthLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading('google');
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message || 'Google ile kayıt yapılamadı');
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
              <CardTitle className="text-3xl font-bold">Hesap Oluşturun</CardTitle>
              <CardDescription className="mt-2 text-base">
                Otomasyonlarınızı yönetmeye başlayın
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
                {oauthLoading === 'github' ? 'Yönlendiriliyor...' : 'GitHub ile Kayıt Ol'}
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
                {oauthLoading === 'google' ? 'Yönlendiriliyor...' : 'Google ile Kayıt Ol'}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Kullanıcı Adı
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="kullaniciadi"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Ad Soyad
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Ad Soyad"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Telefon Numarası
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05xx xxx xx xx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

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
                  required
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Şifre
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="En az 6 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Şifre Tekrar
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Şifrenizi tekrar girin"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={6}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Hesap Türü</Label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.label 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative cursor-pointer overflow-hidden rounded-xl border-2 p-4 transition-all ${
                      formData.role === 'user' 
                        ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-blue-500/10' 
                        : 'border-border hover:border-purple-500/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="user"
                      checked={formData.role === 'user'}
                      onChange={() => setFormData({ ...formData, role: 'user' })}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className={`rounded-lg p-2 ${
                        formData.role === 'user' 
                          ? 'bg-gradient-to-br from-purple-600 to-blue-600' 
                          : 'bg-muted'
                      }`}>
                        <Zap className={`h-5 w-5 ${
                          formData.role === 'user' ? 'text-white' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <span className="text-sm font-semibold">Kullanıcı</span>
                      <span className="text-xs text-center text-muted-foreground">Otomasyonları satın al</span>
                    </div>
                  </motion.label>
                  <motion.label 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative cursor-pointer overflow-hidden rounded-xl border-2 p-4 transition-all ${
                      formData.role === 'developer' 
                        ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-blue-500/10' 
                        : 'border-border hover:border-purple-500/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="developer"
                      checked={formData.role === 'developer'}
                      onChange={() => setFormData({ ...formData, role: 'developer' })}
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className={`rounded-lg p-2 ${
                        formData.role === 'developer' 
                          ? 'bg-gradient-to-br from-purple-600 to-blue-600' 
                          : 'bg-muted'
                      }`}>
                        <svg className={`h-5 w-5 ${
                          formData.role === 'developer' ? 'text-white' : 'text-muted-foreground'
                        }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold">Geliştirici</span>
                      <span className="text-xs text-center text-muted-foreground">Otomasyonlar sat</span>
                    </div>
                  </motion.label>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-border/50 bg-muted/30 p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.terms}
                    onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
                  />
                  <label htmlFor="terms" className="cursor-pointer text-sm leading-tight">
                    <Link href="/terms" target="_blank" className="font-medium text-purple-600 hover:text-purple-500">
                      Kullanım Koşulları
                    </Link>
                    'nı okudum ve kabul ediyorum <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="kvkk"
                    checked={formData.kvkk}
                    onCheckedChange={(checked) => setFormData({ ...formData, kvkk: checked as boolean })}
                  />
                  <label htmlFor="kvkk" className="cursor-pointer text-sm leading-tight">
                    <Link href="/kvkk" target="_blank" className="font-medium text-purple-600 hover:text-purple-500">
                      KVKK Aydınlatma Metni
                    </Link>
                    'ni okudum <span className="text-red-500">*</span>
                  </label>
                </div>

                {formData.role === 'developer' && (
                  <>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="developerTerms"
                        checked={formData.developerTerms}
                        onCheckedChange={(checked) => setFormData({ ...formData, developerTerms: checked as boolean })}
                      />
                      <label htmlFor="developerTerms" className="cursor-pointer text-sm leading-tight">
                        <Link href="/developer-agreement" target="_blank" className="font-medium text-purple-600 hover:text-purple-500">
                          Geliştirici Sözleşmesi
                        </Link>
                        'ni okudum ve kabul ediyorum <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="commission"
                        checked={formData.commission}
                        onCheckedChange={(checked) => setFormData({ ...formData, commission: checked as boolean })}
                      />
                      <label htmlFor="commission" className="cursor-pointer text-sm leading-tight">
                        %15 komisyon sistemini kabul ediyorum <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </>
                )}

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="newsletter"
                    checked={formData.newsletter}
                    onCheckedChange={(checked) => setFormData({ ...formData, newsletter: checked as boolean })}
                  />
                  <label htmlFor="newsletter" className="cursor-pointer text-sm leading-tight">
                    Kampanya ve duyuru e-postaları almak istiyorum
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg shadow-purple-500/50 transition-all hover:scale-[1.02]"
                disabled={loading || oauthLoading !== null}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Kayıt oluşturuluyor...
                  </span>
                ) : (
                  'Kayıt Ol'
                )}
              </Button>
            </form>

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
