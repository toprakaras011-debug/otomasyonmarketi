'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { User, Lock, Bell, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    username: '',
    full_name: '',
    avatar_url: '',
    company_name: '',
    phone: '',
    tax_number: '',
    iban: '',
    billing_address: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

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
        setProfileData({
          username: profileRecord.username || '',
          full_name: profileRecord.full_name || '',
          avatar_url: profileRecord.avatar_url || '',
          company_name: profileRecord.company_name || '',
          phone: profileRecord.phone || '',
          tax_number: profileRecord.tax_number || '',
          iban: profileRecord.iban || '',
          billing_address: profileRecord.billing_address || '',
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          username: profileData.username,
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
          company_name: profileData.company_name,
          phone: profileData.phone,
          tax_number: profileData.tax_number,
          iban: profileData.iban,
          billing_address: profileData.billing_address,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profil bilgileriniz güncellendi');
      setProfile({ ...profile, ...profileData });
    } catch (error: any) {
      toast.error(error.message || 'Güncelleme başarısız');
    } finally {
      setSaving(false);
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

      if (error) throw error;

      toast.success('Şifreniz güncellendi');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Şifre güncellenemedi');
    } finally {
      setSaving(false);
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
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Ayarlar
            </h1>
            <p className="text-muted-foreground">Hesap bilgilerinizi yönetin</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profil</TabsTrigger>
              <TabsTrigger value="security">Güvenlik</TabsTrigger>
              <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profil Bilgileri
                  </CardTitle>
                  <CardDescription>
                    Profil bilgilerinizi güncelleyin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileData.avatar_url} />
                        <AvatarFallback className="text-2xl">
                          {profileData.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <FileUpload
                          label="Avatar"
                          bucketName="profile-avatars"
                          accept="image/*"
                          maxSizeMB={5}
                          onUploadComplete={handleAvatarUpload}
                          currentFile={profileData.avatar_url}
                          userId={user.id}
                          fileType="image"
                          onUploadingChange={setAvatarUploading}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="username">Kullanıcı Adı</Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        placeholder="kullanici_adi"
                      />
                    </div>

                    <div>
                      <Label htmlFor="full_name">Ad Soyad</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        placeholder="Ad Soyad"
                        required
                      />
                    </div>
                    <div>
                      <Label>E-posta</Label>
                      <Input value={user.email} disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground mt-1">
                        E-posta adresiniz giriş ve faturalandırma bildirimleri için kullanılır ve değiştirilemez.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Ödeme ve Faturalandırma Bilgileri
                        </Label>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Aşağıdaki bilgiler Stripe üzerinden yapılacak ödemeler ve fatura kesimi için zorunludur.
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="company_name">Şirket / Ticari Ünvan</Label>
                        <Input
                          id="company_name"
                          value={profileData.company_name}
                          onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                          placeholder="Şirketiniz ya da adınız"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefon Numarası</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          placeholder="(5xx) xxx xx xx"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="tax_number">Vergi / T.C. Numarası</Label>
                        <Input
                          id="tax_number"
                          value={profileData.tax_number}
                          onChange={(e) => setProfileData({ ...profileData, tax_number: e.target.value })}
                          placeholder="Vergi numarası ya da T.C. Kimlik"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="iban">IBAN / Banka Hesabı</Label>
                        <Input
                          id="iban"
                          value={profileData.iban}
                          onChange={(e) => setProfileData({ ...profileData, iban: e.target.value })}
                          placeholder="TRxx xxxx xxxx xxxx xxxx xxxx xx"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="billing_address">Fatura Adresi</Label>
                      <Textarea
                        id="billing_address"
                        value={profileData.billing_address}
                        onChange={(e) => setProfileData({ ...profileData, billing_address: e.target.value })}
                        placeholder="Sokak, mahalle, il/ilçe ve posta kodu"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={saving || avatarUploading}
                      className="bg-gradient-to-r from-purple-600 to-blue-600"
                    >
                      {saving || avatarUploading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Güvenlik
                  </CardTitle>
                  <CardDescription>
                    Şifrenizi değiştirin ve hesabınızı güvende tutun
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                      <Label htmlFor="newPassword">Yeni Şifre</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>

                    <Button type="submit" disabled={saving} className="bg-gradient-to-r from-purple-600 to-blue-600">
                      {saving ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Bildirim Tercihleri
                  </CardTitle>
                  <CardDescription>
                    Hangi bildirimleri almak istediğinizi seçin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">E-posta Bildirimleri</p>
                      <p className="text-sm text-muted-foreground">Yeni otomasyonlar ve kampanyalar hakkında bilgi alın</p>
                    </div>
                    <Button variant="outline" size="sm">Aktif</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Satın Alma Bildirimleri</p>
                      <p className="text-sm text-muted-foreground">Satın alma işlemleriniz hakkında bildirim alın</p>
                    </div>
                    <Button variant="outline" size="sm">Aktif</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Güncelleme Bildirimleri</p>
                      <p className="text-sm text-muted-foreground">Satın aldığınız otomasyonların güncellemeleri</p>
                    </div>
                    <Button variant="outline" size="sm">Aktif</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>

          <Card className="mt-8 border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Tehlikeli Bölge
              </CardTitle>
              <CardDescription>
                Hesabınızı kalıcı olarak silin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir. Bu işlem geri alınamaz.
              </p>
              <Button variant="destructive">Hesabı Sil</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  );
}
