import { supabase } from '@/lib/supabase';

/**
 * Fetch automations with filters and pagination
 * @param options - Filter and pagination options
 */
export async function getAutomations(options: {
  category?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  try {
    // Select only necessary fields for better performance
    let query = supabase
      .from('automations')
      .select(`
        id,
        title,
        slug,
        description,
        price,
        image_url,
        image_path,
        total_sales,
        rating_avg,
        rating_count,
        is_featured,
        created_at,
        category:categories(id, name, slug, icon, color),
        developer:user_profiles(id, username, avatar_url)
      `)
      .eq('is_published', true)
      .eq('admin_approved', true);

    if (options.category) {
      query = query.eq('category_id', options.category);
    }

    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%,tags.cs.{${options.search}}`);
    }

    if (options.featured) {
      query = query.eq('is_featured', true);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    // Order by featured first, then by sales/rating
    query = query.order('is_featured', { ascending: false })
                 .order('total_sales', { ascending: false })
                 .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching automations:', error);
    return [];
  }
}

/**
 * Fetch a single automation by slug
 */
export async function getAutomationBySlug(slug: string) {
  const { data, error } = await supabase
    .from('automations')
    .select(`
      *,
      category:categories(*),
      developer:user_profiles(username, avatar_url, bio)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .eq('admin_approved', true)
    .single();

  if (error) {
    console.error('Error fetching automation:', error);
    return null;
  }

  return data;
}

/**
 * Fetch featured automations
 */
export async function getFeaturedAutomations(limit: number = 6) {
  return getAutomations({ featured: true, limit });
}
