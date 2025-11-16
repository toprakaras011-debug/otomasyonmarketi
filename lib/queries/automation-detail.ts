import { createClient } from '@/lib/supabase/server';
import { cacheTag, cacheLife } from 'next/cache';

export type AutomationDetail = {
  id: string;
  developer_id: string;
  title: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  price: number;
  image_url: string | null;
  image_path: string | null;
  file_path: string | null;
  demo_url?: string | null;
  documentation?: string | null;
  tags: string[] | null;
  is_featured: boolean;
  total_sales: number;
  rating_avg: number | null;
  rating_count: number;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  admin_approved: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
    created_at: string;
  } | null;
  developer: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
};

export type Review = {
  id: string;
  automation_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
};

/**
 * Fetch automation detail by slug
 * Uses server-side caching for better performance
 */
export async function getAutomationBySlug(slug: string): Promise<AutomationDetail | null> {
  "use cache";
  cacheTag(`automation-${slug}`);
  cacheLife("minutes");
  
  try {
    const supabase = await createClient();
    
    // Block access to test/debug slugs
    const blockedSlugs = ['test', 'debug', 'demo', 'example'];
    if (blockedSlugs.includes(slug.toLowerCase())) {
      return null;
    }

    const { data, error } = await supabase
      .from('automations')
      .select('id,developer_id,title,slug,description,long_description,price,image_url,image_path,file_path,demo_url,documentation,tags,is_featured,total_sales,rating_avg,rating_count,created_at,updated_at,is_published,admin_approved, category:categories(id,name,slug,color,created_at), developer:user_profiles(id,username,avatar_url)')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    // Handle Supabase relation format (can be array or object)
    const automationData = data as any;
    const category = Array.isArray(automationData.category) 
      ? automationData.category[0] 
      : automationData.category;
    const developer = Array.isArray(automationData.developer) 
      ? automationData.developer[0] 
      : automationData.developer;

    return {
      ...automationData,
      category,
      developer,
    } as AutomationDetail;
  } catch {
    return null;
  }
}

/**
 * Fetch reviews for an automation
 * Uses server-side caching for better performance
 */
export async function getAutomationReviews(automationId: string): Promise<Review[]> {
  "use cache";
  cacheTag(`automation-reviews-${automationId}`);
  cacheLife("minutes");
  
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('reviews')
      .select('id,automation_id,user_id,rating,comment,created_at,updated_at, user:user_profiles(id,username,avatar_url)')
      .eq('automation_id', automationId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !data) {
      return [];
    }

    // Handle Supabase relation format (can be array or object)
    return (data || []).map((review: any) => {
      const user = Array.isArray(review.user) 
        ? review.user[0] 
        : review.user;
      return {
        ...review,
        user,
      };
    }) as Review[];
  } catch {
    return [];
  }
}

/**
 * Check if user has purchased an automation
 */
export async function checkUserPurchase(automationId: string, userId: string): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('automation_id', automationId)
      .eq('status', 'completed')
      .maybeSingle();

    return !!data;
  } catch {
    return false;
  }
}

