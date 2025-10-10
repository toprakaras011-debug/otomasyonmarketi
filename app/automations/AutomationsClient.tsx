'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, Search, Filter } from 'lucide-react';
import { type Automation } from '@/lib/supabase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  automations: Automation[];
  categories: { id: string; name: string; slug: string }[];
}

export default function AutomationsClient({ automations, categories }: Props) {
  const searchParams = useSearchParams();
  const [filtered, setFiltered] = useState<Automation[]>(automations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [searchParams]);

  useEffect(() => {
    let list = automations;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) =>
        a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'all') {
      list = list.filter((a) => (a as any).category?.slug === selectedCategory);
    }
    setFiltered(list);
  }, [searchQuery, selectedCategory, automations]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Tüm Otomasyonlar</h1>
          <p className="text-lg text-muted-foreground">İşinizi kolaylaştıracak otomasyonları keşfedin</p>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Otomasyon ara..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Kategori Seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">Otomasyon bulunamadı.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((automation) => (
              <Link key={automation.id} href={`/automations/${automation.slug}`}>
                <Card className="group h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20">
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-blue-600/20">
                    {(automation as any).image_path ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/automation-images/${(automation as any).image_path}`}
                        alt={automation.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        priority={false}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl font-bold text-muted-foreground">
                        {automation.title.charAt(0)}
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {automation.title}
                      </h3>
                    </div>
                    {(automation as any).category && (
                      <Badge variant="outline" className="w-fit">
                        {(automation as any).category.name}
                      </Badge>
                    )}
                  </CardHeader>

                  <CardContent>
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                      {automation.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{automation.rating_avg.toFixed(1)}</span>
                        <span className="text-muted-foreground">({automation.rating_count})</span>
                      </div>
                      <div className="text-muted-foreground">
                        {automation.total_sales} satış
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">
                      {automation.price.toLocaleString('tr-TR')} ₺
                    </div>
                    <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground">
                      Detaylar
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
