'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function FixOrphanedProfilePage() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFix = async () => {
    if (!userId.trim()) {
      setError('Lütfen bir kullanıcı ID girin');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Note: We can't directly delete from client, so we'll show SQL instructions
      setResult({
        userId: userId.trim(),
        message: 'Orphaned profile tespit edildi. SQL script kullanarak düzeltin.',
        sqlScript: `-- Orphaned profile'ı silmek için bu SQL'i Supabase SQL Editor'de çalıştırın:\n\nDELETE FROM user_profiles WHERE id = '${userId.trim()}';\n\n-- Dikkat: Bu işlem geri alınamaz! Önce kontrol edin:\nSELECT * FROM user_profiles WHERE id = '${userId.trim()}';\nSELECT * FROM auth.users WHERE id = '${userId.trim()}';`,
      });
    } catch (err: any) {
      setError(err?.message || 'İşlem başarısız oldu');
      console.error('Fix orphaned profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Orphaned Profile Düzeltme
          </CardTitle>
          <CardDescription>
            user_profiles tablosunda olup auth.users tablosunda olmayan profilleri düzeltin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Orphaned Profile Nedir?</strong>
              <br />
              user_profiles tablosunda kayıt var ama auth.users tablosunda yok. Bu durumda giriş yapılamaz.
              <br />
              <br />
              <strong>Çözüm:</strong> Orphaned profile'ı silin, kullanıcı yeniden kayıt olsun.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="userId">Kullanıcı ID (user_profiles tablosundan)</Label>
            <div className="flex gap-2">
              <Input
                id="userId"
                type="text"
                placeholder="Kullanıcı ID'sini girin (UUID)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFix()}
                disabled={loading}
              />
              <Button onClick={handleFix} disabled={loading} variant="destructive">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kontrol Ediliyor...
                  </>
                ) : (
                  'SQL Script Oluştur'
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>SQL Script Hazır!</strong>
                  <br />
                  Aşağıdaki SQL script'i Supabase SQL Editor'de çalıştırın.
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-gray-900 text-gray-100 rounded-md font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap">{result.sqlScript}</pre>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <h3 className="font-semibold mb-2">Adımlar:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Supabase Dashboard'a gidin</li>
                  <li>SQL Editor'ü açın</li>
                  <li>Yukarıdaki SQL script'i kopyalayın</li>
                  <li>Önce SELECT sorgularını çalıştırıp kontrol edin</li>
                  <li>Sonra DELETE sorgusunu çalıştırın</li>
                  <li>Kullanıcı artık yeniden kayıt olabilir</li>
                </ol>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-semibold mb-2">Notlar:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>DELETE işlemi geri alınamaz!</li>
                  <li>Önce SELECT ile kontrol edin</li>
                  <li>Kullanıcı ID'sinin doğru olduğundan emin olun</li>
                  <li>Profil silindikten sonra kullanıcı normal kayıt akışından geçebilir</li>
                </ul>
              </div>
            </div>
          )}

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <h3 className="font-semibold mb-2">Tüm Orphaned Profilleri Bulmak İçin:</h3>
            <div className="p-3 bg-gray-900 text-gray-100 rounded-md font-mono text-xs overflow-x-auto">
              <pre className="whitespace-pre-wrap">{`SELECT 
  up.id,
  up.username,
  up.full_name,
  up.role,
  up.created_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE au.id IS NULL;`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

