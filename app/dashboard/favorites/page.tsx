'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Star,
  Heart,
  Trash2,
  Sparkles,
  ShoppingCart,
  Tag,
  ArrowRight,
} from 'lucide-react';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HoloIcon } from '@/components/ui/holo-icon';
import { supabase, type Favorite } from '@/lib/supabase';

export default function FavoritesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push('/auth/signin');
        return;
      }

      setUser(currentUser);

      const { data: favoritesData } = await supabase
        .from('favorites')
        .select(`
          *,
          automation:automations(
            *,
            category:categories(*)
          )
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (favoritesData) {
        setFavorites(favoritesData as any);
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter(f => f.id !== favoriteId));
      toast.success('Favorilerden kaldırıldı');
    } catch (error: any) {
      toast.error(error.message || 'İşlem başarısız');
    }
  };

  const stats = {
    totalFavorites: favorites.length,
    totalValue: favorites.reduce((sum, favorite) => sum + Number(favorite.automation?.price ?? 0), 0),
    averageRating:
      favorites.length > 0
        ? favorites.reduce((sum, favorite) => sum + Number(favorite.automation?.rating_avg ?? 0), 0) /
          favorites.length
        : 0,
    categories: new Set(
      favorites
        .map((favorite) => favorite.automation?.category?.name)
        .filter(Boolean)
    ).size,
  };

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-background">
        <Navbar />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
          <motion.div
            className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-purple-600/20 blur-[140px]"
            animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-blue-500/20 blur-[160px]"
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
            transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
          />
        </div>
        <div className="container relative mx-auto px-4 py-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-3xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 backdrop-blur-xl"
              />
            ))}
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <Navbar />
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f14_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f14_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-70" />
        <motion.div
          className="absolute -top-36 left-1/4 h-[24rem] w-[24rem] rounded-full bg-purple-500/25 blur-[160px]"
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.08, 1], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/5 h-[28rem] w-[28rem] rounded-full bg-blue-500/25 blur-[160px]"
          animate={{ opacity: [0.2, 0.45, 0.2], scale: [1, 1.1, 1], x: [0, -30, 0] }}
          transition={{ duration: 9, repeat: Infinity, delay: 0.8 }}
        />
      </div>

      <div className="container relative mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col gap-6 rounded-3xl border border-purple-500/20 bg-background/80 p-8 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(124,58,237,0.45)]"
        >
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1 text-sm font-semibold text-purple-200">
                <Sparkles className="h-4 w-4" />
                Favorilerim
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground md:text-5xl">
                En Sevdiğiniz Otomasyonlar
              </h1>
              <p className="mt-3 max-w-2xl text-base text-muted-foreground">
                Beğendiğiniz otomasyonları tek bir yerde toplayın, fırsatları kaçırmayın ve 
                kişisel koleksiyonunuzu ışık hızında yönetin.
              </p>
            </div>

            <div className="grid w-full gap-4 sm:grid-cols-3 lg:w-auto">
              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 via-transparent to-purple-500/30 p-4 text-center">
                <p className="text-sm font-medium text-purple-100/70">Favori Sayısı</p>
                <p className="mt-2 text-3xl font-black text-purple-100">
                  {stats.totalFavorites}
                </p>
              </div>
              <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/20 via-transparent to-blue-500/30 p-4 text-center">
                <p className="text-sm font-medium text-blue-100/70">Tahmini Değer</p>
                <p className="mt-2 text-3xl font-black text-blue-100">
                  {stats.totalValue.toLocaleString('tr-TR')} ₺
                </p>
              </div>
              <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/20 via-transparent to-pink-500/30 p-4 text-center">
                <p className="text-sm font-medium text-pink-100/70">Ortalama Puan</p>
                <p className="mt-2 text-3xl font-black text-pink-100">
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-2 border-purple-500/40 bg-purple-500/10 text-purple-100">
              <ShoppingCart className="h-3.5 w-3.5" /> {stats.totalFavorites} aktif koleksiyon
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 border-blue-500/40 bg-blue-500/10 text-blue-100">
              <Tag className="h-3.5 w-3.5" /> {stats.categories} kategori
            </Badge>
          </div>
        </motion.div>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-500/20 via-background/90 to-blue-500/20 p-12 text-center backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(67,97,238,0.7)]"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-black text-foreground">Henüz favori eklemediniz</h2>
            <p className="mt-3 text-base text-foreground/70">
              Beğendiğiniz otomasyonları favorilerinize ekleyerek hızlı erişim sağlayın ve kampanyalardan haberdar olun.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-10 py-6 text-base font-semibold"
            >
              <Link href="/automations" className="inline-flex items-center gap-2">
                Otomasyonları Keşfet
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((favorite, index) => (
              <motion.div
                key={favorite.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
              >
                <Card className="group relative overflow-hidden rounded-3xl border border-purple-500/20 bg-background/80 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-purple-500/40">
                  <button
                    onClick={() => handleRemoveFavorite(favorite.id)}
                    className="absolute top-4 right-4 z-20 rounded-full bg-background/70 p-2 opacity-0 shadow-lg transition-all duration-300 hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                    title="Favorilerden kaldır"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <Link href={`/automations/${favorite.automation?.slug ?? ''}`} className="block">
                    <div className="relative h-48 overflow-hidden rounded-t-3xl">
                      <div className="absolute inset-0 opacity-90">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-blue-500/25" />
                        {favorite.automation?.image_url ? (
                          <Image
                            src={favorite.automation.image_url}
                            alt={favorite.automation.title ?? 'Automation cover'}
                            fill
                            sizes="(min-width: 1280px) 33vw, (min-width: 1024px) 45vw, 100vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <HoloIcon icon={Sparkles} gradientFrom="#a855f7" gradientTo="#6366f1" />
                          </div>
                        )}
                      </div>

                      <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                        <span>Eklenme: {new Date(favorite.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>

                    <CardHeader className="relative">
                      <CardTitle className="line-clamp-2 text-xl font-semibold tracking-tight">
                        {favorite.automation?.title}
                      </CardTitle>
                      {favorite.automation?.category && (
                        <Badge className="mt-3 w-fit rounded-full border border-purple-500/40 bg-purple-500/10 text-xs font-medium text-purple-100">
                          {favorite.automation.category.name}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {favorite.automation?.description ?? 'Bu otomasyon açıklaması yakında güncellenecek.'}
                      </p>
                      <div className="mt-6 flex items-end justify-between">
                        <div className="flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-200">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          {Number(favorite.automation?.rating_avg ?? 0).toFixed(1)} / 5
                        </div>
                        <div className="text-2xl font-black text-foreground">
                          {Number(favorite.automation?.price ?? 0).toLocaleString('tr-TR')} ₺
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
