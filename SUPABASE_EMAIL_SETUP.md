# Supabase E-posta Gönderim Sorunu Çözümü

## 🔍 Sorun Analizi

Supabase'den e-posta gelmemesinin birkaç nedeni olabilir:

### 1. **Supabase E-posta Ayarları (En Yaygın Sorun)**

Supabase Dashboard'da e-posta ayarlarını kontrol edin:

#### ✅ Adım 1: Supabase Dashboard'a Gidin
1. https://app.supabase.com adresine gidin
2. Projenizi seçin
3. Sol menüden **Authentication** → **Email Templates** seçin

#### ✅ Adım 2: E-posta Doğrulama Ayarlarını Kontrol Edin
1. **Settings** → **Authentication** → **Email Auth** bölümüne gidin
2. Şu ayarları kontrol edin:
   - ✅ **Enable email confirmations**: `AÇIK` olmalı
   - ✅ **Confirm email**: `AÇIK` olmalı
   - ✅ **Secure email change**: `AÇIK` (önerilen)
   - ✅ **Double confirm email changes**: `AÇIK` (önerilen)

#### ✅ Adım 3: Site URL'ini Ayarlayın
1. **Settings** → **Authentication** → **URL Configuration**
2. **Site URL** alanına production URL'inizi girin:
   ```
   https://otomasyonmagazasi.com
   ```
   veya development için:
   ```
   http://localhost:3000
   ```

3. **Redirect URLs** listesine şunları ekleyin:
   ```
   http://localhost:3000/auth/confirm
   http://localhost:3000/auth/callback
   https://otomasyonmagazasi.com/auth/confirm
   https://otomasyonmagazasi.com/auth/callback
   ```

---

## 2. **E-posta Sağlayıcı Ayarları**

### Varsayılan Supabase E-posta (Geliştirme İçin)

Supabase varsayılan olarak kendi e-posta servisini kullanır, ancak:
- ⚠️ **Günlük limit**: Ücretsiz planda günde 3-4 e-posta
- ⚠️ **Spam klasörüne düşebilir**
- ⚠️ **Production için önerilmez**

### Özel SMTP Kurulumu (Production İçin ÖNERİLİR)

#### Gmail SMTP Kurulumu:

1. **Supabase Dashboard** → **Settings** → **Authentication** → **SMTP Settings**

2. Aşağıdaki bilgileri girin:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: your-email@gmail.com
   SMTP Password: [App Password - aşağıda açıklanıyor]
   Sender Email: your-email@gmail.com
   Sender Name: Otomasyon Mağazası
   ```

3. **Gmail App Password Oluşturma**:
   - Gmail hesabınıza gidin
   - Güvenlik → 2 Adımlı Doğrulama'yı aktif edin
   - Güvenlik → Uygulama Şifreleri → Yeni şifre oluştur
   - Bu şifreyi SMTP Password olarak kullanın

#### SendGrid Kurulumu (Önerilen):

1. https://sendgrid.com adresine kayıt olun (ücretsiz 100 e-posta/gün)

2. API Key oluşturun:
   - Settings → API Keys → Create API Key
   - Full Access verin

3. Supabase'de SMTP ayarları:
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Password: [SendGrid API Key]
   Sender Email: noreply@otomasyonmagazasi.com
   Sender Name: Otomasyon Mağazası
   ```

4. SendGrid'de domain doğrulama yapın (önemli!)

---

## 3. **E-posta Template Ayarları**

### Confirm Signup Template'i Düzenleyin:

1. **Authentication** → **Email Templates** → **Confirm signup**

2. Template'i güncelleyin:

```html
<h2>E-posta Adresinizi Doğrulayın</h2>

<p>Merhaba,</p>

<p>Otomasyon Mağazası'na hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #8B5CF6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
    E-postamı Doğrula
  </a>
</p>

<p>Veya aşağıdaki linki tarayıcınıza kopyalayın:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Bu bağlantı 24 saat geçerlidir.</p>

<p>Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>

<p>Teşekkürler,<br>Otomasyon Mağazası Ekibi</p>
```

3. **Subject** alanını güncelleyin:
   ```
   Otomasyon Mağazası - E-posta Doğrulama
   ```

---

## 4. **Kod Tarafında Kontroller**

### .env.local Dosyasını Kontrol Edin:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Site URL (ÖNEMLİ!)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# veya production için:
# NEXT_PUBLIC_SITE_URL=https://otomasyonmagazasi.com
```

### Redirect URL'i Kontrol Edin:

Kod tarafında zaten doğru ayarlanmış:

```typescript
// lib/auth.ts içinde
const emailRedirectTo = `${(siteUrl || 'http://localhost:3000')}/auth/confirm?email=${encodeURIComponent(
  normalizedEmail
)}`;
```

---

## 5. **Test ve Debugging**

### E-posta Gönderimini Test Edin:

1. **Supabase Dashboard** → **Authentication** → **Users**
2. Yeni bir test kullanıcısı oluşturun
3. "Send confirmation email" butonuna tıklayın
4. E-posta gelip gelmediğini kontrol edin

### Logları Kontrol Edin:

1. **Supabase Dashboard** → **Logs** → **Auth Logs**
2. E-posta gönderim hatalarını kontrol edin
3. Hata mesajlarını okuyun ve çözün

### Spam Klasörünü Kontrol Edin:

- Gmail: Spam/Gereksiz klasörü
- Outlook: Gereksiz E-posta klasörü
- Yahoo: Spam klasörü

---

## 6. **Hızlı Çözüm Adımları**

### Senaryo 1: Development Ortamında Test Ediyorsanız

```bash
# 1. .env.local dosyasını kontrol edin
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 2. Supabase Dashboard'da Site URL'i ayarlayın
# Settings → Authentication → Site URL: http://localhost:3000

# 3. Redirect URLs ekleyin:
# http://localhost:3000/auth/confirm
# http://localhost:3000/auth/callback

# 4. Email confirmations'ı aktif edin
# Settings → Authentication → Enable email confirmations: ON
```

### Senaryo 2: Production'da Sorun Yaşıyorsanız

```bash
# 1. SMTP ayarlarını yapın (Gmail veya SendGrid)
# 2. Domain doğrulama yapın
# 3. SPF ve DKIM kayıtlarını ekleyin
# 4. Site URL'i production URL'e güncelleyin
```

---

## 7. **Alternatif Çözüm: E-posta Doğrulama Olmadan Test**

Geliştirme sırasında e-posta doğrulamayı geçici olarak kapatabilirsiniz:

1. **Supabase Dashboard** → **Settings** → **Authentication**
2. **Enable email confirmations**: `KAPALI` yapın
3. ⚠️ **DİKKAT**: Production'da mutlaka AÇIK olmalı!

---

## 8. **Supabase CLI ile E-posta Ayarları**

Eğer Supabase CLI kullanıyorsanız:

```bash
# supabase/config.toml dosyasını düzenleyin
[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true

[auth.email.template.confirmation]
subject = "Otomasyon Mağazası - E-posta Doğrulama"
content_path = "./supabase/templates/confirmation.html"
```

---

## 🎯 Önerilen Kurulum (Production)

1. ✅ **SendGrid** veya **AWS SES** kullanın (ücretsiz tier yeterli)
2. ✅ Domain doğrulama yapın
3. ✅ SPF, DKIM, DMARC kayıtlarını ekleyin
4. ✅ E-posta template'lerini özelleştirin
5. ✅ Rate limiting ayarlayın
6. ✅ E-posta loglarını takip edin

---

## 📞 Destek

Hala sorun yaşıyorsanız:

1. **Supabase Discord**: https://discord.supabase.com
2. **Supabase Docs**: https://supabase.com/docs/guides/auth/auth-email
3. **GitHub Issues**: https://github.com/supabase/supabase/issues

---

## ✅ Kontrol Listesi

- [ ] Supabase'de "Enable email confirmations" açık mı?
- [ ] Site URL doğru ayarlanmış mı?
- [ ] Redirect URLs eklenmiş mi?
- [ ] SMTP ayarları yapılmış mı? (production için)
- [ ] E-posta template'leri özelleştirilmiş mi?
- [ ] Spam klasörü kontrol edildi mi?
- [ ] Auth logs kontrol edildi mi?
- [ ] .env.local dosyası doğru mu?
- [ ] Domain doğrulama yapıldı mı? (production için)

---

**Son Güncelleme**: 11 Kasım 2025
