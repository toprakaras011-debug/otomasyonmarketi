'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Star, Download, ExternalLink, ShoppingCart } from 'lucide-react';
import { supabase, type Automation, type Review } from '@/lib/supabase';
import { toast } from 'sonner';
import { useCart } from '@/components/cart-context';
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
  currentUser
}: AutomationDetailClientProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [hasPurchased, setHasPurchased] = useState(initialHasPurchased);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const { add } = useCart();

  const handleAddToCart = () => {
    add({
      id: automation.id,
      slug: automation.slug,
      title: automation.title,
      price: automation.price,
      image_path: (automation as any).image_path || null,
    });
    toast.success('Sepete eklendi');
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
        .select('*, user:user_profiles(*)')
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

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: automation.title,
    description: automation.description,
    image: (automation as any).image_path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/automation-images/${(automation as any).image_path}` : 'https://otomasyonmagazasi.com.tr/placeholder.jpg',
    brand: {
      '@type': 'Brand',
      name: 'Otomasyon Mağazası'
    },
    offers: {
      '@type': 'Offer',
      url: `https://otomasyonmagazasi.com.tr/automations/${automation.slug}`,
      priceCurrency: 'TRY',
      price: automation.price,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: (automation as any).developer?.username || 'Otomasyon Mağazası'
      }
    },
    aggregateRating: reviews.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: averageRating.toFixed(1),
      reviewCount: reviews.length,
      bestRating: '5',
      worstRating: '1'
    } : undefined,
    review: reviews.slice(0, 5).map(review => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: '5',
        worstRating: '1'
      },
      author: {
        '@type': 'Person',
        name: (review as any).user?.username || 'Kullanıcı'
      },
      reviewBody: review.comment,
      datePublished: review.created_at
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="relative h-96 overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-blue-600/20">
              {(automation as any).image_path ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/automation-images/${(automation as any).image_path}`}
                  alt={automation.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, (max-width: 1440px) 66vw, 960px"
                  priority
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`flex h-full items-center justify-center text-8xl font-bold text-muted-foreground ${(automation as any).image_path ? 'hidden' : ''}`}>
                {automation.title.charAt(0)}
              </div>
            </div>

            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{automation.title}</h1>
                  {automation.category && (
                    <Badge variant="outline" className="mb-4">{automation.category.name}</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviews.length} değerlendirme)</span>
                </div>
                <div className="text-muted-foreground">
                  {automation.total_sales} satış
                </div>
              </div>

              <p className="text-lg mb-6">{automation.description}</p>

              {automation.long_description && (
                <div className="prose prose-invert max-w-none">
                  <h2 className="text-2xl font-bold mb-4">Detaylı Açıklama</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{automation.long_description}</p>
                </div>
              )}

              {automation.documentation && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Kurulum Rehberi</h2>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                      <pre className="whitespace-pre-wrap text-sm">{automation.documentation}</pre>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Değerlendirmeler</h2>

              {hasPurchased && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Değerlendirme Yap</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Puan</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                            >
                              <Star
                                className={`h-8 w-8 cursor-pointer ${
                                  star <= newReview.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Yorumunuz</label>
                        <Textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder="Deneyiminizi paylaşın..."
                          rows={4}
                        />
                      </div>
                      <Button type="submit" disabled={submittingReview}>
                        {submittingReview ? 'Gönderiliyor...' : 'Yorum Yap'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Henüz değerlendirme yapılmamış.</p>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarImage src={review.user?.avatar_url} />
                            <AvatarFallback>{review.user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{review.user?.username}</span>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(review.created_at).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-primary">
                  {automation.price.toLocaleString('tr-TR')} ₺
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasPurchased ? (
                  <>
                    <Button
                      className="w-full"
                      size="lg"
                      variant="outline"
                      onClick={handleDownload}
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Dosyayı İndir
                    </Button>
                    <p className="text-sm text-center text-green-500">✓ Bu ürünü satın aldınız</p>
                  </>
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    size="lg"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Sepete Ekle
                  </Button>
                )}

                {automation.demo_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={automation.demo_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Demo İzle
                    </a>
                  </Button>
                )}

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Geliştirici</h3>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={automation.developer?.avatar_url} />
                      <AvatarFallback>
                        {automation.developer?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{automation.developer?.username}</p>
                      {automation.developer?.full_name && (
                        <p className="text-sm text-muted-foreground">
                          {automation.developer.full_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {automation.tags && automation.tags.length > 0 && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3">Etiketler</h3>
                    <div className="flex flex-wrap gap-2">
                      {automation.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
