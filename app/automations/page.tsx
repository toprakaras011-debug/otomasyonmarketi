import { createClient } from '@supabase/supabase-js';
import AutomationsClient from './AutomationsClient';
import { CATEGORY_DEFINITIONS } from '@/lib/constants/categories';
import { logger } from '@/lib/logger';

// Note: revalidate and dynamic exports removed - not compatible with cacheComponents: true in Next.js 16
// Caching is handled by cacheComponents configuration

export default async function AutomationsPage() {
  try {
    // Use anon key for public data (is_published=true, admin_approved=true)
    // Service role key is only needed for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are not configured.');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Block test/debug automations from appearing in listings
    const blockedSlugs = ['test', 'debug', 'demo', 'example'];
    
    const {
      data: automations,
      error: automationsError,
    } = await supabase
      .from('automations')
      .select('id,title,slug,description,price,image_url,image_path,total_sales,rating_avg,created_at,is_published,admin_approved, category:categories(id,name,slug), developer:user_profiles(id,username,avatar_url)')
      .eq('is_published', true)
      .eq('admin_approved', true)
      .order('created_at', { ascending: false })
      .limit(100);
    
    // Filter out blocked slugs (test, debug, demo, example)
    const filteredAutomations = (automations || []).filter(
      (automation: any) => !blockedSlugs.includes(automation.slug?.toLowerCase() || '')
    );

    const {
      data: categories,
      error: categoriesError,
    } = await supabase
      .from('categories')
      .select('id,name,slug')
      .order('name');

    if (automationsError || categoriesError) {
      logger.error('Automations page error', new Error(automationsError?.message || categoriesError?.message || 'Unknown error'), {
        automationsError: automationsError?.message,
        categoriesError: categoriesError?.message,
      });
      return (
        <div className="container mx-auto px-4 py-12">
          <p className="text-red-500">Liste yüklenemedi: {automationsError?.message || categoriesError?.message}</p>
        </div>
      );
    }

  const categoriesBySlug = new Map((categories || []).map((category) => [category.slug, category]));

  const mergedCategories = CATEGORY_DEFINITIONS.map((definition) => {
    const existing = categoriesBySlug.get(definition.slug);
    return {
      id: existing?.id ?? null, // Don't use static IDs that look like UUIDs
      slug: definition.slug,
      name: definition.name,
    };
  });

  const remainingCategories = (categories || [])
    .filter((category) => !categoriesBySlug.has(category.slug) || !CATEGORY_DEFINITIONS.some((definition) => definition.slug === category.slug))
    .map((category) => ({
      id: category.id,
      slug: category.slug,
      name: category.name,
    }));

    // ItemList Schema for Rich Snippets (Product Listings - Primary Domain)
    const itemListJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Otomasyon Listesi',
      description: 'Türkiye\'nin en büyük otomasyon marketplace\'i - Tüm otomasyon çözümleri',
      url: 'https://otomasyonmagazasi.com/automations',
      sameAs: ['https://otomasyonmagazasi.com/automations'],
      numberOfItems: filteredAutomations?.length || 0,
      itemListElement: (filteredAutomations || []).slice(0, 20).map((automation: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: automation.title,
          description: automation.description,
          url: `https://otomasyonmagazasi.com/automations/${automation.slug}`,
          sameAs: [`https://otomasyonmagazasi.com/automations/${automation.slug}`],
          image: automation.image_path 
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/automation-images/${automation.image_path}`
            : automation.image_url || 'https://otomasyonmagazasi.com/placeholder.jpg',
          offers: [
            {
              '@type': 'Offer',
              url: `https://otomasyonmagazasi.com/automations/${automation.slug}`,
              priceCurrency: 'TRY',
              price: automation.price.toString(),
              availability: 'https://schema.org/InStock'
            },
            {
              '@type': 'Offer',
              url: `https://otomasyonmagazasi.com/automations/${automation.slug}`,
              priceCurrency: 'TRY',
              price: automation.price.toString(),
              availability: 'https://schema.org/InStock'
            }
          ],
          aggregateRating: automation.rating_avg > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: automation.rating_avg.toFixed(1),
            reviewCount: automation.rating_count || 0,
            bestRating: '5',
            worstRating: '1'
          } : undefined
        }
      }))
    };

    // ItemList Schema for Rich Snippets (Product Listings - Alternate Domain)
    const itemListJsonLdAlt = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Otomasyon Listesi',
      description: 'Türkiye\'nin en büyük otomasyon marketplace\'i - Tüm otomasyon çözümleri',
      url: 'https://otomasyonmagazasi.com/automations',
      sameAs: ['https://otomasyonmagazasi.com/automations'],
      numberOfItems: filteredAutomations?.length || 0,
      itemListElement: (filteredAutomations || []).slice(0, 20).map((automation: any, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: automation.title,
          description: automation.description,
          url: `https://otomasyonmagazasi.com/automations/${automation.slug}`,
          sameAs: [`https://otomasyonmagazasi.com/automations/${automation.slug}`],
          image: automation.image_path 
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/automation-images/${automation.image_path}`
            : automation.image_url || 'https://otomasyonmagazasi.com/placeholder.jpg',
          offers: [
            {
              '@type': 'Offer',
              url: `https://otomasyonmagazasi.com/automations/${automation.slug}`,
              priceCurrency: 'TRY',
              price: automation.price.toString(),
              availability: 'https://schema.org/InStock'
            },
            {
              '@type': 'Offer',
              url: `https://otomasyonmagazasi.com/automations/${automation.slug}`,
              priceCurrency: 'TRY',
              price: automation.price.toString(),
              availability: 'https://schema.org/InStock'
            }
          ],
          aggregateRating: automation.rating_avg > 0 ? {
            '@type': 'AggregateRating',
            ratingValue: automation.rating_avg.toFixed(1),
            reviewCount: automation.rating_count || 0,
            bestRating: '5',
            worstRating: '1'
          } : undefined
        }
      }))
    };

    return (
      <>
        {/* ItemList Schema for Rich Snippets (Primary Domain) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
        {/* ItemList Schema for Rich Snippets (Alternate Domain) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLdAlt) }}
        />
        <AutomationsClient
          automations={(filteredAutomations || []) as any}
          categories={[...mergedCategories, ...remainingCategories]}
        />
      </>
    );
  } catch (error: any) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('Automations page exception', errorObj);
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-red-500">Bir hata oluştu: {error?.message || 'Bilinmeyen hata'}</p>
      </div>
    );
  }
}
