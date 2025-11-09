'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Code2,
  Globe,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { HoloIcon } from '@/components/ui/holo-icon';

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
    gradientFrom: '#9333ea',
    gradientTo: '#6d28d9',
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
    gradientFrom: '#a855f7',
    gradientTo: '#7c3aed',
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
    gradientFrom: '#6366f1',
    gradientTo: '#4338ca',
    baselineCount: 95,
  },
} as const;

type CategoryStyleKey = keyof typeof categoryStyleMap;

const fallbackStyle = {
  icon: TrendingUp,
  gradientFrom: '#3730a3',
  gradientTo: '#1d4ed8',
  baselineCount: 50,
};

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

export default function CategoriesPage() {
  const [categoriesWithStats, setCategoriesWithStats] = useState<any[]>([]);
<<<<<<< HEAD
  const [totalAutomationCount, setTotalAutomationCount] = useState(0);
=======
>>>>>>> 4595d2f384ec8f56ba16da6cecb09b0f2a9e8a39
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (data) {
<<<<<<< HEAD
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const oneWeekAgoIso = oneWeekAgo.toISOString();

        const statsPromises = data.map(async (category) => {
          const { data: automations } = await supabase
            .from('automations')
            .select('id, total_sales, rating_avg')
=======
        const statsPromises = data.map(async (category) => {
          const { count } = await supabase
            .from('automations')
            .select('*', { count: 'exact', head: true })
>>>>>>> 4595d2f384ec8f56ba16da6cecb09b0f2a9e8a39
            .eq('category_id', category.id)
            .eq('is_published', true)
            .eq('admin_approved', true);

<<<<<<< HEAD
          const automationCount = automations?.length ?? 0;
          const automationIds = automations?.map((a) => a.id) ?? [];

          let weeklySalesCount = 0;
          if (automationIds.length > 0) {
            const { count: weeklyCount } = await supabase
              .from('purchases')
              .select('*', { count: 'exact', head: true })
              .in('automation_id', automationIds)
              .eq('status', 'completed')
              .gte('purchased_at', oneWeekAgoIso);
            weeklySalesCount = weeklyCount || 0;
          }
=======
          const { data: automations } = await supabase
            .from('automations')
            .select('total_sales, rating_avg')
            .eq('category_id', category.id)
            .eq('is_published', true)
            .eq('admin_approved', true);
>>>>>>> 4595d2f384ec8f56ba16da6cecb09b0f2a9e8a39

          const totalSales = automations?.reduce((sum, a) => sum + (a.total_sales || 0), 0) || 0;
          const avgRating = automations && automations.length > 0
            ? automations.reduce((sum, a) => sum + Number(a.rating_avg || 0), 0) / automations.length
            : 0;

          return {
            ...category,
<<<<<<< HEAD
            automationCount,
            totalSales,
            avgRating: avgRating.toFixed(1),
            weeklySalesCount,
=======
            automationCount: count || 0,
            totalSales,
            avgRating: avgRating.toFixed(1)
>>>>>>> 4595d2f384ec8f56ba16da6cecb09b0f2a9e8a39
          };
        });

        const stats = await Promise.all(statsPromises);

        const statsBySlug = new Map(stats.map((item) => [item.slug, item]));

        const merged = staticCategories.map((category) => {
          const existing = statsBySlug.get(category.slug);
          if (existing) {
            return {
              ...existing,
              name: category.name,
              description: category.description ?? '',
              icon: category.icon,
              gradientFrom: category.gradientFrom,
              gradientTo: category.gradientTo,
            };
          }

          return {
            id: `static-${category.slug}`,
            slug: category.slug,
            name: category.name,
            description: category.description ?? '',
            icon: category.icon,
            gradientFrom: category.gradientFrom,
            gradientTo: category.gradientTo,
            automationCount: 0,
            totalSales: 0,
            avgRating: '0.0',
<<<<<<< HEAD
            weeklySalesCount: 0,
=======
>>>>>>> 4595d2f384ec8f56ba16da6cecb09b0f2a9e8a39
          };
        });

        const remaining = stats
          .filter((category) => !staticCategories.some((staticCat) => staticCat.slug === category.slug))
          .map((category) => ({
            ...category,
            description: category.description ?? '',
            gradientFrom: category.gradientFrom ?? '#312e81',
            gradientTo: category.gradientTo ?? '#1e1b4b',
            icon: category.icon ?? 'trending',
<<<<<<< HEAD
            weeklySalesCount: category.weeklySalesCount ?? 0,
          }));

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

        const totalAutomations = consolidated.reduce((sum, cat) => sum + (cat.automationCount ?? 0), 0);

        setCategoriesWithStats(sortedByPerformance);
        setTotalAutomationCount(totalAutomations);
=======
          }));

        setCategoriesWithStats([...merged, ...remaining]);
>>>>>>> 4595d2f384ec8f56ba16da6cecb09b0f2a9e8a39
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const iconMap: Record<string, any> = {
    sparkles: Sparkles,
    trending: TrendingUp,
    code: Code2,
    shield: Shield,
    globe: Globe,
    users: Users,
  };

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-background">
        <Navbar />
        <div className="container relative mx-auto px-4 py-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm" />
            ))}
          </div>
        </div>
      </main>
    );
  }

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
<<<<<<< HEAD
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-purple-500"
          >
            <Sparkles className="h-3.5 w-3.5" /> Popüler Kategoriler
          </motion.div>

=======
>>>>>>> 4595d2f384ec8f56ba16da6cecb09b0f2a9e8a39
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 text-5xl font-black md:text-6xl lg:text-7xl"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
<<<<<<< HEAD
              İşletmenize En Uygun Otomasyonları Seçin
=======
              Otomasyon Kategorileri
>>>>>>> 4595d2f384ec8f56ba16da6cecb09b0f2a9e8a39
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-2xl text-xl text-foreground/70"
          >
<<<<<<< HEAD
            Yapay zeka destekli otomasyon kütüphanemizle operasyonlarınızı ölçeklendirin, ekip verimliliğini artırın.
            <br className="hidden sm:block" />
            <span className="font-semibold text-purple-400">{totalAutomationCount.toLocaleString('tr-TR')}+</span> otomasyon çözümü bugün uygulanabilir durumda.
=======
            İhtiyacınıza uygun kategoriyi seçin ve binlerce otomasyon çözümü arasından size en uygun olanı bulun
>>>>>>> 4595d2f384ec8f56ba16da6cecb09b0f2a9e8a39
          </motion.p>
        </div>

        {/* Categories Grid */}
        <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categoriesWithStats.map((category, index) => {
            const Icon = iconMap[category.icon as keyof typeof iconMap] || TrendingUp;
            const gradientFrom = category.gradientFrom ?? '#3730a3';
            const gradientTo = category.gradientTo ?? '#1d4ed8';
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
              >
                <Link href={`/automations?category=${category.slug}`} className="group block">
                  <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:from-purple-500/20 hover:to-blue-500/20">
<<<<<<< HEAD
                    {category.isTopPerformer && (
                      <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-100 backdrop-blur">
                        <Sparkles className="h-3 w-3" /> Bu haftanın yıldızı
                      </div>
                    )}
=======
>>>>>>> 4595d2f384ec8f56ba16da6cecb09b0f2a9e8a39
                    {/* Glow Effect */}
                    <div
                      className="absolute inset-0 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20"
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
<<<<<<< HEAD
                        iconColor={gradientTo}
=======
>>>>>>> 4595d2f384ec8f56ba16da6cecb09b0f2a9e8a39
                        className="mb-6"
                      />

                      {/* Title */}
                      <h3 className="mb-3 text-2xl font-bold transition-colors group-hover:text-purple-400">
                        {category.name}
                      </h3>

                      <div className="mb-6" />

                      {/* Stats */}
                      <div className="mb-6 flex flex-wrap items-center gap-3 border-t border-border/50 pt-4">
                        <Badge className="border-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300">
                          <Zap className="mr-1 h-3 w-3" />
<<<<<<< HEAD
                          {category.automationCount?.toLocaleString('tr-TR')} Otomasyon
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-foreground/60">
                          <TrendingUp className="h-3 w-3 text-purple-400" />
                          <span>
                            {category.weeklySalesCount > 0
                              ? `${category.weeklySalesCount} satış / bu hafta`
                              : 'Bu hafta henüz satış yok'}
                          </span>
                        </div>
                        {category.totalSales > 0 && (
                          <div className="flex items-center gap-1 text-xs text-foreground/60">
                            <Sparkles className="h-3 w-3 text-purple-400" />
                            <span>{category.totalSales.toLocaleString('tr-TR')} toplam satış</span>
=======
                          {category.automationCount} Otomasyon
                        </Badge>
                        {category.totalSales > 0 && (
                          <div className="flex items-center gap-1 text-xs text-foreground/60">
                            <TrendingUp className="h-3 w-3 text-purple-400" />
                            <span>{category.totalSales} Satış</span>
>>>>>>> 4595d2f384ec8f56ba16da6cecb09b0f2a9e8a39
                          </div>
                        )}
                        {Number(category.avgRating) > 0 && (
                          <div className="flex items-center gap-1 text-xs text-foreground/60">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{category.avgRating}</span>
                          </div>
                        )}
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between border-t border-border/50 pt-4">
                        <span className="text-sm font-semibold text-purple-400">Keşfet</span>
<<<<<<< HEAD
                        <ArrowRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
=======
                        <ArrowRight className="h-5 w-5 text-purple-400 transition-transform group-hover:translate-x-1" />
>>>>>>> 4595d2f384ec8f56ba16da6cecb09b0f2a9e8a39
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
