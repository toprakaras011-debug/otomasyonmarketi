# Acil Durum Kontrol Listesi

## Dün Çalışıyordu, Bugün Çalışmıyor - Hızlı Kontrol

### 1. Vercel Deployment Kontrolü

1. **Vercel Dashboard** > **Project** > **Deployments** sayfasına gidin
2. Son deployment'ın durumunu kontrol edin:
   - ✅ **Ready** (yeşil) - Başarılı
   - ❌ **Error** (kırmızı) - Hata var, logları kontrol edin
   - ⏳ **Building** - Hala build ediliyor

3. **Eğer hata varsa:**
   - Deployment'a tıklayın
   - **Functions Logs** veya **Build Logs** bölümünü kontrol edin
   - Hata mesajını not edin

### 2. Environment Variables Kontrolü

**Vercel Dashboard** > **Project** > **Settings** > **Environment Variables**

Şu değişkenlerin olduğundan emin olun:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_SITE_URL` (opsiyonel)

**Eğer eksikse:**
- Değişkenleri ekleyin
- **Redeploy** yapın (Deployments > ... > Redeploy)

### 3. Supabase Bağlantı Kontrolü

1. **Supabase Dashboard** > **Settings** > **API** sayfasına gidin
2. **Project URL** ve **anon public key** değerlerini kontrol edin
3. Vercel'deki environment variables ile karşılaştırın

### 4. Browser Console Kontrolü

1. Siteye gidin (`https://www.otomasyonmagazasi.com`)
2. **F12** tuşuna basın (Developer Tools)
3. **Console** tab'ını açın
4. Kırmızı hataları kontrol edin:
   - `NEXT_PUBLIC_SUPABASE_URL is not defined`
   - `Failed to fetch`
   - `Network error`

### 5. Network Tab Kontrolü

1. **F12** > **Network** tab
2. Sayfayı yenileyin (F5)
3. Kırmızı (failed) istekleri kontrol edin:
   - `/api/` endpoint'leri
   - Supabase istekleri

### 6. Hızlı Test

**Browser Console'da şunu çalıştırın:**

```javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Site URL:', process.env.NEXT_PUBLIC_SITE_URL);
```

**Eğer `undefined` görüyorsanız:**
- Environment variables eksik veya yanlış yapılandırılmış

### 7. Vercel Log Kontrolü

**Vercel Dashboard** > **Project** > **Deployments** > **Son Deployment** > **Functions Logs**

Son 1 saatteki hataları kontrol edin:
- `Missing environment variables`
- `Supabase connection error`
- `Build failed`

### 8. Supabase Log Kontrolü

**Supabase Dashboard** > **Logs** > **Auth Logs**

Son 1 saatteki hataları kontrol edin:
- `Invalid API key`
- `Connection timeout`
- `Rate limit exceeded`

## Yaygın Sorunlar ve Çözümleri

### Sorun 1: "NEXT_PUBLIC_SUPABASE_URL is not defined"
**Çözüm:**
1. Vercel'de environment variable'ı ekleyin
2. Redeploy yapın

### Sorun 2: "Failed to fetch" veya Network Error
**Çözüm:**
1. Supabase Dashboard'da project'in aktif olduğunu kontrol edin
2. API key'lerin doğru olduğunu kontrol edin
3. Supabase'in down olmadığını kontrol edin: https://status.supabase.com

### Sorun 3: Build Failed
**Çözüm:**
1. Vercel Dashboard > Deployments > Build Logs'u kontrol edin
2. Hata mesajını okuyun
3. Genellikle dependency sorunu veya TypeScript hatası

### Sorun 4: OAuth Çalışmıyor
**Çözüm:**
1. Supabase > Authentication > URL Configuration'ı kontrol edin
2. Google Cloud Console > Redirect URIs'yi kontrol edin
3. `www` versiyonunun eklendiğinden emin olun

## Acil Çözüm: Redeploy

Eğer hiçbir şey çalışmıyorsa:

1. **Vercel Dashboard** > **Deployments**
2. Son başarılı deployment'ı bulun
3. **...** > **Redeploy** yapın
4. 2-3 dakika bekleyin

## Hala Çalışmıyorsa

1. Browser cache'ini temizleyin (Ctrl+Shift+Delete)
2. Incognito/Private mode'da test edin
3. Vercel support'a başvurun
4. Supabase support'a başvurun

