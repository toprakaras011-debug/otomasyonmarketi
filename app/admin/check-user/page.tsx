'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { checkUserExists, getUserStatus } from '@/lib/check-user';
import { Loader2 } from 'lucide-react';

export default function CheckUserPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!email.trim()) {
      setError('Lütfen bir e-posta adresi girin');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const status = await getUserStatus(email.trim());
      setResult(status);
    } catch (err: any) {
      setError(err?.message || 'Kullanıcı kontrolü başarısız oldu');
      console.error('Check user error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Durumu Kontrolü</CardTitle>
          <CardDescription>
            Veritabanında kullanıcının mevcut olup olmadığını kontrol edin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-posta Adresi</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                disabled={loading}
              />
              <Button onClick={handleCheck} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kontrol Ediliyor...
                  </>
                ) : (
                  'Kontrol Et'
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
              <strong>Hata:</strong> {error}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-semibold mb-2">Kontrol Sonuçları</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>E-posta:</strong> {result.email}</p>
                  <p>
                    <strong>Profil Durumu:</strong>{' '}
                    {result.profile_exists ? (
                      <span className="text-green-600">✅ Bulundu</span>
                    ) : (
                      <span className="text-red-600">❌ Bulunamadı</span>
                    )}
                  </p>
                </div>
              </div>

              {result.profile_data && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="font-semibold mb-2">Profil Bilgileri</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Kullanıcı ID:</strong> {result.profile_data.id}</p>
                    <p><strong>Kullanıcı Adı:</strong> {result.profile_data.username}</p>
                    <p><strong>Ad Soyad:</strong> {result.profile_data.full_name || 'Belirtilmemiş'}</p>
                    <p><strong>Rol:</strong> {result.profile_data.role || 'user'}</p>
                    <p><strong>Admin:</strong> {result.profile_data.is_admin ? 'Evet' : 'Hayır'}</p>
                    <p><strong>Developer:</strong> {result.profile_data.is_developer ? 'Evet' : 'Hayır'}</p>
                    <p><strong>Oluşturulma:</strong> {new Date(result.profile_data.created_at).toLocaleString('tr-TR')}</p>
                    {result.profile_data.updated_at && (
                      <p><strong>Güncellenme:</strong> {new Date(result.profile_data.updated_at).toLocaleString('tr-TR')}</p>
                    )}
                  </div>
                </div>
              )}

              {result.profile_error && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h3 className="font-semibold mb-2">Profil Kontrol Hatası</h3>
                  <div className="text-sm">
                    <p><strong>Mesaj:</strong> {result.profile_error.message}</p>
                    <p><strong>Kod:</strong> {result.profile_error.code}</p>
                  </div>
                </div>
              )}

              {result.recommendations && result.recommendations.length > 0 && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <h3 className="font-semibold mb-2">Öneriler</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.recommendations.map((rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

