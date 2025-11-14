# Cache Temizleme Rehberi

Giriş yapamama sorunu genellikle tarayıcı veya CDN cache'inden kaynaklanır. Aşağıdaki adımları takip edin:

## 1. Tarayıcı Cache Temizleme

### Chrome/Edge:
1. `Ctrl + Shift + Delete` (Windows) veya `Cmd + Shift + Delete` (Mac)
2. "Cached images and files" seçeneğini işaretleyin
3. "Time range" → "All time" seçin
4. "Clear data" butonuna tıklayın

### Hard Refresh (Önerilen):
- **Windows/Linux**: `Ctrl + Shift + R` veya `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### Gizli Mod (Incognito):
- Yeni bir gizli pencere açın ve tekrar deneyin
- Bu, cache sorunlarını tamamen bypass eder

## 2. Service Worker Temizleme

1. Chrome DevTools'u açın (`F12`)
2. "Application" sekmesine gidin
3. Sol menüden "Service Workers" seçin
4. "Unregister" butonuna tıklayın
5. Sayfayı yenileyin

## 3. Cookies ve Local Storage Temizleme

1. Chrome DevTools'u açın (`F12`)
2. "Application" sekmesine gidin
3. Sol menüden "Cookies" → `https://www.otomasyonmagazasi.com` seçin
4. Tüm cookie'leri silin
5. "Local Storage" → `https://www.otomasyonmagazasi.com` seçin
6. Tüm local storage verilerini silin
7. Sayfayı yenileyin

## 4. Vercel CDN Cache Temizleme

Eğer Vercel kullanıyorsanız:

1. Vercel Dashboard'a gidin
2. Projenizi seçin
3. "Deployments" sekmesine gidin
4. En son deployment'ı bulun
5. "Redeploy" butonuna tıklayın (bu cache'i temizler)

Veya:
- Vercel CLI ile: `vercel --prod --force`

## 5. Supabase Session Kontrolü

1. Chrome DevTools'u açın (`F12`)
2. "Application" sekmesine gidin
3. "Cookies" → `https://www.otomasyonmagazasi.com` seçin
4. `sb-*-auth-token` cookie'sini kontrol edin
5. Eğer varsa, silin ve tekrar giriş yapmayı deneyin

## 6. Network Tab Kontrolü

1. Chrome DevTools'u açın (`F12`)
2. "Network" sekmesine gidin
3. "Disable cache" seçeneğini işaretleyin
4. Sayfayı yenileyin (`F5`)
5. Giriş yapmayı deneyin

## 7. Console Hatalarını Kontrol Etme

1. Chrome DevTools'u açın (`F12`)
2. "Console" sekmesine gidin
3. Giriş yapmayı deneyin
4. Hata mesajlarını kontrol edin
5. Özellikle şu hatalara dikkat edin:
   - `401 Unauthorized`
   - `403 Forbidden`
   - `Network Error`
   - `CORS Error`

## 8. Environment Variables Kontrolü

Eğer local'de çalışıyorsa production'da çalışmıyorsa:

1. Vercel Dashboard → Settings → Environment Variables
2. Şu değişkenlerin doğru olduğundan emin olun:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 9. Browser Extension Sorunları

Bazı browser extension'ları (ad blocker, privacy extension) giriş işlemini engelleyebilir:

1. Tüm extension'ları devre dışı bırakın
2. Gizli modda tekrar deneyin
3. Eğer çalışırsa, extension'ları tek tek aktif ederek sorunlu olanı bulun

## 10. DNS Cache Temizleme

Eğer hala sorun varsa:

### Windows:
```cmd
ipconfig /flushdns
```

### Mac/Linux:
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

## Hızlı Çözüm (Önerilen)

1. **Hard Refresh**: `Ctrl + Shift + R` (Windows) veya `Cmd + Shift + R` (Mac)
2. **Gizli Mod**: Yeni bir gizli pencere açın
3. **Cookies Temizle**: DevTools → Application → Cookies → Clear All
4. **Tekrar Deneyin**: Giriş yapmayı tekrar deneyin

## Sorun Devam Ederse

1. Console'daki hata mesajlarını kontrol edin
2. Network tab'da failed request'leri kontrol edin
3. Supabase Dashboard'da user'ın gerçekten var olduğunu kontrol edin
4. Email ve şifrenin doğru olduğundan emin olun

