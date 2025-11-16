# OAuth Provider Kurulum Talimatları

## 📋 GEREKSİNİMLER

Bu proje Google ve GitHub OAuth provider'larını kullanır. Provider'ları aktif etmek için Supabase dashboard'da yapılandırma yapmanız gerekir.

## 🔧 ADIM 1: SUPABASE DASHBOARD'A GİRİŞ

1. [Supabase Dashboard](https://supabase.com/dashboard) açın
2. Projenizi seçin
3. Sol menüden **Authentication** > **Providers** bölümüne gidin

## 🔧 ADIM 2: GOOGLE OAUTH KURULUMU

### 2.1 Google Console'da Uygulama Oluşturma
1. [Google Cloud Console](https://console.cloud.google.com/) açın
2. Yeni proje oluşturun veya mevcut projeyi seçin
3. **APIs & Services** > **Credentials** gidin
4. **+ CREATE CREDENTIALS** > **OAuth client ID** seçin
5. **Application type**: **Web application**
6. **Name**: `Otomasyon Mağazası`
7. **Authorized redirect URIs**:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
8. **CREATE** butonuna tıklayın
9. **Client ID** ve **Client Secret** kopyalayın

### 2.2 Supabase'de Google Provider'ı Aktif Etme
1. Supabase Dashboard > Authentication > Providers
2. **Google** provider'ını bulun
3. **Enable** toggle'ı açın
4. **Client ID** ve **Client Secret** girin
5. **Save** butonuna tıklayın

## 🔧 ADIM 3: GITHUB OAUTH KURULUMU

### 3.1 GitHub'da OAuth App Oluşturma
1. [GitHub](https://github.com) hesabınıza giriş yapın
2. **Settings** > **Developer settings** > **OAuth Apps**
3. **New OAuth App** butonuna tıklayın
4. Formu doldurun:
   - **Application name**: `Otomasyon Mağazası`
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
5. **Register application** butonuna tıklayın
6. **Generate a new client secret** butonuna tıklayın
7. **Client ID** ve **Client Secret** kopyalayın

### 3.2 Supabase'de GitHub Provider'ı Aktif Etme
1. Supabase Dashboard > Authentication > Providers
2. **GitHub** provider'ını bulun
3. **Enable** toggle'ı açın
4. **Client ID** ve **Client Secret** girin
5. **Save** butonuna tıklayın

## 🔧 ADIM 4: ENVIRONMENT VARIABLES KONTROLÜ

`.env.local` dosyanızda şu variable'ların olduğundan emin olun:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Development için
# NEXT_PUBLIC_SITE_URL=https://yourdomain.com  # Production için
```

## 🔧 ADIM 5: REDIRECT URL KONTROLÜ

Supabase'de **Authentication** > **URL Configuration** bölümünde:

1. **Site URL**: `http://localhost:3000` (development) veya `https://yourdomain.com` (production)
2. **Redirect URLs**: `http://localhost:3000/auth/callback` (development) veya `https://yourdomain.com/auth/callback` (production)

## ✅ TEST ETME

Provider'ları kurduktan sonra test edin:

1. Uygulamanızı başlatın: `npm run dev`
2. Kayıt sayfasına gidin: `http://localhost:3000/auth/signup`
3. **Google ile Kayıt Ol** butonuna tıklayın
4. **GitHub ile Kayıt Ol** butonuna tıklayın
5. OAuth akışının çalıştığını doğrulayın

## 🚨 TROUBLESHOOTING

### "Provider is not enabled" Hatası
- Supabase Dashboard'da provider'ın enable edildiğinden emin olun
- Client ID ve Secret'ın doğru girildiğinden emin olun

### "Invalid redirect_uri" Hatası
- Callback URL'in Google Console ve GitHub'da doğru ayarlandığından emin olun
- Supabase project URL'inin doğru olduğundan emin olun

### "No such provider" Hatası
- Provider'ın Supabase'te aktif olduğundan emin olun
- Environment variables'ın doğru set edildiğinden emin olun

## 📞 DESTEK

Sorun yaşarsanız:
1. Supabase loglarını kontrol edin
2. Browser console'da hataları kontrol edin
3. Bu dokümanı tekrar gözden geçirin
