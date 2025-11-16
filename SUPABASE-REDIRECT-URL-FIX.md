# Supabase Redirect URL Düzeltmesi

## Sorun
Site `https://www.otomasyonmagazasi.com` kullanıyor ama Supabase Redirect URLs'de sadece `www` olmayan versiyon var.

## Çözüm

### Supabase Dashboard'da Eklenecek URL'ler

**Authentication > URL Configuration > Redirect URLs** bölümüne şu URL'leri ekleyin:

```
https://www.otomasyonmagazasi.com/auth/callback
https://www.otomasyonmagazasi.com/auth/signin
https://www.otomasyonmagazasi.com/auth/signup
```

**Mevcut URL'ler (bunlar zaten var, silmeyin):**
- ✅ `https://otomasyonmagazasi.com/auth/callback` (www olmayan versiyon)
- ✅ `https://otomasyonmagazasi.vercel.app/auth/callback` (Vercel preview)
- ✅ `https://otomasyonmagazasi.com.supabase.co/auth/v1/callback` (Supabase callback)

### Google Cloud Console'da da Eklenecek URL'ler

**Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client ID**

**Authorized redirect URIs** bölümüne şu URL'leri ekleyin:

```
https://[your-project-ref].supabase.co/auth/v1/callback
https://www.otomasyonmagazasi.com/auth/callback
https://otomasyonmagazasi.com/auth/callback
```

**Authorized JavaScript origins** bölümüne şu URL'leri ekleyin:

```
https://[your-project-ref].supabase.co
https://www.otomasyonmagazasi.com
https://otomasyonmagazasi.com
```

## Önemli Not

`www.otomasyonmagazasi.com` ve `otomasyonmagazasi.com` farklı domain'ler olarak algılanır. Her ikisi de eklenmelidir.

## Test

1. Supabase'de URL'leri ekleyin
2. Google Cloud Console'da URL'leri ekleyin
3. 2-3 dakika bekleyin (değişikliklerin yayılması için)
4. Google ile giriş yapmayı tekrar deneyin

