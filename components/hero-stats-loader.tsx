import { Suspense } from 'react';
import { Hero } from '@/components/hero';
import { getHeroStats } from '@/lib/data/hero-stats';

// Server Component - can use "use cache"
async function HeroStatsLoader() {
  const stats = await getHeroStats();
  return <Hero initialStats={stats} />;
}

export function HeroStatsLoaderWithSuspense() {
  return (
    <Suspense fallback={<Hero initialStats={null} />}>
      <HeroStatsLoader />
    </Suspense>
  );
}

