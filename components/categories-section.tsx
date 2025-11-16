'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import {
  CATEGORY_CONFIG,
  CATEGORY_ICON_MAP,
  type CategoryIconKey,
} from '@/lib/category-config';

type CategoryStat = {
  slug: string;
  name: string;
  description: string;
  gradient: string;
  icon: CategoryIconKey;
  automationCount: number;
  salesLast7Days: number;
};

const formatAutomationLabel = (count: number) => {
  if (!count) return 'Yakında';
  if (count >= 1000) {
    return `${new Intl.NumberFormat('tr-TR', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(count)} Otomasyon`;
  }
  return `${new Intl.NumberFormat('tr-TR').format(count)} Otomasyon`;
};

function CategoryCard({ category, index }: { category: CategoryStat; index: number }) {
  const config = CATEGORY_CONFIG.find((cfg) => cfg.slug === category.slug);
  const iconKey: CategoryIconKey = (config?.icon ?? category.icon ?? 'sparkles') as CategoryIconKey;
  const Icon = CATEGORY_ICON_MAP[iconKey];
  const descriptionText = config?.description || category.description || 'Kategori detayları yakında.';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="gpu-accelerated"
    >
      <Link href={`/automations?category=${category.slug}`} className="group block h-full">
        <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 p-[1px] shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:from-purple-500/10 hover:to-blue-500/10">
          {/* Animated glow effect */}
          <div className="absolute inset-0 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-30">
            <div className={`h-full w-full bg-gradient-to-br ${category.gradient}`} />
          </div>

          {/* Card content */}
          <div className="relative h-full overflow-hidden rounded-3xl bg-background/80 p-8 backdrop-blur-sm">
            {/* Icon with gradient background */}
            <div className="mb-6">
              <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${category.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Category name */}
            <h3 className="mb-3 text-2xl font-bold text-foreground transition-colors group-hover:text-purple-400">
              {category.name}
            </h3>

            {/* Description */}
            <p className="mb-6 text-sm text-muted-foreground/80">{descriptionText}</p>

            {/* Automation count badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-blue-500/10 px-4 py-2 backdrop-blur-sm">
              <Zap className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-400">
                {formatAutomationLabel(category.automationCount)}
              </span>
            </div>

            {/* CTA */}
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm font-semibold text-purple-400 transition-colors group-hover:text-purple-300">Keşfet</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 transition-all duration-300 group-hover:from-purple-500/30 group-hover:to-blue-500/30">
                <ArrowRight className="h-5 w-5 text-purple-400 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCategoryStats = async () => {
      setIsLoading(true);
      try {
        // Fetch from API route (server-side function cannot be called from client component)
        const response = await fetch('/api/categories/stats');
        const stats = response.ok ? await response.json() : [];
        
        // Merge with static config for gradients and icons
        const mergedCategories = CATEGORY_CONFIG.map((config) => {
          const stat = stats.find((s: any) => s.slug === config.slug);
          return {
            slug: config.slug,
            name: config.name,
            description: config.description || stat?.description || '',
            gradient: config.gradient,
            icon: config.icon,
            automationCount: stat?.automationCount || 0,
            salesLast7Days: stat?.weeklySalesCount || 0,
          };
        });
        
        // Sort by performance
        mergedCategories.sort((a, b) => {
          if (b.salesLast7Days !== a.salesLast7Days) {
            return b.salesLast7Days - a.salesLast7Days;
          }
          return b.automationCount - a.automationCount;
        });

        if (isMounted) {
          setCategories(mergedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (isMounted) {
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCategoryStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalAutomations = categories.reduce((sum, category) => sum + category.automationCount, 0);
  const totalAutomationLabel = categories.length
    ? `${formatAutomationLabel(totalAutomations)} sizi bekliyor.`
    : 'Bu hafta popüler kategoriler oluşturuluyor...';

  return (
    <section className="relative py-20 sm:py-24 lg:py-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <motion.div 
          className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-[120px]"
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]"
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="mx-auto mb-16 max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-blue-500/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-purple-400 backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Sparkles className="h-4 w-4 animate-pulse" />
            Popüler Kategoriler
          </motion.div>
          
          <h2 className="mb-6 text-4xl font-black text-foreground sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              İhtiyacınıza Uygun Çözümleri Keşfedin
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground sm:text-xl">
            AI destekli otomasyon çözümleriyle işlerinizi hızlandırın ve verimliliğinizi artırın.{' '}
            <span className="font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {isLoading ? 'Veriler yükleniyor...' : totalAutomationLabel}
            </span>
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((category, index) => (
            <CategoryCard key={category.slug} category={category} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            href="/categories"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 p-[2px] shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25"
          >
            <span className="relative inline-flex items-center gap-3 rounded-full bg-background px-8 py-4 font-semibold text-foreground transition-all group-hover:bg-background/80">
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text transition-all group-hover:text-transparent">Tüm Kategorileri Görüntüle</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 transition-all group-hover:from-purple-500/30 group-hover:to-blue-500/30">
                <ArrowRight className="h-4 w-4 text-purple-400 transition-transform group-hover:translate-x-1" />
              </div>
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
