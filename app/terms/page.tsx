'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Kullanım Koşulları
            </h1>
            <p className="text-muted-foreground">Son güncelleme: 6 Ekim 2025</p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6 prose prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">1. Taraflar</h2>
              <p className="text-muted-foreground mb-6">
                İşbu Kullanım Koşulları, Otomasyon Mağazası ile Platform'u kullanan "Kullanıcı" ve/veya "Geliştirici" arasında akdedilmiştir.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">2. Tanımlar</h2>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li><strong>Platform:</strong> Otomasyon Mağazası web sitesi ve hizmetleri.</li>
                <li><strong>Otomasyon:</strong> Platform üzerinde satışa sunulan dijital ürünler.</li>
                <li><strong>Kullanıcı:</strong> Platform'u ziyaret eden veya Otomasyon satın alan kişi.</li>
                <li><strong>Geliştirici:</strong> Platform üzerinde Otomasyon satan kişi.</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">3. Hizmetler</h2>
              <p className="text-muted-foreground mb-6">
                Platform, Geliştiricilerin Otomasyonlarını sergilemesi ve Kullanıcıların bu Otomasyonları satın alması için bir pazar yeri sağlar. Otomasyon Mağazası, Otomasyonların içeriğinden veya performansından sorumlu değildir.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">4. Kullanıcı Yükümlülükleri</h2>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Kullanıcı, hesap bilgilerinin doğruluğundan sorumludur.</li>
                <li>Platform'u yasa dışı amaçlarla kullanmamayı taahhüt eder.</li>
                <li>Satın alınan Otomasyonların lisans koşullarına uymakla yükümlüdür.</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">5. Geliştirici Yükümlülükleri</h2>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Geliştirici, yüklediği Otomasyonların fikri mülkiyet haklarına sahip olmalıdır.</li>
                <li>Yanıltıcı veya zararlı içerik yüklememeyi taahhüt eder.</li>
                <li>Platform komisyon oranlarını kabul eder.</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">6. Fikri Mülkiyet</h2>
              <p className="text-muted-foreground mb-6">
                Platform'un tüm tasarımı ve içeriği Otomasyon Mağazası'na aittir. Geliştiriciler tarafından yüklenen Otomasyonların fikri mülkiyeti Geliştiricilere aittir.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">7. Sorumluluğun Sınırlandırılması</h2>
              <p className="text-muted-foreground mb-6">
                Otomasyon Mağazası, Otomasyonların kullanımından kaynaklanan doğrudan veya dolaylı zararlardan sorumlu tutulamaz.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">8. Değişiklikler</h2>
              <p className="text-muted-foreground mb-6">
                Otomasyon Mağazası, bu kullanım koşullarını dilediği zaman değiştirme hakkını saklı tutar.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">9. Uyuşmazlıkların Çözümü</h2>
              <p className="text-muted-foreground mb-6">
                İşbu sözleşmeden doğan uyuşmazlıkların çözümünde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  );
}
