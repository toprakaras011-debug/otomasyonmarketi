import './globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/components/cart-context';
import { AuthProvider } from '@/components/auth-provider';
import { createClient } from '@/lib/supabase/server';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['400', '600', '700', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://otomasyonmagazasi.com.tr'),
  title: {
    default: 'Otomasyon Mağazası - İş Süreçlerinizi Otomatikleştirin | Türkiye\'nin En Büyük Otomasyon Platformu',
    template: '%s | Otomasyon Mağazası'
  },
  description: 'Türkiye\'nin en büyük otomasyon marketplace\'i. E-ticaret otomasyonları, sosyal medya yönetimi, veri işleme ve RPA çözümleri. Make.com, Zapier, n8n ve özel otomasyon scriptleri. İşinizi hızlandırın, verimliliği artırın.',
  keywords: [
    'otomasyon',
    'make.com',
    'zapier',
    'n8n',
    'e-ticaret otomasyonu',
    'sosyal medya otomasyonu',
    'rpa',
    'iş süreçleri otomasyonu',
    'workflow automation',
    'veri otomasyonu',
    'api entegrasyonu',
    'otomasyon scriptleri',
    'iş akışı otomasyonu',
    'dijital dönüşüm',
    'verimlilik araçları',
    'otomasyon çözümleri',
    'türkiye otomasyon',
    'otomasyon marketplace',
    'hazır otomasyon',
    'otomasyon şablonları'
  ],
  authors: [{ name: 'Otomasyon Mağazası' }],
  creator: 'Otomasyon Mağazası',
  publisher: 'Otomasyon Mağazası',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://otomasyonmagazasi.com.tr',
    siteName: 'Otomasyon Mağazası',
    title: 'Otomasyon Mağazası - İş Süreçlerinizi Otomatikleştirin',
    description: 'Türkiye\'nin en büyük otomasyon marketplace\'i. E-ticaret, sosyal medya, veri işleme ve RPA çözümleri. Make.com, Zapier, n8n şablonları.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Otomasyon Mağazası - İş Süreçlerini Otomatikleştirin',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Otomasyon Mağazası - İş Süreçlerinizi Otomatikleştirin',
    description: 'Türkiye\'nin en büyük otomasyon marketplace\'i. E-ticaret, sosyal medya, veri işleme ve RPA çözümleri.',
    images: ['/twitter-image.jpg'],
    creator: '@otomasyonmagaza',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
  alternates: {
    canonical: 'https://otomasyonmagazasi.com.tr',
    languages: {
      'tr-TR': 'https://otomasyonmagaza.com',
    },
  },
  category: 'technology',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: any = null;
  if (user) {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    profile = data ?? null;
  }

  return (
    <html lang="tr" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <CartProvider>
          <AuthProvider initialUser={user ?? null} initialProfile={profile}>
            {children}
            <Toaster />
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
