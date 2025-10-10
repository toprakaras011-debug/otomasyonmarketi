'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { signUp } from '@/lib/auth';
import { toast } from 'sonner';
import { Zap } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullName: '',
    role: 'user' as 'user' | 'developer',
    terms: false,
    kvkk: false,
    developerTerms: false,
    commission: false,
    newsletter: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.terms) {
      toast.error('Kullanım Koşulları\'nı kabul etmelisiniz');
      return;
    }

    if (!formData.kvkk) {
      toast.error('KVKK Aydınlatma Metni\'ni okumalısınız');
      return;
    }

    if (formData.role === 'developer') {
      if (!formData.developerTerms) {
        toast.error('Geliştirici Sözleşmesi\'ni kabul etmelisiniz');
        return;
      }
      if (!formData.commission) {
        toast.error('%20 komisyon sistemini kabul etmelisiniz');
        return;
      }
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.username, formData.fullName);
      toast.success('Hesabınız oluşturuldu! Giriş yapabilirsiniz.');
      router.push('/auth/signin');
    } catch (error: any) {
      toast.error(error.message || 'Kayıt oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl animate-pulse delay-700" />
      </div>

      <Card className="relative z-10 w-full max-w-md border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Kayıt Ol</CardTitle>
          <CardDescription>Yeni hesap oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <Input
                id="username"
                type="text"
                placeholder="kullaniciadi"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Ad Soyad</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Ad Soyad"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="En az 6 karakter"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label>Hesap Türü</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={formData.role === 'user'}
                    onChange={(e) => setFormData({ ...formData, role: 'user' })}
                    className="h-4 w-4 text-primary"
                  />
                  <span>Kullanıcı</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="developer"
                    checked={formData.role === 'developer'}
                    onChange={(e) => setFormData({ ...formData, role: 'developer' })}
                    className="h-4 w-4 text-primary"
                  />
                  <span>Geliştirici</span>
                </label>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.terms}
                  onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
                />
                <label
                  htmlFor="terms"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <Link href="/terms" target="_blank" className="text-primary hover:underline">
                    Kullanım Koşulları
                  </Link>
                  &rsquo;nı okudum ve kabul ediyorum <span className="text-red-500">*</span>
                </label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="kvkk"
                  checked={formData.kvkk}
                  onCheckedChange={(checked) => setFormData({ ...formData, kvkk: checked as boolean })}
                />
                <label
                  htmlFor="kvkk"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <Link href="/kvkk" target="_blank" className="text-primary hover:underline">
                    KVKK Aydınlatma Metni
                  </Link>
                  &rsquo;ni okudum <span className="text-red-500">*</span>
                </label>
              </div>

              {formData.role === 'developer' && (
                <>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="developerTerms"
                      checked={formData.developerTerms}
                      onCheckedChange={(checked) => setFormData({ ...formData, developerTerms: checked as boolean })}
                    />
                    <label
                      htmlFor="developerTerms"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <Link href="/developer-agreement" target="_blank" className="text-primary hover:underline">
                        Geliştirici Sözleşmesi
                      </Link>
                      &rsquo;ni okudum ve kabul ediyorum <span className="text-red-500">*</span>
                    </label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="commission"
                      checked={formData.commission}
                      onCheckedChange={(checked) => setFormData({ ...formData, commission: checked as boolean })}
                    />
                    <label
                      htmlFor="commission"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
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
                />
                <label
                  htmlFor="newsletter"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Kampanya ve duyuru e-postaları almak istiyorum
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={loading}
            >
              {loading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Zaten hesabınız var mı? </span>
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              Giriş Yap
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
              Ana Sayfaya Dön
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
