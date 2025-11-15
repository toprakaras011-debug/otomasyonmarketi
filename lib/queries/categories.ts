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
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not set. Returning empty categories.');
      return [];
    }

    // Fetch all data in parallel for better performance
    const [categoriesResult, automationsResult] = await Promise.all([
      ((supabase.from as any) as any)('categories').select('*').order('name'),
      supabase
        .from('automations')
        .select('id, category_id, total_sales, rating_avg')
        .eq('is_published', true)
        .eq('admin_approved', true)
    ]);

    if (categoriesResult.error) {
      console.error('Categories fetch error:', {
        message: categoriesResult.error.message,
        code: categoriesResult.error.code,
        details: categoriesResult.error.details,
        hint: categoriesResult.error.hint,
      });
      throw categoriesResult.error;
    }

    if (automationsResult.error) {
      console.error('Automations fetch error:', {
        message: automationsResult.error.message,
        code: automationsResult.error.code,
      });
      // Continue with empty automations array if this fails
    }

    const categories = (categoriesResult.data as any[]) || [];
    const automations = (automationsResult.data as any[]) || [];
    
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
      const totalSales = categoryAutomations.reduce((sum: number, a: any) => sum + (a.total_sales || 0), 0);
      const avgRating = automationCount > 0
        ? (categoryAutomations.reduce((sum: number, a: any) => sum + Number(a.rating_avg || 0), 0) / automationCount).toFixed(1)
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
  } catch (error: any) {
    console.error('Error fetching categories with stats:', {
      message: error?.message || 'Unknown error',
      name: error?.name,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
    // Return empty array on error to prevent UI crashes
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
