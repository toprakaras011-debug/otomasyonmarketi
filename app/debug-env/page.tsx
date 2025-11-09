'use client';

import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Ortam Değişkeni (Environment Variable) Kontrolü</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Uygulamanız şu anda aşağıdaki Supabase URL&rsquo;sini kullanmaya çalışıyor:
            </p>
            <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all">
              {supabaseUrl ? supabaseUrl : 'URL BULUNAMADI - .env dosyanızı kontrol edin!'}
            </div>
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-2">Nasıl Düzeltilir?</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>
                  Supabase projenizde <strong>Project Settings &gt; API</strong> bölümüne gidin.
                </li>
                <li>
                  Oradaki <strong>URL</strong>&rsquo;yi kopyalayın.
                </li>
                <li>
                  Yukarıda yazan URL ile karşılaştırın. Eğer farklıysa, sorun budur.
                </li>
                <li>
                  Projenizdeki <code>.env</code> dosyasına gidin ve <code>NEXT_PUBLIC_SUPABASE_URL</code> değerini Supabase&rsquo;den kopyaladığınız doğru URL ile güncelleyin.
                </li>
                <li>
                  Geliştirme sunucusunu durdurup yeniden başlatın.
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
