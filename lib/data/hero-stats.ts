import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { cacheTag, cacheLife } from 'next/cache';

export type HeroStats = {
  automations: number;
  developers: number;
  users: number;
  integrations: number;
  estimatedHours: number;
  efficiencyMultiplier: number;
};

/**
 * Fetches hero stats from Supabase
 * 
 * This function uses "use cache" to cache the results for better performance.
 * It returns fallback values silently if any error occurs to avoid blocking route rendering.
 * 
 * Cache can be revalidated by calling revalidateTag("hero-stats") from a server action or webhook.
 * Cache will automatically revalidate after 5 minutes.
 */
export const getHeroStats = async (): Promise<HeroStats> => {
  "use cache";
  cacheTag("hero-stats");
  cacheLife("minutes");
  
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return {
        automations: 1,
        developers: 3,
        users: 1,
        integrations: 1,
        estimatedHours: 60,
        efficiencyMultiplier: 8,
      };
    }

    const [automationsResponse, developersResponse, usersResponse, integrationsResponse] = await Promise.all([
      supabase
        .from('automations')
        .select('id', { count: 'exact', head: true })
        .eq('is_published', true)
        .eq('admin_approved', true),
      supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true })
        .eq('is_developer', true)
        .eq('developer_approved', true),
      // Count all user profiles (no filter to get total users)
      ((supabase.from as any) as any)('user_profiles').select('id', { count: 'exact', head: true }),
      supabase
        .from('automations')
        .select('tags')
        .eq('is_published', true)
        .eq('admin_approved', true)
        .limit(1000),
    ]);

  // Ensure we have valid counts, fallback to 0 if null/undefined
  const automationsCount = automationsResponse.count ?? 0;
  const developersCount = developersResponse.count ?? 0;
  const usersCount = usersResponse.count ?? 0;

  const tagSet = new Set<string>();
  const integrationsData = integrationsResponse.data as Array<{ tags?: string[] | null }> | null;
  integrationsData?.forEach(({ tags }) => {
    if (Array.isArray(tags)) {
      tags.forEach((tag) => tagSet.add(tag));
    }
  });

  const integrationsCount = tagSet.size;
  const estimatedHours = automationsCount * 60;
  const efficiencyMultiplier = Math.max(8, Math.round(8 + automationsCount / 150));

    // Ensure minimum values for display (even if database is empty)
    return {
      automations: Math.max(automationsCount, 1),
      developers: Math.max(developersCount, 3),
      users: Math.max(usersCount, 1),
      integrations: Math.max(integrationsCount, 1),
      estimatedHours: Math.max(estimatedHours, 60),
      efficiencyMultiplier: Math.max(efficiencyMultiplier, 8),
    };
  } catch (error) {
    // Return fallback values with minimums (silently for Next.js 16 cacheComponents compatibility)
    // No console.error to avoid blocking route issues
    return {
      automations: 1,
      developers: 3,
      users: 1,
      integrations: 1,
      estimatedHours: 60,
      efficiencyMultiplier: 8,
    };
  }
};
