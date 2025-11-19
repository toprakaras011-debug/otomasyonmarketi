import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import Head from 'next/head';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/components/cart-context';
import { AuthProvider } from '@/components/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';
import { CookieConsent } from '@/components/cookie-consent';
import { createClient } from '@/lib/supabase/server';

// Font optimizasyonu
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
  weight: ['400', '600'],
  style: 'normal',
});

const poppins = Poppins({
  weight: '700',
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  adjustFontFallback: true,
});

// Preconnect to external domains for performance
const preconnectDomains = [
  'https://kizewqavkosvrwfnbxme.supabase.co',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://vercel.live',
  'https://cdn.vercel-insights.com',
];

// Simple theme script for initial theme setup
const themeScript = `
  (function() {
    try {
      // Check for saved theme preference or use system preference
      const theme = localStorage.getItem('theme') || 'system';
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Apply theme immediately to prevent flash of default theme
      if (theme === 'dark' || (theme === 'system' && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

// Optimize Inter font loading

// Optimize Poppins font loading

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://otomasyonmagazasi.com'),
  title: {
    default: 'Otomasyon Mağazası - Workflow Automation & İş Süreçlerini Otomatikleştirin',
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
  description: 'Türkiye\'nin en büyük workflow automation ve otomasyon marketplace platformu. Make.com, Zapier, n8n şablonları, RPA çözümleri ve API entegrasyonları. İş süreçlerinizi otomatikleştirin, verimliliği %300 artırın.',
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
  const { data: { user } } = await supabase.auth.getUser();

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
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Resource Hints for Performance - Critical */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} crossOrigin="anonymous" />
            {/* Preconnect to Supabase storage for faster image loading */}
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL.replace('/rest/v1', '/storage/v1')} />
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL.replace('/rest/v1', '/storage/v1')} crossOrigin="anonymous" />
          </>
        )}
        {/* Preconnect to Google Fonts - Early connection */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Preconnect to Vercel Analytics */}
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
        
        {/* Theme initialization is handled by ThemeScript component */}
        
        {/* Structured Data - Defer to avoid blocking render */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `
              /* Critical CSS Inlined */
              html{scroll-behavior:smooth}body{margin:0;padding:0;font-family:var(--font-inter),-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif;line-height:1.5;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}*,:after,:before{box-sizing:border-box;border:0 solid #e5e7eb}img{max-width:100%;height:auto;vertical-align:middle;font-style:italic;background-repeat:no-repeat;background-size:cover;shape-margin:.75rem}@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
            `,
          }}
        />

        {/* Theme Script */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />

        {/* Preconnect and Preload */}
        {preconnectDomains.map((url) => (
          <link key={url} rel="preconnect" href={url} crossOrigin="anonymous" />
        ))}

        {/* Preload Critical Assets */}
        <link
          rel="preload"
          href="/_next/static/media/2aaf0723116ed430-s.p.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/_next/static/media/3f32b9a3d5f3a3b3-s.p.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />

        {/* Preload LCP Image if exists */}
        <link
          rel="preload"
          href="/hero-image.webp"
          as="image"
          type="image/webp"
          imageSrcSet="/hero-image.webp 1x, /hero-image@2x.webp 2x"
        />

        {/* Next SEO */}
      </head>

      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <AuthProvider initialUser={user} initialProfile={profile}>
              <CartProvider>
                {children}
                <Toaster position="top-center" richColors />
                <SpeedInsights />
                <Analytics />
                <CookieConsent />
              </CartProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
