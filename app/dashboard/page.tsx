'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Download, ShoppingBag, Heart, Star } from 'lucide-react';
import Link from 'next/link';
import { supabase, type Favorite, type Purchase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
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

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      const { data: purchasesData } = await supabase
        .from('purchases')
        .select(`
          *,
          automation:automations(*)
        `)
        .eq('user_id', currentUser.id)
        .order('purchased_at', { ascending: false });

      if (purchasesData) {
        setPurchases(purchasesData as any);
      }

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

  const totalSpent = purchases
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.price_paid), 0);

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
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Hoş Geldin, {profile?.username || 'Kullanıcı'}!</h1>
          <p className="text-muted-foreground">Hesap bilgilerinizi ve satın alımlarınızı yönetin</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Satın Alım</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{purchases.filter(p => p.status === 'completed').length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Harcama</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSpent.toLocaleString('tr-TR')} ₺</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorilerim</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favorites.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="purchases" className="space-y-6">
          <TabsList>
            <TabsTrigger value="purchases">Satın Alımlar</TabsTrigger>
            <TabsTrigger value="favorites">Favoriler</TabsTrigger>
          </TabsList>

          <TabsContent value="purchases" className="space-y-4">
            {purchases.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">Henüz satın alım yapmadınız.</p>
                  <Button asChild>
                    <Link href="/automations">Otomasyonları Keşfet</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              purchases.map((purchase) => (
                <Card key={purchase.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 to-blue-600/20">
                        {purchase.automation?.image_url ? (
                          <Image
                            src={purchase.automation.image_url}
                            alt={purchase.automation.title}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-2xl font-bold text-muted-foreground">
                            {purchase.automation?.title?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg mb-1">{purchase.automation?.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {new Date(purchase.purchased_at).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <Badge variant={purchase.status === 'completed' ? 'default' : 'secondary'}>
                              {purchase.status === 'completed' ? 'Tamamlandı' :
                               purchase.status === 'pending' ? 'Bekliyor' : 'İade Edildi'}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              {Number(purchase.price_paid).toLocaleString('tr-TR')} ₺
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button size="sm" asChild>
                            <Link href={`/automations/${purchase.automation?.slug}`}>
                              Detayları Gör
                            </Link>
                          </Button>
                          {purchase.status === 'completed' && (
                            <Button size="sm" variant="outline">
                              <Download className="mr-2 h-4 w-4" />
                              İndir
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            {favorites.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">Favori listeniz boş.</p>
                  <Button asChild>
                    <Link href="/automations">Otomasyonları Keşfet</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {favorites.map((favorite) => (
                  <Link key={favorite.id} href={`/automations/${favorite.automation?.slug}`}>
                    <Card className="h-full overflow-hidden transition-all hover:scale-105 hover:shadow-lg">
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-blue-600/20">
                        {favorite.automation?.image_url ? (
                          <Image
                            src={favorite.automation.image_url}
                            alt={favorite.automation.title}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover"
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
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
