'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IconBox } from '@/components/ui/icon-box';
import { Download, ShoppingBag, Heart, Star, TrendingUp, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { supabase, type Favorite, type Purchase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Wait a bit for session to be established (especially after redirect)
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Try to get session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('[DEBUG] dashboard/page.tsx - Session check', {
        hasSession: !!session,
        hasUser: !!session?.user,
        sessionError: sessionError ? {
          message: sessionError.message,
          code: sessionError.code,
        } : null,
      });
      
      // If no session, try getUser
      if (!session) {
        console.log('[DEBUG] dashboard/page.tsx - No session, trying getUser...');
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

      console.log('[DEBUG] dashboard/page.tsx - User check', {
        hasUser: !!currentUser,
        userId: currentUser?.id,
        userError: userError ? {
          message: userError.message,
          code: userError.code,
        } : null,
      });

      if (!currentUser) {
        console.warn('[DEBUG] dashboard/page.tsx - No user found, redirecting to signin');
        router.replace('/auth/signin');
        return;
      }

      setUser(currentUser);

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('id,username,avatar_url,role,is_admin,is_developer,developer_approved')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Try to fetch purchases with error handling
      try {
        // First check if purchases table exists and user has access
        const { data: purchasesData, error: purchasesError } = await supabase
          .from('purchases')
          .select(`
            id,
            user_id,
            automation_id,
            price,
            status,
            purchased_at,
            automation:automations!inner(
              id,
              title,
              slug,
              image_url,
              is_published,
              admin_approved
            )
          `)
          .eq('user_id', currentUser.id)
          .eq('status', 'completed')
          .order('purchased_at', { ascending: false });
        
        if (purchasesError) {
          // Silently handle errors - purchases may not exist for new users
          console.warn('Purchases fetch error:', purchasesError.message);
          setPurchases([]);
        } else {
          setPurchases(purchasesData || []);
        }
      } catch (error) {
        console.error('Purchases fetch exception:', error);
        setPurchases([]);
      }

      const { data: favoritesData } = await supabase
        .from('favorites')
        .select(`
          id,created_at,
          automation:automations(
            id,title,slug,description,price,image_url,total_sales,rating_avg,
            category:categories(id,name,slug)
          )
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(50);

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
      <>
        <Navbar />
        <main className="relative min-h-screen overflow-hidden bg-background">
          <div className="container relative mx-auto px-4 py-12">
            <div className="space-y-8">
              <div className="h-32 animate-pulse rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
              <div className="grid gap-6 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 animate-pulse rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
                ))}
              </div>
              <div className="h-96 animate-pulse rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen overflow-hidden bg-background">
        {/* Background Effects */}
        <div className="absolute inset-0">
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 mt-8 pt-8"
        >
          <h1 className="mb-2 text-4xl font-black md:text-5xl">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Hoş Geldin, {profile?.username || 'Kullanıcı'}!
            </span>
          </h1>
          <p className="text-foreground/70">Hesap bilgilerinizi ve satın alımlarınızı yönetin</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { 
              icon: Package, 
              label: 'Toplam Satın Alım', 
              value: purchases.filter(p => p.status === 'completed').length, 
              gradient: 'from-purple-600 to-blue-600',
              description: 'Tamamlanan siparişler'
            },
            { 
              icon: TrendingUp, 
              label: 'Toplam Harcama', 
              value: `${totalSpent.toLocaleString('tr-TR')} ₺`, 
              gradient: 'from-pink-600 to-rose-600',
              description: 'Toplam ödeme tutarı'
            },
            { 
              icon: Heart, 
              label: 'Favorilerim', 
              value: favorites.length, 
              gradient: 'from-red-600 to-pink-600',
              description: 'Beğenilen otomasyonlar'
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl"
            >
              <div className="rounded-2xl bg-background/80 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground/60">{stat.label}</p>
                    <p className="mt-1 text-xs text-foreground/40">{stat.description}</p>
                  </div>
                  <IconBox icon={stat.icon} gradient={stat.gradient} size="sm" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="purchases" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="purchases">Satın Alımlar</TabsTrigger>
              <TabsTrigger value="favorites">Favoriler</TabsTrigger>
            </TabsList>

            <TabsContent value="purchases" className="space-y-4">
              {purchases.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm"
                >
                  <div className="rounded-2xl bg-background/80 p-16 text-center backdrop-blur-sm">
                    <Package className="mx-auto mb-6 h-20 w-20 text-purple-400" />
                    <h3 className="mb-2 text-2xl font-bold">Henüz Satın Alım Yok</h3>
                    <p className="mb-8 text-muted-foreground">Harika otomasyonları keşfetmeye başlayın!</p>
                    <Button 
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Link href="/automations">
                        Otomasyonları Keşfet
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ) : (
                purchases.map((purchase, index) => (
                  <motion.div
                    key={purchase.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl"
                  >
                    <div className="rounded-2xl bg-background/80 p-6 backdrop-blur-sm">
                      <div className="flex items-start gap-6">
                        {/* Purchase Image */}
                        <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 shadow-lg">
                          {purchase.automation?.image_url ? (
                            <Image
                              src={purchase.automation.image_url}
                              alt={purchase.automation.title}
                              fill
                              sizes="128px"
                              className="object-cover transition-transform group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-4xl font-bold text-muted-foreground">
                              {purchase.automation?.title?.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Purchase Info */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="mb-2 flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold">{purchase.automation?.title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {new Date(purchase.purchased_at).toLocaleDateString('tr-TR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                              <Badge 
                                className={purchase.status === 'completed' 
                                  ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                                  : 'bg-gradient-to-r from-yellow-600 to-orange-600'
                                }
                              >
                                {purchase.status === 'completed' ? 'Tamamlandı' :
                                 purchase.status === 'pending' ? 'Bekliyor' : 'İade Edildi'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-baseline gap-2">
                              <span className="text-3xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                {Number(purchase.price_paid).toLocaleString('tr-TR')} ₺
                              </span>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/automations/${purchase.automation?.slug}`}>
                                  Detayları Gör
                                </Link>
                              </Button>
                              {purchase.status === 'completed' && (
                                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                                  <Download className="mr-2 h-4 w-4" />
                                  İndir
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
            )}
          </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              {favorites.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm"
                >
                  <div className="rounded-2xl bg-background/80 p-16 text-center backdrop-blur-sm">
                    <Heart className="mx-auto mb-6 h-20 w-20 text-pink-400" />
                    <h3 className="mb-2 text-2xl font-bold">Favori Listeniz Boş</h3>
                    <p className="mb-8 text-muted-foreground">Beğendiğiniz otomasyonları favorilere ekleyin!</p>
                    <Button 
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Link href="/automations">
                        Otomasyonları Keşfet
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {favorites.map((favorite, index) => (
                    <motion.div
                      key={favorite.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/automations/${favorite.automation?.slug}`}>
                        <div className="group h-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm transition-all hover:scale-[1.02]">
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
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      </main>
      <Footer />
    </>
  );
}
