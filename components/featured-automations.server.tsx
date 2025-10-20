import Image from 'next/image';
import Link from 'next/link';
import { supabase, type Automation } from '@/lib/supabase';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp } from 'lucide-react';

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
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Öne Çıkan Otomasyonlar</h2>
          <p className="text-lg text-muted-foreground">En çok tercih edilen ve en yüksek puanlı çözümler</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {automations.map((automation, index) => (
            <div key={automation.id}>
              <Link href={`/automations/${automation.slug}`}>
                <Card className="group h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20">
                    {(automation as any).image_path ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/automation-images/${(automation as any).image_path}`}
                        alt={automation.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        priority={index < 2}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <TrendingUp className="h-16 w-16 text-purple-400/50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-purple-600 to-blue-600">Öne Çıkan</Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-lg line-clamp-2">{automation.title}</h3>
                    </div>
                    {automation.category && (
                      <Badge variant="outline" className="w-fit">{automation.category.name}</Badge>
                    )}
                  </CardHeader>

                  <CardContent>
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{automation.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{automation.rating_avg.toFixed(1)}</span>
                        <span className="text-muted-foreground">({automation.rating_count})</span>
                      </div>
                      <div className="text-muted-foreground">{automation.total_sales} satış</div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">
                      {automation.price.toLocaleString('tr-TR')} ₺
                    </div>
                    <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground">
                      İncele
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" asChild>
            <Link href="/automations">Tüm Otomasyonları Görüntüle</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
