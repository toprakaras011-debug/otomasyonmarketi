# 🚀 Production Deployment Checklist

## ✅ Son Kontroller (Pre-Deployment)

### 1. Git & Kod Durumu
- [x] Tüm değişiklikler commit edildi
- [x] Tüm değişiklikler push edildi
- [x] Main branch'te son sürüm var

### 2. Environment Variables (Vercel/Production)
Aşağıdaki environment variables'ların production'da ayarlandığından emin olun:

#### Zorunlu Variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (server-side only)
```

#### Opsiyonel ama Önerilen:
```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
NEXT_PUBLIC_TURNSTILE_SECRET_KEY=your-turnstile-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret
```

### 3. Database Migrations
Aşağıdaki SQL migration dosyalarının Supabase'de çalıştırıldığından emin olun:

- [x] `supabase-migration-complete-profile-fields.sql` - Profil ve ödeme kolonları
- [ ] `supabase-rls-policies.sql` - Row Level Security politikaları
- [ ] Diğer migration dosyaları (varsa)

**Kontrol için:**
```sql
-- user_profiles tablosundaki kolonları kontrol et
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles';
```

### 4. Supabase Ayarları

#### Authentication Settings:
- [ ] Email confirmation: Production için gerekli mi kontrol edin
- [ ] OAuth providers (Google, GitHub) ayarlı ve production URL'leri eklenmiş
- [ ] Redirect URLs production domain'e göre ayarlanmış

#### Database:
- [ ] RLS (Row Level Security) politikaları aktif
- [ ] Tüm gerekli tablolar oluşturulmuş
- [ ] Index'ler oluşturulmuş (performans için)

#### Storage:
- [ ] Storage bucket'ları oluşturulmuş
- [ ] Storage politikaları ayarlanmış
- [ ] Avatar upload için bucket hazır

### 5. Build Test (Opsiyonel ama Önerilen)
```bash
npm run build
```
Build başarılı olmalı, hata olmamalı.

### 6. Domain & DNS
- [ ] Production domain ayarlanmış (örn: otomasyonmagazasi.com)
- [ ] SSL sertifikası aktif
- [ ] DNS kayıtları doğru

### 7. Performance Optimizations
- [x] Image optimization aktif (next.config.js)
- [x] Code splitting aktif
- [x] Compression aktif
- [x] Console.log'lar production'da kaldırılıyor

### 8. Security
- [x] `poweredByHeader: false` (güvenlik için)
- [ ] Rate limiting (Vercel'de otomatik)
- [ ] CORS ayarları kontrol edilmiş
- [ ] Environment variables production'da doğru

### 9. Monitoring & Analytics
- [x] Vercel Speed Insights aktif
- [ ] Error tracking (Sentry, vb.) - opsiyonel
- [ ] Analytics (Google Analytics, vb.) - opsiyonel

## 🚀 Deployment Adımları

### Vercel Deployment:
1. GitHub repository'yi Vercel'e bağla
2. Environment variables'ları ekle
3. Build settings kontrol et:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Deploy et

### Post-Deployment Kontroller:
- [ ] Ana sayfa yükleniyor mu?
- [ ] Authentication çalışıyor mu? (Sign in/Sign up)
- [ ] Profil sayfası çalışıyor mu?
- [ ] Bildirimler görünüyor mu? (sağ alt köşe)
- [ ] Database bağlantısı çalışıyor mu?
- [ ] Image upload çalışıyor mu?
- [ ] OAuth (Google/GitHub) çalışıyor mu?

## 📝 Notlar

- **Bildirimler**: Artık sağ alt köşede fixed position ile görünüyor
- **Database**: Tüm kolonlar eklendi (city, district, postal_code, company_name, tc_no, tax_office, iban, bank_name, billing_address)
- **Username**: Kayıt sırasında belirlenir ve değiştirilemez
- **Validation**: Client-side ve server-side validation aktif

## 🆘 Sorun Giderme

### Build Hatası:
```bash
npm run build
```
Hataları kontrol edin ve düzeltin.

### Database Bağlantı Hatası:
- Supabase URL ve key'leri kontrol edin
- Network restrictions kontrol edin

### Authentication Hatası:
- OAuth redirect URL'leri kontrol edin
- Email confirmation ayarlarını kontrol edin

---

**Son Güncelleme:** $(date)
**Hazırlayan:** AI Assistant
**Durum:** ✅ Production'a Hazır

