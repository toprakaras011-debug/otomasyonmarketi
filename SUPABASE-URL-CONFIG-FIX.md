# 🔧 Supabase URL Yapılandırma Düzeltmesi

## ❌ Mevcut Sorunlar

### 1. Site URL Eksik
- **Şu anki:** `https://www.otomasyoni`
- **Olması gereken:** `https://www.otomasyonmagazasi.com`

### 2. Redirect URL'lerde Path Eksik
- **Şu anki:** `https://www.otomasyonmagazasi.com`
- **Olması gereken:** `https://www.otomasyonmagazasi.com/auth/callback`

## ✅ Düzeltme Adımları

### Supabase Dashboard'da Yapılacaklar:

1. **Site URL'i Düzelt:**
   - Supabase Dashboard > Authentication > URL Configuration
   - "Site URL" alanına: `https://www.otomasyonmagazasi.com` yazın
   - "Save changes" butonuna tıklayın

2. **Redirect URL'leri Güncelle:**
   - "Redirect URLs" bölümünde mevcut `https://www.otomasyonmagazasi.com` URL'ini silin
   - "Add URL" butonuna tıklayın
   - Şu URL'leri ekleyin (her biri için ayrı ayrı):
     - ✅ `https://www.otomasyonmagazasi.com/auth/callback`
     - ✅ `https://otomasyonmagazasi.com/auth/callback` (www olmayan versiyon)
     - ✅ `http://localhost:3000/auth/callback` (development için - opsiyonel)

3. **Mevcut URL'ler:**
   - ✅ `https://kizewqavkosvrwfnbxme.supabase.co/auth/v1/callback` - Bu kalmalı (Supabase'in kendi callback'i)

## 📋 Son Durum (Olması Gereken)

### Site URL:
```
https://www.otomasyonmagazasi.com
```

### Redirect URLs:
```
✅ https://kizewqavkosvrwfnbxme.supabase.co/auth/v1/callback
✅ https://www.otomasyonmagazasi.com/auth/callback
✅ https://otomasyonmagazasi.com/auth/callback
✅ http://localhost:3000/auth/callback (development - opsiyonel)
```

## ⚠️ Önemli Notlar

1. **Path Zorunlu:** Redirect URL'lerde `/auth/callback` path'i mutlaka olmalı. Kodumuz bu path'i kullanıyor:
   ```typescript
   const redirectTo = `${window.location.origin}/auth/callback`;
   ```

2. **www ve non-www:** Her iki versiyonu da ekleyin çünkü kullanıcılar farklı şekillerde siteye girebilir.

3. **Wildcard Kullanımı:** İsterseniz wildcard kullanabilirsiniz:
   ```
   https://*.otomasyonmagazasi.com/auth/callback
   ```
   Bu hem `www` hem de `www` olmayan versiyonları kapsar.

4. **Değişikliklerin Etkisi:** URL'leri değiştirdikten sonra OAuth girişleri düzgün çalışmalı. Eğer hala sorun varsa:
   - Browser cache'ini temizleyin
   - OAuth provider (Google/GitHub) ayarlarını da kontrol edin

## 🔍 Kontrol Listesi

- [ ] Site URL: `https://www.otomasyonmagazasi.com` olarak ayarlandı
- [ ] Redirect URL: `https://www.otomasyonmagazasi.com/auth/callback` eklendi
- [ ] Redirect URL: `https://otomasyonmagazasi.com/auth/callback` eklendi (opsiyonel ama önerilir)
- [ ] Supabase callback URL korundu: `https://kizewqavkosvrwfnbxme.supabase.co/auth/v1/callback`
- [ ] Değişiklikler kaydedildi
- [ ] OAuth girişi test edildi

