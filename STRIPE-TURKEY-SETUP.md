# Stripe Türkiye Kurulum Rehberi
## TRY (Türk Lirası) Ödemeleri

---

## 📌 Önemli Notlar

### ✅ Platform Stripe Kullanıyor (PayTR/Iyzico DEĞİL)

**Neden Stripe?**
- ✅ Uluslararası standart ödeme sistemi
- ✅ TRY (Türk Lirası) desteği VAR
- ✅ Stripe Connect ile marketplace desteği
- ✅ Güvenilir ve gelişmiş API
- ✅ Düşük komisyon oranları
- ✅ Otomatik payout sistemi

**Platform Komisyon Yapısı:**
- Platform komisyonu: %15 (sizin)
- Developer kazancı: %85
- Stripe komisyonu: ~%2.9 + 0.99 TRY (her işlem için)

---

## 🇹🇷 Stripe Türkiye Desteği

### Stripe TRY (Türk Lirası) Ödemelerini Destekliyor!

**Desteklenen Özellikler:**
- ✅ TRY currency ile ödeme alma
- ✅ Türk banka kartları (Visa, Mastercard)
- ✅ 3D Secure zorunlu doğrulama
- ✅ TRY hesaplarına payout
- ✅ Türkiye'den şirket/bireysel hesap açma

### Gereksinimler

**Platform Sahibi (Sizin) İçin:**
```bash
1. Stripe hesabı (Test veya Live)
2. Türkiye'de kayıtlı şirket VEYA şahıs şirketi
3. Vergi kimlik numarası
4. İş bankası hesabı (TRY)
```

**Geliştiriciler İçin:**
```bash
1. Stripe Connect hesabı (Standard account)
2. TC Kimlik No veya Vergi No
3. Türk banka hesabı (IBAN)
4. E-posta ve telefon
```

---

## 🔧 Stripe Kurulumu

### 1. Stripe Hesabı Oluşturma

#### A. Test Mode (Geliştirme)
```bash
1. https://stripe.com → Sign up
2. Email ile kayıt ol
3. Test Mode'da kal (sol üst toggle)
4. Dashboard → Developers → API Keys
5. Keys'leri kopyala
```

**Test Keys:**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

#### B. Live Mode (Production)
```bash
1. Dashboard → Activate Account
2. Business bilgilerini doldur:
   - Business type: Company/Individual
   - Country: Turkey
   - Business name: Otomasyon Mağazası
   - Tax ID: Vergi No
   - Industry: Software/SaaS
3. Bank account (TRY):
   - IBAN
   - Bank name
   - Account holder name
4. Verification:
   - ID upload
   - Address proof
   - Business documents
5. Onay bekle (1-3 gün)
```

**Live Keys:**
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
```

---

### 2. Stripe Connect Kurulumu

#### A. Connect Platform Ayarları
```bash
1. Stripe Dashboard → Connect → Settings
2. Platform profile:
   - Name: Otomasyon Mağazası
   - Icon/Logo: Yükle
   - Color: #9333EA (purple)
   - Support URL: https://otomasyonmagazasi.com.tr/help
   - Privacy URL: https://otomasyonmagazasi.com.tr/privacy
```

#### B. Account Requirements
```bash
1. Connect → Settings → Account requirements
2. Required information:
   ✅ Business profile (name, industry)
   ✅ Individual details (name, DOB, ID)
   ✅ Bank account (IBAN)
   ✅ Verification documents

3. Payout settings:
   - Default payout: Automatic (daily)
   - Minimum: 10 TRY
   - Currency: TRY
```

#### C. Application Settings
```bash
1. Connect → Settings → Applications
2. Redirect URLs:
   https://otomasyonmagazasi.com.tr/developer/stripe-callback
   https://otomasyonmagazasi.com.tr/developer/stripe-onboarding

3. OAuth settings:
   - Enable Express accounts: ✅
   - Enable Standard accounts: ✅
   - Default account type: Standard
```

---

### 3. Webhook Kurulumu

#### A. Webhook Endpoint Oluşturma
```bash
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint
3. URL (Production):
   https://[SUPABASE_PROJECT_ID].supabase.co/functions/v1/stripe-webhook

   Örnek:
   https://abcdefghijk.supabase.co/functions/v1/stripe-webhook
```

#### B. Dinlenecek Event'ler
```bash
Seçilecek Events:
✅ payment_intent.succeeded
✅ payment_intent.payment_failed
✅ account.updated
✅ payout.paid
✅ payout.failed
✅ charge.refunded
```

#### C. Webhook Secret
```bash
1. Webhook oluşturulduktan sonra "Signing secret" göreceksin
2. Kopyala: whsec_xxxxx
3. Supabase Secrets'a ekle:

supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

### 4. Environment Variables

#### A. Vercel (Frontend)
```env
# Stripe Keys (Live Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Platform
PLATFORM_FEE_PERCENTAGE=15
```

#### B. Supabase Edge Functions
```bash
# Deploy edge functions
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
supabase secrets set SUPABASE_URL=https://xxx.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
supabase secrets set PLATFORM_FEE_PERCENTAGE=15
```

---

## 💳 TRY Currency Yapılandırması

### Edge Functions'da TRY Desteği

Platformda TRY zaten aktif! İşte nasıl çalışıyor:

#### create-checkout/index.ts
```typescript
// Fiyat TL cinsinden (örn: 150.00 TL)
const amountInTRY = automation.price;

// Platform komisyonu (%15)
const platformFee = (amountInTRY * 15) / 100;

// Stripe kuruş cinsinden işlem yapar
const amountInKurus = Math.round(amountInTRY * 100);

// Payment Intent (TRY)
const paymentIntent = await stripe.paymentIntents.create({
  amount: amountInKurus,        // 15000 kuruş = 150 TL
  currency: "try",              // TRY currency
  application_fee_amount: platformFeeInKurus,
  transfer_data: {
    destination: developer_stripe_account_id,
  },
});
```

#### stripe-webhook/index.ts
```typescript
// Webhook'ta TRY currency
if (event.type === "payment_intent.succeeded") {
  const paymentIntent = event.data.object;

  // Platform earnings (TRY)
  await supabase.from("platform_earnings").insert({
    amount: platformFee,
    currency: "try",  // TRY kaydedilir
    status: "completed",
  });
}
```

---

## 💰 Komisyon ve Ödeme Akışı

### Ödeme Nasıl İşler?

**Senaryo: 100 TL'lik otomasyon satışı**

```bash
1. Kullanıcı 100 TL ödeme yapar
   ├─ Stripe ücret: ~2.90 TL + 0.99 TL = ~3.89 TL
   └─ Net tutar: ~96.11 TL

2. Platform komisyonu (net tutardan):
   ├─ Platform: 96.11 * 0.15 = ~14.42 TL
   └─ Developer: 96.11 * 0.85 = ~81.69 TL

3. Otomatik transfer:
   ├─ Platform hesabı: 14.42 TL
   └─ Developer hesabı: 81.69 TL (1-3 gün içinde)
```

### Stripe Ücretleri (Türkiye)

```bash
Domestic cards (Türk kartları):
- %2.9 + 0.99 TRY per transaction
- 3D Secure: Ücretsiz (zorunlu)

International cards:
- %3.9 + 0.99 TRY per transaction

Stripe Connect:
- Platform için ücretsiz
- Developer'a standard ücretler

Payout (Türk bankalarına):
- Ücretsiz (TRY to TRY)
- 1-3 iş günü
```

---

## 🧪 Test Kartları

### Türkiye Test Kartları

```bash
# Başarılı ödeme
Card: 4242 4242 4242 4242
Expiry: Gelecekteki herhangi bir tarih (örn: 12/25)
CVC: Herhangi 3 hane (örn: 123)
ZIP: Herhangi 5 hane (örn: 34000)

# 3D Secure gerekli
Card: 4000 0027 6000 3184
Expiry: 12/25
CVC: 123

# Reddedilen kart
Card: 4000 0000 0000 0002
Expiry: 12/25
CVC: 123

# Yetersiz bakiye
Card: 4000 0000 0000 9995
Expiry: 12/25
CVC: 123
```

**Test Mode'da ödeme:**
```bash
1. Test kartı ile ödeme yap
2. 3D Secure: "Complete authentication" tıkla
3. Webhook otomatik tetiklenir
4. Purchase "completed" olur
5. Platform earnings kaydedilir
```

---

## 🚀 Production'a Geçiş

### Live Mode Aktivasyonu

#### 1. Stripe Hesabını Aktive Et
```bash
1. Test Mode → Live Mode toggle (sol üst)
2. "Activate your account" butonuna tıkla
3. Tüm bilgileri doldur (business, bank, verification)
4. Onay bekle (1-3 gün)
```

#### 2. Live Keys'leri Güncelle
```bash
# Vercel
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → pk_live_xxx
- STRIPE_SECRET_KEY → sk_live_xxx

# Supabase Secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
```

#### 3. Webhook'u Live'a Taşı
```bash
1. Live Mode'da yeni webhook oluştur
2. URL: https://[PROJECT_ID].supabase.co/functions/v1/stripe-webhook
3. Events: Aynı event'leri seç
4. Webhook secret'i güncelle:
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_live_xxx
```

#### 4. Test Et (GERÇEK Kart)
```bash
1. Küçük bir test ödemesi yap (örn: 10 TL)
2. Kendi kartınla test et
3. Purchase tamamlandı mı kontrol et
4. Platform earnings kaydı var mı?
5. Developer'a transfer oldu mu? (1-3 gün)
```

---

## 🔒 Güvenlik

### PCI Compliance

**Stripe otomatik olarak PCI DSS uyumluluğu sağlar:**
- ✅ Kart bilgileri sizin sunucunuza GELMİYOR
- ✅ Stripe.js kartları direkt Stripe'a gönderir
- ✅ Tokenization otomatik
- ✅ 3D Secure zorunlu (Türkiye)

### Best Practices

```bash
1. API Keys:
   ✅ Publishable key: Frontend'de OK
   ❌ Secret key: ASLA frontend'e koyma
   ✅ Webhook secret: Backend'de sakla

2. Webhook Verification:
   ✅ Her webhook'u signature ile doğrula
   ❌ Doğrulamadan işlem yapma

3. Idempotency:
   ✅ Aynı payment intent'i 2 kez işleme
   ✅ payment_intent_id ile check et

4. Error Handling:
   ✅ Her hatayı logla
   ✅ Kullanıcıya anlaşılır hata ver
   ✅ Retry mechanism
```

---

## 📊 Dashboard ve Raporlama

### Stripe Dashboard'da İzlenecekler

```bash
# Payments
- Başarılı ödemeler
- Başarısız ödemeler
- Refund'lar
- Toplam gelir (TRY)

# Connect
- Connected accounts (geliştiriciler)
- Payouts to developers
- Application fees (platform komisyonu)

# Disputes
- Chargeback'ler
- İtirazlar
- Fraud attempts
```

### Platform Database (Supabase)

```sql
-- Toplam satışlar
SELECT COUNT(*), SUM(price) FROM purchases WHERE status = 'completed';

-- Platform kazançları
SELECT SUM(amount) FROM platform_earnings WHERE currency = 'try';

-- Developer kazançları
SELECT developer_id, SUM(price - platform_commission)
FROM purchases
WHERE status = 'completed'
GROUP BY developer_id;
```

---

## ❓ Sık Sorulan Sorular

### Stripe Türkiye'de çalışıyor mu?
✅ Evet! Stripe TRY currency'sini ve Türk kartlarını destekliyor.

### PayTR/Iyzico yerine neden Stripe?
- Uluslararası standard
- Daha düşük komisyon
- Marketplace (Connect) desteği
- Gelişmiş API ve webhook sistemi
- Global müşteriler de ödeme yapabilir

### Developer'lar nasıl para alır?
- Stripe Connect ile kendi Stripe hesaplarını bağlarlar
- Satış olduğunda otomatik transfer edilir
- 1-3 iş günü içinde TRY olarak Türk bankasına ulaşır

### 3D Secure zorunlu mu?
✅ Evet, Türkiye'de 3D Secure zorunludur ve Stripe otomatik halleder.

### Test mode'dan live'a geçiş zor mu?
Hayır, sadece keys'leri değiştirip hesap aktivasyonu yapıyorsun.

### Minimum ödeme tutarı var mı?
Stripe: 0.50 TRY minimum (teknik olarak)
Platform: İstediğiniz minimumu siz belirleyebilirsiniz

### Refund (iade) nasıl yapılır?
```bash
# Stripe Dashboard
1. Payment'i bul
2. "Refund" butonuna tıkla
3. Tutar gir (full/partial)
4. Webhook otomatik tetiklenir
```

---

## 🎯 Özet Checklist

Production'a geçmeden önce:

```bash
✅ Stripe hesabı aktive edildi (Live Mode)
✅ Business bilgileri tamamlandı
✅ Banka hesabı eklendi (TRY)
✅ Stripe Connect ayarları yapıldı
✅ Webhook oluşturuldu (Live Mode)
✅ Live keys Vercel'e eklendi
✅ Live secrets Supabase'e eklendi
✅ Edge functions deploy edildi
✅ Test ödemesi yapıldı (gerçek kart)
✅ Purchase tamamlandı
✅ Platform earnings kaydedildi
✅ Developer transfer kontrolü
```

---

## 📞 Destek

### Stripe Support
- Email: support@stripe.com
- Chat: Dashboard → Help
- Docs: https://stripe.com/docs
- Community: https://stackoverflow.com/questions/tagged/stripe

### Türkiye Stripe Support
- Turkish documentation available
- Email support in Turkish
- Phone: +90 (850) 250 8787

---

**✨ Stripe ile TRY ödemeleri tamamen hazır! Güvenli, hızlı ve kolay ödeme sistemi! 🚀**

**Not:** PayTR/Iyzico yerine Stripe kullanmanız daha profesyonel ve uluslararası bir çözüm. Türkiye'de de %100 çalışıyor!
