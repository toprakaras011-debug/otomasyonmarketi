# Otomasyon Mağazası

Bu proje monorepo yapısındadır. Ana uygulama `project` klasöründe bulunmaktadır.

## Vercel Deploy

Bu projeyi Vercel'de deploy etmek için:

1. **Root Directory**: `project` olarak ayarlayın
2. **Framework**: Next.js
3. **Build Command**: `npm run build`
4. **Output Directory**: `.next`

## Klasör Yapısı

```
/
├── project/          # Ana Next.js uygulaması
│   ├── app/         # Next.js App Router
│   ├── components/  # React bileşenleri
│   ├── lib/         # Utility fonksiyonları
│   └── package.json # Dependencies
├── migrations/      # Database migration dosyaları
└── docs/           # Dokümantasyon
```

## Kurulum

```bash
cd project
npm install
npm run dev
```
