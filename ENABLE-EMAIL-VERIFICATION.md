# Email Verification Kurulumu

Email verification sistemi aktif edilmiştir. Yeni kullanıcılar kayıt olduktan sonra e-posta adreslerini doğrulamaları gerekmektedir.

## Supabase Dashboard Ayarları

Email verification'ın çalışması için Supabase Dashboard'da şu ayarı yapmanız gerekmektedir:

### 1. Email Confirmations'ı Aktif Et

1. [Supabase Dashboard](https://app.supabase.com) → Projenizi seçin
2. **Authentication** → **Settings** → **Email Auth** bölümüne gidin
3. **"Enable email confirmations"** seçeneğini **Aktif** yapın
4. Değişiklikleri kaydedin

### 2. Email Template'i Kontrol Et (Opsiyonel)

Email template'ini özelleştirmek isterseniz:
1. **Authentication** → **Email Templates** bölümüne gidin
2. **"Confirm signup"** template'ini düzenleyin
3. Redirect URL'in doğru olduğundan emin olun: `{{ .SiteURL }}/auth/callback`

## Sistem Akışı

### 1. Kullanıcı Kayıt Olur
- Kullanıcı `/auth/signup` sayfasında kayıt olur
- Supabase'e kayıt isteği gönderilir
- Eğer email confirmation aktifse, kullanıcı otomatik giriş yapmaz

### 2. Email Verification Sayfasına Yönlendirilir
- Kayıt başarılı olduktan sonra kullanıcı `/auth/verify-email?email=...` sayfasına yönlendirilir
- Bu sayfada:
  - E-posta gönderildiği bilgisi gösterilir
  - "E-postayı Tekrar Gönder" butonu vardır
  - Kullanıcı e-postasını kontrol etmesi için yönlendirilir

### 3. Kullanıcı Email'deki Linke Tıklar
- Kullanıcı e-postasındaki "E-postayı Doğrula" linkine tıklar
- Link `/auth/callback?code=...&type=signup` şeklinde gelir

### 4. Callback Route İşlemi
- `app/auth/callback/route.ts` callback'i handle eder
- Session oluşturulur (`exchangeCodeForSession`)
- Kullanıcı profili oluşturulur/doğrulanır
- Kullanıcı admin ise `/admin/dashboard`, değilse `/dashboard` sayfasına yönlendirilir

### 5. Kullanıcı Dashboard'a Giriş Yapar
- Session aktif olduğu için kullanıcı direkt dashboard'a giriş yapar
- Artık normal giriş yapabilir

## Önemli Notlar

### Email Verification Zorunlu mu?
- **Evet**, yeni kayıt olan kullanıcılar email doğrulamadan giriş yapamazlar
- Email doğrulamadan önce `supabase.auth.getUser()` `null` döner
- Email doğrulandıktan sonra session aktif olur ve kullanıcı giriş yapabilir

### Email Gönderilmediyse?
- Kullanıcı `/auth/verify-email` sayfasında "E-postayı Tekrar Gönder" butonunu kullanabilir
- `supabase.auth.resend()` fonksiyonu kullanılır
- Rate limiting olabilir (çok fazla istek yapılırsa)

### Email Verification'ı Devre Dışı Bırakmak İsterseniz?
1. Supabase Dashboard'da "Enable email confirmations" seçeneğini **Kapatın**
2. `app/auth/signup/page.tsx` dosyasında `verify-email` yerine `signin` sayfasına yönlendirin
3. `app/auth/callback/route.ts` dosyasında email verification callback'ini güncelleyin

## Test Etme

1. Yeni bir kullanıcı kaydı oluşturun
2. E-posta kutunuzu kontrol edin
3. Email'deki linke tıklayın
4. Otomatik olarak dashboard'a yönlendirilmelisiniz
5. Artık normal giriş yapabilirsiniz

## Sorun Giderme

### Email Gelmiyor
- Spam klasörünü kontrol edin
- Supabase Dashboard'da email settings'i kontrol edin
- Email template'in doğru olduğundan emin olun
- Rate limiting olup olmadığını kontrol edin

### Link Çalışmıyor
- Link'in süresi dolmuş olabilir (genellikle 24 saat)
- Yeni bir doğrulama e-postası isteyin
- Callback URL'in doğru olduğundan emin olun

### Session Oluşmuyor
- Callback route'da `exchangeCodeForSession` başarılı mı kontrol edin
- Browser console'da hata var mı kontrol edin
- Supabase Dashboard'da session'ı kontrol edin

