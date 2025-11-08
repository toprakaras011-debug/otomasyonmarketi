'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
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
  featuredAutomation?: {
    title: string;
    slug?: string;
  } | null;
};

type PurchaseRow = {
  price_paid: number | null;
  purchased_at: string;
  automation: {
    id: string | number | null;
    title: string;
    slug: string | null;
    is_published: boolean;
    admin_approved: boolean;
    category_id: string | null;
    category: {
      id: string;
      slug: string;
      name: string;
      description: string | null;
    } | null;
  } | null;
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

function CategoryCard({ category }: { category: CategoryStat }) {
  const config = CATEGORY_CONFIG.find((cfg) => cfg.slug === category.slug);
  const iconKey: CategoryIconKey = (config?.icon ?? category.icon ?? 'sparkles') as CategoryIconKey;
  const Icon = CATEGORY_ICON_MAP[iconKey];
  const descriptionText = config?.description || category.description || 'Kategori detayları yakında.';

  return (
    <Link href={`/automations?category=${category.slug}`}>
      <Card className="space-y-6 border border-border bg-background/95 p-6 transition-transform duration-200 hover:-translate-y-1">
        <div className={`inline-flex rounded-xl bg-gradient-to-br ${category.gradient} p-3 text-white`}>
          <Icon className="h-8 w-8" />
        </div>

        <div>
          <h3 className="text-2xl font-bold text-foreground">{category.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{descriptionText}</p>
        </div>

        <div className="rounded-2xl border border-dashed border-purple-500/30 bg-purple-500/5 p-5 text-center text-sm font-semibold text-purple-600">
          {formatAutomationLabel(category.automationCount)}
        </div>

        {category.featuredAutomation?.title && (
          <div className="rounded-lg border border-border/40 bg-background/80 p-4 text-left">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-purple-500">Öne Çıkan</p>
            <p className="mt-2 text-sm text-foreground">{category.featuredAutomation.title}</p>
          </div>
        )}

        <div className="inline-flex items-center text-sm font-semibold text-purple-600">
          Keşfet
          <ArrowRight className="ml-2 h-4 w-4" />
        </div>
      </Card>
    </Link>
  );
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchCategoryStats = async () => {
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: purchaseRowsRaw, error: purchasesError } = await supabase
          .from('purchases')
          .select(
            `price_paid,
             purchased_at,
             automation:automations(
               id,
               title,
               slug,
               is_published,
               admin_approved,
               category_id,
               category:categories(
                 id,
                 slug,
                 name,
                 description
               )
             )`
          )
          .eq('status', 'completed')
          .gte('purchased_at', sevenDaysAgo.toISOString());

        if (purchasesError) {
          throw purchasesError;
        }

        const purchaseRows = ((purchaseRowsRaw ?? []) as any[]).map((row) => {
          const raw = row as any;
          const automation = raw?.automation;
          return {
            price_paid: raw?.price_paid ?? null,
            purchased_at: raw?.purchased_at ?? '',
            automation: automation
              ? {
                  id: automation.id ?? null,
                  title: automation.title ?? 'İsimsiz Otomasyon',
                  slug: automation.slug ?? null,
                  is_published: Boolean(automation.is_published),
                  admin_approved: Boolean(automation.admin_approved),
                  category_id: automation.category_id ?? null,
                  category: automation.category
                    ? {
                        id: automation.category.id,
                        slug: automation.category.slug,
                        name: automation.category.name,
                        description: automation.category.description ?? null,
                      }
                    : null,
                }
              : null,
          } satisfies PurchaseRow;
        }) as PurchaseRow[];

        const categoryMap = new Map<
          string,
          {
            stat: CategoryStat;
            automationSales: Map<
              string,
              {
                total: number;
                count: number;
                title: string;
                slug?: string;
              }
            >;
            automationIds: Set<string>;
            categoryId?: string | null;
          }
        >();

        (purchaseRows ?? []).forEach((row) => {
          const automation = row?.automation;
          if (!automation || !automation.is_published || !automation.admin_approved) return;

          const category = automation.category;
          if (!category?.slug) return;

          const automationIdSource = automation.id ?? automation.slug ?? automation.title;
          if (!automationIdSource) return;
          const automationId = String(automationIdSource);

          const config = CATEGORY_CONFIG.find((cfg) => cfg.slug === category.slug);
          const gradient = config?.gradient ?? 'from-purple-600 via-pink-500 to-blue-600';
          const icon = config?.icon ?? 'trending';
          const name = config?.name ?? category.name ?? 'Popüler Kategori';
          const description = config?.description ?? '';

          let entry = categoryMap.get(category.slug);
          if (!entry) {
            entry = {
              stat: {
                slug: category.slug,
                name,
                description,
                gradient,
                icon,
                automationCount: 0,
                salesLast7Days: 0,
                featuredAutomation: null,
              },
              automationSales: new Map(),
              automationIds: new Set(),
              categoryId: category.id,
            };
            categoryMap.set(category.slug, entry);
          } else if (!entry.categoryId && category.id) {
            entry.categoryId = category.id;
          }

          const pricePaid = Number(row.price_paid ?? 0);
          entry.stat.salesLast7Days += pricePaid;
          entry.automationIds.add(automationId);

          const currentAutomation = entry.automationSales.get(automationId) ?? {
            total: 0,
            count: 0,
            title: automation.title,
            slug: automation.slug ?? undefined,
          };

          currentAutomation.total += pricePaid;
          currentAutomation.count += 1;
          entry.automationSales.set(automationId, currentAutomation);
        });

        let derivedCategories: CategoryStat[] = await Promise.all(
          Array.from(categoryMap.values()).map(async ({ stat, automationSales, automationIds, categoryId }) => {
            const topAutomation = Array.from(automationSales.values()).sort((a, b) => {
              if (b.total !== a.total) return b.total - a.total;
              return b.count - a.count;
            })[0];

            let automationCount = automationIds.size;
            if (categoryId) {
              const { count, error: countError } = await supabase
                .from('automations')
                .select('id', { count: 'exact', head: true })
                .eq('category_id', categoryId)
                .eq('is_published', true)
                .eq('admin_approved', true);

              if (!countError && typeof count === 'number') {
                automationCount = count;
              }
            }

            return {
              ...stat,
              automationCount,
              featuredAutomation: topAutomation
                ? {
                    title: topAutomation.title,
                    slug: topAutomation.slug,
                  }
                : null,
            };
          })
        );

        if (derivedCategories.length === 0) {
          const { data: categoriesTable, error: categoriesError } = await supabase
            .from('categories')
            .select('id, slug, name, description');

          if (categoriesError) {
            throw categoriesError;
          }

          const results = await Promise.all(
            CATEGORY_CONFIG.map(async (config) => {
              const match = (categoriesTable ?? []).find((category) => category.slug === config.slug);
              if (!match) {
                return null;
              }

              const { count, error: countError } = await supabase
                .from('automations')
                .select('id', { count: 'exact', head: true })
                .eq('category_id', match.id)
                .eq('is_published', true)
                .eq('admin_approved', true);

              if (countError) {
                return null;
              }

              return {
                slug: config.slug,
                name: config.name,
                description: config.description ?? '',
                gradient: config.gradient,
                icon: config.icon,
                automationCount: typeof count === 'number' ? count : 0,
                salesLast7Days: 0,
                featuredAutomation: null,
              } satisfies CategoryStat;
            })
          );

          derivedCategories = results.filter(Boolean) as CategoryStat[];
        }

        derivedCategories.sort((a, b) => {
          if (b.salesLast7Days !== a.salesLast7Days) {
            return b.salesLast7Days - a.salesLast7Days;
          }
          return b.automationCount - a.automationCount;
        });

        const limitedCategories = derivedCategories.slice(0, CATEGORY_CONFIG.length);

        if (isMounted) {
          setCategories(limitedCategories);
        }
      } catch (error) {
        if (isMounted) {
          setCategories(
            CATEGORY_CONFIG.map((config) => ({
              slug: config.slug,
              name: config.name,
              description: config.description,
              gradient: config.gradient,
              icon: config.icon,
              automationCount: config.baselineCount,
              salesLast7Days: 0,
              featuredAutomation: null,
            }))
          );
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
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/40 bg-purple-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-purple-500">
            <Sparkles className="h-4 w-4" />
            Popüler Kategoriler
          </div>
          <h2 className="text-balance text-3xl font-black text-foreground sm:text-4xl">
            İhtiyacınıza Uygun Çözümleri Keşfedin
          </h2>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            AI destekli otomasyon çözümleriyle işlerinizi hızlandırın ve verimliliğinizi artırın.{' '}
            <span className="font-semibold text-purple-500">
              {isLoading ? 'Veriler yükleniyor...' : totalAutomationLabel}
            </span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.slice(0, 6).map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-purple-500/50"
          >
            Tüm Kategorileri Görüntüle
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
