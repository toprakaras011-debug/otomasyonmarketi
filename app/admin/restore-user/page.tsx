'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function RestoreUserPage() {
  const [email, setEmail] = useState('ftnakras01@gmail.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRestore = async () => {
    if (!email.trim()) {
      setError('Lütfen bir e-posta adresi girin');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Kullanıcıyı auth.users'dan bul
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(email.trim());
      
      if (authError || !authUser) {
        throw new Error('Kullanıcı auth.users tablosunda bulunamadı. Önce Supabase Dashboard\'dan kullanıcıyı oluşturun.');
      }

      const userId = authUser.user.id;

      // 2. Profil var mı kontrol et
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      let profileData;
      
      if (!existingProfile) {
        // Profil yoksa oluştur
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            username: email.split('@')[0],
            full_name: 'Kullanıcı',
            email: email.trim(),
            is_developer: true,
            developer_approved: true,
            role: 'admin',
            is_admin: true,
          })
          .select()
          .single();

        if (createError) {
          throw new Error(`Profil oluşturulamadı: ${createError.message}`);
        }

        profileData = newProfile;
      } else {
        // Profil varsa güncelle
        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update({
            is_developer: true,
            developer_approved: true,
            role: 'admin',
            is_admin: true,
            email: email.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Profil güncellenemedi: ${updateError.message}`);
        }

        profileData = updatedProfile;
      }

      // 3. Otomasyonları kontrol et
      const { data: automations, error: automationError } = await supabase
        .from('automations')
        .select('id, title, slug, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (automationError) {
        console.warn('Otomasyon kontrolü başarısız:', automationError);
      }

      // 4. Son durum raporu
      const finalResult = {
        success: true,
        user: {
          id: userId,
          email: email.trim(),
          emailConfirmed: !!authUser.user.email_confirmed_at,
        },
        profile: {
          id: profileData.id,
          username: profileData.username,
          full_name: profileData.full_name,
          is_developer: profileData.is_developer,
          developer_approved: profileData.developer_approved,
          role: profileData.role,
          is_admin: profileData.is_admin,
        },
        automations: {
          total: automations?.length || 0,
          list: automations || [],
        },
      };

      setResult(finalResult);
      toast.success('Kullanıcı hesabı başarıyla geri getirildi!', {
        duration: 5000,
      });
    } catch (err: any) {
      const errorMessage = err?.message || 'Kullanıcı geri getirme işlemi başarısız oldu';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 8000,
      });
      console.error('Restore user error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Hesabını Geri Getir</CardTitle>
          <CardDescription>
            Silinen veya bozulan kullanıcı hesabını geri getirin ve geliştirici panelini aktif edin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta Adresi</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                disabled={loading}
              />
              <Button
                onClick={handleRestore}
                disabled={loading || !email.trim()}
                className="min-w-[150px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    İşleniyor...
                  </>
                ) : (
                  'Hesabı Geri Getir'
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Hata</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && result.success && (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                      Hesap Başarıyla Geri Getirildi!
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Kullanıcı hesabı geri getirildi ve geliştirici paneli aktif edildi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Kullanıcı Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">ID:</span>{' '}
                      <span className="text-muted-foreground font-mono text-xs">
                        {result.user.id}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">E-posta:</span>{' '}
                      <span className="text-muted-foreground">{result.user.email}</span>
                    </div>
                    <div>
                      <span className="font-medium">E-posta Onayı:</span>{' '}
                      <span className={result.user.emailConfirmed ? 'text-green-600' : 'text-yellow-600'}>
                        {result.user.emailConfirmed ? 'Onaylı' : 'Onaysız'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Profil Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Kullanıcı Adı:</span>{' '}
                      <span className="text-muted-foreground">{result.profile.username}</span>
                    </div>
                    <div>
                      <span className="font-medium">Ad Soyad:</span>{' '}
                      <span className="text-muted-foreground">{result.profile.full_name}</span>
                    </div>
                    <div>
                      <span className="font-medium">Geliştirici:</span>{' '}
                      <span className={result.profile.is_developer ? 'text-green-600' : 'text-red-600'}>
                        {result.profile.is_developer ? 'Evet' : 'Hayır'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Geliştirici Onayı:</span>{' '}
                      <span className={result.profile.developer_approved ? 'text-green-600' : 'text-yellow-600'}>
                        {result.profile.developer_approved ? 'Onaylı' : 'Onaysız'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Rol:</span>{' '}
                      <span className="text-purple-600 font-semibold">{result.profile.role}</span>
                    </div>
                    <div>
                      <span className="font-medium">Admin:</span>{' '}
                      <span className={result.profile.is_admin ? 'text-green-600' : 'text-red-600'}>
                        {result.profile.is_admin ? 'Evet' : 'Hayır'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Otomasyonlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Toplam Otomasyon:</span>
                      <span className="text-lg font-bold text-purple-600">
                        {result.automations.total}
                      </span>
                    </div>
                    {result.automations.list.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium mb-2">Otomasyon Listesi:</p>
                        <div className="space-y-1">
                          {result.automations.list.map((auto: any) => (
                            <div
                              key={auto.id}
                              className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                            >
                              <span className="font-medium">{auto.title}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                auto.status === 'published' ? 'bg-green-100 text-green-700' :
                                auto.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {auto.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Sonraki Adımlar
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                      <li>Çıkış yapıp tekrar giriş yapın</li>
                      <li>Geliştirici paneline erişebilmelisiniz</li>
                      <li>Admin paneline erişebilmelisiniz</li>
                      <li>Otomasyonlarınız görünür olmalı</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

