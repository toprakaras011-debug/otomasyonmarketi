# Deployment Kılavuzu
## otomasyonmagazasi.com.tr

---

## 🎯 Domain Bilgileri

**Domain:** https://otomasyonmagazasi.com.tr
**Durum:** ✅ Tüm dosyalarda güncellendi
**Build:** ✅ Başarılı (32 sayfa)

---

## 📋 Deployment Checklist

### 1. Vercel'e Deploy

#### A. Vercel Hesabı ve Proje Oluşturma
```bash
1. https://vercel.com adresine git
2. GitHub ile giriş yap
3. "New Project" tıkla
4. Repository'yi seç (ya da import et)
5. Framework: Next.js (otomatik algılanır)
6. Root Directory: ./
7. Build Command: npm run build (default)
8. Output Directory: .next (default)
```

#### B. Environment Variables Ekleme
Vercel dashboard → Project Settings → Environment Variables

```bash
# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Stripe (Production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Platform
PLATFORM_FEE_PERCENTAGE=15
```

#### C. Deploy Başlat
```bash
1. "Deploy" butonuna tıkla
2. Build loglarını izle
3. Deploy tamamlanınca preview URL'ini kontrol et
```

---

### 2. Domain Bağlama

#### A. Vercel'de Domain Ayarları
```bash
1. Vercel Project → Settings → Domains
2. "Add Domain" tıkla
3. "otomasyonmagazasi.com.tr" gir
4. Vercel sana DNS kayıtlarını verecek
```

#### B. Domain Provider'da DNS Ayarları
Domain panel'ine (GoDaddy, Namecheap, vs.) git ve şu kayıtları ekle:

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP)
TTL: 3600
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Alternatif (Nameserver Yöntemi):**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

⏱️ DNS propagation 24-48 saat sürebilir.

---

### 3. Supabase Production Setup

#### A. Production Database
```bash
1. https://supabase.com → Dashboard
2. Yeni bir Production project oluştur (ya da mevcut test projesini kullan)
3. Database Password'ü kaydet
4. Project Settings → API → Keys
   - anon/public key
   - service_role key
5. Bu key'leri Vercel'e environment variables olarak ekle
```

#### B. Migrations Uygula
```bash
1. Supabase Dashboard → SQL Editor
2. /supabase/migrations/ klasöründeki tüm .sql dosyalarını sırayla çalıştır:
   - 20251005080715_create_marketplace_schema.sql
   - 20251005080821_setup_storage_buckets.sql
   - 20251006132645_add_new_categories.sql
   - 20251006133618_add_file_storage_support.sql
   - 20251006152843_add_admin_role.sql
   - 20251006153943_add_stripe_connect_system.sql
   - 20251006155632_add_purchases_insert_policy.sql
```

#### C. Storage Buckets Kontrol
```bash
1. Supabase Dashboard → Storage
2. Bucket'ları kontrol et:
   - automation-files (public: false)
   - images (public: true)
3. RLS policies aktif mi kontrol et
```

---

### 4. Stripe Production Setup

#### A. Stripe Hesabı
```bash
1. https://stripe.com → Dashboard
2. Test Mode'dan LIVE Mode'a geç (sol üst toggle)
3. Settings → API Keys
   - Publishable key → Vercel env var
   - Secret key → Vercel env var
```

#### B. Stripe Connect
```bash
1. Stripe Dashboard → Connect → Settings
2. Branding ayarları:
   - Business name: Otomasyon Mağazası
   - Logo yükle
   - Color scheme ayarla
```

#### C. Webhook Ayarları
```bash
1. Stripe Dashboard → Developers → Webhooks
2. "Add endpoint" tıkla
3. Endpoint URL: https://otomasyonmagazasi.com.tr/api/stripe-webhook
   (Not: Supabase Edge Function kullanıyoruz, bu URL'i güncelle)

   Doğru URL:
   https://[SUPABASE_PROJECT_REF].supabase.co/functions/v1/stripe-webhook

4. Events to send:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - account.updated
5. Webhook signing secret'i kopyala ve Vercel'e ekle:
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

### 5. Edge Functions Deploy

#### A. Supabase CLI Kurulumu
```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

#### B. Supabase Login
```bash
supabase login
supabase link --project-ref [YOUR_PROJECT_REF]
```

#### C. Edge Functions Deploy
```bash
# Tüm functions'ları deploy et
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook

# Environment variables ekle (Edge Functions için)
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

### 6. SEO ve Analytics

#### A. Google Search Console
```bash
1. https://search.google.com/search-console
2. "Add property" → https://otomasyonmagazasi.com.tr
3. Verification method seç:
   - HTML tag (en kolay)
   - DNS record
   - HTML file upload
4. Verification code'u /app/layout.tsx'e ekle:

   verification: {
     google: 'GERÇEK_GOOGLE_CODE_BURAYA',
     yandex: 'yandex-verification-code',
   }

5. Verify et ve Vercel'e redeploy yap
6. Sitemap gönder:
   https://otomasyonmagazasi.com.tr/sitemap.xml
```

#### B. Google Analytics (Opsiyonel)
```bash
1. https://analytics.google.com
2. Yeni property oluştur
3. Measurement ID'yi al (G-XXXXXXXXXX)
4. Google Tag Manager veya direkt script ile ekle
```

#### C. Open Graph Test
```bash
# Facebook Debugger
https://developers.facebook.com/tools/debug/
URL: https://otomasyonmagazasi.com.tr

# Twitter Card Validator
https://cards-dev.twitter.com/validator
URL: https://otomasyonmagazasi.com.tr

# LinkedIn Post Inspector
https://www.linkedin.com/post-inspector/
URL: https://otomasyonmagazasi.com.tr
```

---

### 7. Admin Hesabı Oluşturma

Deploy sonrası ilk admin hesabı:

```bash
1. https://otomasyonmagazasi.com.tr/auth/signup → Kayıt ol
2. Supabase Dashboard → Table Editor → user_profiles
3. Oluşturduğun kullanıcıyı bul
4. is_admin kolonunu true yap
5. is_developer kolonunu true yap (opsiyonel)
6. Logout/login yap
7. /admin/dashboard artık erişilebilir
```

---

### 8. Test Checklist

Deploy sonrası test edilecekler:

#### Genel Testler
- [ ] Ana sayfa yükleniyor
- [ ] Tüm linkler çalışıyor
- [ ] Mobil responsive
- [ ] SEO meta tags görünüyor (view source)
- [ ] Robots.txt erişilebilir (/robots.txt)
- [ ] Sitemap.xml erişilebilir (/sitemap.xml)

#### Authentication
- [ ] Kayıt olma çalışıyor
- [ ] Giriş yapma çalışıyor
- [ ] Email confirmation (eğer aktifse)
- [ ] Şifre sıfırlama
- [ ] Logout çalışıyor

#### User Flow
- [ ] Otomasyon arama
- [ ] Otomasyon detay sayfası
- [ ] Favorilere ekleme
- [ ] Dashboard erişimi

#### Developer Flow
- [ ] Geliştirici kaydı
- [ ] Stripe Connect onboarding
- [ ] Otomasyon ekleme
- [ ] Dosya yükleme
- [ ] Developer dashboard

#### Admin Flow
- [ ] Admin dashboard erişimi
- [ ] Otomasyon onaylama
- [ ] İstatistikler görünüyor

#### Payment Flow (Test Mode)
- [ ] Stripe checkout açılıyor
- [ ] Test kartı ile ödeme
- [ ] Satın alma kaydı
- [ ] İndirme linki çalışıyor
- [ ] Developer'a komisyon hesaplanıyor

**Stripe Test Kartı:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

---

### 9. Production'a Geçiş

Test Mode'dan Live Mode'a geçiş:

```bash
1. Stripe Dashboard → Test Mode OFF (Live Mode'a geç)
2. Yeni Live keys'leri al
3. Vercel Environment Variables'ı güncelle:
   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (live)
   - STRIPE_SECRET_KEY (live)
4. Stripe Webhook'u güncelle (live endpoint)
5. Edge Functions secrets'ı güncelle:
   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
6. Vercel'den redeploy yap
7. Test ödeme yap (GERÇEK kart kullan!)
```

---

### 10. Monitoring ve Bakım

#### Vercel Analytics
```bash
Vercel Dashboard → Analytics
- Page views
- Top pages
- Unique visitors
- Performance metrics
```

#### Supabase Monitoring
```bash
Supabase Dashboard → Project Settings
- Database size
- API requests
- Bandwidth usage
- Active connections
```

#### Stripe Dashboard
```bash
Daily/Weekly kontroller:
- Successful payments
- Failed payments
- Disputes/Chargebacks
- Payout schedule
```

---

## 🚨 Troubleshooting

### Build Hatası
```bash
Vercel build fail olursa:
1. Local'de npm run build çalışıyor mu?
2. Environment variables doğru mu?
3. Supabase URL/keys production'a mı ait?
4. Build logs'u incele
```

### Domain Bağlanamıyor
```bash
1. DNS kayıtlarını kontrol et
2. DNS propagation için 24-48 saat bekle
3. nslookup otomasyonmagazasi.com.tr (terminal)
4. https://dnschecker.org (global check)
```

### Ödeme Çalışmıyor
```bash
1. Stripe keys doğru mu? (test vs live)
2. Webhook URL doğru mu?
3. Edge function deploy edildi mi?
4. Console'da hata var mı?
5. Stripe Dashboard → Events → Logs
```

### Database Bağlanamıyor
```bash
1. Supabase URL doğru mu?
2. Anon key doğru mu?
3. RLS policies aktif mi?
4. User authenticated mı?
5. Supabase Dashboard → Logs
```

---

## 📞 İletişim ve Destek

### Vercel Support
- https://vercel.com/support
- Discord: https://vercel.com/discord

### Supabase Support
- https://supabase.com/support
- Discord: https://discord.supabase.com

### Stripe Support
- https://support.stripe.com
- Phone: +1 (888) 926-2289

---

## ✅ Deployment Tamamlandı!

Platform artık **https://otomasyonmagazasi.com.tr** adresinde LIVE!

**Son Adımlar:**
1. ✅ SEO verification'ları tamamla
2. ✅ Social media hesaplarını bağla
3. ✅ İlk admin hesabını oluştur
4. ✅ Test ödemesi yap
5. ✅ Marketing'e başla! 🚀

---

**Deployment Date:** 2025-10-06
**Version:** 1.0.0
**Status:** 🟢 Production Ready
