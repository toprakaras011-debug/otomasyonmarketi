'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CircleCheck as CheckCircle, Circle as XCircle, Loader as Loader2, CreditCard, CircleAlert as AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function StripeOnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stripeAccount, setStripeAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
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

      if (!profileData?.is_developer) {
        toast.error('Geliştirici hesabınız yok');
        router.push('/developer/register');
        return;
      }

      setProfile(profileData);

      const { data: stripeData } = await supabase
        .from('stripe_accounts')
        .select('*')
        .eq('developer_id', currentUser.id)
        .maybeSingle();

      setStripeAccount(stripeData);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleCreateStripeAccount = async () => {
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-connect-account', {
        body: {
          developerId: user.id,
          developerEmail: user.email ?? profile?.email,
          refreshUrl: `${window.location.origin}/developer/stripe-onboarding?refresh=1`,
          returnUrl: `${window.location.origin}/developer/stripe-onboarding?success=1`,
        },
      });

      if (error) {
        throw new Error(error.message ?? 'Stripe hesabı oluşturulamadı');
      }

      if (!data) {
        throw new Error('Stripe servisi yanıt vermedi');
      }

      const {
        stripeAccountId,
        onboardingUrl,
        onboardingComplete,
        chargesEnabled,
        payoutsEnabled,
      } = data as {
        stripeAccountId: string | null;
        onboardingUrl: string | null;
        onboardingComplete: boolean;
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
      };

      setStripeAccount({
        developer_id: user.id,
        stripe_account_id: stripeAccountId,
        onboarding_complete: onboardingComplete,
        charges_enabled: chargesEnabled,
        payouts_enabled: payoutsEnabled,
      });

      if (onboardingUrl) {
        toast.success('Stripe hesabınız için yönlendirme açılıyor...');
        window.location.assign(onboardingUrl);
        return;
      }

      toast.success('Stripe hesabınız güncellendi.');
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Stripe Connect Kurulumu</h1>
          <p className="text-muted-foreground">
            Satışlarınızdan otomatik ödeme alabilmek için Stripe hesabınızı bağlayın
          </p>
        </div>

        {!stripeAccount ? (
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-full bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Stripe Hesabı Bağlayın</CardTitle>
                  <CardDescription>
                    Otomasyonlarınızdan kazanç elde edebilmek için Stripe hesabınızı bağlamanız gerekiyor
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Stripe Connect Nedir?</h3>
                <p className="text-muted-foreground">
                  Stripe Connect, satışlarınızın ödemelerini doğrudan Stripe hesabınıza almanızı sağlayan güvenli bir ödeme sistemidir.
                  Platform %{process.env.PLATFORM_FEE_PERCENTAGE || '15'} komisyon alır, geri kalan tutar doğrudan sizin Stripe hesabınıza aktarılır.
                </p>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Avantajlar
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-6">
                    <li>Satışlardan otomatik ödeme alın</li>
                    <li>7-14 gün içinde paranız hesabınızda</li>
                    <li>Güvenli ve şeffaf ödeme sistemi</li>
                    <li>Detaylı kazanç raporları</li>
                    <li>Uluslararası ödemeler</li>
                  </ul>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    Komisyon Oranı
                  </h4>
                  <p className="text-sm">
                    Platform her satıştan <strong>%{process.env.PLATFORM_FEE_PERCENTAGE || '15'}</strong> komisyon alır.
                    Örneğin 100₺ satış yaptığınızda {100 - parseInt(process.env.PLATFORM_FEE_PERCENTAGE || '15')}₺ sizin hesabınıza aktarılır.
                  </p>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Not:</strong> Stripe hesabınızı bağlamak için Stripe.com&rsquo;da bir hesap oluşturmanız gerekiyor.
                  Henüz hesabınız yoksa <a href="https://dashboard.stripe.com/register" target="_blank" rel="noopener noreferrer" className="underline text-primary">buradan</a> ücretsiz oluşturabilirsiniz.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  onClick={handleCreateStripeAccount}
                  disabled={creating}
                  size="lg"
                  className="flex-1"
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Stripe Hesabımı Bağla
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/developer/dashboard')}
                >
                  Daha Sonra
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Stripe Hesap Durumu</CardTitle>
              <CardDescription>
                Stripe Connect hesabınızın durumunu buradan takip edebilirsiniz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      stripeAccount.onboarding_complete
                        ? 'bg-green-500/10'
                        : 'bg-yellow-500/10'
                    }`}>
                      {stripeAccount.onboarding_complete ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Onboarding Durumu</p>
                      <p className="text-sm text-muted-foreground">
                        {stripeAccount.onboarding_complete
                          ? 'Tamamlandı'
                          : 'Beklemede - Admin onayı gerekiyor'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      stripeAccount.charges_enabled
                        ? 'bg-green-500/10'
                        : 'bg-gray-500/10'
                    }`}>
                      {stripeAccount.charges_enabled ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Ödeme Alma</p>
                      <p className="text-sm text-muted-foreground">
                        {stripeAccount.charges_enabled ? 'Aktif' : 'Pasif'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      stripeAccount.payouts_enabled
                        ? 'bg-green-500/10'
                        : 'bg-gray-500/10'
                    }`}>
                      {stripeAccount.payouts_enabled ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Para Çekme</p>
                      <p className="text-sm text-muted-foreground">
                        {stripeAccount.payouts_enabled ? 'Aktif' : 'Pasif'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {!stripeAccount.onboarding_complete && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Hesabınız admin tarafından inceleniyor. Onaylandıktan sonra satış yapmaya başlayabileceksiniz.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                variant="outline"
                onClick={() => router.push('/developer/dashboard')}
                className="w-full"
              >
                Geliştirici Paneline Dön
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
