import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { cacheTag, cacheLife } from 'next/cache';

export type Automation = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  image_path: string | null;
  total_sales: number;
  rating_avg: number | null;
  created_at: string;
  is_published: boolean;
  admin_approved: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  developer: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

/**
 * Fetch published and approved automations
 * Uses server-side caching for better performance
 */
export async function getAutomations(): Promise<Automation[]> {
  "use cache";
  cacheTag("automations");
  cacheLife("minutes");
  
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return [];
    }

    const blockedSlugs = ['test', 'debug', 'demo', 'example'];
    
    const { data, error } = await supabase
      .from('automations')
      .select('id,title,slug,description,price,image_url,image_path,total_sales,rating_avg,created_at,is_published,admin_approved, category:categories(id,name,slug), developer:user_profiles(id,username,avatar_url)')
      .eq('is_published', true)
      .eq('admin_approved', true)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return [];
    }

    return (data || []).filter(
      (automation: any) => !blockedSlugs.includes(automation.slug?.toLowerCase() || '')
    ) as Automation[];
  } catch {
    return [];
  }
}

/**
 * Fetch all categories
 * Uses server-side caching for better performance
 */
export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag("categories");
  cacheLife("minutes");
  
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return [];
    }

    const { data, error } = await supabase
      .from('categories')
      .select('id,name,slug')
      .order('name');

    if (error) {
      return [];
    }

    return (data || []) as Category[];
  } catch {
    return [];
  }
}
