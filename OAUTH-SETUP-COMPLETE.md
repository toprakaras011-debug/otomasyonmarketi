# 🔐 OAuth Setup - Complete Guide

## ✅ Kritik Yapılandırma

### 1. Environment Variables (.env.local)

`.env.local` dosyasında **MUTLAKA** şu değişkenler olmalı:

```env
# Public Supabase URL and Key (Client-side)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-side Supabase URL and Key (Optional but recommended)
# Note: If not set, NEXT_PUBLIC_ versions will be used
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Site URL (Critical for OAuth redirects)
# Development:
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Production:
# NEXT_PUBLIC_SITE_URL=https://otomasyonmagazasi.com
```

### 2. Supabase Dashboard - URL Configuration

**Supabase Dashboard → Authentication → URL Configuration** ekranında:

#### Site URL:
```
https://otomasyonmagazasi.com
```
(Production için - Development için: `http://localhost:3000`)

#### Redirect URLs:
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?*
https://otomasyonmagazasi.com/auth/callback
https://otomasyonmagazasi.com/auth/callback?*
https://www.otomasyonmagazasi.com/auth/callback
https://www.otomasyonmagazasi.com/auth/callback?*
```

**Önemli:** Tüm redirect URL'lerini ekleyin (wildcard `*` kullanabilirsiniz).

### 3. Google OAuth Setup

#### Google Cloud Console:
1. **APIs & Services → Credentials** sayfasına gidin
2. **OAuth 2.0 Client ID** oluşturun
3. **Authorized Redirect URIs** bölümüne ekleyin:

```
https://your-project.supabase.co/auth/v1/callback
```

**Not:** Supabase, OAuth callback'i kendi domain'inde handle eder, sonra sizin `/auth/callback` route'unuza yönlendirir.

### 4. GitHub OAuth Setup

#### GitHub Developer Settings:
1. **Settings → Developer settings → OAuth Apps** sayfasına gidin
2. Yeni OAuth App oluşturun
3. **Authorization callback URL** olarak:

```
https://your-project.supabase.co/auth/v1/callback
```

### 5. Supabase Dashboard - OAuth Providers

**Supabase Dashboard → Authentication → Providers** sayfasında:

#### Google:
- ✅ Enable Google provider
- **Client ID (for Google OAuth)**: `217437269524-e0atskdseudalqh8cc3a1evv2lgfemqp.apps.googleusercontent.com`
- **Client Secret (for Google OAuth)**: Environment variable (`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET`)
- **Skip Nonce Check**: `false` (Güvenlik için doğru)

**Not:** Client Secret, Supabase Dashboard → Project Settings → Environment Variables'da set edilmeli.

#### GitHub:
- ✅ Enable GitHub provider
- **Client ID (for GitHub OAuth)**: GitHub'dan alınan Client ID
- **Client Secret (for GitHub OAuth)**: GitHub'dan alınan Client Secret

## 🔧 Yapılandırma Kontrolü

### Server-Side Route Handler

`/auth/callback/route.ts` dosyası oluşturuldu ve şu özelliklere sahip:

- ✅ Server-side cookie-based session management
- ✅ PKCE flow desteği
- ✅ Automatic profile creation
- ✅ Admin role detection
- ✅ Error handling
- ✅ Secure redirects

### Cookie Handling

Supabase server client (`lib/supabase/server.ts`) otomatik olarak:

- ✅ HTTP-only cookies set eder
- ✅ Secure cookies (HTTPS'de)
- ✅ SameSite attribute
- ✅ Cookie domain yönetimi

## 🚨 Yaygın Hatalar ve Çözümleri

### Hata 1: "Session yok gibi → tekrar signin sayfası"

**Sebep:** Cookie domain hatası veya environment variable eksikliği

**Çözüm:**
1. `.env.local` dosyasında `NEXT_PUBLIC_SITE_URL` tanımlı olmalı
2. Supabase Dashboard'da Site URL doğru olmalı
3. Cookie domain'i doğru olmalı (localhost için `localhost`, production için domain)

### Hata 2: "OAuth girişi başarısız oldu"

**Sebep:** Redirect URL yanlış veya Supabase'de tanımlı değil

**Çözüm:**
1. Supabase Dashboard → Authentication → URL Configuration
2. Redirect URLs'e `/auth/callback` ekleyin
3. Google/GitHub OAuth callback URL'leri doğru olmalı

### Hata 3: "Code exchange failed"

**Sebep:** Server-side route handler yok veya yanlış yapılandırılmış

**Çözüm:**
1. `/auth/callback/route.ts` dosyası olmalı
2. `lib/supabase/server.ts` doğru yapılandırılmış olmalı
3. Environment variables doğru olmalı

## 📝 Test Checklist

- [ ] `.env.local` dosyasında tüm environment variables tanımlı
- [ ] Supabase Dashboard'da Site URL doğru
- [ ] Supabase Dashboard'da Redirect URLs doğru
- [ ] Google OAuth Client ID/Secret doğru
- [ ] GitHub OAuth Client ID/Secret doğru
- [ ] Google Cloud Console'da Redirect URI doğru
- [ ] GitHub Developer Settings'de Callback URL doğru
- [ ] `/auth/callback/route.ts` dosyası var
- [ ] `lib/supabase/server.ts` doğru yapılandırılmış
- [ ] Cookie handling çalışıyor
- [ ] OAuth login test edildi

## 🎯 Sonuç

Tüm yapılandırmalar tamamlandığında:

1. ✅ OAuth login çalışır
2. ✅ Session cookie'lerde saklanır
3. ✅ Automatic profile creation çalışır
4. ✅ Admin role detection çalışır
5. ✅ Secure redirects çalışır

## 📞 Destek

Sorun devam ederse:

1. Browser console'da hataları kontrol edin
2. Network tab'da OAuth callback isteklerini kontrol edin
3. Supabase Dashboard → Authentication → Logs bölümünü kontrol edin
4. Server logs'ları kontrol edin

