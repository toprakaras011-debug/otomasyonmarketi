import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Navbar } from '@/components/navbar';
import { AuthRedirectHandler } from '@/components/auth-redirect-handler';
import { HeroStatsLoaderWithSuspense } from '@/components/hero-stats-loader';

// Lazy load non-critical components for better initial page load
const CategoriesSection = dynamic(() => import('@/components/categories-section').then(mod => ({ default: mod.CategoriesSection })), {
  loading: () => null,
  ssr: true, // Keep SSR for SEO
});

const FeaturedAutomations = dynamic(() => import('@/components/featured-automations.server'), {
  loading: () => null,
  ssr: true, // Keep SSR for SEO
});

const Footer = dynamic(() => import('@/components/footer').then(mod => ({ default: mod.Footer })), {
  loading: () => null,
  ssr: true, // Keep SSR for SEO
});


export default function Home() {

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Otomasyon Mağazası',
    alternateName: ['Otomasyon Marketplace', 'Türkiye Otomasyon Mağazası', 'https://otomasyonmagazasi.com', 'https://www.otomasyonmagazasi.com'],
    description: 'Türkiye\'nin en büyük workflow automation ve otomasyon marketplace\'i. Business process automation, workflow management, RPA, API integration, Make.com, Zapier, n8n şablonları. Workflow automation software, automation tools, integration platform.',
    url: 'https://otomasyonmagazasi.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://otomasyonmagazasi.com/automations?search={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Otomasyon Mağazası',
      url: 'https://otomasyonmagazasi.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://otomasyonmagazasi.com/logo.png'
      },
      sameAs: [
        'https://twitter.com/otomasyonmagaza',
        'https://linkedin.com/company/otomasyonmagaza',
        'https://www.instagram.com/otomasyonmagazasi/'
      ]
    }
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Otomasyon Mağazası',
    legalName: 'Otomasyon Mağazası A.Ş.', // Örnek yasal isim, bunu kendi şirketinizin yasal adıyla değiştirmelisiniz.
    alternateName: ['Automation Store Turkey', 'https://otomasyonmagazasi.com', 'https://www.otomasyonmagazasi.com'],
    url: 'https://otomasyonmagazasi.com',
    logo: 'https://otomasyonmagazasi.com/logo.png',
    foundingDate: '2023-01-01', // Kendi kuruluş tarihinizi ekleyin.
    description: 'Türkiye\'nin en büyük workflow automation ve otomasyon marketplace\'i. Business process automation, workflow management, RPA, API integration platform.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TR',
      addressLocality: 'İstanbul'
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: 'info@otomasyonmagazasi.com',
        contactType: 'customer support',
        areaServed: 'TR',
        availableLanguage: ['Turkish']
      }
    ]
  };

  return (
    <>
      <main className="min-h-screen pt-0 w-full overflow-x-hidden">
        <AuthRedirectHandler />
        <Navbar />
        <HeroStatsLoaderWithSuspense />
        <CategoriesSection />
        <FeaturedAutomations />
        <Footer />
      </main>
    </>
  );
}
