import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { CategoriesSection } from '@/components/categories-section';
import FeaturedAutomations from '@/components/featured-automations.server';
import { Footer } from '@/components/footer';

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Otomasyon Mağazası',
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
        'https://instagram.com/otomasyonmagaza'
      ]
    }
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Otomasyon Mağazası',
    alternateName: 'Automation Store Turkey',
    url: 'https://otomasyonmagazasi.com.tr',
    logo: 'https://otomasyonmagazasi.com.tr/logo.png',
    description: 'Türkiye\'nin en büyük otomasyon marketplace\'i',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TR',
      addressLocality: 'İstanbul'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'destek@otomasyonmagaza.com',
      availableLanguage: ['Turkish', 'English']
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <main className="min-h-screen">
        <Navbar />
        <Hero />
        <CategoriesSection />
        <FeaturedAutomations />
        <Footer />
      </main>
    </>
  );
}
