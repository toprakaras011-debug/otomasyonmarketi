# 🔐 Environment Variables - Critical Checklist

## ✅ Required Environment Variables

`.env.local` dosyasında **MUTLAKA** şu değişkenler olmalı:

```env
# Public Supabase URL and Key (Client-side)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-side Supabase URL and Key (Optional but recommended)
# Note: If not set, NEXT_PUBLIC_ versions will be used
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Site URL (Critical for OAuth redirects and cookie domain)
# Development:
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Production:
# NEXT_PUBLIC_SITE_URL=https://otomasyonmagazasi.com
```

## 🚨 Critical Issues Without These Variables

### 1. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY
- ❌ OAuth callback will fail
- ❌ Session cannot be established
- ❌ User will be redirected to signin page
- ❌ Error: "Sunucu yapılandırma hatası"

### 2. Missing NEXT_PUBLIC_SITE_URL
- ❌ Cookie domain mismatch
- ❌ Session lost after redirect
- ❌ User logged out immediately
- ❌ OAuth redirects may fail

## 📝 Verification Steps

1. **Check .env.local exists:**
   ```bash
   ls -la .env.local
   ```

2. **Verify all variables are set:**
   ```bash
   # In .env.local, ensure these lines exist:
   grep NEXT_PUBLIC_SUPABASE_URL .env.local
   grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local
   grep NEXT_PUBLIC_SITE_URL .env.local
   ```

3. **Restart development server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Start again
   npm run dev
   ```

4. **Check browser console:**
   - Open browser DevTools
   - Check Console tab for errors
   - Check Network tab for failed requests
   - Check Application tab → Cookies for session cookies

## 🔧 Supabase Dashboard Configuration

### URL Configuration:
1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. **Site URL:** `https://otomasyonmagazasi.com` (production)
3. **Redirect URLs:** Add these:
   - `http://localhost:3000/auth/callback` (development)
   - `http://localhost:3000/auth/callback?*` (development)
   - `https://otomasyonmagazasi.com/auth/callback` (production)
   - `https://otomasyonmagazasi.com/auth/callback?*` (production)
   - `https://www.otomasyonmagazasi.com/auth/callback` (production with www)
   - `https://www.otomasyonmagazasi.com/auth/callback?*` (production with www)

## 🎯 OAuth Provider Configuration

### Google OAuth:
1. **Google Cloud Console → APIs & Services → Credentials**
2. **Authorized Redirect URIs:** 
   - `https://your-project.supabase.co/auth/v1/callback`

### GitHub OAuth:
1. **GitHub → Settings → Developer settings → OAuth Apps**
2. **Authorization callback URL:**
   - `https://your-project.supabase.co/auth/v1/callback`

## ✅ Final Checklist

- [ ] `.env.local` file exists
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] `NEXT_PUBLIC_SITE_URL` is set
- [ ] Supabase Dashboard → URL Configuration is correct
- [ ] Supabase Dashboard → Redirect URLs include `/auth/callback`
- [ ] Google OAuth → Redirect URI is set
- [ ] GitHub OAuth → Callback URL is set
- [ ] Development server is restarted
- [ ] OAuth login is tested

## 🐛 Troubleshooting

### Issue: "Session yok gibi → tekrar signin sayfası"
**Solution:** Check `NEXT_PUBLIC_SITE_URL` matches your actual URL

### Issue: "OAuth girişi başarısız oldu"
**Solution:** Check Supabase Dashboard → Redirect URLs

### Issue: "Sunucu yapılandırma hatası"
**Solution:** Check `.env.local` file and restart server

### Issue: "Code exchange failed"
**Solution:** Check `/auth/callback/route.ts` exists and environment variables are set

