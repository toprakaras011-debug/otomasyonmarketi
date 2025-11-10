import './globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/components/cart-context';
import { AuthProvider } from '@/components/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { createClient } from '@/lib/supabase/server';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { CookieConsent } from '@/components/cookie-consent';

const timeBasedThemeInitScript = `
(function() {
  try {
    var storageKey = 'theme';
    var modeKey = 'theme-mode';
    var mode = localStorage.getItem(modeKey);
    var root = document.documentElement;

    if (mode === 'manual') {
      var storedTheme = localStorage.getItem(storageKey);
      if (storedTheme) {
        root.classList.remove('light', 'dark');
        root.classList.add(storedTheme);
      }
      return;
    }

    var hour = new Date().getHours();
    var theme = hour >= 7 && hour < 19 ? 'light' : 'dark';

    localStorage.setItem(storageKey, theme);
    localStorage.setItem(modeKey, 'auto');

    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  } catch (error) {
    console.warn('Theme initialization failed', error);
  }
})();
`;

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
  // Only load weights we actually use
  weight: ['400', '500', '600', '700'],
});

const poppins = Poppins({
  weight: ['600', '700', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  preload: false, // Defer Poppins - not critical for LCP
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://otomasyonmagazasi.com.tr'),
  title: {
    default: 'Otomasyon Mağazası - İş Süreçlerinizi Otomatikleştirin | Türkiye\'nin En Büyük Otomasyon Platformu',
    template: '%s | Otomasyon Mağazası'
  },
  other: {
    'revisit-after': '1 days',
    'robots': 'index, follow',
    'google-site-verification': 'your-google-site-verification-code'
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
        url: 'https://otomasyonmagazasi.com.tr/og-image.jpg',
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Optimize: Only fetch essential profile fields for initial render
  let profile: any = null;
  if (user) {
    const { data } = await supabase
      .from('user_profiles')
      .select('id,username,avatar_url,role,is_admin,is_developer')
      .eq('id', user.id)
      .maybeSingle();
    profile = data ?? null;
  }

  return (
    <html lang="tr" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Resource Hints for Performance - Optimized */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
          </>
        )}
        {/* Preconnect to Google Fonts - Optimized */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Prefetch critical resources */}
        <link rel="prefetch" href="/automations" as="document" />
        <link rel="prefetch" href="/categories" as="document" />
        
        {/* Critical inline script - must run before render */}
        <script
          dangerouslySetInnerHTML={{
            __html: timeBasedThemeInitScript,
          }}
        />
        
        {/* Structured Data - Defer to avoid blocking render */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Otomasyon Mağazası",
              "url": "https://www.otomasyonmagazasi.com.tr",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.otomasyonmagazasi.com.tr/arama?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }),
          }}
          defer
        />
        
        {/* Icons */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased bg-background text-foreground`}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CartProvider>
              <AuthProvider initialUser={user ?? null} initialProfile={profile}>
                {children}
                <CookieConsent />
                <Toaster position="bottom-right" richColors closeButton />
                <SpeedInsights />
              </AuthProvider>
            </CartProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
