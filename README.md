# Otomasyon Mağazası

Türkiye'nin ilk otomasyon marketplace platformu. E-ticaret, sosyal medya ve veri analitiği için hazır otomasyon çözümlerini keşfedin.

## Özellikler

- **Neon Mor-Mavi Temalı Dark UI**: Modern, 3D hissiyatlı kullanıcı arayüzü
- **Supabase Backend**: Güvenli ve ölçeklenebilir veritabanı
- **Next.js 14 App Router**: Modern React framework
- **Framer Motion Animasyonlar**: Akıcı ve etkileyici geçişler
- **RLS Güvenlik**: Satır düzeyinde güvenlik politikaları
- **Otomatik Komisyon Sistemi**: %15 platform komisyonu
- **Geliştirici Paneli**: CRUD, istatistikler, bakiye yönetimi
- **Kullanıcı Paneli**: Satın alımlar, favoriler, yorumlar

## Teknolojiler

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Framer Motion, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Fonts**: Poppins (başlıklar), Inter (içerik)
- **Icons**: Lucide React

## Kurulum

### 1. Gereksinimler

- Node.js 18+
- npm veya yarn
- Supabase hesabı

### 2. Projeyi Klonlayın

```bash
git clone <repository-url>
cd project
```

### 3. Bağımlılıkları Yükleyin

```bash
npm install
```

### 4. Ortam Değişkenlerini Ayarlayın

`.env` dosyasını düzenleyin ve Supabase bilgilerinizi ekleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Veritabanı Migrasyonlarını Çalıştırın

Supabase projenizde SQL Editor'ü kullanarak aşağıdaki migrasyonları sırayla çalıştırın:

1. `create_marketplace_schema` - Ana tablolar ve RLS politikaları
2. `setup_storage_buckets` - Storage bucket'ları ve politikaları

### 6. Seed Verilerini Ekleyin

Supabase SQL Editor'de şu komutu çalıştırın:

```sql
-- Kategorileri ekle
INSERT INTO categories (name, slug, description, icon, color) VALUES
('E-Ticaret', 'e-ticaret', 'Mağaza yönetimi, sipariş otomasyonu ve envanter takibi için çözümler', 'ShoppingCart', '#8B5CF6'),
('Sosyal Medya', 'sosyal-medya', 'İçerik paylaşımı, takipçi analizi ve otomatik etkileşim araçları', 'Share2', '#3B82F6'),
('Veri & Raporlama', 'veri-raporlama', 'Veri çekme, analiz ve otomatik rapor oluşturma sistemleri', 'BarChart3', '#EC4899')
ON CONFLICT (slug) DO NOTHING;
```

### 7. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## Veritabanı Şeması

### Ana Tablolar

- **user_profiles**: Kullanıcı profilleri ve geliştirici bilgileri
- **categories**: Otomasyon kategorileri
- **automations**: Otomasyon ürünleri
- **purchases**: Satın alımlar ve komisyon kayıtları
- **reviews**: Kullanıcı yorumları ve puanları
- **payouts**: Geliştirici ödeme talepleri
- **favorites**: Kullanıcı favorileri
- **blog_posts**: Blog yazıları

### Storage Buckets

- **automation-images**: Ürün görselleri (public)
- **automation-files**: Otomasyon dosyaları (private)
- **blog-images**: Blog görselleri (public)
- **avatars**: Kullanıcı avatarları (public)

## Güvenlik

- **RLS Policies**: Tüm tablolarda Row Level Security aktif
- **Auth**: Supabase Authentication ile güvenli kimlik doğrulama
- **Storage Policies**: Dosya erişimi için detaylı politikalar
- **Komisyon Sistemi**: Otomatik tetikleyiciler ile %20 platform kesintisi

## Ödeme Entegrasyonu

Platform Türkiye için optimize edilmiştir ve şu ödeme sağlayıcılarını destekler:

- **iyzico**: Türk Lirası ödemeleri
- **PayTR**: Alternatif ödeme yöntemi

Ödeme entegrasyonu için webhook endpoint'i `/api/payment-webhook` kullanılır.

## Deployment

### Vercel'e Deploy

```bash
npm install -g vercel
vercel
```

### Ortam Değişkenleri

Production'da şu ortam değişkenlerini ayarlayın:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Yasal Uyumluluk

Platform şu yasal gereksinimleri karşılar:

- **KVKK**: Kişisel Verilerin Korunması Kanunu
- **GDPR**: Genel Veri Koruma Yönetmeliği
- **E-Ticaret Kanunu**: Türkiye e-ticaret mevzuatı

Gerekli sayfalar:
- Gizlilik Politikası
- Kullanım Şartları
- Çerez Politikası
- Geliştirici Sözleşmesi

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

## Destek

Sorularınız için:
- Email: destek@otomasyonmagazasi.com
- GitHub Issues

---

**Not**: Bu platform Türkiye pazarı için optimize edilmiştir ve TL bazlı ödemeler kabul eder.
