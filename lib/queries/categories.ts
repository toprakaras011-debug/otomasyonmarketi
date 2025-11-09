import { supabase } from '@/lib/supabase';

export type CategoryWithStats = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon?: string;
  gradientFrom?: string;
  gradientTo?: string;
  automationCount: number;
  totalSales: number;
  avgRating: string;
  weeklySalesCount: number;
};

/**
 * Fetch all categories with their automation counts and stats
 * Client-safe version without caching
 */
export async function getCategoriesWithStats() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const statsPromises = (categories || []).map(async (category) => {
        const { data: automations } = await supabase
          .from('automations')
          .select('id, total_sales, rating_avg')
          .eq('category_id', category.id)
          .eq('is_published', true)
          .eq('admin_approved', true);

        const automationCount = automations?.length ?? 0;
        const automationIds = automations?.map((a) => a.id) ?? [];

        let weeklySalesCount = 0;
        if (automationIds.length > 0) {
          const { count } = await supabase
            .from('purchases')
            .select('*', { count: 'exact', head: true })
            .in('automation_id', automationIds)
            .eq('status', 'completed')
            .gte('purchased_at', oneWeekAgo.toISOString());
          weeklySalesCount = count || 0;
        }

        const totalSales = automations?.reduce((sum, a) => sum + (a.total_sales || 0), 0) || 0;
        const avgRating = automations && automations.length > 0
          ? (automations.reduce((sum, a) => sum + Number(a.rating_avg || 0), 0) / automations.length).toFixed(1)
          : '0.0';

        return {
          ...category,
          automationCount,
          totalSales,
          avgRating,
          weeklySalesCount,
        };
      });

    const stats = await Promise.all(statsPromises);
    return stats;
  } catch (error) {
    console.error('Error fetching categories with stats:', error);
    return [];
  }
}

/**
 * Fetch a single category by slug
 */
export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }

  return data;
}
