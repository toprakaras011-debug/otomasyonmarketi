'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';

export default function KvkkPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              KVKK Aydınlatma Metni
            </h1>
            <p className="text-muted-foreground">Son güncelleme: 6 Ekim 2025</p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6 prose prose-invert max-w-none">
              <p className="text-muted-foreground mb-6">
                İşbu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, Otomasyon Mağazası (“Veri Sorumlusu”) olarak, Platformumuzu ziyaret eden ve hizmetlerimizden yararlanan siz değerli kullanıcılarımızı kişisel verilerinizin işlenmesine ilişkin olarak bilgilendirmek amacıyla hazırlanmıştır.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">1. Veri Sorumlusu</h2>
              <p className="text-muted-foreground mb-6">
                <strong>Unvan:</strong> Otomasyon Mağazası<br/>
                <strong>E-posta:</strong> info@otomasyonmagazasi.com
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">2. İşlenen Kişisel Veriler ve İşleme Amaçları</h2>
              <p className="text-muted-foreground mb-6">
                Toplanan kişisel verileriniz, KVKK’nın 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları ve amaçları dahilinde işlenecektir. Detaylı bilgi için Gizlilik Politikamızın 2. ve 3. maddelerini inceleyebilirsiniz.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">3. Kişisel Verilerin Aktarılması</h2>
              <p className="text-muted-foreground mb-6">
                Kişisel verileriniz, yasal zorunluluklar ve hizmetlerimizin gerektirdiği durumlar haricinde açık rızanız olmaksızın üçüncü kişilerle paylaşılmaz. Detaylı bilgi için Gizlilik Politikamızın 4. maddesini inceleyebilirsiniz.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">4. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</h2>
              <p className="text-muted-foreground mb-6">
                Kişisel verileriniz, Platform üzerinden elektronik ortamda, otomatik veya otomatik olmayan yöntemlerle toplanmaktadır. İşbu verilerin toplanmasının hukuki sebebi, bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması, veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması ve temel hak ve özgürlüklerinize zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olmasıdır.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">5. İlgili Kişinin Hakları</h2>
              <p className="text-muted-foreground mb-6">
                KVKK’nın 11. maddesi uyarınca sahip olduğunuz haklar şunlardır:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Kişisel veri işlenip işlenmediğini öğrenme,</li>
                <li>Kişisel verileri işlenmişse buna ilişkin bilgi talep etme,</li>
                <li>Kişisel verilerin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
                <li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,</li>
                <li>Kişisel verilerin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
                <li>KVKK ve ilgili diğer kanun hükümlerine uygun olarak işlenmiş olmasına rağmen, işlenmesini gerektiren sebeplerin ortadan kalkması hâlinde kişisel verilerin silinmesini veya yok edilmesini isteme,</li>
                <li>Yapılan işlemlerin, kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme,</li>
                <li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme.</li>
              </ul>
              <p className="text-muted-foreground mb-6">
                Bu haklarınızı kullanmak için yukarıda belirtilen iletişim adreslerinden bizimle irtibata geçebilirsiniz.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  );
}
