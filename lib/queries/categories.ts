import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { cacheTag, cacheLife } from 'next/cache';

export type CategoryWithStats = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
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
 * Uses server-side caching for better performance
 */
export async function getCategoriesWithStats(): Promise<CategoryWithStats[]> {
  "use cache";
  cacheTag("categories-stats");
  cacheLife("minutes");
  
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return [];
    }

    // Fetch all data in parallel for better performance
    const [categoriesResult, automationsResult] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase
        .from('automations')
        .select('id, category_id, total_sales, rating_avg')
        .eq('is_published', true)
        .eq('admin_approved', true)
    ]);

    if (categoriesResult.error) {
      return [];
    }

    if (automationsResult.error) {
      // Continue with empty automations array if this fails
    }

    const categories = categoriesResult.data || [];
    const automations = automationsResult.data || [];
    
    // Group automations by category (O(n) instead of N queries)
    const automationsByCategory = automations.reduce((acc, auto) => {
      if (!auto.category_id) return acc;
      if (!acc[auto.category_id]) acc[auto.category_id] = [];
      acc[auto.category_id].push(auto);
      return acc;
    }, {} as Record<string, typeof automations>);

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

    return stats as CategoryWithStats[];
  } catch {
    // Return empty array on error to prevent UI crashes
    return [];
  }
}

