'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Code2,
  Shield,
  Globe,
  Users,
  UserCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';

import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HoloIcon } from '@/components/ui/holo-icon';
import type { CategoryWithStats } from '@/lib/queries/categories';

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'crm-musteri-yonetimi': 'CRM & Müşteri Yönetimi',
};

const categoryStyleMap = {
  'sosyal-medya': {
    icon: Sparkles,
    gradientFrom: '#2563eb',
    gradientTo: '#1d4ed8',
    baselineCount: 180,
  },
  'e-ticaret-pazaryeri': {
    icon: TrendingUp,
    gradientFrom: '#3b82f6',
    gradientTo: '#2563eb',
    baselineCount: 250,
  },
  'crm-musteri-yonetimi': {
    icon: Code2,
    gradientFrom: '#f59e0b',
    gradientTo: '#d97706',
    baselineCount: 150,
  },
  'finans-faturalama': {
    icon: Shield,
    gradientFrom: '#10b981',
    gradientTo: '#047857',
    baselineCount: 130,
  },
  'veri-raporlama': {
    icon: TrendingUp,
    gradientFrom: '#db2777',
    gradientTo: '#9d174d',
    baselineCount: 120,
  },
  'yapay-zeka-entegrasyonlari': {
    icon: Sparkles,
    gradientFrom: '#ec4899',
    gradientTo: '#be185d',
    baselineCount: 90,
  },
  'bildirim-email': {
    icon: Globe,
    gradientFrom: '#06b6d4',
    gradientTo: '#0ea5e9',
    baselineCount: 110,
  },
  'kisisel-verimlilik-takvim': {
    icon: Users,
    gradientFrom: '#06b6d4',
    gradientTo: '#0891b2',
    baselineCount: 95,
  },
  'insan-kaynaklari': {
    icon: UserCheck,
    gradientFrom: '#f97316',
    gradientTo: '#ea580c',
    baselineCount: 85,
  },
} as const;

type CategoryStyleKey = keyof typeof categoryStyleMap;

const fallbackStyle = {
  icon: TrendingUp,
  gradientFrom: '#3730a3',
  gradientTo: '#1d4ed8',
  baselineCount: 50,
};

interface CategoriesClientProps {
  initialCategories: CategoryWithStats[];
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  // Merge static categories with fetched data
  const staticCategories = (
    Object.entries(categoryStyleMap) as [CategoryStyleKey, typeof fallbackStyle][]
  ).map(([slug, style]) => ({
    slug,
    name:
      CATEGORY_DISPLAY_NAMES[slug] ||
      slug
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
    description: '',
    icon: slug in categoryStyleMap ? slug : 'trending',
    gradientFrom: style.gradientFrom,
    gradientTo: style.gradientTo,
  }));

  const statsBySlug = new Map(initialCategories.map((item) => [item.slug, item]));

  const merged = staticCategories.map((category) => {
    const existing = statsBySlug.get(category.slug);
    if (existing) {
      return {
        ...existing,
        name: category.name,
        description: category.description ?? existing.description ?? '',
        icon: category.icon,
        gradientFrom: category.gradientFrom,
        gradientTo: category.gradientTo,
      };
    }

    return {
      id: null,
      slug: category.slug,
      name: category.name,
      description: category.description ?? '',
      icon: category.icon,
      gradientFrom: category.gradientFrom,
      gradientTo: category.gradientTo,
      automationCount: 0,
      totalSales: 0,
      avgRating: '0.0',
      weeklySalesCount: 0,
    };
  });

  const remaining = initialCategories
    .filter((category) => !staticCategories.some((staticCat) => staticCat.slug === category.slug))
    .map((category) => {
      const style = categoryStyleMap[category.slug as keyof typeof categoryStyleMap] || fallbackStyle;
      return {
        ...category,
        description: category.description ?? '',
        gradientFrom: style.gradientFrom,
        gradientTo: style.gradientTo,
        icon: style.icon,
        weeklySalesCount: category.weeklySalesCount ?? 0,
      };
    });

  const consolidated = [...merged, ...remaining];

  const sortedByPerformance = consolidated
    .sort((a, b) => {
      const weeklyDiff = (b.weeklySalesCount ?? 0) - (a.weeklySalesCount ?? 0);
      if (weeklyDiff !== 0) return weeklyDiff;
      return (b.totalSales ?? 0) - (a.totalSales ?? 0);
    })
    .map((category, index) => ({
      ...category,
      isTopPerformer: index === 0 && (category.weeklySalesCount ?? 0) > 0,
    }));

  const iconMap: Record<string, any> = {
    sparkles: Sparkles,
    trending: TrendingUp,
    code: Code2,
    shield: Shield,
    globe: Globe,
    users: Users,
    usercheck: UserCheck,
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <motion.div 
          className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]"
          animate={{ opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]"
          animate={{ opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
      </div>

      <Navbar />

      <div className="container relative mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-16 mt-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 text-5xl font-black md:text-6xl lg:text-7xl"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Otomasyon Kategorileri
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-2xl text-xl text-foreground/70"
          >
            İhtiyacınıza uygun kategoriyi seçin ve binlerce otomasyon çözümü arasından
            <br className="hidden sm:block" />
            size en uygun olanı bulun
          </motion.p>
        </div>

        {/* Categories Grid */}
        <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sortedByPerformance.map((category, index) => {
            const Icon = iconMap[category.icon as keyof typeof iconMap] || TrendingUp;
            const gradientFrom = category.gradientFrom ?? '#3730a3';
            const gradientTo = category.gradientTo ?? '#1d4ed8';
            return (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
              >
                <Link href={`/automations?category=${category.slug}`} className="group block">
                  <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:from-purple-500/20 hover:to-blue-500/20">
                    {category.isTopPerformer && (
                      <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-100 backdrop-blur">
                        <Sparkles className="h-3 w-3" /> Bu haftanın yıldızı
                      </div>
                    )}
                    {/* Glow Effect */}
                    <div
                      className="absolute inset-0 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-20"
                      style={{
                        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
                      }}
                    />

                    {/* Card Content */}
                    <div className="relative h-full overflow-hidden rounded-2xl bg-background/80 p-6 backdrop-blur-sm">
                      {/* Icon */}
                      <HoloIcon
                        icon={Icon}
                        size="md"
                        gradientFrom={gradientFrom}
                        gradientTo={gradientTo}
                        iconColor="white"
                        className="mb-6"
                      />

                      {/* Title */}
                      <h3 className="mb-3 text-2xl font-bold transition-colors group-hover:text-purple-400">
                        {category.name}
                      </h3>

                      <div className="mb-6" />

                      {/* Stats */}
                      <div className="mb-6 flex flex-wrap items-center gap-3 pt-4">
                        <Badge className="border-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300">
                          <Zap className="mr-1 h-3 w-3" />
                          {category.automationCount?.toLocaleString('tr-TR')} Otomasyon
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-foreground/60">
                          <TrendingUp className="h-3 w-3 text-purple-400" />
                          <span>
                            {category.totalSales?.toLocaleString('tr-TR') ?? '0'} Toplam Satış
                          </span>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-4">
                        <span className="text-sm font-semibold text-purple-400">Keşfet</span>
                        <ArrowRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-2xl backdrop-blur-sm"
        >
          <div className="rounded-2xl bg-background/80 p-12 text-center backdrop-blur-sm">
            <Sparkles className="mx-auto mb-6 h-16 w-16 text-purple-400" />
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Aradığınız Kategoriyi Bulamadınız mı?
              </span>
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-foreground/70">
              Tüm otomasyonları görüntüleyerek size en uygun çözümü bulabilir veya özel ihtiyaçlarınız için geliştirici olabilirsiniz.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-14 bg-gradient-to-r from-purple-600 to-blue-600 px-8 text-base shadow-lg hover:from-purple-700 hover:to-blue-700 hover:shadow-purple-500/50"
              >
                <Link href="/automations">
                  Tüm Otomasyonları Gör
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 border-purple-500/20 px-8 text-base hover:border-purple-500/40 hover:bg-purple-500/10"
              >
                <Link href="/developer/register">
                  Geliştirici Ol
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

