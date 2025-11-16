# Email Signups Devre Dışı Hatası Çözümü

## 🚨 Hata Mesajı
```
Email signups are disabled
```

## 🔍 Sorun
Bu hata, Supabase Dashboard'da email signups'ın devre dışı olduğunu gösteriyor.

## ✅ Çözüm

### 1. Supabase Dashboard'a Giriş Yapın
- [Supabase Dashboard](https://app.supabase.com) adresine gidin
- Projenizi seçin

### 2. Authentication Ayarlarına Gidin
1. Sol menüden **Authentication** seçeneğine tıklayın
2. **Settings** sekmesine gidin
3. **Email Auth** bölümünü bulun

### 3. Email Signups'ı Aktif Edin
- **"Enable email signups"** seçeneğini ✅ **aktif edin**
- Bu seçenek genellikle **"Auth"** veya **"Providers"** alt bölümünde bulunur

### 4. Email Confirmations'ı Aktif Edin (Opsiyonel)
- **"Enable email confirmations"** seçeneğini ✅ **aktif edin**
- Bu, kullanıcıların e-posta adreslerini doğrulamasını gerektirir

### 5. Değişiklikleri Kaydedin
- Tüm değişiklikleri kaydedin
- Sayfayı yenileyin

## 📋 Kontrol Listesi

- [ ] Supabase Dashboard'a giriş yapıldı
- [ ] Authentication > Settings > Email Auth bölümüne gidildi
- [ ] "Enable email signups" seçeneği aktif edildi
- [ ] (Opsiyonel) "Enable email confirmations" seçeneği aktif edildi
- [ ] Değişiklikler kaydedildi
- [ ] Test kaydı yapıldı

## ⚠️ Önemli Notlar

1. **Email Signups**: Bu seçenek devre dışıysa, kullanıcılar e-posta ile kayıt olamaz
2. **Email Confirmations**: Bu seçenek devre dışıysa, kullanıcılar e-posta doğrulaması olmadan kayıt olabilir
3. **SMTP Ayarları**: E-posta gönderimi için SMTP ayarlarının yapılandırılmış olması gerekir

## 🔧 SMTP Ayarları (Opsiyonel)

Eğer özel bir SMTP servisi kullanmak istiyorsanız:

1. **Authentication** > **Settings** > **SMTP Settings** bölümüne gidin
2. SMTP bilgilerinizi girin:
   - SMTP Host
   - SMTP Port
   - SMTP User
   - SMTP Password
   - From Email

## 📞 Yardım

Eğer sorun devam ederse:
1. Supabase Dashboard'da **Logs** bölümünü kontrol edin
2. Hata mesajlarını kontrol edin
3. [Supabase Dökümantasyonu](https://supabase.com/docs/guides/auth) referans alın

---

**Son Güncelleme**: Bu dosya, email signups devre dışı hatası için hazırlanmıştır.

