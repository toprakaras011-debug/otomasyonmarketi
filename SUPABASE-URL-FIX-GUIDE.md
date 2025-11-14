# 🔧 Supabase URL Yapılandırması - Adım Adım Rehber

## 🎯 Sorun
OAuth code exchange başarısız oluyor çünkü Supabase'deki redirect URL'ler kodumuzla eşleşmiyor.

## ✅ Çözüm Adımları

### 1. Supabase Dashboard'a Giriş Yapın
- https://supabase.com/dashboard adresine gidin
- Projenizi seçin: `kizewqavkosvrwfnbxme`

### 2. Authentication > URL Configuration'a Gidin
- Sol menüden **Authentication** seçin
- **URL Configuration** sekmesine tıklayın

### 3. Site URL'i Düzeltin
**Mevcut:** `https://www.otomasyoni` (eksik)  
**Yeni:** `https://www.otomasyonmagazasi.com`

**Adımlar:**
1. "Site URL" alanını bulun
2. Mevcut değeri silin: `https://www.otomasyoni`
3. Yeni değeri yazın: `https://www.otomasyonmagazasi.com`
4. **"Save changes"** butonuna tıklayın

### 4. Redirect URL'leri Güncelleyin

**Mevcut Durum:**
- ❌ `https://www.otomasyonmagazasi.com` (path eksik)
- ✅ `https://kizewqavkosvrwfnbxme.supabase.co/auth/v1/callback` (bu kalmalı)

**Yapılacaklar:**

1. **Eksik path'i olan URL'i silin:**
   - `https://www.otomasyonmagazasi.com` URL'inin yanındaki checkbox'ı işaretleyin
   - Sil butonuna tıklayın

2. **Doğru URL'leri ekleyin:**
   - **"Add URL"** butonuna tıklayın
   - Şu URL'leri tek tek ekleyin:

   ```
   https://www.otomasyonmagazasi.com/auth/callback
   ```

   - Tekrar **"Add URL"** butonuna tıklayın:
   
   ```
   https://otomasyonmagazasi.com/auth/callback
   ```

   - (Opsiyonel) Development için:
   
   ```
   http://localhost:3000/auth/callback
   ```

3. **"Save changes"** butonuna tıklayın

### 5. Son Durum Kontrolü

**Site URL:**
```
https://www.otomasyonmagazasi.com
```

**Redirect URLs (Toplam 3-4 adet olmalı):**
```
✅ https://kizewqavkosvrwfnbxme.supabase.co/auth/v1/callback
✅ https://www.otomasyonmagazasi.com/auth/callback
✅ https://otomasyonmagazasi.com/auth/callback
✅ http://localhost:3000/auth/callback (opsiyonel)
```

## 🔍 Neden Bu URL'ler?

Kodumuz şu şekilde redirect URL oluşturuyor:
```typescript
const redirectTo = `${siteUrl}/auth/callback`;
```

Bu yüzden Supabase'de de `/auth/callback` path'i olmalı.

## ⚠️ Önemli Notlar

1. **Path Zorunlu:** `/auth/callback` path'i mutlaka olmalı
2. **www ve non-www:** Her iki versiyonu da ekleyin
3. **Wildcard Alternatifi:** İsterseniz wildcard kullanabilirsiniz:
   ```
   https://*.otomasyonmagazasi.com/auth/callback
   ```
   Bu hem `www` hem de `www` olmayan versiyonları kapsar.

## 🧪 Test

URL'leri düzelttikten sonra:

1. Browser cache'ini temizleyin (Ctrl+Shift+Delete)
2. OAuth girişini test edin:
   - Signin sayfasına gidin
   - "Google ile Giriş Yap" butonuna tıklayın
   - Google'da giriş yapın
   - Callback'e dönüp session kurulduğunu kontrol edin

3. Browser console'da logları kontrol edin:
   ```
   [DEBUG] callback/route.ts - Session exchanged successfully
   ```

## 🐛 Hala Sorun Varsa

1. **Google Cloud Console'u kontrol edin:**
   - APIs & Services > Credentials > OAuth 2.0 Client IDs
   - Authorized redirect URIs'de şu URL olmalı:
     ```
     https://kizewqavkosvrwfnbxme.supabase.co/auth/v1/callback
     ```

2. **GitHub OAuth App'i kontrol edin:**
   - Settings > Developer settings > OAuth Apps
   - Authorization callback URL:
     ```
     https://kizewqavkosvrwfnbxme.supabase.co/auth/v1/callback
     ```

3. **Browser console loglarını kontrol edin:**
   - `[DEBUG] callback/route.ts - Exchange code error` loglarını arayın
   - Error message'ı not edin

## ✅ Kontrol Listesi

- [ ] Site URL: `https://www.otomasyonmagazasi.com` olarak ayarlandı
- [ ] Eski redirect URL (`https://www.otomasyonmagazasi.com`) silindi
- [ ] Yeni redirect URL (`https://www.otomasyonmagazasi.com/auth/callback`) eklendi
- [ ] www olmayan versiyon (`https://otomasyonmagazasi.com/auth/callback`) eklendi
- [ ] Supabase callback URL korundu
- [ ] Değişiklikler kaydedildi
- [ ] Browser cache temizlendi
- [ ] OAuth girişi test edildi

## 📞 Destek

Eğer hala sorun varsa:
1. Browser console loglarını paylaşın
2. Supabase Auth Logs'u kontrol edin
3. Network tab'ında `/auth/callback` request'ini inceleyin

