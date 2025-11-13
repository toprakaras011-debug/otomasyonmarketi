# 🚀 Otomasyon Mağazası

Modern, güvenli ve ölçeklenebilir bir otomasyon marketplace platformu.

## 📋 İçindekiler

- [Özellikler](#özellikler)
- [Teknoloji Stack](#teknoloji-stack)
- [Kurulum](#kurulum)
- [Yapılandırma](#yapılandırma)
- [Geliştirme](#geliştirme)
- [Deployment](#deployment)
- [Dokümantasyon](#dokümantasyon)

## ✨ Özellikler

### Kullanıcı Özellikleri
- 🔐 Güvenli authentication (Email/Password, GitHub, Google OAuth)
- 🛒 Sepet ve checkout sistemi
- 💳 Stripe entegrasyonu (TRY desteği)
- ⭐ Favori ve değerlendirme sistemi
- 👤 Kullanıcı profili ve dashboard
- 📧 E-posta bildirimleri

### Geliştirici Özellikleri
- 📦 Otomasyon yükleme ve yönetimi
- 💰 Gelir takibi ve ödeme talep sistemi
- 📊 Satış analytics
- 🔔 Bildirim sistemi
- ✅ Admin onay süreci

### Admin Özellikleri
- 👥 Kullanıcı yönetimi
- 📦 Otomasyon onay/red sistemi
- 💵 Ödeme yönetimi
- 📊 Platform analytics
- 🛡️ Güvenlik ve moderasyon

### Teknik Özellikler
- ⚡ Next.js 15 + React 19
- 🎨 Modern UI (Tailwind CSS, shadcn/ui)
- 🌓 Dark/Light mode
- 📱 Fully responsive
- 🔒 Row Level Security (RLS)
- 🚀 Performance optimized
- ♿ Accessibility (WCAG 2.1 AA)

## 🛠️ Teknoloji Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui, Radix UI
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Forms:** React Hook Form
- **State:** React Context API

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **API:** Next.js API Routes
- **Payments:** Stripe

### DevOps
- **Hosting:** Vercel
- **CI/CD:** GitHub Actions
- **Monitoring:** Vercel Analytics
- **Error Tracking:** Sentry (optional)

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- Supabase hesabı
- Stripe hesabı

### Adımlar

1. **Repository'yi klonlayın**
```bash
git clone https://github.com/OtomasyonMagazasi/otomasyonmagazasi.git
cd otomasyonmagazasi/project
```

2. **Dependencies'leri yükleyin**
```bash
npm install
```

3. **Environment variables'ları ayarlayın**
```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin ve gerekli değerleri girin.

4. **Database'i kurun**
```bash
# Supabase dashboard'dan migration'ları çalıştırın
# veya SQL dosyalarını manuel olarak çalıştırın
```

5. **Development server'ı başlatın**
```bash
npm run dev
```

Site `http://localhost:3000` adresinde çalışacaktır.

## ⚙️ Yapılandırma

### Environment Variables

Detaylı bilgi için `.env.example` dosyasına bakın.

**Zorunlu:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_SITE_URL` - Site URL

**Opsiyonel:**
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Cloudflare Turnstile
- `NEXT_PUBLIC_GA_ID` - Google Analytics
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking

### Supabase Setup

1. **Database Schema**
   - `supabase/migrations/` klasöründeki migration'ları çalıştırın
   - RLS policies'leri aktif edin

2. **Authentication**
   - Email/Password auth'u aktif edin
   - OAuth providers'ı yapılandırın (GitHub, Google)
   - Redirect URLs'leri ayarlayın

3. **Storage**
   - Gerekli bucket'ları oluşturun:
     - `automation-files`
     - `automation-images`
     - `avatars`

### Stripe Setup

1. **Webhook Endpoint**
   ```
   URL: https://yourdomain.com/api/stripe-webhook
   Events: checkout.session.completed, payment_intent.succeeded
   ```

2. **Currency**
   - TRY (Turkish Lira) desteğini aktif edin

3. **Test Mode**
   - Development'ta test mode kullanın
   - Production'da live mode'a geçin

## 💻 Geliştirme

### Kurulum

```bash
cd project
npm install
npm run dev
```

> Not: Bu dosya 13 Kasım 2025 dağıtım onayı için güncellendi.

### Scripts

```bash
# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint

# Type checking
npm run type-check
```

### Proje Yapısı

```
project/
├── app/                    # Next.js app directory
│   ├── (routes)/          # Route groups
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components (shadcn)
│   └── ...               # Feature components
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase clients
│   ├── auth.ts           # Auth helpers
│   └── ...               # Other utilities
├── public/               # Static assets
├── supabase/             # Supabase config & migrations
└── ...                   # Config files
```

### Coding Standards

- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Conventional Commits** - Commit messages

## 🚀 Deployment

### Vercel (Önerilen)

1. **Vercel'e bağlanın**
```bash
npm i -g vercel
vercel login
```

2. **Deploy edin**
```bash
vercel --prod
```

3. **Environment variables'ları ayarlayın**
   - Vercel dashboard'dan tüm env variables'ları ekleyin

### Manual Deployment

1. **Build**
```bash
npm run build
```

2. **Start**
```bash
npm run start
```

## 📚 Dokümantasyon

### Kullanıcı Dokümantasyonu
- [Kullanım Kılavuzu](./docs/user-guide.md)
- [SSS](./docs/faq.md)
- [Video Tutorials](./docs/tutorials.md)

### Geliştirici Dokümantasyonu
- [API Dokümantasyonu](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Architecture](./docs/architecture.md)
- [Contributing Guide](./CONTRIBUTING.md)

### Deployment Dokümantasyonu
- [Production Checklist](../PRODUCTION_DEPLOYMENT_CHECKLIST.md)
- [Comprehensive Audit](../COMPREHENSIVE_SITE_AUDIT.md)
- [Email Setup](../SUPABASE_EMAIL_SETUP.md)

## 🐛 Bug Reports & Feature Requests

GitHub Issues kullanarak bug report veya feature request oluşturabilirsiniz:
https://github.com/OtomasyonMagazasi/otomasyonmagazasi/issues

## 📄 License

[MIT License](./LICENSE)

## 👥 Team

- **Developer:** [Your Name]
- **Designer:** [Designer Name]
- **PM:** [PM Name]

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Stripe](https://stripe.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)

---

**Made with ❤️ in Turkey**
