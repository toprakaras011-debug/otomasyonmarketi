# OAuth ve Admin Rolü Düzeltmeleri

## Yapılan Değişiklikler

### 1. Admin Rolü Otomatik Atama
- `ftnakras01@gmail.com` için admin rolü otomatik olarak atanacak şekilde ayarlandı
- OAuth callback'te (`app/auth/callback/route.ts`) admin email listesi eklendi
- Yeni OAuth girişlerinde admin email kontrolü yapılıyor
- Mevcut profiller için admin rolü güncelleniyor

### 2. OAuth Hata Yönetimi İyileştirildi
- Daha açıklayıcı hata mesajları eklendi
- Geçersiz/expired token hataları için özel mesajlar
- Network hataları için özel mesajlar
- OAuth hataları artık doğru şekilde `/auth/signin` sayfasına yönlendiriliyor

### 3. Profile Oluşturma İyileştirildi
- OAuth girişlerinde profile oluşturma daha güvenilir hale getirildi
- Admin email'ler için otomatik admin rolü atanıyor
- Profile oluşturma hataları artık OAuth akışını durdurmuyor
- Retry mekanizması eklendi (profile okuma için)

## SQL Script Çalıştırma

Supabase SQL Editor'de `fix-admin-oauth.sql` dosyasını çalıştırın:

1. Supabase Dashboard'a gidin
2. SQL Editor'ü açın
3. `fix-admin-oauth.sql` dosyasındaki SQL'i kopyalayın
4. Çalıştırın

Bu script:
- Mevcut kullanıcının admin rolünü kontrol eder
- Admin rolünü ayarlar (`role = 'admin'`, `is_admin = true`)
- Eğer profile yoksa oluşturur

## Admin Email Ekleme

Yeni admin email'leri eklemek için `app/auth/callback/route.ts` dosyasındaki `ADMIN_EMAILS` dizisine ekleyin:

```typescript
const ADMIN_EMAILS = [
  'ftnakras01@gmail.com',
  'yeni-admin@example.com', // Yeni admin email buraya
].map(email => email.toLowerCase());
```

## Test Adımları

1. **SQL Script'i Çalıştırın**
   - Supabase SQL Editor'de `fix-admin-oauth.sql` dosyasını çalıştırın

2. **Google ile Giriş Yapın**
   - `ftnakras01@gmail.com` ile Google OAuth girişi yapın
   - Admin dashboard'a yönlendirilmelisiniz

3. **Admin Kontrolü**
   - Navbar'da "Admin Panel" linki görünmeli
   - Profile dropdown'da admin seçenekleri olmalı

## Sorun Giderme

### OAuth hala başarısız oluyorsa:
1. Supabase Dashboard > Authentication > Providers > Google
2. Google OAuth ayarlarını kontrol edin
3. Redirect URL'lerin doğru olduğundan emin olun: `https://yourdomain.com/auth/callback`

### Admin rolü görünmüyorsa:
1. SQL script'i tekrar çalıştırın
2. Browser cache'ini temizleyin
3. Çıkış yapıp tekrar giriş yapın

### Profile oluşturulmuyorsa:
1. Supabase Dashboard > Database > Tables > user_profiles
2. RLS policies'i kontrol edin
3. `fix-oauth-rls-policies.sql` script'ini çalıştırın

