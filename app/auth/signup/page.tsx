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
import { Zap, Github, ArrowLeft, Sparkles, Shield, User, Mail, Phone, Lock, Code2, ShoppingBag, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { Turnstile } from '@/components/turnstile';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
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

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Turnstile token
    if (!!turnstileSiteKey && !turnstileToken) {
      toast.error('Lütfen güvenlik doğrulamasını tamamlayın', {
        duration: 4000,
      });
      return;
    }

    // Client-side validation
    if (!formData.email?.trim()) {
      toast.error('E-posta adresi gereklidir', {
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

    if (!formData.username?.trim()) {
      toast.error('Kullanıcı adı gereklidir', {
        duration: 4000,
      });
      return;
    }

    if (formData.username.trim().length < 3) {
      toast.error('Kullanıcı adı en az 3 karakter olmalıdır', {
        duration: 4000,
      });
      return;
    }

    if (formData.username.trim().length > 30) {
      toast.error('Kullanıcı adı en fazla 30 karakter olabilir', {
        duration: 4000,
      });
      return;
    }

    // Username format validation
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(formData.username.trim())) {
      toast.error('Kullanıcı adı sadece harf, rakam, alt çizgi ve tire içerebilir', {
        duration: 4000,
      });
      return;
    }

    // Strong password validation
    if (!formData.password || formData.password.length < 8) {
      toast.error('Şifre en az 8 karakter olmalıdır', {
        duration: 4000,
      });
      return;
    }

    // Check for strong password requirements
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      toast.error('Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir', {
        duration: 5000,
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Şifreler eşleşmiyor', {
        duration: 4000,
      });
      return;
    }

    // Phone validation (if provided)
    if (formData.phone?.trim()) {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
        toast.error('Geçerli bir telefon numarası giriniz (10 veya 11 haneli)', {
          duration: 4000,
        });
        return;
      }
    }

    if (!formData.terms) {
      toast.error('Kullanım Koşulları\'nı kabul etmelisiniz', {
        duration: 4000,
      });
      return;
    }

    if (!formData.kvkk) {
      toast.error('KVKK Aydınlatma Metni\'ni okumalısınız', {
        duration: 4000,
      });
      return;
    }

    if (formData.role === 'developer') {
      if (!formData.developerTerms) {
        toast.error('Geliştirici Sözleşmesi\'ni kabul etmelisiniz', {
          duration: 4000,
        });
        return;
      }
      if (!formData.commission) {
        toast.error('%15 komisyon sistemini kabul etmelisiniz', {
          duration: 4000,
        });
        return;
      }
    }

    setLoading(true);

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();

      // Log signup attempt in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Signup attempt:', {
          email: normalizedEmail,
          username: formData.username.trim(),
          role: formData.role,
        });
      }

      const result = await signUp(
        normalizedEmail,
        formData.password,
        formData.username.trim(),
        formData.fullName?.trim() || undefined,
        formData.phone?.trim() || undefined,
        formData.role
      );

      // Log success in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Signup successful:', {
          userId: result?.user?.id,
          email: result?.user?.email,
        });
      }
      
      toast.success('Hesabınız başarıyla oluşturuldu!', {
        duration: 5000,
        description: 'E-posta doğrulama linki gönderildi. Şimdi giriş yapabilirsiniz.',
      });
      
      // Redirect to sign in page
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    } catch (error: any) {
      // Log error in all environments for debugging
      console.error('Signup error:', {
        message: error?.message,
        name: error?.name,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      });

      const errorMessage = error?.message || 'Kayıt oluşturulamadı';
      toast.error(errorMessage, {
        duration: 6000,
        description: errorMessage.includes('e-posta') || errorMessage.includes('kullanıcı adı')
          ? 'Lütfen farklı bir e-posta veya kullanıcı adı deneyin.'
          : errorMessage.includes('kolonu') || errorMessage.includes('veritabanı')
          ? 'Lütfen yöneticiye bildirin.'
          : undefined,
      });
      setTurnstileToken(null); // Reset Turnstile on error
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
      const errorMessage = error?.message || 'GitHub ile kayıt yapılamadı';
      toast.error(errorMessage, {
        duration: 5000,
        description: 'Lütfen tekrar deneyin veya e-posta ile kayıt olun.',
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
      const errorMessage = error?.message || 'Google ile kayıt yapılamadı';
      toast.error(errorMessage, {
        duration: 5000,
        description: 'Lütfen tekrar deneyin veya e-posta ile kayıt olun.',
      });
      setOauthLoading(null);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-6">
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
              {/* Personal Information Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <User className="h-4 w-4 text-purple-500" />
                  <h3 className="text-base font-semibold text-foreground">Kişisel Bilgiler</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2 group">
                    <Label htmlFor="username" className="text-sm font-medium flex items-center gap-1.5">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Kullanıcı Adı
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="username"
                        type="text"
                        placeholder="@kullaniciadi"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                        className="h-11 text-sm pl-3 pr-10 transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                      />
                      {formData.username && formData.username.length >= 3 && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5" />
                      <span>Kalıcıdır, değiştirilemez</span>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      Ad Soyad
                      <span className="text-sm text-muted-foreground">(Opsiyonel)</span>
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Adınız Soyadınız"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="h-11 text-sm transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Mail className="h-4 w-4 text-purple-500" />
                  <h3 className="text-base font-semibold text-foreground">İletişim Bilgileri</h3>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    E-posta Adresi
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onBlur={(e) => setFormData({ ...formData, email: e.target.value.trim().toLowerCase() })}
                      required
                      autoComplete="email"
                      className="h-11 text-sm pl-3 pr-10 transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                    />
                    {formData.email && formData.email.includes('@') && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Telefon Numarası
                    <span className="text-sm text-muted-foreground">(Opsiyonel)</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex items-center rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground">
                      <span className="text-sm font-medium">🇹🇷 +90</span>
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="555 123 45 67"
                      value={formData.phone}
                      onChange={(e) => {
                        // Remove all non-digit characters
                        const value = e.target.value.replace(/\D/g, '');
                        // Format: 5XX XXX XX XX (max 10 digits)
                        let formatted = value;
                        if (value.length > 0) {
                          formatted = value.slice(0, 10);
                          if (formatted.length > 3) {
                            formatted = `${formatted.slice(0, 3)} ${formatted.slice(3)}`;
                          }
                          if (formatted.length > 7) {
                            formatted = `${formatted.slice(0, 7)} ${formatted.slice(7)}`;
                          }
                          if (formatted.length > 10) {
                            formatted = `${formatted.slice(0, 10)} ${formatted.slice(10, 12)}`;
                          }
                        }
                        setFormData({ ...formData, phone: formatted });
                      }}
                      onBlur={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, phone: digits });
                      }}
                      autoComplete="tel"
                      maxLength={13}
                      className="h-11 flex-1 text-sm transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Türkiye (+90) - 10 haneli numara</p>
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Lock className="h-4 w-4 text-purple-500" />
                  <h3 className="text-base font-semibold text-foreground">Güvenlik</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium flex items-center gap-1.5">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Şifre
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={8}
                        className="h-11 text-sm transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                      />
                      {formData.password && (() => {
                        const hasUpperCase = /[A-Z]/.test(formData.password);
                        const hasLowerCase = /[a-z]/.test(formData.password);
                        const hasNumber = /[0-9]/.test(formData.password);
                        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
                        const isStrong = formData.password.length >= 8 && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
                        return isStrong ? (
                          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                        ) : null;
                      })()}
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Min. 8 karakter</p>
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <div className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <span>{/[A-Z]/.test(formData.password) ? '✓' : '○'}</span>
                          <span>Büyük harf</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <span>{/[a-z]/.test(formData.password) ? '✓' : '○'}</span>
                          <span>Küçük harf</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <span>{/[0-9]/.test(formData.password) ? '✓' : '○'}</span>
                          <span>Rakam</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <span>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? '✓' : '○'}</span>
                          <span>Özel karakter</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-1.5">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      Şifre Tekrar
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        minLength={8}
                        className="h-11 text-sm transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
                      />
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                      )}
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                      )}
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-500">Şifreler eşleşmiyor</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Type Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <h3 className="text-base font-semibold text-foreground">Hesap Türü Seçimi</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <motion.label 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative cursor-pointer overflow-hidden rounded-lg border-2 p-2.5 transition-all duration-300 ${
                      formData.role === 'user' 
                        ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-blue-500/10 shadow-md shadow-purple-500/20' 
                        : 'border-border hover:border-purple-500/50 hover:shadow-sm'
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
                    {formData.role === 'user' && (
                      <motion.div 
                        layoutId="activeRole"
                        className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/5 rounded-lg"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="relative flex items-center gap-2">
                      <div className={`rounded-lg p-1.5 transition-all duration-300 ${
                        formData.role === 'user' 
                          ? 'bg-gradient-to-br from-purple-600 to-blue-600 shadow-md' 
                          : 'bg-muted'
                      }`}>
                        <ShoppingBag className={`h-3.5 w-3.5 transition-colors ${
                          formData.role === 'user' ? 'text-white' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="text-left space-y-0">
                        <span className="text-sm font-semibold block leading-tight">Kullanıcı</span>
                        <span className="text-xs text-muted-foreground block leading-tight">Otomasyonları satın al</span>
                      </div>
                      {formData.role === 'user' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-0.5 -right-0.5 bg-purple-500 rounded-full p-0.5"
                        >
                          <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.label>
                  <motion.label 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative cursor-pointer overflow-hidden rounded-lg border-2 p-2.5 transition-all duration-300 ${
                      formData.role === 'developer' 
                        ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-blue-500/10 shadow-md shadow-purple-500/20' 
                        : 'border-border hover:border-purple-500/50 hover:shadow-sm'
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
                    {formData.role === 'developer' && (
                      <motion.div 
                        layoutId="activeRole"
                        className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/5 rounded-lg"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="relative flex items-center gap-2">
                      <div className={`rounded-lg p-1.5 transition-all duration-300 ${
                        formData.role === 'developer' 
                          ? 'bg-gradient-to-br from-purple-600 to-blue-600 shadow-md' 
                          : 'bg-muted'
                      }`}>
                        <Code2 className={`h-3.5 w-3.5 transition-colors ${
                          formData.role === 'developer' ? 'text-white' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="text-left space-y-0">
                        <span className="text-sm font-semibold block leading-tight">Geliştirici</span>
                        <span className="text-xs text-muted-foreground block leading-tight">Otomasyonları sat</span>
                      </div>
                      {formData.role === 'developer' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-0.5 -right-0.5 bg-purple-500 rounded-full p-0.5"
                        >
                          <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </motion.label>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-border/50 bg-muted/30 p-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.terms}
                    onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
                    className="mt-0.5"
                  />
                  <label htmlFor="terms" className="cursor-pointer text-sm leading-tight">
                    <Link href="/terms" target="_blank" className="font-medium text-purple-600 hover:text-purple-500">
                      Kullanım Koşulları
                    </Link>
                    'nı okudum ve kabul ediyorum <span className="text-red-500">*</span>
                  </label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="kvkk"
                    checked={formData.kvkk}
                    onCheckedChange={(checked) => setFormData({ ...formData, kvkk: checked as boolean })}
                    className="mt-0.5"
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
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="developerTerms"
                        checked={formData.developerTerms}
                        onCheckedChange={(checked) => setFormData({ ...formData, developerTerms: checked as boolean })}
                        className="mt-0.5"
                      />
                      <label htmlFor="developerTerms" className="cursor-pointer text-sm leading-tight">
                        <Link href="/developer-agreement" target="_blank" className="font-medium text-purple-600 hover:text-purple-500">
                          Geliştirici Sözleşmesi
                        </Link>
                        'ni okudum ve kabul ediyorum <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="commission"
                        checked={formData.commission}
                        onCheckedChange={(checked) => setFormData({ ...formData, commission: checked as boolean })}
                        className="mt-0.5"
                      />
                      <label htmlFor="commission" className="cursor-pointer text-sm leading-tight">
                        %15 komisyon sistemini kabul ediyorum <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </>
                )}

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={formData.newsletter}
                    onCheckedChange={(checked) => setFormData({ ...formData, newsletter: checked as boolean })}
                    className="mt-0.5"
                  />
                  <label htmlFor="newsletter" className="cursor-pointer text-sm leading-tight">
                    Kampanya ve duyuru e-postaları almak istiyorum
                  </label>
                </div>
              </div>

              {/* Cloudflare Turnstile */}
              {turnstileSiteKey && (
                <div className="py-1">
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
                className="w-full h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-semibold shadow-lg shadow-purple-500/50 transition-all hover:scale-[1.02] text-sm"
                disabled={loading || oauthLoading !== null || (!!turnstileSiteKey && !turnstileToken)}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
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

            <div className="space-y-3 pt-3 border-t">
              <p className="text-center text-xs text-muted-foreground">
                Zaten hesabınız var mı?{' '}
                <Link href="/auth/signin" className="font-semibold text-purple-600 hover:text-purple-500 transition-colors">
                  Giriş Yap
                </Link>
              </p>
              <Link
                href="/"
                className="flex items-center justify-center text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Ana Sayfaya Dön
              </Link>
            </div>
          </CardContent>
        </Card>

      </motion.div>
    </div>
  );
}
