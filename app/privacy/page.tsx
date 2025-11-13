'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <motion.div 
          className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]"
          animate={{ opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]"
          animate={{ opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
      </div>
      <Navbar />

      <div className="container relative mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16 mt-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-5xl font-black md:text-6xl lg:text-7xl"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Gizlilik Politikası
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-foreground/60"
            >
              Son güncelleme: 6 Ekim 2025
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm"
          >
            <div className="rounded-2xl bg-background/80 p-8 backdrop-blur-sm prose prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">1. Giriş</h2>
              <p className="text-muted-foreground mb-6">
                Otomasyon Mağazası olarak, kullanıcılarımızın gizliliğini korumayı en önemli önceliklerimizden biri olarak görüyoruz. Bu gizlilik politikası, topladığımız bilgileri, bu bilgileri nasıl kullandığımızı ve haklarınızı açıklar.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">2. Topladığımız Bilgiler</h2>
              <h3 className="text-xl font-semibold mb-3">2.1 Kişisel Bilgiler</h3>
              <p className="text-muted-foreground mb-4">
                Platformumuza kaydolduğunuzda aşağıdaki bilgileri topluyoruz:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Ad ve soyad</li>
                <li>E-posta adresi</li>
                <li>Telefon numarası (isteğe bağlı)</li>
                <li>Şirket bilgileri (geliştirici hesapları için)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">2.2 Ödeme Bilgileri</h3>
              <p className="text-muted-foreground mb-6">
                Ödeme işlemleri için güvenli ödeme sağlayıcıları kullanıyoruz. Kredi kartı bilgileriniz doğrudan sunucularımızda saklanmaz, sadece ödeme sağlayıcılarının güvenli sistemlerinde işlenir.
              </p>

              <h3 className="text-xl font-semibold mb-3">2.3 Kullanım Bilgileri</h3>
              <p className="text-muted-foreground mb-6">
                Platformumuzu nasıl kullandığınıza dair bilgiler topluyoruz:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>IP adresi ve konum bilgisi</li>
                <li>Tarayıcı türü ve versiyonu</li>
                <li>Ziyaret edilen sayfalar ve tıklama verileri</li>
                <li>Oturum süreleri</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">3. Bilgilerin Kullanımı</h2>
              <p className="text-muted-foreground mb-4">
                Topladığımız bilgileri şu amaçlarla kullanıyoruz:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Hesap oluşturma ve yönetimi</li>
                <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
                <li>Müşteri destek hizmetleri</li>
                <li>Platform güvenliğinin sağlanması</li>
                <li>Hizmet kalitesinin iyileştirilmesi</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">4. Bilgi Paylaşımı</h2>
              <p className="text-muted-foreground mb-4">
                Kişisel bilgilerinizi üçüncü taraflarla paylaşmıyoruz. Ancak aşağıdaki durumlarda bilgi paylaşımı gerekebilir:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Yasal zorunluluklar ve mahkeme kararları</li>
                <li>Ödeme işlemleri için ödeme sağlayıcıları ile</li>
                <li>Hizmet sağlayıcılar (hosting, analitik)</li>
                <li>Açık rızanızın bulunması durumunda</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">5. Çerezler (Cookies)</h2>
              <p className="text-muted-foreground mb-4">
                Platformumuz, kullanıcı deneyimini iyileştirmek için çerezler kullanır. Çerezler, tarayıcınıza kaydedilen küçük metin dosyalarıdır. Kullandığımız çerez türleri:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li><strong>Zorunlu Çerezler:</strong> Platform işlevselliği için gereklidir</li>
                <li><strong>Performans Çerezleri:</strong> Platform performansını ölçer</li>
                <li><strong>İşlevsellik Çerezleri:</strong> Tercihlerinizi hatırlar</li>
                <li><strong>Hedefleme Çerezleri:</strong> İlgili içerik gösterilmesi için kullanılır</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">6. Veri Güvenliği</h2>
              <p className="text-muted-foreground mb-6">
                Kişisel bilgilerinizi korumak için endüstri standardı güvenlik önlemleri alıyoruz:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>SSL/TLS şifreleme</li>
                <li>Güvenli veri saklama</li>
                <li>Düzenli güvenlik güncellemeleri</li>
                <li>Erişim kontrolleri</li>
                <li>Güvenlik denetimleri</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">7. Haklarınız</h2>
              <p className="text-muted-foreground mb-4">
                KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-2">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenmişse bilgi talep etme</li>
                <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                <li>Verilerin silinmesini veya yok edilmesini isteme</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4 mt-8">8. Çocukların Gizliliği</h2>
              <p className="text-muted-foreground mb-6">
                Platformumuz 18 yaşın altındaki kullanıcılar için tasarlanmamıştır. Bilerek 18 yaş altı çocuklardan kişisel bilgi toplamıyoruz.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">9. Politika Değişiklikleri</h2>
              <p className="text-muted-foreground mb-6">
                Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler olduğunda sizi e-posta yoluyla bilgilendireceğiz.
              </p>

              <h2 className="text-2xl font-bold mb-4 mt-8">10. İletişim</h2>
              <p className="text-muted-foreground mb-4">
                Gizlilik politikamız hakkında sorularınız için:
              </p>
              <p className="text-muted-foreground">
                <strong>E-posta:</strong> info@otomasyonmagazasi.com<br />
                <strong>Telefon:</strong> +90 507 420 19 20
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
