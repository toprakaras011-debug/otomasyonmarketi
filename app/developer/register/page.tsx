'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Code as Code2, TrendingUp, Shield, DollarSign } from 'lucide-react';
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
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push('/auth/signin');
        return;
      }

      setUser(currentUser);

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
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
      router.push('/developer/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'İşlem başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Geliştirici Ol</h1>
            <p className="text-lg text-muted-foreground">
              Otomasyonlarınızı paylaşın ve gelir elde edin
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <Card>
              <CardHeader>
                <Code2 className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Özgürce Geliştirin</CardTitle>
                <CardDescription>
                  İstediğiniz otomasyon çözümlerini geliştirin ve platforma ekleyin
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>%85 Gelir</CardTitle>
                <CardDescription>
                  Her satıştan %85 kazanç elde edin, platform komisyonu sadece %15
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Büyüyen Pazar</CardTitle>
                <CardDescription>
                  Binlerce kullanıcıya ulaşın ve ürünlerinizi kolayca satın
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Güvenli Ödeme</CardTitle>
                <CardDescription>
                  Ödemeleriniz güvenli bir şekilde işlenir ve hesabınıza aktarılır
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Geliştirici Sözleşmesi</CardTitle>
              <CardDescription>
                Lütfen aşağıdaki şartları okuyun ve kabul edin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="lg"
                  disabled={!agreed || submitting}
                >
                  {submitting ? 'İşlem Yapılıyor...' : 'Geliştirici Hesabı Oluştur'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
