# Supabase OAuth (Google) Yapılandırma Rehberi

## Sorun
Google OAuth ile giriş yaparken "OAuth girişi başarısız oldu" hatası alınıyor.

## Çözüm Adımları

### 1. Supabase Dashboard'da Google OAuth Ayarları

1. **Supabase Dashboard** > **Authentication** > **Providers** > **Google** sayfasına gidin

2. **Google Provider'ı Aktifleştirin:**
   - ✅ Enable Google provider
   - Client ID (Google Cloud Console'dan)
   - Client Secret (Google Cloud Console'dan)

3. **Redirect URL'leri Kontrol Edin:**
   - Supabase otomatik olarak şu URL'leri ekler:
     - `https://[your-project-ref].supabase.co/auth/v1/callback`
   - **ÖNEMLİ:** Bu URL Google Cloud Console'da da olmalı!

### 2. Google Cloud Console Ayarları

1. **Google Cloud Console** > **APIs & Services** > **Credentials** sayfasına gidin

2. **OAuth 2.0 Client ID'nizi seçin**

3. **Authorized redirect URIs** bölümüne şu URL'leri ekleyin:
   ```
   https://[your-project-ref].supabase.co/auth/v1/callback
   https://www.otomasyonmagazasi.com/auth/callback
   http://localhost:3000/auth/callback (development için)
   ```

4. **Authorized JavaScript origins** bölümüne şu URL'leri ekleyin:
   ```
   https://[your-project-ref].supabase.co
   https://www.otomasyonmagazasi.com
   http://localhost:3000 (development için)
   ```

### 3. Supabase Site URL Kontrolü

1. **Supabase Dashboard** > **Authentication** > **URL Configuration** sayfasına gidin

2. **Site URL** şu şekilde olmalı:
   ```
   https://www.otomasyonmagazasi.com
   ```

3. **Redirect URLs** bölümüne şu URL'leri ekleyin:
   ```
   https://www.otomasyonmagazasi.com/auth/callback
   https://www.otomasyonmagazasi.com/auth/signin
   https://www.otomasyonmagazasi.com/auth/signup
   http://localhost:3000/auth/callback (development için)
   ```

### 4. Environment Variables Kontrolü

Vercel'de veya `.env.local` dosyasında şu değişkenlerin olduğundan emin olun:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
NEXT_PUBLIC_SITE_URL=https://www.otomasyonmagazasi.com
```

### 5. Test Adımları

1. **Google OAuth'u test edin:**
   - Siteye gidin
   - "Google ile Giriş Yap" butonuna tıklayın
   - Google consent sayfasında "İzin Ver" butonuna tıklayın
   - Callback sayfasına yönlendirilmelisiniz

2. **Hata durumunda:**
   - Browser console'u açın (F12)
   - Network tab'inde `/auth/callback` isteğini kontrol edin
   - Response'da hata mesajını kontrol edin
   - Supabase Dashboard > Logs > Auth Logs bölümünü kontrol edin

### 6. Yaygın Hatalar ve Çözümleri

#### "Invalid redirect_uri"
- **Sebep:** Google Cloud Console'da redirect URI eksik veya yanlış
- **Çözüm:** Google Cloud Console'da redirect URI'yi ekleyin

#### "Code already used"
- **Sebep:** OAuth code'u zaten kullanılmış
- **Çözüm:** Tekrar giriş yapmayı deneyin

#### "Invalid code"
- **Sebep:** Code süresi dolmuş veya geçersiz
- **Çözüm:** Tekrar giriş yapmayı deneyin

#### "Missing environment variables"
- **Sebep:** Supabase URL veya key eksik
- **Çözüm:** Environment variables'ı kontrol edin

### 7. Debug İçin Log Kontrolü

Vercel'de veya local'de logları kontrol edin:

```bash
# Vercel'de
vercel logs

# Local'de
npm run dev
# Console'da OAuth callback loglarını kontrol edin
```

## Hala Sorun Varsa

1. Supabase Dashboard > Logs > Auth Logs'u kontrol edin
2. Browser console'da hata mesajlarını kontrol edin
3. Network tab'inde `/auth/callback` request'ini inceleyin
4. Supabase support'a başvurun

