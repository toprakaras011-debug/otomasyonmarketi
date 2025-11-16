# 🔧 OAuth Giriş Sorunları - Troubleshooting Rehberi

## ❌ Hata: "Giriş bağlantısı geçersiz veya süresi dolmuş"

Bu hata, OAuth code exchange'in başarısız olduğunu gösterir. Kullanıcı Supabase'de oluşturulmuş olabilir ama session kurulamıyor.

## 🔍 Olası Nedenler ve Çözümler

### 1. Supabase URL Yapılandırması Yanlış

**Kontrol:**
- Supabase Dashboard > Authentication > URL Configuration
- Site URL: `https://www.otomasyonmagazasi.com` olmalı
- Redirect URLs: `https://www.otomasyonmagazasi.com/auth/callback` olmalı

**Çözüm:**
- `SUPABASE-URL-CONFIG-FIX.md` dosyasındaki adımları takip edin

### 2. OAuth Provider (Google/GitHub) Ayarları Yanlış

**Google Cloud Console:**
- APIs & Services > Credentials > OAuth 2.0 Client IDs
- Authorized redirect URIs'de şu URL'ler olmalı:
  - `https://kizewqavkosvrwfnbxme.supabase.co/auth/v1/callback`
  - `https://www.otomasyonmagazasi.com/auth/callback`

**GitHub:**
- Settings > Developer settings > OAuth Apps
- Authorization callback URL: `https://kizewqavkosvrwfnbxme.supabase.co/auth/v1/callback`

### 3. Code Expire Oluyor (Çok Yavaş Callback)

**Neden:**
- OAuth code'ları genellikle 1-5 dakika içinde expire olur
- Callback route çok yavaş çalışıyorsa code expire olabilir

**Çözüm:**
- Browser console'da `[DEBUG] callback/route.ts` loglarını kontrol edin
- Code exchange'in ne kadar sürdüğünü kontrol edin
- Network latency'yi kontrol edin

### 4. Code Zaten Kullanılmış

**Neden:**
- Kullanıcı OAuth butonuna iki kez tıkladı
- Sayfa refresh edildi
- Code zaten exchange edilmiş

**Çözüm:**
- OAuth butonuna tıklandığında butonu disable edin (zaten yapılıyor)
- Code'un sadece bir kez kullanılabilir olduğunu unutmayın

### 5. Kullanıcı Zaten Oluşturulmuş Ama Session Kurulamıyor

**Durum:**
- OAuth provider (Google/GitHub) kullanıcıyı başarıyla oluşturdu
- Callback route'a code geldi
- Code exchange başarısız oldu (expired/invalid)
- Kullanıcı `auth.users` tablosunda var ama session yok

**Çözüm:**
1. **Normal Giriş Yap:** Eğer kullanıcı daha önce şifre ayarlamışsa, normal giriş yapabilir
2. **OAuth ile Tekrar Giriş:** Yeni bir code üretmek için OAuth ile tekrar giriş yapın
3. **Şifre Sıfırlama:** Eğer şifre yoksa, şifre sıfırlama isteği gönderin

## 🛠️ Debug Adımları

### 1. Browser Console'u Kontrol Edin

```javascript
// Console'da şu logları arayın:
[DEBUG] callback/route.ts - Exchange code error
[DEBUG] callback/route.ts - Code expired/used
```

### 2. Network Tab'ı Kontrol Edin

- Network tab'ında `/auth/callback` request'ini bulun
- Response'u kontrol edin
- Error message'ı okuyun

### 3. Supabase Logs'u Kontrol Edin

- Supabase Dashboard > Logs > Auth Logs
- OAuth callback'lerini kontrol edin
- Error message'ları okuyun

### 4. Code Exchange Timing'i Kontrol Edin

```typescript
// callback/route.ts'de timing logları:
console.log('[DEBUG] callback/route.ts - Code received at:', new Date().toISOString());
console.log('[DEBUG] callback/route.ts - Code exchange started at:', new Date().toISOString());
console.log('[DEBUG] callback/route.ts - Code exchange completed at:', new Date().toISOString());
```

## ✅ Hızlı Çözümler

### Çözüm 1: OAuth ile Tekrar Giriş Yap
1. Signin sayfasına gidin
2. "Google ile Giriş Yap" veya "GitHub ile Giriş Yap" butonuna tıklayın
3. Yeni bir code üretilecek ve session kurulacak

### Çözüm 2: Normal Giriş Yap
1. Eğer daha önce şifre ayarladıysanız:
   - Signin sayfasına gidin
   - E-posta ve şifre ile giriş yapın

### Çözüm 3: Şifre Sıfırlama
1. Eğer şifre yoksa:
   - "Şifremi Unuttum" linkine tıklayın
   - E-posta adresinizi girin
   - Şifre sıfırlama linkine tıklayın
   - Yeni şifre belirleyin

## 📊 OAuth Flow Diyagramı

```
1. Kullanıcı "Google ile Giriş Yap" butonuna tıklar
   ↓
2. signInWithGoogle() çağrılır
   ↓
3. Supabase OAuth URL'i oluşturulur
   ↓
4. Kullanıcı Google'a yönlendirilir
   ↓
5. Google kullanıcıyı doğrular
   ↓
6. Google, Supabase'e code gönderir
   ↓
7. Supabase, kullanıcıyı /auth/callback'e yönlendirir (code ile)
   ↓
8. Callback route code'u alır
   ↓
9. exchangeCodeForSession(code) çağrılır
   ↓
10. Session kurulur ve kullanıcı yönlendirilir
```

**Sorun genellikle 9. adımda oluyor:**
- Code expired
- Code invalid
- Code already used
- Network error

## 🔐 Güvenlik Notları

1. **Code'lar tek kullanımlıktır:** Bir code sadece bir kez kullanılabilir
2. **Code'lar kısa süreli geçerlidir:** Genellikle 1-5 dakika
3. **HTTPS zorunludur:** Production'da mutlaka HTTPS kullanın
4. **Redirect URL'ler doğru olmalı:** Supabase ve OAuth provider'da eşleşmeli

## 📞 Destek

Eğer sorun devam ederse:
1. Browser console loglarını paylaşın
2. Network tab'ındaki request/response'ları paylaşın
3. Supabase Auth Logs'u kontrol edin
4. OAuth provider (Google/GitHub) ayarlarını kontrol edin

