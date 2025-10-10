'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';

export default function DeveloperAgreementPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Geliştirici Sözleşmesi
            </h1>
            <p className="text-muted-foreground">Son güncelleme: 6 Ekim 2025</p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6 prose prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">1. Giriş</h2>
              <p className="text-muted-foreground mb-6">
                Bu sözleşme, Otomasyon Mağazası (&quot;Platform&quot;) üzerinde dijital ürün (&quot;Otomasyon&quot;) satan &quot;Geliştirici&quot; ile Platform arasındaki hak ve yükümlülükleri düzenler.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">2. Geliştirici Yükümlülükleri</h2>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Geliştirici, Platform'a yüklediği tüm Otomasyonların fikri mülkiyet haklarına sahip olduğunu veya gerekli lisanslara sahip olduğunu beyan ve taahhüt eder.</li>
                <li>Geliştirici, yasa dışı, zararlı, yanıltıcı veya kötü amaçlı yazılım içeren Otomasyonlar yükleyemez.</li>
                <li>Geliştirici, Otomasyonların açıklamalarını ve belgelerini doğru ve eksiksiz bir şekilde sağlamakla yükümlüdür.</li>
                <li>Geliştirici, Otomasyonların güncel ve çalışır durumda olmasını sağlamak için makul çabayı gösterecektir.</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">3. Ödemeler ve Komisyon</h2>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Platform, her başarılı satış üzerinden %15 (on beş) oranında komisyon alır. Bu oran, Platform tarafından önceden bildirilmek suretiyle değiştirilebilir.</li>
                <li>Geliştirici kazançları, Stripe Connect aracılığıyla Geliştiricinin bağlı Stripe hesabına aktarılır.</li>
                <li>Ödemelerin yapılabilmesi için Geliştiricinin geçerli bir Stripe hesabı bağlaması zorunludur.</li>
                <li>Geri ödemeler (refunds) durumunda, ilgili tutar Geliştiricinin bakiyesinden düşülür.</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">4. Onay Süreci</h2>
              <p className="text-muted-foreground mb-6">
                Yüklenen her Otomasyon, Platform tarafından bir onay sürecinden geçirilir. Platform, kendi takdirine bağlı olarak herhangi bir Otomasyonu onaylama, reddetme veya yayından kaldırma hakkını saklı tutar.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">5. Fesih</h2>
              <p className="text-muted-foreground mb-6">
                Taraflardan herhangi biri, diğer tarafa bildirimde bulunarak bu sözleşmeyi feshedebilir. Fesih durumunda, Geliştiricinin mevcut bakiyesi, Platformun alacakları düşüldükten sonra ödenir.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">6. Gizlilik</h2>
              <p className="text-muted-foreground mb-6">
                Geliştirici, Platform aracılığıyla elde ettiği kullanıcı verilerini Platform'un Gizlilik Politikası'na uygun olarak kullanmayı kabul eder.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">7. Uyuşmazlıkların Çözümü</h2>
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
