# OAuth Provider Kurulum Rehberi

Bu rehber, Supabase'de Google ve GitHub OAuth provider'larını aktif etmek için gerekli adımları içerir.

## Hata Mesajı

Eğer şu hatayı alıyorsanız:
```json
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

Bu, OAuth provider'ın Supabase dashboard'da aktif edilmediği anlamına gelir.

## Google OAuth Kurulumu

### 1. Google Cloud Console'da Proje Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Yeni bir proje oluşturun veya mevcut bir projeyi seçin
3. **APIs & Services** > **Credentials** bölümüne gidin
4. **Create Credentials** > **OAuth client ID** seçin
5. **Application type** olarak **Web application** seçin
6. **Authorized redirect URIs** kısmına şunu ekleyin:
   ```
   https://[PROJECT-REF].supabase.co/auth/v1/callback
   ```
   `[PROJECT-REF]` yerine Supabase proje referansınızı yazın (örnek: `abcdefghijklmnop`)

### 2. Supabase Dashboard'da Google Provider'ı Aktif Etme

1. [Supabase Dashboard](https://app.supabase.com/) adresine gidin
2. Projenizi seçin
3. **Authentication** > **Providers** menüsüne gidin
4. **Google** provider'ını bulun ve **Enable** butonuna tıklayın
5. Google Cloud Console'dan aldığınız **Client ID** ve **Client Secret** değerlerini girin
6. **Save** butonuna tıklayın

## GitHub OAuth Kurulumu

### 1. GitHub'da OAuth App Oluşturma

1. GitHub hesabınıza giriş yapın
2. **Settings** > **Developer settings** > **OAuth Apps** bölümüne gidin
3. **New OAuth App** butonuna tıklayın
4. Aşağıdaki bilgileri doldurun:
   - **Application name**: Projenizin adı (örnek: "Otomasyon Marketi")
   - **Homepage URL**: Web sitenizin URL'i (örnek: `https://yourdomain.com`)
   - **Authorization callback URL**: 
     ```
     https://[PROJECT-REF].supabase.co/auth/v1/callback
     ```
     `[PROJECT-REF]` yerine Supabase proje referansınızı yazın
5. **Register application** butonuna tıklayın
6. **Client ID** ve **Client Secret** değerlerini kopyalayın (Client Secret'i bir daha göremeyeceksiniz!)

### 2. Supabase Dashboard'da GitHub Provider'ı Aktif Etme

1. [Supabase Dashboard](https://app.supabase.com/) adresine gidin
2. Projenizi seçin
3. **Authentication** > **Providers** menüsüne gidin
4. **GitHub** provider'ını bulun ve **Enable** butonuna tıklayın
5. GitHub'dan aldığınız **Client ID** ve **Client Secret** değerlerini girin
6. **Save** butonuna tıklayın

## Redirect URI Kontrolü

Her iki provider için de redirect URI'nin doğru olduğundan emin olun:

```
https://[PROJECT-REF].supabase.co/auth/v1/callback
```

`[PROJECT-REF]` değerini bulmak için:
1. Supabase Dashboard'a gidin
2. Proje ayarlarına gidin
3. **API Settings** bölümünde **Project URL** değerini kontrol edin
4. URL'den proje referansını çıkarın (örnek: `https://abcdefghijklmnop.supabase.co` → `abcdefghijklmnop`)

## Test Etme

Provider'ları aktif ettikten sonra:

1. Uygulamanızda **Sign In** veya **Sign Up** sayfasına gidin
2. **Google ile Giriş Yap** veya **GitHub ile Giriş Yap** butonlarına tıklayın
3. OAuth akışının başarıyla çalıştığını doğrulayın

## Sorun Giderme

### Provider aktif görünüyor ama hala hata alıyorum

1. **Redirect URI'yi kontrol edin**: Google Cloud Console ve GitHub OAuth App ayarlarında redirect URI'nin tam olarak eşleştiğinden emin olun
2. **Client ID ve Secret'ı kontrol edin**: Supabase dashboard'da girilen değerlerin doğru olduğundan emin olun
3. **Cache'i temizleyin**: Tarayıcı cache'ini temizleyip tekrar deneyin
4. **Supabase Dashboard'u yenileyin**: Provider ayarlarını kaydettikten sonra sayfayı yenileyin

### "Invalid redirect URI" hatası

Redirect URI'nin tam olarak eşleşmesi gerekiyor. Şu formatı kullanın:
```
https://[PROJECT-REF].supabase.co/auth/v1/callback
```

Sonunda `/` olmamalı ve `http://` yerine `https://` kullanılmalı.

## Güvenlik Notları

- **Client Secret** değerlerini asla public repository'lere commit etmeyin
- Supabase dashboard'da girilen değerler otomatik olarak şifrelenir ve güvenli bir şekilde saklanır
- OAuth provider'ları sadece production ortamında aktif edin, development için gerekli değilse kapalı tutun

## Ek Kaynaklar

- [Supabase OAuth Dokümantasyonu](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [GitHub OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-github)

