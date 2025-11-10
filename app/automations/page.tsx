import { createClient } from '@/lib/supabase/server';
import AutomationsClient from './AutomationsClient';
import { CATEGORY_DEFINITIONS } from '@/lib/constants/categories';

export const revalidate = 60; // Cache for 60 seconds

export default async function AutomationsPage() {
  const supabase = await createClient();

  const {
    data: automations,
    error: automationsError,
  } = await supabase
    .from('automations')
    .select('id,title,slug,description,price,image_url,total_sales,rating_avg,created_at,is_published,admin_approved, category:categories(id,name,slug), developer:user_profiles(id,username,avatar_url)')
    .eq('is_published', true)
    .eq('admin_approved', true)
    .order('created_at', { ascending: false })
    .limit(100);

  const {
    data: categories,
    error: categoriesError,
  } = await supabase
    .from('categories')
    .select('id,name,slug')
    .order('name');

  if (automationsError || categoriesError) {
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

  return (
    <AutomationsClient
      automations={automations || []}
      categories={[...mergedCategories, ...remainingCategories]}
    />
  );
}
