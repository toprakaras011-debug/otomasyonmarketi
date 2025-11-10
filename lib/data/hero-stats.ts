import { unstable_cache } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export type HeroStats = {
  automations: number;
  developers: number;
  users: number;
  integrations: number;
  estimatedHours: number;
  efficiencyMultiplier: number;
};

const fetchHeroStats = async (): Promise<HeroStats> => {
  try {
    const supabase = getSupabaseAdmin();

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
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabase
        .from('automations')
        .select('tags')
        .eq('is_published', true)
        .eq('admin_approved', true)
        .limit(1000),
    ]);

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

    return {
      automations: automationsCount,
      developers: developersCount,
      users: usersCount,
      integrations: integrationsCount,
      estimatedHours,
      efficiencyMultiplier,
    };
  } catch (error) {
    console.error('Error fetching hero stats:', error);
    // Return fallback values
    return {
      automations: 0,
      developers: 0,
      users: 0,
      integrations: 0,
      estimatedHours: 0,
      efficiencyMultiplier: 8,
    };
  }
};

export const getHeroStats = unstable_cache(fetchHeroStats, ['hero-stats'], {
  revalidate: 300, // 5 minutes - more aggressive caching
  tags: ['hero-stats'],
});
