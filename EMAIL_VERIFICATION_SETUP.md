# E-posta Doğrulama Kurulum Rehberi

Bu rehber, Supabase'de e-posta doğrulama sistemini aktif etmek ve yapılandırmak için gerekli adımları içerir.

## 📋 İçindekiler

1. [Supabase Dashboard Ayarları](#supabase-dashboard-ayarları)
2. [E-posta Şablonlarını Özelleştirme](#e-posta-şablonlarını-özelleştirme)
3. [SMTP Yapılandırması (Opsiyonel)](#smtp-yapılandırması-opsiyonel)
4. [Test Etme](#test-etme)
5. [Sorun Giderme](#sorun-giderme)

---

## Supabase Dashboard Ayarları

### 1. Authentication Ayarlarına Erişim

1. [Supabase Dashboard](https://app.supabase.com/) adresine gidin
2. Projenizi seçin
3. Sol menüden **Authentication** > **Settings** bölümüne gidin

### 2. E-posta Doğrulamayı Aktif Etme

**Authentication Settings** sayfasında:

1. **Enable Email Confirmations** seçeneğini **Aktif** yapın
   - Bu seçenek, kullanıcıların e-posta adreslerini doğrulamadan giriş yapmalarını engeller

2. **Confirm email** seçeneğini **Aktif** yapın
   - Kayıt olduktan sonra kullanıcılara doğrulama e-postası gönderilir

3. **Site URL** ayarını kontrol edin:
   ```
   https://yourdomain.com
   ```
   - Production için: Gerçek domain adresiniz
   - Development için: `http://localhost:3000`

4. **Redirect URLs** listesine şu URL'leri ekleyin:
   ```
   http://localhost:3000/auth/confirm
   https://yourdomain.com/auth/confirm
   https://yourdomain.com/auth/callback
   ```

### 3. E-posta Ayarları

**Email Templates** bölümünde:

1. **Confirm signup** şablonunu kontrol edin
2. **Redirect URL**'nin doğru olduğundan emin olun:
   ```
   {{ .SiteURL }}/auth/confirm?email={{ .Email }}&token={{ .TokenHash }}&type=signup
   ```

---

## E-posta Şablonlarını Özelleştirme

### 1. E-posta Şablonuna Erişim

1. **Authentication** > **Email Templates** menüsüne gidin
2. **Confirm signup** şablonunu seçin

### 2. Örnek E-posta Şablonu

```html
<h2>E-posta Adresinizi Doğrulayın</h2>

<p>Merhaba,</p>

<p>Otomasyon Marketi'ne hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki butona tıklayın:</p>

<p>
  <a href="{{ .ConfirmationURL }}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    E-postamı Doğrula
  </a>
</p>

<p>Veya aşağıdaki linki tarayıcınıza yapıştırın:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Bu link 24 saat geçerlidir.</p>

<p>Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>

<p>Saygılarımızla,<br>Otomasyon Marketi Ekibi</p>
```

### 3. Önemli Değişkenler

- `{{ .ConfirmationURL }}` - Doğrulama linki (otomatik oluşturulur)
- `{{ .Email }}` - Kullanıcının e-posta adresi
- `{{ .SiteURL }}` - Site URL'iniz
- `{{ .TokenHash }}` - Güvenlik token'ı

---

## SMTP Yapılandırması (Opsiyonel)

Varsayılan olarak Supabase kendi SMTP sunucusunu kullanır. Kendi SMTP sunucunuzu kullanmak isterseniz:

### 1. SMTP Ayarlarına Erişim

1. **Authentication** > **Settings** > **SMTP Settings** bölümüne gidin

### 2. SMTP Bilgilerini Girin

- **SMTP Host**: SMTP sunucu adresiniz (örn: `smtp.gmail.com`)
- **SMTP Port**: Port numarası (genellikle 587 veya 465)
- **SMTP User**: SMTP kullanıcı adınız
- **SMTP Password**: SMTP şifreniz
- **Sender Email**: Gönderen e-posta adresi
- **Sender Name**: Gönderen adı (örn: "Otomasyon Marketi")

### 3. Popüler E-posta Sağlayıcıları

#### Gmail
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Password: (Gmail App Password - 2FA aktifse)
```

**Not**: Gmail kullanıyorsanız, "App Password" oluşturmanız gerekebilir:
1. Google Account > Security > 2-Step Verification
2. App passwords oluşturun
3. Bu şifreyi SMTP Password olarak kullanın

#### SendGrid
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: (SendGrid API Key)
```

#### Mailgun
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: (Mailgun SMTP username)
SMTP Password: (Mailgun SMTP password)
```

---

## Test Etme

### 1. Yerel Geliştirme Ortamında Test

1. Development server'ı başlatın:
   ```bash
   npm run dev
   ```

2. Tarayıcıda `http://localhost:3000/auth/signup` adresine gidin

3. Yeni bir hesap oluşturun

4. E-posta kutunuzu kontrol edin (spam klasörü dahil)

5. E-postadaki doğrulama linkine tıklayın

6. `/auth/confirm` sayfasına yönlendirilmelisiniz

7. E-posta doğrulandıktan sonra `/auth/signin` sayfasına yönlendirilmelisiniz

### 2. Production Ortamında Test

1. Production URL'inizi Supabase Dashboard'da **Site URL** olarak ayarlayın

2. **Redirect URLs** listesine production URL'lerinizi ekleyin

3. Yeni bir test hesabı oluşturun

4. E-posta gönderimini kontrol edin

5. Doğrulama linkinin çalıştığını doğrulayın

---

## Sorun Giderme

### E-posta Gelmiyor

1. **Spam Klasörünü Kontrol Edin**
   - E-postalar spam klasörüne düşebilir
   - Gmail, Outlook, Yahoo gibi sağlayıcılar bazen e-postaları spam olarak işaretler

2. **Supabase Rate Limiting**
   - Supabase ücretsiz planında günlük e-posta limiti vardır
   - Limit aşıldıysa, e-postalar gönderilmez
   - Dashboard'da **Usage** bölümünden limitleri kontrol edin

3. **E-posta Adresi Kontrolü**
   - Geçerli bir e-posta adresi kullandığınızdan emin olun
   - Test için gerçek bir e-posta adresi kullanın

4. **SMTP Ayarları**
   - Kendi SMTP sunucunuzu kullanıyorsanız, ayarları kontrol edin
   - SMTP sunucunuzun çalıştığından emin olun

### Doğrulama Linki Çalışmıyor

1. **Redirect URL Kontrolü**
   - Supabase Dashboard'da **Redirect URLs** listesinde doğru URL'lerin olduğundan emin olun
   - URL'ler tam olarak eşleşmelidir (http/https, trailing slash, vb.)

2. **Token Süresi**
   - Doğrulama linkleri sınırlı bir süre geçerlidir (genellikle 24 saat)
   - Süresi dolmuş linkler çalışmaz
   - Yeni bir doğrulama e-postası gönderin

3. **Site URL Kontrolü**
   - **Site URL** ayarının doğru olduğundan emin olun
   - Development ve production için farklı URL'ler kullanabilirsiniz

### "Email not confirmed" Hatası

1. **E-posta Doğrulama Durumunu Kontrol Edin**
   - Supabase Dashboard > Authentication > Users
   - Kullanıcının `email_confirmed_at` değerini kontrol edin
   - `null` ise, e-posta henüz doğrulanmamıştır

2. **Manuel Doğrulama**
   - Gerekirse, Supabase Dashboard'dan kullanıcının e-postasını manuel olarak doğrulayabilirsiniz
   - **Users** > Kullanıcıyı seçin > **Confirm email** butonuna tıklayın

### E-posta Şablonu Görünmüyor

1. **Şablon Ayarlarını Kontrol Edin**
   - **Email Templates** bölümünde şablonun aktif olduğundan emin olun
   - Şablon içeriğinin doğru olduğunu kontrol edin

2. **HTML Formatı**
   - E-posta şablonları HTML formatında olmalıdır
   - Geçerli HTML kullandığınızdan emin olun

---

## Önemli Notlar

### Güvenlik

- ✅ E-posta doğrulaması zorunlu hale getirildi
- ✅ Kullanıcılar e-posta doğrulamadan giriş yapamaz
- ✅ Doğrulama linkleri sınırlı süre geçerlidir

### Performans

- Supabase ücretsiz planında günlük e-posta limiti vardır
- Yüksek trafikli siteler için kendi SMTP sunucunuzu kullanmanız önerilir
- SendGrid, Mailgun gibi servisler daha yüksek limitler sunar

### Geliştirme Ortamı

- Development'ta e-postalar Supabase'in test SMTP sunucusu üzerinden gönderilir
- Production'da kendi SMTP sunucunuzu kullanmanız önerilir
- E-posta gönderim loglarını Supabase Dashboard'dan takip edebilirsiniz

---

## Ek Kaynaklar

- [Supabase Email Templates Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase SMTP Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase Email Rate Limits](https://supabase.com/docs/guides/platform/going-to-pro#email-rate-limits)

---

## Hızlı Kontrol Listesi

- [ ] Supabase Dashboard'da **Enable Email Confirmations** aktif
- [ ] **Confirm email** seçeneği aktif
- [ ] **Site URL** doğru ayarlanmış
- [ ] **Redirect URLs** listesine gerekli URL'ler eklenmiş
- [ ] E-posta şablonu özelleştirilmiş (opsiyonel)
- [ ] SMTP ayarları yapılandırılmış (opsiyonel)
- [ ] Test e-postası gönderilmiş ve doğrulama linki çalışıyor
- [ ] Production URL'leri doğru yapılandırılmış

Bu adımları tamamladıktan sonra, e-posta doğrulama sistemi tam olarak çalışır durumda olacaktır! 🎉

