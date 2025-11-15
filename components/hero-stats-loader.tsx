import { Suspense } from 'react';
import { Hero } from '@/components/hero';
import { getHeroStats } from '@/lib/data/hero-stats';

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

