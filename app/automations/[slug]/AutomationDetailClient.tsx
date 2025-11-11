'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Star, Download, ExternalLink, ShoppingCart, Sparkles, TrendingUp, Zap, CheckCircle2, FileText, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { supabase, type Automation, type Review } from '@/lib/supabase';
import { toast } from 'sonner';
import { useCart } from '@/components/cart-context';
import { useAuth } from '@/components/auth-provider';
import type { User } from '@supabase/supabase-js';

interface AutomationDetailClientProps {
  automation: Automation;
  initialReviews: Review[];
  initialHasPurchased: boolean;
  currentUser: User | null;
}

export default function AutomationDetailClient({ 
  automation, 
  initialReviews, 
  initialHasPurchased,
  currentUser: initialCurrentUser // This will be removed in a future step, but kept for now to avoid breaking the parent
}: AutomationDetailClientProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [hasPurchased, setHasPurchased] = useState(initialHasPurchased);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const { add } = useCart();
  const { user: currentUser, loading } = useAuth(); // Use the central auth state

  const handleAddToCart = () => {
    if (loading && !currentUser) {
      toast.info('Lütfen bekleyin...');
      return;
    }
    
    // Add to cart first
    add({
      id: automation.id,
      slug: automation.slug,
      title: automation.title,
      price: automation.price,
      image_path: (automation as any).image_path || automation.image_url || null,
    });
    
    toast.success('Sepete eklendi');
    
    // If user is not logged in, redirect to signin page
    if (!currentUser) {
      router.push('/auth/signin?redirect=/cart');
    }
  };

  const handleDownload = async () => {
    if (!currentUser || !automation) return;

    if (!hasPurchased) {
      toast.error('Dosyayı indirebilmek için ürünü satın almalısınız');
      return;
    }

    const filePath = (automation as any).file_path;
    if (!filePath) {
      toast.error('İndirilecek dosya bulunamadı');
      return;
    }

    try {
      const { data, error } = await supabase.storage
        .from('automation-files')
        .download(filePath);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'automation-file';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      await supabase.from('download_logs').insert({
        user_id: currentUser.id,
        automation_id: automation.id,
      });

      toast.success('Dosya indiriliyor...');
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Dosya indirilirken bir hata oluştu');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !automation) {
      toast.error('Yorum yapabilmek için giriş yapmalısınız');
      return;
    }

    if (!hasPurchased) {
      toast.error('Yorum yapabilmek için ürünü satın almalısınız');
      return;
    }

    setSubmittingReview(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          automation_id: automation.id,
          user_id: currentUser.id,
          rating: newReview.rating,
          comment: newReview.comment,
        });

      if (error) throw error;

      toast.success('Yorumunuz eklendi!');
      setNewReview({ rating: 5, comment: '' });

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('id,rating,comment,created_at, user:user_profiles(id,username,avatar_url)')
        .eq('automation_id', automation.id)
        .order('created_at', { ascending: false });

      if (reviewsData) {
        setReviews(reviewsData as any);
      }
    } catch (error: any) {
      toast.error(error.message || 'Yorum eklenemedi');
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  // Build Product schema for Rich Snippets (both domains)
  const productUrl = `https://otomasyonmagazasi.com/automations/${automation.slug}`;
  const productUrlAlt = `https://otomasyonmagazasi.com.tr/automations/${automation.slug}`;
  const productJsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: automation.title,
    description: automation.description,
    sku: automation.id.toString(),
    mpn: automation.slug,
    url: productUrl,
    sameAs: [productUrlAlt], // Alternate domain
    category: (Array.isArray(automation.category) ? automation.category[0] : automation.category)?.name,
    image: (automation as any).image_path 
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/automation-images/${(automation as any).image_path}`
      : automation.image_url || 'https://otomasyonmagazasi.com/placeholder.jpg',
    brand: {
      '@type': 'Brand',
      name: (automation as any).developer?.username || 'Otomasyon Mağazası'
    },
    offers: [
      {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: 'TRY',
        price: automation.price.toString(),
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: (automation as any).developer?.username || 'Otomasyon Mağazası'
        }
      },
      {
        '@type': 'Offer',
        url: productUrlAlt,
        priceCurrency: 'TRY',
        price: automation.price.toString(),
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: (automation as any).developer?.username || 'Otomasyon Mağazası'
        }
      }
    ]
  };

  // Add aggregateRating only if reviews exist
  if (reviews.length > 0 && averageRating > 0) {
    productJsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: reviews.length,
      bestRating: '5',
      worstRating: '1'
    };

    // Add reviews (max 5 for Rich Snippets)
    productJsonLd.review = reviews.slice(0, 5).map((review: any) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating.toString(),
        bestRating: '5',
        worstRating: '1'
      },
      author: {
        '@type': 'Person',
        name: review.user?.username || 'Kullanıcı'
      },
      reviewBody: review.comment || '',
      datePublished: review.created_at
    }));
  }

  // Add BreadcrumbList for Rich Snippets (both domains)
  const category = Array.isArray(automation.category) ? automation.category[0] : automation.category;
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ana Sayfa',
        item: 'https://otomasyonmagazasi.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Otomasyonlar',
        item: 'https://otomasyonmagazasi.com/automations'
      },
      ...(category ? [{
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `https://otomasyonmagazasi.com/categories/${category.slug}`
      }] : []),
      {
        '@type': 'ListItem',
        position: category ? 4 : 3,
        name: automation.title,
        item: `https://otomasyonmagazasi.com/automations/${automation.slug}`
      }
    ]
  };

  // Alternate BreadcrumbList for otomasyonmagazasi.com.tr domain
  const breadcrumbJsonLdAlt = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ana Sayfa',
        item: 'https://otomasyonmagazasi.com.tr'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Otomasyonlar',
        item: 'https://otomasyonmagazasi.com.tr/automations'
      },
      ...(category ? [{
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `https://otomasyonmagazasi.com.tr/categories/${category.slug}`
      }] : []),
      {
        '@type': 'ListItem',
        position: category ? 4 : 3,
        name: automation.title,
        item: `https://otomasyonmagazasi.com.tr/automations/${automation.slug}`
      }
    ]
  };

  return (
    <>
      {/* Product Schema for Rich Snippets (Primary Domain) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {/* BreadcrumbList Schema for Rich Snippets (Primary Domain) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* BreadcrumbList Schema for Rich Snippets (Alternate Domain) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLdAlt) }}
      />
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
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

      <div className="container relative mx-auto px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-2xl backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 opacity-0 blur-xl transition-opacity group-hover:opacity-20" />
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20">
                {((automation as any).image_path || automation.image_url) ? (
                  <Image
                    src={
                      (automation as any).image_path 
                        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/automation-images/${(automation as any).image_path}`
                        : automation.image_url || ''
                    }
                    alt={automation.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, (max-width: 1440px) 66vw, 960px"
                    priority
                    quality={80}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.parentElement?.querySelector('.image-fallback');
                      if (fallback) (fallback as HTMLElement).style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="image-fallback flex h-full items-center justify-center" style={{ display: (automation as any).image_path || automation.image_url ? 'none' : 'flex' }}>
                  <Sparkles className="h-32 w-32 text-purple-400/50" />
                </div>
              </div>
            </motion.div>

            {/* Title & Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-8 shadow-xl backdrop-blur-sm"
            >
              <div className="mb-6">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mb-4 text-xl font-bold"
                >
                  {automation.title}
                </motion.h1>
                {(() => {
                  const category = Array.isArray(automation.category) ? automation.category[0] : automation.category;
                  return category && (
                    <Badge className="border-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      {category.name}
                    </Badge>
                  );
                })()}
              </div>

              <div className="mb-6 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-bold">{averageRating.toFixed(1)}</span>
                  <span className="text-foreground/60">({reviews.length} değerlendirme)</span>
                </div>
                <div className="flex items-center gap-2 text-foreground/70">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  <span className="font-semibold">{automation.total_sales} satış</span>
                </div>
              </div>

              <p className="text-lg leading-relaxed text-foreground/80">{automation.description}</p>
            </motion.div>

              {automation.long_description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-8 shadow-xl backdrop-blur-sm"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <FileText className="h-6 w-6 text-purple-400" />
                    <h2 className="text-2xl font-bold">Detaylı Açıklama</h2>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed text-foreground/70">{automation.long_description}</p>
                </motion.div>
              )}

              {automation.documentation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-8 shadow-xl backdrop-blur-sm"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-purple-400" />
                    <h2 className="text-2xl font-bold">Kurulum Rehberi</h2>
                  </div>
                  <div className="rounded-xl bg-background/50 p-6 backdrop-blur-sm">
                    <pre className="whitespace-pre-wrap text-sm text-foreground/70">{automation.documentation}</pre>
                  </div>
                </motion.div>
              )}
            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="mb-6 text-2xl font-bold">Değerlendirmeler</h2>

              {hasPurchased && (
                <div className="mb-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-6 shadow-xl backdrop-blur-sm">
                  <h3 className="mb-4 text-lg font-bold">Değerlendirme Yap</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Puan</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                          >
                            <Star
                              className={`h-8 w-8 cursor-pointer transition-all ${
                                star <= newReview.rating
                                  ? 'fill-yellow-400 text-yellow-400 scale-110'
                                  : 'text-foreground/30 hover:text-foreground/50'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Yorumunuz</label>
                      <Textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        placeholder="Deneyiminizi paylaşın..."
                        rows={4}
                        className="border-purple-500/20 bg-background/50 backdrop-blur-sm"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {submittingReview ? 'Gönderiliyor...' : 'Yorum Yap'}
                    </Button>
                  </form>
                </div>
              )}

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-transparent p-12 text-center shadow-xl backdrop-blur-sm">
                    <Sparkles className="mx-auto mb-4 h-12 w-12 text-purple-400/50" />
                    <p className="text-foreground/60">Henüz değerlendirme yapılmamış</p>
                  </div>
                ) : (
                  reviews.map((review) => {
                    const user = Array.isArray((review as any).user) ? (review as any).user[0] : (review as any).user;
                    return (
                      <div
                        key={review.id}
                        className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-6 shadow-xl backdrop-blur-sm"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 border-2 border-purple-500/20">
                            <AvatarImage src={user?.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                              {user?.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <span className="font-semibold">{user?.username}</span>
                            </div>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-foreground/20'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="mt-2 text-foreground/70">{review.comment}</p>
                            <p className="mt-2 text-xs text-foreground/50">
                              {new Date(review.created_at).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Purchase Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-2xl backdrop-blur-sm">
              <div className="rounded-2xl bg-background/80 p-6 backdrop-blur-sm">
                {/* Price */}
                <div className="mb-6 text-center">
                  <div className="mb-2 text-sm font-medium text-foreground/60">Fiyat</div>
                  <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {automation.price.toLocaleString('tr-TR')} ₺
                  </div>
                  <div className="mt-2 rounded-lg bg-blue-500/10 border border-blue-500/20 p-2">
                    <p className="text-xs text-foreground/70">
                      <strong className="text-blue-600 dark:text-blue-400">KDV Dahil:</strong> Fiyat KDV dahil olarak gösterilmiştir.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {hasPurchased ? (
                    <>
                      <Button
                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
                        size="lg"
                        onClick={handleDownload}
                      >
                        <Download className="mr-2 h-5 w-5" />
                        Dosyayı İndir
                      </Button>
                      <div className="flex items-center justify-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm font-medium text-green-500">
                        <CheckCircle2 className="h-4 w-4" />
                        Bu ürünü satın aldınız
                      </div>
                    </>
                  ) : (
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/50 transition-all"
                      size="lg"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Sepete Ekle
                    </Button>
                  )}

                  {automation.demo_url && (
                    <Button
                      variant="outline"
                      className="w-full h-12 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/10"
                      asChild
                    >
                      <a href={automation.demo_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Demo İzle
                      </a>
                    </Button>
                  )}
                </div>

                {/* Developer Info */}
                <div className="mt-6 border-t border-border/50 pt-6">
                  <h3 className="mb-3 text-sm font-semibold text-foreground/70">Geliştirici</h3>
                  {(() => {
                    const developer = Array.isArray((automation as any).developer) ? (automation as any).developer[0] : (automation as any).developer;
                    return developer ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-purple-500/20">
                          <AvatarImage src={developer?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                            {developer?.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{developer?.username || 'Geliştirici'}</p>
                          <p className="text-xs text-foreground/50">
                            Geliştirici
                          </p>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Tags */}
                {automation.tags && automation.tags.length > 0 && (
                  <div className="mt-6 border-t border-border/50 pt-6">
                    <h3 className="mb-3 text-sm font-semibold text-foreground/70">Etiketler</h3>
                    <div className="flex flex-wrap gap-2">
                      {automation.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="border-purple-500/30 text-purple-400"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
