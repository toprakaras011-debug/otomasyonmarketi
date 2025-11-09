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
    let query = supabase
      .from('automations')
      .select(`
        *,
        category:categories(*),
        developer:user_profiles(username, avatar_url)
      `)
      .eq('is_published', true)
      .eq('admin_approved', true);

    if (options.category) {
      query = query.eq('category_id', options.category);
    }

    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
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

    query = query.order('created_at', { ascending: false });

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
