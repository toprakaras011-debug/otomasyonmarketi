import dynamic from 'next/dynamic';
import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { getHeroStats } from '@/lib/data/hero-stats';

// Lazy load non-critical components for better initial page load
const CategoriesSection = dynamic(() => import('@/components/categories-section').then(mod => ({ default: mod.CategoriesSection })), {
  loading: () => <div className="h-96 animate-pulse bg-muted/10" />,
  ssr: true, // Keep SSR for SEO
});

const FeaturedAutomations = dynamic(() => import('@/components/featured-automations.server'), {
  loading: () => <div className="h-96 animate-pulse bg-muted/10" />,
  ssr: true, // Keep SSR for SEO
});

const Footer = dynamic(() => import('@/components/footer').then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="h-64 animate-pulse bg-muted/10" />,
  ssr: true, // Keep SSR for SEO
});

export default async function Home() {
  const heroStats = await getHeroStats();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Otomasyon Mağazası',
    alternateName: ['Otomasyon Marketplace', 'Türkiye Otomasyon Mağazası'],
    description: 'Türkiye\'nin en büyük otomasyon marketplace\'i. E-ticaret, sosyal medya, veri işleme ve RPA çözümleri.',
    url: 'https://otomasyonmagazasi.com.tr',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://otomasyonmagazasi.com.tr/automations?search={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Otomasyon Mağazası',
      url: 'https://otomasyonmagazasi.com.tr',
      logo: {
        '@type': 'ImageObject',
        url: 'https://otomasyonmagazasi.com.tr/logo.png'
      },
      sameAs: [
        'https://twitter.com/otomasyonmagaza',
        'https://linkedin.com/company/otomasyonmagaza',
        'https://www.instagram.com/otomasyonmagazasi.com.tr/'
      ]
    }
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Otomasyon Mağazası',
    legalName: 'Otomasyon Mağazası A.Ş.', // Örnek yasal isim, bunu kendi şirketinizin yasal adıyla değiştirmelisiniz.
    alternateName: 'Automation Store Turkey',
    url: 'https://otomasyonmagazasi.com.tr',
    logo: 'https://otomasyonmagazasi.com.tr/logo.png',
    foundingDate: '2023-01-01', // Kendi kuruluş tarihinizi ekleyin.
    description: 'Türkiye\'nin en büyük otomasyon marketplace\'i',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TR',
      addressLocality: 'İstanbul'
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: 'info@otomasyonmagazasi.com.tr',
        contactType: 'customer support',
        areaServed: 'TR',
        availableLanguage: ['Turkish']
      }
    ]
  };

  return (
    <>
      {/* Defer structured data to avoid blocking render */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        defer
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        defer
      />
      <main className="min-h-screen pt-0">
        <Navbar />
        <Hero initialStats={heroStats} />
        <CategoriesSection />
        <FeaturedAutomations />
        <Footer />
      </main>
    </>
  );
}
