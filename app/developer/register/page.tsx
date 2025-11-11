'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { IconBox } from '@/components/ui/icon-box';
import { Code as Code2, TrendingUp, Shield, DollarSign, Sparkles, Rocket } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function DeveloperRegisterPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push('/auth/signin');
        return;
      }

      setUser(currentUser);

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('id,is_developer,developer_approved')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);

        if (profileData.is_developer) {
          toast.info('Zaten geliştirici hesabınız var');
          router.push('/developer/dashboard');
          return;
        }
      }

      setLoading(false);
    };

    fetchUser();
    
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      toast.error('Geliştirici sözleşmesini kabul etmelisiniz');
      return;
    }

    if (!user) return;

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_developer: true })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Geliştirici hesabınız oluşturuldu!');
      // Yeni geliştirici için ödeme dialog'unu göstermek üzere localStorage'ı temizle
      if (typeof window !== 'undefined') {
        localStorage.removeItem('payment_dialog_shown');
      }
      router.push('/developer/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'İşlem başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-background">
        <Navbar />
        <div className="container relative mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="h-32 animate-pulse rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
            <div className="h-96 animate-pulse rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <motion.div 
          className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]"
          animate={{ opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]"
          animate={{ opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
      </div>

      <Navbar />

      <div className="container relative mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-16 mt-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 text-5xl font-black md:text-6xl"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Geliştirici Ol
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto max-w-2xl text-xl text-foreground/70"
            >
              Otomasyonlarınızı paylaşın ve gelir elde edin
            </motion.p>
          </div>

          {/* Features Grid */}
          <div className="mb-16 grid gap-6 md:grid-cols-2">
            {[
              { icon: Code2, title: 'Özgürce Geliştirin', desc: 'İstediğiniz otomasyon çözümlerini geliştirin ve platforma ekleyin', gradient: 'from-purple-600 to-blue-600' },
              { icon: DollarSign, title: '%85 Gelir', desc: 'Her satıştan %85 kazanç elde edin, platform komisyonu sadece %15', gradient: 'from-green-600 to-emerald-600' },
              { icon: TrendingUp, title: 'Büyüyen Pazar', desc: 'Binlerce kullanıcıya ulaşın ve ürünlerinizi kolayca satın', gradient: 'from-pink-600 to-rose-600' },
              { icon: Shield, title: 'Güvenli Ödeme', desc: 'Ödemeleriniz güvenli bir şekilde işlenir ve hesabınıza aktarılır', gradient: 'from-cyan-600 to-blue-600' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              >
                <div className="relative h-full rounded-2xl bg-background/80 p-6 backdrop-blur-sm">
                  <IconBox icon={feature.icon} gradient={feature.gradient} className="mb-4" />
                  <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                  <p className="text-foreground/70">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Agreement Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-2xl backdrop-blur-sm"
          >
            <div className="rounded-2xl bg-background/80 p-8 backdrop-blur-sm">
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-bold">Geliştirici Sözleşmesi</h2>
                <p className="text-foreground/60">Lütfen aşağıdaki şartları okuyun ve kabul edin</p>
              </div>
              <div className="space-y-6">
              <div className="prose prose-invert max-w-none">
                <h3 className="text-lg font-semibold mb-2">Komisyon Oranları</h3>
                <p className="text-muted-foreground mb-4">
                  Platform, her satıştan %15 komisyon alır. Geriye kalan %85 geliştirici hesabınıza aktarılır.
                </p>

                <h3 className="text-lg font-semibold mb-2">Ödeme Koşulları</h3>
                <p className="text-muted-foreground mb-4">
                  Bakiyeniz minimum 100 ₺ olduğunda ödeme talebi oluşturabilirsiniz.
                  Ödemeler 7 iş günü içinde banka hesabınıza aktarılır.
                </p>

                <h3 className="text-lg font-semibold mb-2">İçerik Politikası</h3>
                <p className="text-muted-foreground mb-4">
                  Yüklediğiniz tüm otomasyonlar platform yönetimi tarafından incelenir.
                  Zararlı, yasadışı veya telif hakkı ihlali içeren içerikler reddedilir.
                </p>

                <h3 className="text-lg font-semibold mb-2">Destek ve Güncellemeler</h3>
                <p className="text-muted-foreground mb-4">
                  Ürünleriniz için kullanıcılara destek sağlamayı ve düzenli güncellemeler yapmayı taahhüt edersiniz.
                </p>

                <h3 className="text-lg font-semibold mb-2">Hesap İptali</h3>
                <p className="text-muted-foreground mb-4">
                  Platform, şartları ihlal eden geliştiricilerin hesaplarını askıya alabilir veya iptal edebilir.
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t">
                <Checkbox
                  id="agreement"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                />
                <label
                  htmlFor="agreement"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Geliştirici sözleşmesini okudum ve kabul ediyorum
                </label>
              </div>

              <form onSubmit={handleSubmit}>
                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/50 transition-all"
                  size="lg"
                  disabled={!agreed || submitting}
                >
                  {submitting ? 'İşlem Yapılıyor...' : 'Geliştirici Hesabı Oluştur'}
                </Button>
              </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
