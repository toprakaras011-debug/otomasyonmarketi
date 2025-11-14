# OAuth (Google & GitHub) Kurulum Rehberi

Bu rehber, Supabase'de Google ve GitHub OAuth provider'larını yapılandırmanız için adım adım talimatlar içerir.

## ✅ Kod Tarafı Hazır

OAuth entegrasyonu kod tarafında tamamlandı:
- ✅ `lib/auth.ts` - OAuth fonksiyonları eklendi
- ✅ `app/auth/signin/page.tsx` - OAuth butonları eklendi
- ✅ `app/auth/signup/page.tsx` - OAuth butonları eklendi
- ✅ `app/auth/callback/route.ts` - OAuth callback handler mevcut

## 🔧 Supabase Dashboard Yapılandırması

### 1. Google OAuth Yapılandırması

#### A. Google Cloud Console'da Proje Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
3. **APIs & Services** > **Credentials** bölümüne gidin
4. **Create Credentials** > **OAuth client ID** seçin
5. **Application type**: Web application seçin
6. **Authorized redirect URIs** ekleyin:
   ```
   https://[YOUR-SUPABASE-PROJECT-REF].supabase.co/auth/v1/callback
   ```
   Örnek:
   ```
   https://kizewqavkosvrwfnbxme.supabase.co/auth/v1/callback
   ```
7. **Client ID** ve **Client Secret**'ı kopyalayın

#### B. Supabase Dashboard'da Google Provider'ı Aktifleştirme

1. [Supabase Dashboard](https://app.supabase.com/)'a gidin
2. Projenizi seçin
3. **Authentication** > **Providers** bölümüne gidin
4. **Google** provider'ını bulun ve **Enable** yapın
5. **Client ID** ve **Client Secret**'ı yapıştırın
6. **Save** butonuna tıklayın

### 2. GitHub OAuth Yapılandırması

#### A. GitHub'da OAuth App Oluşturma

1. GitHub hesabınıza gidin
2. **Settings** > **Developer settings** > **OAuth Apps** bölümüne gidin
3. **New OAuth App** butonuna tıklayın
4. Formu doldurun:
   - **Application name**: Otomasyon Mağazası (veya istediğiniz isim)
   - **Homepage URL**: `https://otomasyonmagazasi.com` (veya domain'iniz)
   - **Authorization callback URL**: 
     ```
     https://[YOUR-SUPABASE-PROJECT-REF].supabase.co/auth/v1/callback
     ```
     Örnek:
     ```
     https://kizewqavkosvrwfnbxme.supabase.co/auth/v1/callback
     ```
5. **Register application** butonuna tıklayın
6. **Client ID** ve **Client Secret**'ı kopyalayın (Generate a new client secret butonuna tıklayarak secret oluşturun)

#### B. Supabase Dashboard'da GitHub Provider'ı Aktifleştirme

1. [Supabase Dashboard](https://app.supabase.com/)'a gidin
2. Projenizi seçin
3. **Authentication** > **Providers** bölümüne gidin
4. **GitHub** provider'ını bulun ve **Enable** yapın
5. **Client ID** ve **Client Secret**'ı yapıştırın
6. **Save** butonuna tıklayın

## 🔐 Güvenlik Ayarları

### Redirect URL Kontrolü

Supabase Dashboard'da **Authentication** > **URL Configuration** bölümünde:

1. **Site URL**: Production domain'iniz
   ```
   https://otomasyonmagazasi.com
   ```

2. **Redirect URLs**: Tüm izin verilen redirect URL'leri ekleyin
   ```
   https://otomasyonmagazasi.com/**
   https://www.otomasyonmagazasi.com/**
   http://localhost:3000/** (development için)
   http://localhost:3001/** (development için - alternatif port)
   ```

## 🧪 Test Etme

### Development Ortamında Test

1. `npm run dev` ile development server'ı başlatın
2. `/auth/signin` veya `/auth/signup` sayfasına gidin
3. **Google ile Giriş Yap** veya **GitHub ile Giriş Yap** butonuna tıklayın
4. OAuth provider'ın login sayfasına yönlendirilmelisiniz
5. Giriş yaptıktan sonra `/auth/callback` route'una yönlendirilmelisiniz
6. Başarılı girişten sonra dashboard'a yönlendirilmelisiniz

### Production Ortamında Test

1. Production domain'inizde `/auth/signin` sayfasına gidin
2. OAuth butonlarına tıklayın
3. OAuth akışını tamamlayın
4. Başarılı girişten sonra dashboard'a yönlendirilmelisiniz

## 📝 Notlar

### OAuth Kullanıcı Profilleri

- OAuth ile giriş yapan kullanıcılar için otomatik profil oluşturulur
- Username, email ve metadata'dan otomatik oluşturulur
- Admin email listesindeki kullanıcılar otomatik olarak admin rolü alır

### Callback Route

- `/auth/callback` route'u OAuth callback'lerini işler
- Otomatik profil oluşturma yapar
- Admin rolü ataması yapar
- Redirect işlemlerini yönetir

### Hata Ayıklama

OAuth ile ilgili sorunlar için:

1. Browser console'u kontrol edin
2. Network sekmesinde OAuth isteklerini kontrol edin
3. Supabase Dashboard'da **Authentication** > **Logs** bölümünü kontrol edin
4. Callback route loglarını kontrol edin

## 🚀 Kullanım

### Sign In Sayfası

Kullanıcılar `/auth/signin` sayfasında:
- Google ile giriş yapabilir
- GitHub ile giriş yapabilir
- E-posta/şifre ile giriş yapabilir

### Sign Up Sayfası

Kullanıcılar `/auth/signup` sayfasında:
- Google ile kayıt olabilir
- GitHub ile kayıt olabilir
- E-posta/şifre ile kayıt olabilir

## ✅ Kontrol Listesi

- [ ] Google Cloud Console'da OAuth client oluşturuldu
- [ ] Google OAuth redirect URI eklendi
- [ ] Supabase Dashboard'da Google provider aktif edildi
- [ ] GitHub'da OAuth App oluşturuldu
- [ ] GitHub OAuth callback URL eklendi
- [ ] Supabase Dashboard'da GitHub provider aktif edildi
- [ ] Redirect URLs yapılandırıldı
- [ ] Development ortamında test edildi
- [ ] Production ortamında test edildi

## 🔗 Faydalı Linkler

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [GitHub OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-github)

