# 🌐 Production URL Configuration - otomasyonmagazasi.com

## ✅ Production Site URL

**Site URL:** `https://otomasyonmagazasi.com`

## 🔧 Environment Variables

### Production Environment (`.env.production` or Vercel Environment Variables)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://otomasyonmagazasi.com
```

### Development Environment (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 📝 Supabase Dashboard Configuration

### URL Configuration:
1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. **Site URL:** `https://otomasyonmagazasi.com`
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
2. **OAuth 2.0 Client ID:** `217437269524-e0atskdseudalqh8cc3a1evv2lgfemqp.apps.googleusercontent.com`
3. **Authorized Redirect URIs:** 
   - `https://your-project.supabase.co/auth/v1/callback`
   - ✅ This is already configured (Supabase handles OAuth callback)
4. **Authorized JavaScript Origins:**
   - `https://otomasyonmagazasi.com`
   - `https://www.otomasyonmagazasi.com`
   - `https://your-project.supabase.co`

**Not:** `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` environment variable Supabase Dashboard'da set edilmeli.

### GitHub OAuth:
1. **GitHub → Settings → Developer settings → OAuth Apps**
2. **Authorization callback URL:**
   - `https://your-project.supabase.co/auth/v1/callback`
   - ✅ This is already configured (Supabase handles OAuth callback)

## 🚀 Vercel Deployment

### Environment Variables in Vercel:

1. Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key`
   - `NEXT_PUBLIC_SITE_URL` = `https://otomasyonmagazasi.com`

### Production Deployment:

```bash
# Deploy to Vercel
vercel --prod

# Or push to main branch (if connected to GitHub)
git push origin main
```

## ✅ Checklist

- [ ] `.env.production` file exists with production URL
- [ ] Vercel environment variables are set
- [ ] Supabase Dashboard → Site URL is set to `https://otomasyonmagazasi.com`
- [ ] Supabase Dashboard → Redirect URLs include production URLs
- [ ] Google OAuth → Redirect URI is set (Supabase callback)
- [ ] GitHub OAuth → Callback URL is set (Supabase callback)
- [ ] Production deployment is tested
- [ ] OAuth login is tested on production

## 🐛 Troubleshooting

### Issue: "OAuth girişi başarısız oldu" on production
**Solution:** 
1. Check Supabase Dashboard → Redirect URLs include `https://otomasyonmagazasi.com/auth/callback`
2. Check Vercel environment variables are set correctly
3. Check `NEXT_PUBLIC_SITE_URL` is set to `https://otomasyonmagazasi.com`

### Issue: "Session yok gibi → tekrar signin sayfası" on production
**Solution:**
1. Check `NEXT_PUBLIC_SITE_URL` matches production URL
2. Check cookie domain is correct (should be `.otomasyonmagazasi.com`)
3. Check HTTPS is enabled (required for secure cookies)

### Issue: "Cookie domain mismatch"
**Solution:**
1. Ensure `NEXT_PUBLIC_SITE_URL` is set to `https://otomasyonmagazasi.com`
2. Check Supabase Dashboard → Site URL matches production URL
3. Restart Vercel deployment

## 📞 Support

If issues persist:

1. Check Vercel logs for errors
2. Check Supabase Dashboard → Authentication → Logs
3. Check browser console for errors
4. Verify all environment variables are set correctly
5. Verify Supabase Dashboard configuration

## 🎯 Next Steps

1. **Set Vercel Environment Variables:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Add `NEXT_PUBLIC_SITE_URL` = `https://otomasyonmagazasi.com`

2. **Update Supabase Dashboard:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Set Site URL to `https://otomasyonmagazasi.com`
   - Add production redirect URLs

3. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

4. **Test OAuth Login on Production:**
   - Go to `https://otomasyonmagazasi.com/auth/signin`
   - Click "Google ile Giriş Yap" or "GitHub ile Giriş Yap"
   - Verify redirect to `/auth/callback`
   - Verify session is established
   - Verify redirect to dashboard or admin panel

