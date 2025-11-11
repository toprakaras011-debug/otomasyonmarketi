'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FileUpload } from '@/components/file-upload';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  User,
  Lock,
  Bell,
  Trash2,
  Sparkles,
  CalendarDays,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Activity,
  ShoppingBag,
  Smartphone,
  CreditCard,
  Info,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getBankNameFromIban, validateIban } from '@/lib/utils/iban-bank';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TURKEY_CITIES, getDistrictsByCity } from '@/lib/utils/turkey-cities';

type ProfileFormData = {
  username: string;
  full_name: string;
  avatar_url: string;
  phone: string;
  city: string;
  district: string;
  postal_code: string;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type NotificationPrefs = {
  email: boolean;
  purchases: boolean;
  updates: boolean;
  sms: boolean;
};

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  email: true,
  purchases: true,
  updates: true,
  sms: false,
};

const NOTIFICATION_OPTIONS: {
  key: keyof NotificationPrefs;
  title: string;
  description: string;
  accent: string;
  icon: LucideIcon;
}[] = [
  {
    key: 'email',
    title: 'E-posta Bildirimleri',
    description: 'Yeni otomasyonlar, kampanyalar ve duyurular e-posta kutunuza gelsin.',
    accent: 'from-purple-500/20 to-purple-600/20',
    icon: Mail,
  },
  {
    key: 'purchases',
    title: 'Satın Alma Bildirimleri',
    description: 'Satın alma ve faturalandırma hareketlerini anında takip edin.',
    accent: 'from-blue-500/20 to-cyan-500/20',
    icon: ShoppingBag,
  },
  {
    key: 'updates',
    title: 'Ürün Güncellemeleri',
    description: 'Favorilerinizdeki otomasyon güncellemelerinden haberdar olun.',
    accent: 'from-emerald-500/20 to-teal-500/20',
    icon: Activity,
  },
  {
    key: 'sms',
    title: 'SMS Bildirimleri',
    description: 'Kritik durumlarda SMS ile anında bilgilendirilin.',
    accent: 'from-amber-500/20 to-orange-500/20',
    icon: Smartphone,
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'payment'>('profile');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    username: '',
    full_name: '',
    avatar_url: '',
    phone: '',
    city: '',
    district: '',
    postal_code: '',
  });
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);
  const [notificationSaving, setNotificationSaving] = useState(false);
  const [paymentData, setPaymentData] = useState({
    full_name: '',
    company_name: '',
    tc_no: '',
    tax_office: '',
    iban: '',
    bank_name: '',
    billing_address: '',
  });
  const [savingPayment, setSavingPayment] = useState(false);
  
  const handleIbanChange = (iban: string) => {
    const cleanIban = iban.replace(/[\s\-_.,]/g, '').toUpperCase();
    setPaymentData({ ...paymentData, iban: cleanIban });
    
    if (cleanIban.length >= 4) {
      const bankName = getBankNameFromIban(cleanIban);
      if (bankName) {
        setPaymentData(prev => ({ ...prev, bank_name: bankName }));
      } else {
        setPaymentData(prev => ({ ...prev, bank_name: '' }));
      }
    }
  };
  
  const handleSavePayment = async () => {
    if (!user?.id) {
      toast.error('Kullanıcı bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }

    if (!paymentData.full_name.trim()) {
      toast.error('Ad soyad zorunludur');
      return;
    }
    if (!paymentData.tc_no.trim()) {
      toast.error('TC Kimlik No zorunludur');
      return;
    }
    if (!paymentData.tax_office.trim()) {
      toast.error('Vergi dairesi zorunludur');
      return;
    }
    if (!paymentData.iban.trim()) {
      toast.error('IBAN zorunludur');
      return;
    }
    if (!validateIban(paymentData.iban)) {
      toast.error('Geçerli bir IBAN giriniz');
      return;
    }
    if (!paymentData.billing_address.trim()) {
      toast.error('Adres zorunludur');
      return;
    }

    const bankName = getBankNameFromIban(paymentData.iban);
    if (!bankName) {
      toast.error('IBAN\'dan banka adı tespit edilemedi');
      return;
    }

    setSavingPayment(true);
    
    // Timeout koruması (10 saniye)
    let timeoutCleared = false;
    const timeoutId = setTimeout(() => {
      if (!timeoutCleared) {
        setSavingPayment(false);
        toast.error('İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.');
      }
    }, 10000);
    
    try {
      const cleanIban = paymentData.iban.replace(/[\s\-_.,]/g, '').toUpperCase();
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          full_name: paymentData.full_name.trim(),
          company_name: paymentData.company_name.trim() || null, // Allow empty string to be saved as null
          tc_no: paymentData.tc_no.trim(),
          tax_office: paymentData.tax_office.trim(),
          iban: cleanIban,
          bank_name: bankName,
          billing_address: paymentData.billing_address.trim(), // ✅ Adres alanını ekle
        })
        .eq('id', user.id)
        .select()
        .single();

      clearTimeout(timeoutId);
      timeoutCleared = true;

      if (error) {
        console.error('Payment save error:', error);
        // Kolon yoksa daha açıklayıcı hata mesajı
        if (error.code === '42703' || error.message?.includes('column') || error.message?.includes('does not exist')) {
          toast.error('Veritabanı kolonları eksik. Lütfen SQL migration dosyasını çalıştırın.');
        } else {
          toast.error(error.message || 'Kayıt başarısız. Lütfen tekrar deneyin.');
        }
        setSavingPayment(false);
        return;
      }

      if (data) {
        setProfile((prev: any) => ({
          ...prev,
          full_name: paymentData.full_name.trim(),
          company_name: paymentData.company_name.trim(),
          tc_no: paymentData.tc_no.trim(),
          tax_office: paymentData.tax_office.trim(),
          iban: cleanIban,
          bank_name: bankName,
          billing_address: paymentData.billing_address.trim(),
        }));

        toast.success('Ödeme bilgileri kaydedildi!', {
          duration: 3000,
        });
      } else {
        toast.error('Kayıt başarısız. Veri döndürülmedi.');
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      timeoutCleared = true;
      console.error('Payment save exception:', error);
      toast.error(error?.message || 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSavingPayment(false);
    }
  };

  const displayName =
    profileData.full_name?.trim() ||
    profileData.username?.trim() ||
    user?.email?.split('@')[0] ||
    'Kullanıcı';

  const membershipStartedAt = user?.created_at ? new Date(user.created_at) : null;
  const membershipDays = membershipStartedAt
    ? Math.max(1, Math.floor((Date.now() - membershipStartedAt.getTime()) / 86_400_000))
    : null;
  const membershipLabel = membershipDays ? `${membershipDays}+ gün` : '—';
  const membershipDateLabel = membershipStartedAt
    ? membershipStartedAt.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Kayıt tarihi bulunamadı';

  const lastSignInLabel = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString('tr-TR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'İlk girişinizi yapın';

  const profileCompletionFields = [
    profileData.username,
    profileData.full_name,
    profileData.phone,
    profileData.city,
    profileData.district,
    profileData.postal_code,
  ];

  const profileCompletion = Math.round(
    (profileCompletionFields.filter((value) => value && value.trim().length > 0).length /
      (profileCompletionFields.length || 1)) *
      100,
  );

  const quickStats = [
    {
      label: 'Üyelik Süresi',
      value: membershipLabel,
      hint: membershipDateLabel,
      accent: 'from-purple-500/25 via-fuchsia-500/10 to-blue-500/25',
      icon: CalendarDays,
    },
    {
      label: 'Profil Tamamlanma',
      value: `%${Math.min(100, Math.max(0, profileCompletion))}`,
      hint: 'Profil bilgilerinizi tamamlayın',
      accent: 'from-emerald-500/25 via-teal-500/10 to-cyan-500/25',
      icon: CheckCircle2,
    },
    {
      label: 'Son Giriş',
      value: lastSignInLabel,
      hint: 'Hesabınızı güvende tutun',
      accent: 'from-blue-500/25 via-purple-500/10 to-indigo-500/25',
      icon: ShieldCheck,
    },
  ] as const;

  const handleAvatarUpload = async (path: string) => {
    if (!path) {
      setProfileData((prev) => ({ ...prev, avatar_url: '' }));
      return;
    }

    const { data } = supabase.storage
      .from('profile-avatars')
      .getPublicUrl(path);

    const publicUrl = data.publicUrl;

    setProfileData((prev) => ({
      ...prev,
      avatar_url: publicUrl,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push('/auth/signin');
        return;
      }

      setUser(currentUser);

      const { data: profileRecord } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileRecord) {
        setProfile(profileRecord);
        const city = profileRecord.city || '';
        setProfileData({
          username: profileRecord.username || '',
          full_name: profileRecord.full_name || '',
          avatar_url: profileRecord.avatar_url || '',
          phone: profileRecord.phone || '',
          city: city,
          district: profileRecord.district || '',
          postal_code: profileRecord.postal_code || '',
        });
        // İl seçilmişse ilçeleri yükle
        if (city) {
          setAvailableDistricts(getDistrictsByCity(city));
        }
        
        setPaymentData({
          full_name: profileRecord.full_name || '',
          company_name: profileRecord.company_name || '',
          tc_no: profileRecord.tc_no || '',
          tax_office: profileRecord.tax_office || '',
          iban: profileRecord.iban || '',
          bank_name: profileRecord.bank_name || '',
          billing_address: profileRecord.billing_address || '',
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (saving || avatarUploading) {
      return;
    }
    
    setSaving(true);

    // Timeout protection (10 seconds)
    let timeoutCleared = false;
    const timeoutId = setTimeout(() => {
      if (!timeoutCleared) {
        setSaving(false);
        toast.error('İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.');
      }
    }, 10000);

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          // Username is not updatable - set during signup
          full_name: profileData.full_name?.trim() || null,
          avatar_url: profileData.avatar_url || null,
          phone: profileData.phone?.trim() || null,
          city: profileData.city?.trim() || null,
          district: profileData.district?.trim() || null,
          postal_code: profileData.postal_code?.trim() || null,
        })
        .eq('id', user.id)
        .select()
        .single();

      clearTimeout(timeoutId);
      timeoutCleared = true;

      if (error) {
        console.error('Profile update error:', error);
        
        // More specific error handling
        if (error.code === '42703' || error.message?.includes('column') || error.message?.includes('does not exist')) {
          toast.error('Veritabanı kolonları eksik. Lütfen SQL migration dosyasını çalıştırın.');
        } else {
          toast.error(error.message || 'Güncelleme başarısız. Lütfen tekrar deneyin.', {
            duration: 5000,
          });
        }
        setSaving(false);
        return;
      }

      if (data) {
        setProfile({ ...profile, ...data });
        toast.success('Profil bilgileriniz güncellendi', {
          duration: 3000,
        });
      } else {
        toast.error('Güncelleme başarısız. Veri döndürülmedi.');
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      timeoutCleared = true;
      console.error('Profile update exception:', error);
      toast.error(error?.message || 'Güncelleme başarısız', {
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationToggle = (key: keyof NotificationPrefs) => {
    const newValue = !notificationPrefs[key];
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: newValue,
    }));
    
    // Bildirim göster
    const option = NOTIFICATION_OPTIONS.find(opt => opt.key === key);
    if (option) {
      const message = `${option.title} ${newValue ? 'açıldı' : 'kapatıldı'}`;
      // Toast'ı göstermek için setTimeout kullan (React state güncellemesinden sonra)
      setTimeout(() => {
        toast.success(message, {
          duration: 3000,
        });
      }, 0);
    }
  };

  const handleSaveNotifications = async () => {
    setNotificationSaving(true);
    try {
      const response = await fetch('/api/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(notificationPrefs),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
          router.push('/auth/signin');
          setNotificationSaving(false);
          return;
        }
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message || 'Tercihler kaydedilemedi');
      }

      toast.success('Bildirim tercihleri güncellendi', {
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Notification save error:', error);
      toast.error(error?.message || 'Tercihler kaydedilemedi');
    } finally {
      setNotificationSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        console.error('Password update error:', error);
        toast.error(error.message || 'Şifre güncellenemedi');
        setSaving(false);
        return;
      }

      toast.success('Şifreniz güncellendi', {
        duration: 3000,
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Password update exception:', error);
      toast.error(error?.message || 'Şifre güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="space-y-8">
            <div className="h-24 rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20" />
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="h-60 rounded-3xl bg-muted/60" />
              <div className="h-60 rounded-3xl bg-muted/30" />
            </div>
            <div className="h-96 rounded-3xl bg-muted" />
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.15),transparent_65%),radial-gradient(ellipse_at_bottom,_rgba(59,130,246,0.18),transparent_60%)] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#ffffff05_0%,transparent_35%,transparent_65%,#0f172a08_100%)]" />
      </div>
      <Navbar />

      <div className="container relative mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto mb-12 max-w-5xl overflow-hidden rounded-[32px] border border-white/15 bg-slate-950/80 p-8 text-white shadow-[0_25px_80px_rgba(88,28,135,0.35)] backdrop-blur-2xl sm:p-12"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/25 blur-[90px]" />
          <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-blue-500/20 blur-[90px]" />
          <motion.div
            className="absolute inset-0 translate-x-[-100%] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.35),transparent)]"
            animate={{ translateX: ['-100%', '120%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.45em] text-white/70">
                <Sparkles className="h-4 w-4" />
                Hesap Kontrol Merkezi
              </div>
              <div>
                <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  {displayName},
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    Ayarlarınızı Özelleştirin
                  </span>
                </h1>
                <p className="mt-4 max-w-xl text-base text-white/80">
                  Güvenlik, profil ve bildirim tercihlerinizi tek panelden yönetin. Tüm değişiklikler gerçek zamanlı olarak senkronize edilir ve güvenle saklanır.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1">
                  <ShieldCheck className="h-4 w-4 text-teal-200" />
                  256-bit şifreleme ile korunur
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1">
                  <Sparkles className="h-4 w-4 text-purple-200" />
                  Gerçek zamanlı yedekleme
                </div>
              </div>
            </div>

            <div className="grid w-full gap-4 sm:grid-cols-2 lg:w-auto">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 text-left shadow-[0_15px_40px_rgba(59,130,246,0.18)]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 * index }}
                  >
                    <span className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-80" />
                    <span className={`absolute inset-0 -z-10 bg-gradient-to-br ${stat.accent}`} />
                    <div className="relative flex items-start justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-white/60">{stat.label}</p>
                        <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
                        <p className="mt-1 text-xs text-white/70">{stat.hint}</p>
                      </div>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        <div className="mx-auto max-w-5xl">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-8">
            <TabsList className="relative grid w-full grid-cols-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-1 text-slate-600 shadow-lg backdrop-blur-lg dark:border-white/15 dark:bg-white/5 dark:text-white/80">
              <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(168,85,247,0.12),rgba(59,130,246,0.12))] dark:bg-[linear-gradient(120deg,rgba(168,85,247,0.15),rgba(59,130,246,0.15))]" />
              {[
                { key: 'profile', label: 'Profil', icon: User },
                { key: 'security', label: 'Güvenlik', icon: Lock },
                { key: 'notifications', label: 'Bildirimler', icon: Bell },
                { key: 'payment', label: 'Ödeme', icon: CreditCard },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className={`relative flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-[0_12px_30px_rgba(147,197,253,0.25)] dark:bg-white/15 dark:text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:text-white/60 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden border border-slate-200 bg-white/95 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                  <CardHeader className="relative border-b border-slate-200/80 pb-6 dark:border-white/10">
                    <motion.div
                      className="absolute inset-0 bg-[linear-gradient(140deg,rgba(168,85,247,0.15),rgba(59,130,246,0.12))]"
                      animate={{ opacity: [0.6, 0.8, 0.6] }}
                      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className="relative z-10">
                      <CardTitle className="flex items-center gap-3 text-xl text-slate-900 dark:text-white">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-900 dark:bg-white/10 dark:text-white">
                          <User className="h-5 w-5" />
                        </span>
                        Profil Bilgileri
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-white/70">
                        Profilinizi güncelleyin, şirket ve faturalandırma bilgilerinizi tamamlayın.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-8 p-8 text-slate-800 dark:text-white">
                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                        <Avatar className="h-24 w-24 border-2 border-slate-200 shadow-[0_15px_35px_rgba(168,85,247,0.25)] dark:border-white/25">
                          <AvatarImage src={profileData.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-2xl text-white">
                            {profileData.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="mb-3 text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-white/60">Avatar</div>
                          <FileUpload
                            label="Profil görselini güncelle"
                            bucketName="profile-avatars"
                            accept="image/*"
                            maxSizeMB={5}
                            onUploadComplete={handleAvatarUpload}
                            currentFile={profileData.avatar_url}
                            userId={user.id}
                            fileType="image"
                            onUploadingChange={setAvatarUploading}
                          />
                          <p className="mt-3 text-xs text-slate-500 dark:text-white/60">5MB altı .jpg, .png ya da .webp formatlarını yükleyebilirsiniz.</p>
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-slate-700 dark:text-white/80">Kullanıcı Adı</Label>
                          <Input
                            id="username"
                            value={profileData.username}
                            disabled
                            className="border-slate-200 bg-slate-100 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/70 cursor-not-allowed"
                          />
                          <p className="text-xs text-slate-500 dark:text-white/60">
                            Kullanıcı adı kayıt sırasında belirlenir ve değiştirilemez.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="full_name" className="text-slate-700 dark:text-white/80">Ad Soyad</Label>
                          <Input
                            id="full_name"
                            value={profileData.full_name}
                            onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                            placeholder="Ad Soyad"
                            required
                            className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-700 dark:text-white/80">E-posta</Label>
                          <Input value={user.email} disabled className="border-slate-200 bg-slate-100 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/70" />
                          <p className="text-xs text-slate-500 dark:text-white/60">
                            E-posta adresiniz giriş ve faturalandırma bildirimleri için kullanılır.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-slate-700 dark:text-white/80">Telefon Numarası</Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            placeholder="(5xx) xxx xx xx"
                            required
                            className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                          />
                        </div>

                      </div>

                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="city" className="text-slate-700 dark:text-white/80">İl *</Label>
                          <Select
                            value={profileData.city}
                            onValueChange={(value) => {
                              setProfileData({ ...profileData, city: value, district: '' }); // İl değişince ilçeyi sıfırla
                              setAvailableDistricts(getDistrictsByCity(value));
                            }}
                          >
                            <SelectTrigger className="border-slate-200 bg-white text-slate-900 dark:border-white/20 dark:bg-white/10 dark:text-white">
                              <SelectValue placeholder="İl seçiniz" />
                            </SelectTrigger>
                            <SelectContent 
                              position="popper" 
                              side="bottom" 
                              align="start"
                              sideOffset={4}
                              avoidCollisions={true}
                              collisionPadding={8}
                              className="z-[100] max-h-[300px]"
                            >
                              {TURKEY_CITIES.map((city) => (
                                <SelectItem key={city.code} value={city.name}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="district" className="text-slate-700 dark:text-white/80">İlçe *</Label>
                          <Select
                            value={profileData.district}
                            onValueChange={(value) => setProfileData({ ...profileData, district: value })}
                            disabled={!profileData.city || availableDistricts.length === 0}
                          >
                            <SelectTrigger className="border-slate-200 bg-white text-slate-900 dark:border-white/20 dark:bg-white/10 dark:text-white disabled:opacity-50">
                              <SelectValue placeholder={profileData.city ? "İlçe seçiniz" : "Önce il seçiniz"} />
                            </SelectTrigger>
                            <SelectContent 
                              position="popper" 
                              side="bottom" 
                              align="start"
                              sideOffset={4}
                              avoidCollisions={true}
                              collisionPadding={8}
                              className="z-[100] max-h-[300px]"
                            >
                              {availableDistricts.map((district, index) => (
                                <SelectItem key={`${district}-${index}`} value={district}>
                                  {district}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="postal_code" className="text-slate-700 dark:text-white/80">Posta Kodu *</Label>
                          <Input
                            id="postal_code"
                            value={profileData.postal_code}
                            onChange={(e) => setProfileData({ ...profileData, postal_code: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                            placeholder="34000"
                            maxLength={5}
                            required
                            className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                          />
                        </div>
                      </div>


                      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5 text-purple-500 dark:text-purple-200" />
                          <span>Profilinizi ve Ödeme Bilgilerinizi tamamlayarak otomatik faturalandırma sürecini hızlandırın.</span>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700 shadow-sm dark:bg-white/10 dark:text-white/80">
                          %{profileCompletion}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="submit"
                          disabled={saving || avatarUploading}
                          className="group relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 px-6 py-2 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(147,197,253,0.35)] hover:opacity-90"
                        >
                          <span className="absolute inset-0 translate-y-[120%] bg-gradient-to-r from-white/40 via-white/10 to-transparent opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100" />
                          <span className="relative">{saving || avatarUploading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-white/30 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                          onClick={() => {
                            const city = profile?.city || '';
                            setProfileData({
                              username: profile?.username || '',
                              full_name: profile?.full_name || '',
                              avatar_url: profile?.avatar_url || '',
                              phone: profile?.phone || '',
                              city: city,
                              district: profile?.district || '',
                              postal_code: profile?.postal_code || '',
                            });
                            if (city) {
                              setAvailableDistricts(getDistrictsByCity(city));
                            } else {
                              setAvailableDistricts([]);
                            }
                            // Reset payment data
                            setPaymentData({
                              full_name: profile?.full_name || '',
                              company_name: profile?.company_name || '',
                              tc_no: profile?.tc_no || '',
                              tax_office: profile?.tax_office || '',
                              iban: profile?.iban || '',
                              bank_name: profile?.bank_name || '',
                              billing_address: profile?.billing_address || '',
                            });
                          }}
                        >
                          İptal Et
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="security">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                  <Card className="overflow-hidden border border-slate-200 bg-white/95 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                    <CardHeader className="relative border-b border-slate-200/80 pb-6 dark:border-white/10">
                      <motion.div
                        className="absolute inset-0 bg-[linear-gradient(140deg,rgba(96,165,250,0.15),rgba(167,139,250,0.12))]"
                        animate={{ opacity: [0.55, 0.75, 0.55] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <div className="relative z-10">
                        <CardTitle className="flex items-center gap-3 text-xl text-slate-900 dark:text-white">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-900 dark:bg-white/10 dark:text-white">
                            <Lock className="h-5 w-5" />
                          </span>
                          Güvenlik Kontrolü
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-white/70">
                          Şifrenizi değiştirin, hesabınızı güvende tutun. Şifreleriniz şifrelenmiş olarak saklanır.
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8 text-slate-800 dark:text-white">
                      <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-slate-700 dark:text-white/80">Yeni Şifre</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder="••••••••"
                            className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-slate-700 dark:text-white/80">Yeni Şifre (Tekrar)</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                          />
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
                            <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-200" />
                            Şifre önerileri
                          </div>
                          <ul className="mt-2 list-disc space-y-1 pl-5">
                            <li>En az 12 karakter kullanın</li>
                            <li>Büyük/küçük harf, rakam ve sembol ekleyin</li>
                            <li>Şifrenizi düzenli aralıklarla güncelleyin</li>
                          </ul>
                        </div>

                        <Button
                          type="submit"
                          disabled={saving}
                          className="group relative overflow-hidden bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 px-6 py-2 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(59,130,246,0.35)] hover:opacity-90"
                        >
                          <span className="absolute inset-0 translate-y-[120%] bg-gradient-to-r from-white/40 via-white/10 to-transparent opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100" />
                          <span className="relative">{saving ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}</span>
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="border border-slate-200 bg-white/90 p-6 text-slate-800 shadow-lg dark:border-white/10 dark:bg-white/5 dark:text-white">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-900 dark:bg-white/10 dark:text-white">
                        <ShieldCheck className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Hesap Güvenliği</h3>
                        <p className="text-sm text-slate-600 dark:text-white/70">Şu anda tüm güvenlik önlemleriniz aktif görünüyor.</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-sm text-slate-600 dark:text-white/75">
                      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
                        <Sparkles className="mt-1 h-4 w-4 text-purple-500 dark:text-purple-200" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Çok faktörlü doğrulama</p>
                          <p>Yakında MFA desteği eklenecek. Şimdiden güçlü şifreler kullanın.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
                        <CalendarDays className="mt-1 h-4 w-4 text-blue-500 dark:text-blue-200" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Son şifre güncellemesi</p>
                          <p>{lastSignInLabel}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
                        <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-500 dark:text-emerald-200" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">Oturum yönetimi</p>
                          <p>Yeni şifre kaydından sonra tüm cihazlarınızda yeniden oturum açmayı unutmayın.</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="notifications">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden border border-slate-200 bg-white shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                  <CardHeader className="relative border-b border-slate-200/80 pb-6 dark:border-white/10">
                    <motion.div
                      className="absolute inset-0 bg-[linear-gradient(140deg,rgba(236,72,153,0.15),rgba(37,99,235,0.12))]"
                      animate={{ opacity: [0.55, 0.75, 0.55] }}
                      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className="relative z-10">
                      <CardTitle className="flex items-center gap-3 text-xl text-slate-900 dark:text-white">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-900 dark:bg-white/10 dark:text-white">
                          <Bell className="h-5 w-5" />
                        </span>
                        Bildirim Tercihleri
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-white/70">
                        Hangi kanallardan bilgi almak istediğinizi seçin. Tercihleriniz cihazınızda güvenle saklanır.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8 p-8 text-slate-800 dark:text-white">
                    <div className="grid gap-6 md:grid-cols-2">
                      {NOTIFICATION_OPTIONS.map((option, index) => {
                        const Icon = option.icon;
                        const active = notificationPrefs[option.key];
                        return (
                          <motion.div
                            key={option.key}
                            className={`relative overflow-hidden rounded-2xl border p-6 transition ${
                              active
                                ? 'border-slate-200 bg-white shadow-[0_18px_40px_rgba(147,197,253,0.25)] dark:border-white/10 dark:bg-white/10'
                                : 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${option.accent} opacity-10 dark:opacity-60`} />
                            <div className="relative z-10 flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-900 dark:bg-white/10 dark:text-white">
                                    <Icon className="h-5 w-5" />
                                  </span>
                                  <div>
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{option.title}</p>
                                    <p className="text-sm text-slate-600 dark:text-white/75">{option.description}</p>
                                  </div>
                                </div>
                                <Switch
                                  checked={active}
                                  onCheckedChange={() => handleNotificationToggle(option.key)}
                                  className="data-[state=checked]:bg-slate-900 dark:data-[state=checked]:bg-white/70"
                                />
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-white/75">
                                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 dark:border-white/15 dark:bg-white/10">
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-200" />
                                  Şifrelenmiş teslimat
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 dark:border-white/15 dark:bg-white/10">
                                  <Sparkles className="h-3.5 w-3.5 text-purple-500 dark:text-purple-200" />
                                  AI destekli öneriler
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-200" />
                        <span>Tercihleriniz cihazınızda saklanır ve istediğiniz zaman güncellenebilir.</span>
                      </div>
                      <Button
                        type="button"
                        onClick={handleSaveNotifications}
                        disabled={notificationSaving}
                        className="group relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 px-6 py-2 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(147,197,253,0.35)] hover:opacity-90"
                      >
                        <span className="absolute inset-0 translate-y-[120%] bg-gradient-to-r from-white/40 via-white/10 to-transparent opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100" />
                        <span className="relative">{notificationSaving ? 'Kaydediliyor...' : 'Tercihleri Kaydet'}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden border border-slate-200 bg-white/95 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                  <CardHeader className="relative border-b border-slate-200/80 pb-6 dark:border-white/10">
                    <motion.div
                      className="absolute inset-0 bg-[linear-gradient(140deg,rgba(236,72,153,0.15),rgba(59,130,246,0.12))]"
                      animate={{ opacity: [0.6, 0.8, 0.6] }}
                      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <div className="relative z-10">
                      <CardTitle className="flex items-center gap-3 text-xl text-slate-900 dark:text-white">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900/5 text-slate-900 dark:bg-white/10 dark:text-white">
                          <CreditCard className="h-5 w-5" />
                        </span>
                        Ödeme Bilgileri
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-white/70">
                        Ödeme alabilmek için kişisel ve banka bilgilerinizi tamamlayın.
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-6 p-8 text-slate-800 dark:text-white">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="payment_full_name">
                          Ad Soyad *
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground inline ml-2" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Banka hesabınızda kayıtlı ad soyad</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Input
                          id="payment_full_name"
                          value={paymentData.full_name}
                          onChange={(e) => setPaymentData({ ...paymentData, full_name: e.target.value })}
                          placeholder="Ad Soyad"
                          required
                          className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="payment_tc_no">
                            TC Kimlik No *
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 text-muted-foreground inline ml-2" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>11 haneli TC Kimlik Numarası</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          <Input
                            id="payment_tc_no"
                            value={paymentData.tc_no}
                            onChange={(e) => setPaymentData({ ...paymentData, tc_no: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                            placeholder="12345678901"
                            maxLength={11}
                            required
                            className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                          />
                        </div>

                        <div>
                          <Label htmlFor="payment_tax_office">Vergi Dairesi *</Label>
                          <Input
                            id="payment_tax_office"
                            value={paymentData.tax_office}
                            onChange={(e) => setPaymentData({ ...paymentData, tax_office: e.target.value })}
                            placeholder="Örn: Kadıköy Vergi Dairesi"
                            required
                            className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="payment_iban">
                          IBAN *
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground inline ml-2" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>TR ile başlayan 26 haneli IBAN numarası</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Input
                          id="payment_iban"
                          value={paymentData.iban}
                          onChange={(e) => handleIbanChange(e.target.value)}
                          placeholder="TR33 0006 1005 1978 6457 8413 26 (boşluklu girebilirsiniz)"
                          required
                          className="font-mono border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                        />
                        {paymentData.bank_name && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Banka: {paymentData.bank_name}
                          </p>
                        )}
                        {paymentData.iban && !validateIban(paymentData.iban) && paymentData.iban.length >= 6 && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            Geçersiz IBAN formatı (TR ile başlamalı, 26 karakter olmalı)
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="payment_billing_address">Adres (Sokak, Mahalle, Bina No, Daire No) *</Label>
                        <Textarea
                          id="payment_billing_address"
                          value={paymentData.billing_address}
                          onChange={(e) => setPaymentData({ ...paymentData, billing_address: e.target.value })}
                          placeholder="Sokak, mahalle, bina no, daire no"
                          required
                          className="min-h-[120px] border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 dark:border-white/20 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40"
                        />
                      </div>

                      <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                        <p className="text-xs text-foreground/80">
                          <strong className="text-blue-600 dark:text-blue-400">Bilgi:</strong> Tüm bilgileriniz güvenli bir şekilde saklanır ve sadece ödeme işlemleri için kullanılır.
                        </p>
                      </div>

                      <Button
                        onClick={handleSavePayment}
                        disabled={savingPayment}
                        className="group relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 px-6 py-2 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(147,197,253,0.35)] hover:opacity-90"
                      >
                        <span className="absolute inset-0 translate-y-[120%] bg-gradient-to-r from-white/40 via-white/10 to-transparent opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100" />
                        <span className="relative">{savingPayment ? 'Kaydediliyor...' : 'Ödeme Bilgilerini Kaydet'}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-12"
          >
            <Card className="overflow-hidden border border-red-200 bg-white text-slate-800 shadow-[0_20px_55px_rgba(248,113,113,0.25)] dark:border-destructive/30 dark:bg-red-950/40 dark:text-white dark:shadow-[0_25px_60px_rgba(220,38,38,0.35)] backdrop-blur-xl">
              <CardHeader className="relative border-b border-red-200/70 pb-6 dark:border-white/10">
                <span className="absolute inset-0 bg-[linear-gradient(140deg,rgba(248,113,113,0.12),rgba(251,113,133,0.08))] dark:bg-[linear-gradient(140deg,rgba(248,113,113,0.2),rgba(185,28,28,0.2))] opacity-80" />
                <div className="relative z-10">
                  <CardTitle className="flex items-center gap-3 text-xl text-red-600 dark:text-white">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:bg-white/10 dark:text-white">
                      <Trash2 className="h-5 w-5" />
                    </span>
                    Tehlikeli Bölge
                  </CardTitle>
                  <CardDescription className="text-red-600/70 dark:text-white/70">
                    Hesabınızı kalıcı olarak silmeden önce tüm verilerinizi yedeklediğinizden emin olun. Bu işlem geri alınamaz.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-200" />
                    <span>Güvenlik notu: Silme işlemi sonrası yasal gereklilikler hariç tüm veriler kalıcı olarak silinir.</span>
                  </div>
                </div>
                <div className="flex flex-col gap-4 text-sm text-slate-600 dark:text-white/70 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    Geliştirici hesabınızı silmek istiyorsanız önce ödemelerinizi tamamlayın ve aktif abonelikleri sonlandırın.
                  </div>
                  <Button
                    variant="destructive"
                    className="group relative overflow-hidden border-none bg-gradient-to-r from-red-500 via-rose-600 to-red-700 px-6 py-2 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(248,113,113,0.35)] hover:opacity-90"
                  >
                    <span className="absolute inset-0 translate-y-[120%] bg-gradient-to-r from-white/40 via-white/10 to-transparent opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100" />
                    <span className="relative">Hesabı Sil</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
