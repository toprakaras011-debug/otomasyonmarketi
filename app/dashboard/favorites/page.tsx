'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { supabase, type Favorite } from '@/lib/supabase';
import { toast } from 'sonner';

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

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-96 bg-muted rounded-lg" />
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Favorilerim
          </h1>
          <p className="text-muted-foreground">Beğendiğiniz otomasyonlar burada</p>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Heart className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Henüz favori eklemediniz</h2>
              <p className="text-muted-foreground mb-6">
                Beğendiğiniz otomasyonları favorilerinize ekleyerek kolayca erişin
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Link href="/automations">Otomasyonları Keşfet</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="group relative overflow-hidden hover:shadow-lg transition-all">
                <button
                  onClick={() => handleRemoveFavorite(favorite.id)}
                  className="absolute top-4 right-4 z-10 rounded-full bg-background/80 p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                  title="Favorilerden kaldır"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <Link href={`/automations/${favorite.automation?.slug}`}>
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-blue-600/20">
                    {favorite.automation?.image_url ? (
                      <Image
                        src={favorite.automation.image_url}
                        alt={favorite.automation.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl font-bold text-muted-foreground">
                        {favorite.automation?.title?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{favorite.automation?.title}</CardTitle>
                    {favorite.automation?.category && (
                      <Badge variant="outline" className="w-fit">
                        {favorite.automation.category.name}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {favorite.automation?.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{favorite.automation?.rating_avg?.toFixed(1)}</span>
                      </div>
                      <div className="text-xl font-bold text-primary">
                        {Number(favorite.automation?.price).toLocaleString('tr-TR')} ₺
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
