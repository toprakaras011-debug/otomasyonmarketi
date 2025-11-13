# Şifre Sıfırlama E-posta Sorunu Çözüm Rehberi

## Sorun
Şifre sıfırlama e-postası gelmiyor veya Supabase'den e-posta gönderilmiyor.

## Çözüm Adımları

### 1. Supabase SMTP Ayarlarını Yapılandırın

Supabase varsayılan olarak sınırlı e-posta gönderimi yapar. Production için özel SMTP yapılandırması gereklidir.

#### Seçenek A: Gmail SMTP (Kolay ve Ücretsiz)

1. **Gmail'de App Password Oluşturun:**
   - Gmail hesabınıza giriş yapın
   - Google Account → Security → 2-Step Verification (açık olmalı)
   - App Passwords → Select app: "Mail" → Select device: "Other" → "Supabase"
   - Oluşturulan 16 haneli şifreyi kopyalayın

2. **Supabase Dashboard'da SMTP Ayarları:**
   - Supabase Dashboard → Settings → Auth
   - "SMTP Settings" bölümüne gidin
   - Aşağıdaki bilgileri girin:
     ```
     Host: smtp.gmail.com
     Port: 587
     Username: your-email@gmail.com
     Password: [Gmail App Password - 16 haneli]
     Sender email: your-email@gmail.com
     Sender name: Otomasyon Mağazası
     ```

3. **Test Edin:**
   - "Send test email" butonuna tıklayın
   - E-postanızı kontrol edin

#### Seçenek B: SendGrid (Profesyonel, Ücretsiz Tier)

1. **SendGrid Hesabı Oluşturun:**
   - https://sendgrid.com → Sign Up
   - Ücretsiz tier: 100 e-posta/gün

2. **API Key Oluşturun:**
   - SendGrid Dashboard → Settings → API Keys
   - "Create API Key" → Full Access
   - API Key'i kopyalayın

3. **Supabase'de Yapılandırın:**
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [SendGrid API Key]
   Sender email: noreply@yourdomain.com
   Sender name: Otomasyon Mağazası
   ```

#### Seçenek C: Mailgun (Alternatif)

1. **Mailgun Hesabı Oluşturun:**
   - https://mailgun.com → Sign Up
   - Ücretsiz tier: 5,000 e-posta/ay (ilk 3 ay)

2. **SMTP Bilgileri:**
   ```
   Host: smtp.mailgun.org
   Port: 587
   Username: postmaster@yourdomain.mailgun.org
   Password: [Mailgun SMTP Password]
   Sender email: noreply@yourdomain.com
   ```

### 2. Email Template'lerini Kontrol Edin

1. **Supabase Dashboard → Authentication → Email Templates**
2. **"Reset Password" template'ini kontrol edin:**
   - Template'de `{{ .ConfirmationURL }}` olmalı
   - Redirect URL doğru olmalı: `/auth/reset-password`

3. **Template Örneği:**
   ```html
   <h2>Şifre Sıfırlama</h2>
   <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
   <p><a href="{{ .ConfirmationURL }}">Şifremi Sıfırla</a></p>
   <p>Bu bağlantı 1 saat geçerlidir.</p>
   ```

### 3. Redirect URL'i Kontrol Edin

1. **Supabase Dashboard → Authentication → URL Configuration**
2. **Site URL:** `https://yourdomain.com` (production) veya `http://localhost:3000` (development)
3. **Redirect URLs:** 
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/reset-password`
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com/auth/reset-password`

### 4. Development Ortamında Test

Development'ta e-posta gelmiyorsa:

1. **Supabase Dashboard → Authentication → Users**
2. **Kullanıcıyı bulun ve "Send password reset email" butonuna tıklayın**
3. **E-postayı kontrol edin**

### 5. Rate Limiting Kontrolü

Çok fazla istek yapıldıysa geçici olarak engellenmiş olabilir:

1. **Birkaç dakika bekleyin**
2. **Farklı bir e-posta ile deneyin**
3. **Supabase Dashboard → Logs → Auth Logs** kontrol edin

### 6. Spam Klasörünü Kontrol Edin

- Gmail: Spam klasörü
- Outlook: Junk Email klasörü
- Diğer: Spam/Junk klasörleri

### 7. Email Doğrulama Durumu

E-posta doğrulanmamışsa şifre sıfırlama gönderilmeyebilir:

1. **Supabase Dashboard → Authentication → Settings**
2. **"Enable email confirmations"** ayarını kontrol edin
3. **Development'ta:** Bu ayarı kapatabilirsiniz
4. **Production'da:** Açık tutun ama kullanıcıya bilgi verin

## Hızlı Test

### Terminal/Console'da Kontrol:

1. **Şifre sıfırlama isteği gönderin**
2. **Console loglarını kontrol edin:**
   ```
   Password reset request: { email: '...', redirectTo: '...' }
   Password reset email sent successfully
   ```

3. **Hata varsa:**
   ```
   Password reset error: { message: '...', status: ... }
   ```

### Supabase Dashboard'da Kontrol:

1. **Authentication → Logs**
2. **"Password reset" event'lerini kontrol edin**
3. **Hata mesajlarını inceleyin**

## Production Checklist

- [ ] SMTP yapılandırıldı ve test edildi
- [ ] Email template'leri kontrol edildi
- [ ] Redirect URL'leri doğru yapılandırıldı
- [ ] Site URL doğru ayarlandı
- [ ] Spam klasörü kontrol edildi
- [ ] Rate limiting kontrol edildi

## Önerilen Çözüm (Hızlı)

**Gmail SMTP kullanın:**
1. Gmail App Password oluşturun (5 dakika)
2. Supabase'de SMTP ayarlarını yapın (2 dakika)
3. Test e-postası gönderin (1 dakika)
4. Şifre sıfırlama test edin (1 dakika)

**Toplam süre: ~10 dakika**

## Destek

Sorun devam ederse:
1. Supabase Dashboard → Support
2. Auth Logs'u kontrol edin
3. SMTP test sonuçlarını kontrol edin

