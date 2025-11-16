'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, Search, Filter, TrendingUp, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { type Automation as AutomationType } from '@/lib/queries/automations';
import { automationTags } from '@/lib/automation-tags';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  automations: AutomationType[];
  categories: { id: string; name: string; slug: string }[];
}

export default function AutomationsClient({ automations, categories }: Props) {
  const searchParams = useSearchParams();
  const [filtered, setFiltered] = useState<AutomationType[]>(automations);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    const searchParam = searchParams.get('search');
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let list = [...automations];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((a) =>
        a.title.toLowerCase().includes(q) || 
        (a.description?.toLowerCase().includes(q) ?? false)
      );
    }
    if (selectedCategory !== 'all') {
      list = list.filter((a) => {
        return a.category?.slug === selectedCategory;
      });
    }
    if (selectedTag !== 'all') {
      // Note: tags field is not in the query, so tag filtering is disabled for now
      // To enable: add tags to the select query in lib/queries/automations.ts
      list = list; // Keep all for now
    }
    setFiltered(list);
  }, [searchQuery, selectedCategory, selectedTag, automations]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <motion.div 
          className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]"
          animate={isMounted ? { opacity: [0.2, 0.3, 0.2] } : {}}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]"
          animate={isMounted ? { opacity: [0.2, 0.3, 0.2] } : {}}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        />
      </div>

      <Navbar />
      
      <div className="container relative mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="mb-12 mt-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4 text-5xl font-black md:text-6xl lg:text-7xl"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Tüm Otomasyonlar
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-foreground/70"
          >
            İşinizi kolaylaştıracak {filtered.length} otomasyon çözümünü keşfedin
          </motion.p>
        </div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-6 shadow-xl backdrop-blur-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-purple-400" />
              <Input
                type="search"
                placeholder="Otomasyon ara..."
                className="h-12 border-purple-500/20 bg-background/50 pl-12 text-base backdrop-blur-sm transition-all focus:border-purple-500/40 focus:ring-purple-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="w-full sm:w-[220px]" suppressHydrationWarning>
                {isMounted ? (
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="h-12 w-full border-purple-500/20 bg-background/50 backdrop-blur-sm">
                      <Filter className="mr-2 h-4 w-4 text-purple-400" />
                      <SelectValue placeholder="Kategori Seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Kategoriler</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.slug} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex h-12 w-full items-center justify-start gap-2 rounded-md border border-purple-500/20 bg-background/50 px-3 text-sm text-foreground/60 backdrop-blur-sm">
                    <Filter className="h-4 w-4 text-purple-400" />
                    <span>Kategori Seç</span>
                  </div>
                )}
              </div>

              <div className="w-full sm:w-[220px]" suppressHydrationWarning>
                {isMounted ? (
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="h-12 w-full border-purple-500/20 bg-background/50 backdrop-blur-sm">
                      <Filter className="mr-2 h-4 w-4 text-purple-400" />
                      <SelectValue placeholder="Platform seç" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Platformlar</SelectItem>
                      {automationTags.map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex h-12 w-full items-center justify-start gap-2 rounded-md border border-purple-500/20 bg-background/50 px-3 text-sm text-foreground/60 backdrop-blur-sm">
                    <Filter className="h-4 w-4 text-purple-400" />
                    <span>Platform seç</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={typeof window !== 'undefined' ? { opacity: 1, scale: 1 } : { opacity: 0 }}
            className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent p-20 text-center shadow-xl backdrop-blur-sm"
          >
            <Sparkles className="mx-auto mb-4 h-16 w-16 text-purple-400/50" />
            <p className="text-xl font-semibold text-foreground/70">Otomasyon bulunamadı</p>
            <p className="mt-2 text-sm text-foreground/50">Farklı filtreler deneyebilirsiniz</p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((automation, index) => (
              <motion.div
                key={automation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="gpu-accelerated"
              >
                <Link href={`/automations/${automation.slug}`} className="group block">
                  <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:from-purple-500/20 hover:to-blue-500/20">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 opacity-0 blur-xl transition-opacity group-hover:opacity-20" />
                    
                    {/* Card Content */}
                    <div className="relative h-full overflow-hidden rounded-2xl bg-background/80 backdrop-blur-sm">
                      {/* Image Section */}
                      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20">
                        {(automation.image_path || automation.image_url) ? (
                          <Image
                            src={
                              automation.image_path 
                                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/automation-images/${automation.image_path}`
                                : automation.image_url || ''
                            }
                            alt={automation.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            priority={false}
                            loading="lazy"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.parentElement?.querySelector('.image-fallback');
                              if (fallback) (fallback as HTMLElement).style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="image-fallback flex h-full items-center justify-center" style={{ display: automation.image_path || automation.image_url ? 'none' : 'flex' }}>
                          <TrendingUp className="h-16 w-16 text-purple-400/50" />
                        </div>
                        
                        {/* Featured Badge (if applicable) */}
                        {false && (
                          <div className="absolute top-4 right-4">
                            <Badge className="border-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
                              <Zap className="mr-1 h-3 w-3" />
                              Öne Çıkan
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        {/* Title & Category */}
                        <div className="mb-4">
                          <h3 className="mb-2 text-xl font-bold line-clamp-2 transition-colors group-hover:text-purple-400">
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
                          {automation.rating_avg !== null && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{automation.rating_avg.toFixed(1)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-foreground/70">
                            <TrendingUp className="h-4 w-4" />
                            <span>{automation.total_sales} satış</span>
                          </div>
                        </div>

                        {/* Price & CTA */}
                        <div className="flex items-center justify-between border-t border-border/50 pt-4">
                          <div className="text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            {automation.price.toLocaleString('tr-TR')} ₺
                            <span className="text-xs text-foreground/60 block mt-1">KDV Dahil</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-purple-400 transition-all group-hover:gap-3">
                            İncele
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
