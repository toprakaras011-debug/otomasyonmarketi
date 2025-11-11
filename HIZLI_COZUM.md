# 🚨 HIZLI ÇÖZÜM: Supabase E-posta Gelmiyor

## ⚡ 5 Dakikada Çözüm

### 1️⃣ Supabase Dashboard'a Git
```
https://app.supabase.com
```

### 2️⃣ Authentication Ayarlarını Aç
```
Sol Menü → Settings → Authentication
```

### 3️⃣ Bu Ayarları Yap

#### ✅ Email Auth Bölümü:
- **Enable email confirmations**: ✅ AÇIK
- **Confirm email**: ✅ AÇIK

#### ✅ URL Configuration Bölümü:
**Site URL:**
```
http://localhost:3000
```
(Production için: `https://otomasyonmagazasi.com`)

**Redirect URLs** (hepsini ekle):
```
http://localhost:3000/auth/confirm
http://localhost:3000/auth/callback
http://localhost:3000/**
https://otomasyonmagazasi.com/auth/confirm
https://otomasyonmagazasi.com/auth/callback
https://otomasyonmagazasi.com/**
```

### 4️⃣ .env.local Dosyasını Kontrol Et

Proje klasöründe `.env.local` dosyası oluştur (yoksa):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5️⃣ Uygulamayı Yeniden Başlat

```bash
# Terminalde:
npm run dev
```

---

## 🔍 Hala Gelmiyor mu?

### Test 1: Spam Klasörünü Kontrol Et
- Gmail → Spam/Gereksiz
- Outlook → Gereksiz E-posta
- Yahoo → Spam

### Test 2: Supabase Loglarını Kontrol Et
```
Supabase Dashboard → Logs → Auth Logs
```
Hata mesajlarını oku.

### Test 3: Manuel E-posta Gönder
```
Supabase Dashboard → Authentication → Users
→ Kullanıcı seç → "Send confirmation email"
```

---

## 🎯 Production İçin (Önemli!)

### SMTP Kurulumu Gerekli

Supabase'in varsayılan e-posta servisi:
- ❌ Günde 3-4 e-posta limiti
- ❌ Spam'e düşebilir
- ❌ Production için uygun değil

**Çözüm: SendGrid Kur (Ücretsiz)**

1. https://sendgrid.com → Kayıt ol
2. API Key oluştur
3. Supabase'de SMTP ayarlarını yap:

```
Settings → Authentication → SMTP Settings

SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [SendGrid API Key]
Sender Email: noreply@otomasyonmagazasi.com
Sender Name: Otomasyon Mağazası
```

---

## 📋 Hızlı Kontrol Listesi

- [ ] Supabase'de "Enable email confirmations" AÇIK mı?
- [ ] Site URL `http://localhost:3000` olarak ayarlı mı?
- [ ] Redirect URLs eklendi mi?
- [ ] .env.local dosyası var mı ve doğru mu?
- [ ] Uygulama yeniden başlatıldı mı?
- [ ] Spam klasörü kontrol edildi mi?

---

## 🆘 Acil Destek

Detaylı rehber: `SUPABASE_EMAIL_SETUP.md` dosyasını oku

Hala çözülmediyse:
1. Supabase Discord: https://discord.supabase.com
2. Supabase Docs: https://supabase.com/docs/guides/auth/auth-email
