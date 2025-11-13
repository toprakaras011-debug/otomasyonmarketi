import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Otomasyon Mağazası - İş Süreçlerinizi Otomatikleştirin',
    short_name: 'Otomasyon Mağazası',
    description: 'Türkiye\'nin en büyük otomasyon marketplace\'i. E-ticaret, sosyal medya, veri işleme ve RPA çözümleri.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#a855f7',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    categories: ['business', 'productivity', 'utilities'],
    lang: 'tr',
    dir: 'ltr',
  };
}
