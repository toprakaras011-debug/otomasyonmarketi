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
  display: 'optional', // Prevent layout shift - use fallback immediately
  preload: true, // Preload critical font
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
  weight: ['400', '500', '600', '700'],
});

const poppins = Poppins({
  weight: ['600', '700', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'optional', // Prevent layout shift - use fallback immediately
  preload: false, // Defer non-critical font
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://otomasyonmagazasi.com'),
  title: {
    default: 'Otomasyon Mağazası - İş Süreçlerinizi Otomatikleştirin | Türkiye\'nin En Büyük Otomasyon Platformu',
    template: '%s | Otomasyon Mağazası'
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
  other: {
    'revisit-after': '1 days',
    'robots': 'index, follow',
    'google-site-verification': 'your-google-site-verification-code'
  },
  description: 'Türkiye\'nin en büyük workflow automation ve otomasyon marketplace\'i. Business process automation, workflow management, RPA, API integration, Make.com, Zapier, n8n şablonları. İş süreçlerinizi otomatikleştirin, verimliliği artırın. Workflow automation software, automation tools, integration platform.',
  keywords: [
    // Turkish keywords
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
    'otomasyon şablonları',
    // English workflow & automation keywords
    'workflow',
    'workflow automation',
    'automation workflow',
    'business process automation',
    'process automation',
    'task automation',
    'workflow management',
    'automated workflows',
    'workflow builder',
    'workflow software',
    'workflow tools',
    'workflow platform',
    'workflow integration',
    'workflow solution',
    'workflow system',
    'workflow engine',
    'workflow design',
    'workflow optimization',
    'workflow efficiency',
    'workflow productivity',
    'automation',
    'business automation',
    'workflow automation software',
    'automation platform',
    'automation tools',
    'automation software',
    'automation solution',
    'automation system',
    'automation service',
    'automation technology',
    'automation framework',
    'automation integration',
    'automation marketplace',
    'automation templates',
    'automation scripts',
    'automation workflows',
    'no-code automation',
    'low-code automation',
    'api automation',
    'cloud automation',
    'enterprise automation',
    'digital automation',
    'smart automation',
    'intelligent automation',
    'robotic process automation',
    'rpa automation',
    'rpa tools',
    'rpa software',
    'rpa platform',
    'rpa solution',
    // Integration keywords
    'integration',
    'api integration',
    'system integration',
    'app integration',
    'software integration',
    'data integration',
    'workflow integration',
    'business integration',
    'enterprise integration',
    'cloud integration',
    'webhook integration',
    'rest api integration',
    'api connector',
    'integration platform',
    'integration tools',
    'integration software',
    'integration service',
    // Platform specific
    'make.com automation',
    'make.com workflow',
    'make.com integration',
    'zapier automation',
    'zapier workflow',
    'zapier integration',
    'zapier alternative',
    'n8n automation',
    'n8n workflow',
    'n8n integration',
    'microsoft power automate',
    'power automate',
    'ifttt alternative',
    'automation anywhere',
    'uipath',
    'blue prism',
    // Productivity keywords
    'productivity tools',
    'productivity software',
    'business productivity',
    'workflow productivity',
    'efficiency tools',
    'time saving tools',
    'business efficiency',
    'workflow efficiency',
    'process efficiency',
    'operational efficiency',
    'digital transformation',
    'business transformation',
    'process optimization',
    'workflow optimization',
    'business process management',
    'bpm',
    'process management',
    'task management',
    'project automation',
    'marketing automation',
    'sales automation',
    'customer service automation',
    'support automation',
    'hr automation',
    'finance automation',
    'accounting automation',
    'ecommerce automation',
    'social media automation',
    'content automation',
    'data automation',
    'report automation',
    'notification automation',
    'email automation',
    'sms automation',
    'chatbot automation',
    'ai automation',
    'machine learning automation',
    'iot automation',
    // Turkey specific
    'türkiye workflow',
    'türkiye automation',
    'türkiye integration',
    'türkçe otomasyon',
    'türkçe workflow',
    'türkiye rpa',
    'istanbul automation',
    'ankara automation',
    'izmir automation'
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
    url: 'https://otomasyonmagazasi.com',
    siteName: 'Otomasyon Mağazası',
    title: 'Otomasyon Mağazası - Workflow Automation & İş Süreçlerinizi Otomatikleştirin',
    description: 'Türkiye\'nin en büyük workflow automation ve otomasyon marketplace\'i. Business process automation, workflow management, RPA, API integration, Make.com, Zapier, n8n şablonları. Workflow automation software, automation tools.',
    images: [
      {
        url: 'https://otomasyonmagazasi.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Otomasyon Mağazası - İş Süreçlerini Otomatikleştirin',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Otomasyon Mağazası - Workflow Automation & İş Süreçlerinizi Otomatikleştirin',
    description: 'Türkiye\'nin en büyük workflow automation ve otomasyon marketplace\'i. Business process automation, workflow management, RPA, API integration, Make.com, Zapier, n8n şablonları.',
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
    canonical: 'https://otomasyonmagazasi.com',
    languages: {
      'tr-TR': 'https://otomasyonmagazasi.com',
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
      .select('id,username,avatar_url,role,is_admin,is_developer,developer_approved')
      .eq('id', user.id)
      .maybeSingle();
    profile = data ?? null;
  }

  return (
    <html lang="tr" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Resource Hints for Performance - Critical */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
            {/* Preconnect to Supabase storage for faster image loading */}
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL.replace('/rest/v1', '/storage/v1')} />
          </>
        )}
        {/* Preconnect to Google Fonts - Early connection */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preconnect to Vercel Analytics */}
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
        
        {/* Critical inline script - must run before render (non-blocking) */}
        <script
          dangerouslySetInnerHTML={{
            __html: timeBasedThemeInitScript,
          }}
          suppressHydrationWarning
        />
        
        {/* Structured Data - Defer to avoid blocking render */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Otomasyon Mağazası",
              "url": "https://www.otomasyonmagazasi.com",
              "alternateName": ["https://otomasyonmagazasi.com.tr", "https://www.otomasyonmagazasi.com.tr"],
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.otomasyonmagazasi.com/arama?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }),
          }}
          defer
          suppressHydrationWarning
        />
        
        {/* Icons and manifest - Managed by metadata API */}
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
                <Toaster 
                  position="bottom-right" 
                  richColors 
                  closeButton
                  expand={false}
                  visibleToasts={3}
                  toastOptions={{
                    duration: 3000,
                  }}
                />
                <SpeedInsights />
              </AuthProvider>
            </CartProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
