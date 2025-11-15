
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { signUp } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { TIMEOUTS } from '@/lib/constants';
import { toast } from 'sonner';
import { 
  Zap, 
  Loader2, 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle2, 
  Shield, 
  Sparkles, 
  AlertCircle, 
  ShoppingBag, 
  Code2 
} from 'lucide-react';
import { Turnstile } from '@/components/turnstile';

// SignUpForm component
function SignUpForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string>('');
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({
    checking: false,
    available: null,
    message: '',
  });
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
    phone: '',
    phoneCode: '+90',
    role: 'user' as 'user' | 'developer',
    terms: false,
    kvkk: false,
    developerTerms: false,
    commission: false,
    newsletter: false,
  });

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setTurnstileSiteKey(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '');
    }
  }, []);

  // Real-time username validation
  useEffect(() => {
    const username = formData.username.trim();
    
    // Clear previous timeout
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout);
    }
    
    // Reset status if username is empty
    if (!username) {
      setUsernameStatus({
        checking: false,
        available: null,
        message: '',
      });
      return;
    }
    
    // Validate format first
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: 'Kullanıcı adı sadece harf, rakam, alt çizgi ve tire içerebilir',
      });
      return;
    }
    
    if (username.length < 3) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: 'Kullanıcı adı en az 3 karakter olmalıdır',
      });
      return;
    }
    
    if (username.length > 30) {
      setUsernameStatus({
        checking: false,
        available: false,
        message: 'Kullanıcı adı en fazla 30 karakter olabilir',
      });
      return;
    }
    
    // Debounce: wait 500ms before checking
    setUsernameStatus({
      checking: true,
      available: null,
      message: 'Kontrol ediliyor...',
    });
    
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        
        setUsernameStatus({
          checking: false,
          available: data.available,
          message: data.message || (data.available ? 'Kullanıcı adı kullanılabilir' : 'Bu kullanıcı adı zaten kullanılıyor'),
        });
      } catch (error) {
        setUsernameStatus({
          checking: false,
          available: null,
          message: 'Kontrol edilemedi',
        });
      }
    }, 500);
    
    setUsernameCheckTimeout(timeout);
    
    // Cleanup
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [formData.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    // Check if username is available
    if (usernameStatus.available === false) {
      toast.error(usernameStatus.message || 'Bu kullanıcı adı zaten kullanılıyor', {
        duration: 4000,
      });
      return;
    }
    
    if (usernameStatus.checking) {
      toast.error('Lütfen kullanıcı adı kontrolünün tamamlanmasını bekleyin', {
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
      if (formData.phoneCode === '+90') {
        // Turkish phone validation: 10 digits
        if (phoneDigits.length !== 10) {
          toast.error('Geçerli bir telefon numarası giriniz (10 haneli)', {
            duration: 4000,
          });
          return;
        }
      } else if (phoneDigits.length < 7 || phoneDigits.length > 15) {
        // International phone validation: 7-15 digits
        toast.error('Geçerli bir telefon numarası giriniz', {
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

    // No logging during render to avoid blocking route
    setLoading(true);

    try {
      const normalizedEmail = formData.email.trim().toLowerCase();

      const result = await signUp(
        normalizedEmail,
        formData.password,
        formData.username.trim(),
        formData.fullName?.trim() || undefined,
        formData.phone?.trim() ? `${formData.phoneCode}${formData.phone.replace(/\D/g, '')}` : undefined,
        formData.role
      );

      // No logging during render to avoid blocking route

      if (!result?.user) {
        throw new Error('Kullanıcı oluşturulamadı');
      }

      // EMAIL VERIFICATION IS REQUIRED
      // Always redirect to verification page - users must verify their email before login
      // Even if email_confirmed_at is set, we still require verification for security
      
      // Check if session exists (shouldn't happen with email verification enabled)
      const hasSession = result?.session !== null && result?.session !== undefined;
      const isEmailConfirmed = result.user.email_confirmed_at !== null && result.user.email_confirmed_at !== undefined;

      // If email is already confirmed AND has session (shouldn't happen with email verification enabled)
      // This might happen if Supabase Dashboard has email verification disabled
      if (hasSession && isEmailConfirmed) {
        
        // Still redirect to verification page to be safe
        // But also allow login since email is confirmed
        toast.success('Hesabınız oluşturuldu!', {
          duration: 5000,
          description: 'E-posta adresiniz zaten doğrulandı. Yönlendiriliyorsunuz...',
        });
        
        // Wait a bit for session to be established
        await new Promise(resolve => setTimeout(resolve, TIMEOUTS.PROFILE_RETRY));
        
        // Get user profile to check admin status
        type UserProfile = { role: string | null; is_admin: boolean | null };
        const { data } = await supabase
          .from('user_profiles')
          .select('role, is_admin')
          .eq('id', result.user.id)
          .maybeSingle();
        const profile = data as UserProfile | null;

        // Determine redirect based on user role
        const redirectUrl = (profile && (profile.role === 'admin' || profile.is_admin))
          ? '/admin/dashboard'
          : '/dashboard';
        
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, TIMEOUTS.REDIRECT_DELAY);
      } else {
        // Email verification required - ALWAYS redirect to verification page
        // This is the normal flow when email verification is enabled in Supabase Dashboard
        
        toast.success('Hesabınız oluşturuldu!', {
          duration: 5000,
          description: 'E-posta adresinize doğrulama linki gönderildi. Lütfen e-postanızı kontrol edin.',
        });
        
        // IMPORTANT: Sign out the user if they have a session
        // Email verification must be completed before they can login
        if (hasSession) {
          // Sign out to prevent auto-login without email verification
          await supabase.auth.signOut();
        }
        
        // Redirect to email verification page
        setTimeout(() => {
          router.push(`/auth/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
        }, TIMEOUTS.EMAIL_VERIFICATION_REDIRECT);
      }
    } catch (error: any) {
      // No logging during render to avoid blocking route

      const errorMessage = error?.message || 'Kayıt oluşturulamadı';
      
      // Special handling for "email signups disabled" error
      if (errorMessage.includes('Email signups are disabled') || errorMessage.includes('signups are disabled') || errorMessage.includes('E-posta ile kayıt şu anda devre dışı')) {
        toast.error('E-posta ile Kayıt Devre Dışı', {
          duration: 10000,
          description: 'E-posta ile kayıt şu anda devre dışı. Lütfen Supabase Dashboard\'da "Enable email signups" seçeneğini aktif edin. (Authentication > Settings > Email Auth)',
        });
        setTurnstileToken(null);
      } else if (errorMessage.includes('zaten kayıtlı') || errorMessage.includes('already registered')) {
        // Special handling for "already registered" errors
        toast.error(errorMessage, {
          duration: 8000,
          description: 'Bu e-posta ile giriş yapmayı deneyin veya şifrenizi sıfırlayın.',
          action: {
            label: 'Giriş Yap',
            onClick: () => router.push('/auth/signin'),
          },
        });
        setTurnstileToken(null);
      } else {
        toast.error(errorMessage, {
          duration: 6000,
          description: errorMessage.includes('e-posta') || errorMessage.includes('kullanıcı adı')
            ? 'Lütfen farklı bir e-posta veya kullanıcı adı deneyin.'
            : errorMessage.includes('kolonu') || errorMessage.includes('veritabanı')
            ? 'Lütfen yöneticiye bildirin.'
            : errorMessage.includes('profil bulunamadı')
            ? 'Lütfen şifre sıfırlama sayfasını kullanın veya destek ekibiyle iletişime geçin.'
            : undefined,
        });
        setTurnstileToken(null); // Reset Turnstile on error
      }
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
              Hesap Oluşturun
            </CardTitle>
            <CardDescription className="text-base">
              Otomasyonlarınızı yönetmeye başlayın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-3">
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
                        disabled={loading}
                        className={`h-12 border-2 transition-colors ${
                          usernameStatus.available === true
                            ? 'border-green-500/50 focus:border-green-500'
                            : usernameStatus.available === false
                            ? 'border-red-500/50 focus:border-red-500'
                            : 'border-purple-500/20 focus:border-purple-500'
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {usernameStatus.checking && (
                          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                        )}
                        {!usernameStatus.checking && usernameStatus.available === true && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                        {!usernameStatus.checking && usernameStatus.available === false && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      {usernameStatus.message && (
                        <p
                          className={`text-xs mt-1 ${
                            usernameStatus.available === true
                              ? 'text-green-600 dark:text-green-400'
                              : usernameStatus.available === false
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {usernameStatus.message}
                        </p>
                      )}
                    </div>
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
                      disabled={loading}
                      className="h-12 border-2 border-purple-500/20 focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-3">
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
                      disabled={loading}
                      className="h-12 border-2 border-purple-500/20 focus:border-purple-500 transition-colors"
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
                    <Select
                      value={formData.phoneCode}
                      onValueChange={(value) => setFormData({ ...formData, phoneCode: value })}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-[120px] h-12 border-2 border-purple-500/20 focus:border-purple-500 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+90">🇹🇷 +90</SelectItem>
                        <SelectItem value="+1">🇺🇸 +1</SelectItem>
                        <SelectItem value="+44">🇬🇧 +44</SelectItem>
                        <SelectItem value="+49">🇩🇪 +49</SelectItem>
                        <SelectItem value="+33">🇫🇷 +33</SelectItem>
                        <SelectItem value="+39">🇮🇹 +39</SelectItem>
                        <SelectItem value="+34">🇪🇸 +34</SelectItem>
                        <SelectItem value="+31">🇳🇱 +31</SelectItem>
                        <SelectItem value="+32">🇧🇪 +32</SelectItem>
                        <SelectItem value="+41">🇨🇭 +41</SelectItem>
                        <SelectItem value="+43">🇦🇹 +43</SelectItem>
                        <SelectItem value="+46">🇸🇪 +46</SelectItem>
                        <SelectItem value="+47">🇳🇴 +47</SelectItem>
                        <SelectItem value="+45">🇩🇰 +45</SelectItem>
                        <SelectItem value="+358">🇫🇮 +358</SelectItem>
                        <SelectItem value="+7">🇷🇺 +7</SelectItem>
                        <SelectItem value="+971">🇦🇪 +971</SelectItem>
                        <SelectItem value="+966">🇸🇦 +966</SelectItem>
                        <SelectItem value="+20">🇪🇬 +20</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={formData.phoneCode === '+90' ? '555 123 45 67' : 'Telefon numarası'}
                      value={formData.phone}
                      onChange={(e) => {
                        // Remove all non-digit characters
                        const value = e.target.value.replace(/\D/g, '');
                        // Format based on country code
                        let formatted = value;
                        if (formData.phoneCode === '+90') {
                          // Turkish format: 5XX XXX XX XX (max 10 digits)
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
                        } else {
                          // International format: just numbers
                          formatted = value;
                        }
                        setFormData({ ...formData, phone: formatted });
                      }}
                      onBlur={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, phone: digits });
                      }}
                      autoComplete="tel"
                      maxLength={formData.phoneCode === '+90' ? 13 : 15}
                      disabled={loading}
                      className="h-12 flex-1 border-2 border-purple-500/20 focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.phoneCode === '+90' ? 'Türkiye (+90) - 10 haneli numara' : 'Telefon numaranızı girin'}
                  </p>
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-3">
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
                        disabled={loading}
                      className="h-12 border-2 border-purple-500/20 focus:border-purple-500 transition-colors"
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
                        disabled={loading}
                      className="h-12 border-2 border-purple-500/20 focus:border-purple-500 transition-colors"
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
                disabled={loading || (turnstileSiteKey ? !turnstileToken : false)}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kayıt oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Kayıt Ol
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/signin"
                className="text-muted-foreground hover:text-foreground hover:underline transition-colors text-sm"
              >
                Zaten hesabınız var mı? Giriş yapın
              </Link>
            </div>

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

// Main page component - wraps SignUpForm for Suspense compatibility
export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-600" />
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}
