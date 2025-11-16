# 🔐 Google OAuth Configuration Verification

## ✅ Current Configuration

### Supabase Configuration

```toml
[auth.external.google]
enabled = true
client_id = 217437269524-e0atskdseudalqh8cc3a1evv2lgfemqp.apps.googleusercontent.com
secret = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET)"
skip_nonce_check = false
```

## ✅ Configuration Status

### 1. Google OAuth Provider
- ✅ **Enabled**: `true` (OAuth provider aktif)
- ✅ **Client ID**: Set correctly
- ✅ **Client Secret**: Environment variable'dan alınıyor (`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET`)
- ✅ **Skip Nonce Check**: `false` (Güvenlik için doğru - nonce kontrolü aktif)

## 🔧 Required Checks

### 1. Supabase Environment Variable

**Supabase Dashboard → Project Settings → Environment Variables**

- ✅ `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` environment variable set edilmeli
- ✅ Google Cloud Console'dan alınan Client Secret değeri olmalı

### 2. Google Cloud Console Configuration

**Google Cloud Console → APIs & Services → Credentials**

#### OAuth 2.0 Client ID: `217437269524-e0atskdseudalqh8cc3a1evv2lgfemqp.apps.googleusercontent.com`

#### Authorized Redirect URIs:
```
https://your-project.supabase.co/auth/v1/callback
```

**Önemli:** 
- Supabase, OAuth callback'i kendi domain'inde handle eder
- Bu URL, Google Cloud Console'da **Authorized Redirect URIs** listesinde olmalı
- `your-project.supabase.co` yerine gerçek Supabase project URL'inizi kullanın

#### Authorized JavaScript Origins (Optional but recommended):
```
https://otomasyonmagazasi.com
https://www.otomasyonmagazasi.com
https://your-project.supabase.co
```

### 3. Supabase Dashboard - URL Configuration

**Supabase Dashboard → Authentication → URL Configuration**

#### Site URL:
```
https://otomasyonmagazasi.com
```

#### Redirect URLs:
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?*
https://otomasyonmagazasi.com/auth/callback
https://otomasyonmagazasi.com/auth/callback?*
https://www.otomasyonmagazasi.com/auth/callback
https://www.otomasyonmagazasi.com/auth/callback?*
```

## 🚨 Critical Verification Steps

### Step 1: Verify Supabase Environment Variable

1. Go to **Supabase Dashboard → Project Settings → Environment Variables**
2. Check if `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` exists
3. Verify the value matches Google Cloud Console Client Secret

### Step 2: Verify Google Cloud Console Configuration

1. Go to **Google Cloud Console → APIs & Services → Credentials**
2. Find OAuth 2.0 Client ID: `217437269524-e0atskdseudalqh8cc3a1evv2lgfemqp.apps.googleusercontent.com`
3. Verify **Authorized Redirect URIs** includes:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
4. Verify **Authorized JavaScript Origins** includes:
   ```
   https://otomasyonmagazasi.com
   https://www.otomasyonmagazasi.com
   ```

### Step 3: Verify Supabase Dashboard Configuration

1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. Verify **Site URL** is set to: `https://otomasyonmagazasi.com`
3. Verify **Redirect URLs** includes:
   - `http://localhost:3000/auth/callback` (development)
   - `https://otomasyonmagazasi.com/auth/callback` (production)
   - `https://www.otomasyonmagazasi.com/auth/callback` (production with www)

### Step 4: Test Google OAuth Login

1. Go to `https://otomasyonmagazasi.com/auth/signin`
2. Click "Google ile Giriş Yap"
3. Verify redirect to Google OAuth consent screen
4. After consent, verify redirect to `/auth/callback`
5. Verify session is established
6. Verify redirect to dashboard or admin panel

## 🐛 Troubleshooting

### Issue 1: "OAuth girişi başarısız oldu"

**Possible Causes:**
1. `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` environment variable not set
2. Google Cloud Console → Authorized Redirect URI missing
3. Supabase Dashboard → Redirect URLs missing

**Solution:**
1. Check Supabase Dashboard → Environment Variables
2. Check Google Cloud Console → Authorized Redirect URIs
3. Check Supabase Dashboard → Redirect URLs

### Issue 2: "redirect_uri_mismatch" error

**Possible Causes:**
1. Google Cloud Console → Authorized Redirect URI doesn't match Supabase callback URL
2. Supabase project URL changed

**Solution:**
1. Verify Google Cloud Console → Authorized Redirect URI is:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
2. Verify `your-project.supabase.co` is your actual Supabase project URL

### Issue 3: "invalid_client" error

**Possible Causes:**
1. Client ID mismatch
2. Client Secret mismatch
3. Environment variable not set correctly

**Solution:**
1. Verify Client ID matches: `217437269524-e0atskdseudalqh8cc3a1evv2lgfemqp.apps.googleusercontent.com`
2. Verify `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` is set correctly
3. Verify Client Secret matches Google Cloud Console

### Issue 4: "nonce mismatch" error

**Possible Causes:**
1. `skip_nonce_check = false` but nonce validation failing
2. Cookie/session issues

**Solution:**
1. Verify `skip_nonce_check = false` (correct for security)
2. Check browser cookies are enabled
3. Check session storage is working

## ✅ Final Checklist

- [ ] `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` environment variable is set in Supabase
- [ ] Google Cloud Console → Client ID matches: `217437269524-e0atskdseudalqh8cc3a1evv2lgfemqp.apps.googleusercontent.com`
- [ ] Google Cloud Console → Authorized Redirect URI includes: `https://your-project.supabase.co/auth/v1/callback`
- [ ] Google Cloud Console → Authorized JavaScript Origins includes production URLs
- [ ] Supabase Dashboard → Site URL is set to: `https://otomasyonmagazasi.com`
- [ ] Supabase Dashboard → Redirect URLs include production URLs
- [ ] Google OAuth login is tested on production
- [ ] Session is established correctly
- [ ] Redirect to dashboard works correctly

## 📝 Configuration Summary

### Supabase Configuration:
- ✅ Google OAuth Provider: Enabled
- ✅ Client ID: Set
- ✅ Client Secret: Environment variable
- ✅ Skip Nonce Check: false (secure)

### Google Cloud Console:
- ✅ Client ID: `217437269524-e0atskdseudalqh8cc3a1evv2lgfemqp.apps.googleusercontent.com`
- ⚠️ Authorized Redirect URI: Must include `https://your-project.supabase.co/auth/v1/callback`
- ⚠️ Authorized JavaScript Origins: Should include production URLs

### Supabase Dashboard:
- ⚠️ Site URL: Must be `https://otomasyonmagazasi.com`
- ⚠️ Redirect URLs: Must include production URLs

## 🎯 Next Steps

1. **Verify Supabase Environment Variable:**
   - Go to Supabase Dashboard → Project Settings → Environment Variables
   - Verify `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` is set

2. **Verify Google Cloud Console:**
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Verify Authorized Redirect URI includes Supabase callback URL

3. **Verify Supabase Dashboard:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Verify Site URL and Redirect URLs are correct

4. **Test Google OAuth Login:**
   - Go to production site
   - Click "Google ile Giriş Yap"
   - Verify login works correctly

## 📞 Support

If issues persist:

1. Check Supabase Dashboard → Authentication → Logs
2. Check Google Cloud Console → OAuth consent screen
3. Check browser console for errors
4. Check network tab for failed requests
5. Verify all configurations are correct

