import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase, type Automation } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Sparkles, ArrowRight, Zap } from 'lucide-react';

export const revalidate = 60;

async function getFeaturedAutomations(): Promise<Automation[]> {
  const { data, error } = await supabase
    .from('automations')
    .select(`
      *,
      category:categories(*),
      developer:user_profiles(*)
    `)
    .eq('is_published', true)
    .eq('admin_approved', true)
    .eq('is_featured', true)
    .order('total_sales', { ascending: false })
    .limit(6);

  if (error || !data) return [] as any;
  return data as any;
}

export default async function FeaturedAutomationsServer() {
  const automations = await getFeaturedAutomations();
  if (automations.length === 0) return null;

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />
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

      <div className="container relative mx-auto px-4">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Öne Çıkan Çözümler</span>
          </div>
          
          <h2 className="mb-4 text-4xl font-black md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              En Popüler
            </span>
            <br />
            <span className="text-foreground">Otomasyonlar</span>
          </h2>
          
          <p className="mx-auto max-w-2xl text-lg text-foreground/70">
            En çok tercih edilen ve en yüksek puanlı otomasyon çözümleri
          </p>
        </div>

        {/* Automations Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {automations.map((automation, index) => (
            <Link 
              key={automation.id} 
              href={`/automations/${automation.slug}`}
              className="group"
            >
              <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:from-purple-500/20 hover:to-blue-500/20">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 opacity-0 blur-xl transition-opacity group-hover:opacity-20" />
                
                {/* Card Content */}
                <div className="relative h-full overflow-hidden rounded-2xl bg-background/80 backdrop-blur-sm">
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20">
                    {(automation as any).image_path ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/automation-images/${(automation as any).image_path}`}
                        alt={automation.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        priority={index < 2}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <TrendingUp className="h-16 w-16 text-purple-400/50" />
                      </div>
                    )}
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    
                    {/* Featured Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className="border-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
                        <Zap className="mr-1 h-3 w-3" />
                        Öne Çıkan
                      </Badge>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    {/* Title & Category */}
                    <div className="mb-4">
                      <h3 className="mb-2 text-xl font-bold line-clamp-2 group-hover:text-purple-400 transition-colors">
                        {automation.title}
                      </h3>
                      {automation.category && (
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                          {automation.category.name}
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="mb-4 text-sm text-foreground/70 line-clamp-3">
                      {automation.description}
                    </p>

                    {/* Stats */}
                    <div className="mb-4 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{automation.rating_avg.toFixed(1)}</span>
                        <span className="text-foreground/50">({automation.rating_count})</span>
                      </div>
                      <div className="flex items-center gap-1 text-foreground/70">
                        <TrendingUp className="h-4 w-4" />
                        <span>{automation.total_sales} satış</span>
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between border-t border-border/50 pt-4">
                      <div className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        {automation.price.toLocaleString('tr-TR')} ₺
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-purple-400 group-hover:gap-3 transition-all">
                        İncele
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-16 text-center">
          <Link href="/automations">
            <Button 
              size="lg" 
              className="group h-14 bg-gradient-to-r from-purple-600 to-blue-600 px-8 text-lg font-bold shadow-lg shadow-purple-500/50 transition-all hover:scale-105 hover:shadow-purple-500/70"
            >
              Tüm Otomasyonları Görüntüle
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
