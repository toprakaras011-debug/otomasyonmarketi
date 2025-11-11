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
    // Fetch all data in parallel for better performance
    const [categoriesResult, automationsResult] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase
        .from('automations')
        .select('id, category_id, total_sales, rating_avg')
        .eq('is_published', true)
        .eq('admin_approved', true)
    ]);

    if (categoriesResult.error) throw categoriesResult.error;

    const categories = categoriesResult.data || [];
    const automations = automationsResult.data || [];
    
    // Group automations by category (O(n) instead of N queries)
    const automationsByCategory = automations.reduce((acc, auto) => {
      if (!auto.category_id) return acc;
      if (!acc[auto.category_id]) acc[auto.category_id] = [];
      acc[auto.category_id].push(auto);
      return acc;
    }, {} as Record<string, any[]>);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Calculate stats for each category
    const stats = categories.map((category) => {
      const categoryAutomations = automationsByCategory[category.id] || [];
      const automationCount = categoryAutomations.length;
      const totalSales = categoryAutomations.reduce((sum, a) => sum + (a.total_sales || 0), 0);
      const avgRating = automationCount > 0
        ? (categoryAutomations.reduce((sum, a) => sum + Number(a.rating_avg || 0), 0) / automationCount).toFixed(1)
        : '0.0';

      return {
        ...category,
        automationCount,
        totalSales,
        avgRating,
        weeklySalesCount: 0, // Simplified - can be added back if needed
      };
    });

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
