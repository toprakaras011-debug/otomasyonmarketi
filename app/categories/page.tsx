'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Share2,
  ChartBar as BarChart3,
  Users,
  PiggyBank,
  Sparkles,
  BellRing,
  CalendarDays,
  ArrowRight,
  TrendingUp,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const staticCategories = [
  {
    slug: 'sosyal-medya',
    name: 'Sosyal Medya Otomasyonları',
    description: 'Instagram, TikTok, X (Twitter) ve YouTube için paylaşım, yorum, DM ve içerik planlama otomasyonları.',
    icon: 'Share2',
    gradientFrom: '#2563eb',
    gradientTo: '#1d4ed8',
  },
  {
    slug: 'e-ticaret-pazaryeri',
    name: 'E-Ticaret & Pazaryeri Otomasyonları',
    description: 'Trendyol, Shopify, WooCommerce, Etsy için ürün yükleme, stok senkronizasyonu ve sipariş bildirimi.',
    icon: 'ShoppingCart',
    gradientFrom: '#9333ea',
    gradientTo: '#6d28d9',
  },
  {
    slug: 'crm-musteri-yonetimi',
    name: 'CRM & Müşteri Yönetimi',
    description: 'HubSpot, Notion, Google Sheets, Airtable entegrasyonlarıyla otomatik müşteri kaydı ve e-posta takibi.',
    icon: 'Users',
    gradientFrom: '#f59e0b',
    gradientTo: '#d97706',
  },
  {
    slug: 'finans-faturalama',
    name: 'Finans & Faturalama',
    description: 'Excel, Paraşüt, Mikro, Logo, Stripe veya Supabase tabanlı gelir raporu otomasyonları.',
    icon: 'PiggyBank',
    gradientFrom: '#10b981',
    gradientTo: '#047857',
  },
  {
    slug: 'veri-raporlama',
    name: 'Veri & Raporlama',
    description: 'Google Sheets, Notion, API to Sheet ile veri toplama ve dashboard oluşturma otomasyonları.',
    icon: 'BarChart3',
    gradientFrom: '#db2777',
    gradientTo: '#9d174d',
  },
  {
    slug: 'yapay-zeka-entegrasyonlari',
    name: 'Yapay Zeka Entegrasyonları',
    description: 'ChatGPT, Midjourney, Claude ve Gemini API destekli içerik veya görsel üretim otomasyonları.',
    icon: 'Sparkles',
    gradientFrom: '#a855f7',
    gradientTo: '#7c3aed',
  },
  {
    slug: 'bildirim-email',
    name: 'Bildirim & E-posta Sistemleri',
    description: 'Slack, Telegram, WhatsApp, Discord botlarıyla otomatik bildirim ve müşteri destek mesajları.',
    icon: 'BellRing',
    gradientFrom: '#06b6d4',
    gradientTo: '#0ea5e9',
  },
  {
    slug: 'kisisel-verimlilik-takvim',
    name: 'Kişisel Verimlilik & Takvim',
    description: 'Google Calendar, Todoist, Notion ile görev planlama, alışkanlık takibi ve hatırlatıcı otomasyonları.',
    icon: 'CalendarDays',
    gradientFrom: '#6366f1',
    gradientTo: '#4338ca',
  },
];

export default function CategoriesPage() {
  const [categoriesWithStats, setCategoriesWithStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (data) {
        const statsPromises = data.map(async (category) => {
          const { count } = await supabase
            .from('automations')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .eq('is_published', true)
            .eq('admin_approved', true);

          const { data: automations } = await supabase
            .from('automations')
            .select('total_sales, rating_avg')
            .eq('category_id', category.id)
            .eq('is_published', true)
            .eq('admin_approved', true);

          const totalSales = automations?.reduce((sum, a) => sum + (a.total_sales || 0), 0) || 0;
          const avgRating = automations && automations.length > 0
            ? automations.reduce((sum, a) => sum + Number(a.rating_avg || 0), 0) / automations.length
            : 0;

          return {
            ...category,
            automationCount: count || 0,
            totalSales,
            avgRating: avgRating.toFixed(1)
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
              description: category.description,
              icon: category.icon,
              gradientFrom: category.gradientFrom,
              gradientTo: category.gradientTo,
            };
          }

          return {
            id: `static-${category.slug}`,
            slug: category.slug,
            name: category.name,
            description: category.description,
            icon: category.icon,
            gradientFrom: category.gradientFrom,
            gradientTo: category.gradientTo,
            automationCount: 0,
            totalSales: 0,
            avgRating: '0.0',
          };
        });

        const remaining = stats
          .filter((category) => !staticCategories.some((staticCat) => staticCat.slug === category.slug))
          .map((category) => ({
            ...category,
            gradientFrom: category.gradientFrom ?? '#312e81',
            gradientTo: category.gradientTo ?? '#1e1b4b',
            icon: category.icon ?? 'ShoppingCart',
          }));

        setCategoriesWithStats([...merged, ...remaining]);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const iconMap: Record<string, any> = {
    ShoppingCart,
    Share2,
    BarChart3,
    Users,
    PiggyBank,
    Sparkles,
    BellRing,
    CalendarDays,
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Otomasyon Kategorileri
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            İhtiyacınıza uygun kategoriyi seçin ve binlerce otomasyon çözümü arasından size en uygun olanı bulun
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {categoriesWithStats.map((category, index) => {
            const Icon = iconMap[category.icon as keyof typeof iconMap] || ShoppingCart;
            const gradientFrom = category.gradientFrom ?? '#3730a3';
            const gradientTo = category.gradientTo ?? '#1d4ed8';
            return (
              <Link key={category.id} href={`/automations?category=${category.slug}`}>
                <Card className="group relative h(full overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50">
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
                    }}
                  />

                  <CardHeader className="pb-4 relative">
                    <div
                      className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br shadow-lg transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-500"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`
                      }}
                    >
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                      {category.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="relative space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {category.description}
                    </p>

                    <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {category.automationCount} Otomasyon
                        </Badge>
                      </div>
                      {category.totalSales > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          <span>{category.totalSales} Satış</span>
                        </div>
                      )}
                      {Number(category.avgRating) > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{category.avgRating}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                      variant="outline"
                    >
                      Otomasyonları Gör
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-primary/20">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Aradığınız Kategoriyi Bulamadınız mı?</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Tüm otomasyonları görüntüleyerek size en uygun çözümü bulabilir veya özel ihtiyaçlarınız için geliştirici olabilirsiniz.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Link href="/automations">
                  Tüm Otomasyonları Gör
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/developer/register">
                  Geliştirici Ol
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
