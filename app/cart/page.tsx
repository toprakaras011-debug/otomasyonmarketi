'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { useCart } from '@/components/cart-context';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const { items, remove, clear, total } = useCart();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    load();
  }, []);

  
  
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
          className="mb-12 mt-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-black md:text-5xl">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Sepetim
              </span>
            </h1>
            <p className="mt-2 text-foreground/70">{items.length} ürün</p>
          </div>
          {items.length > 0 && (
            <Button 
              variant="outline" 
              onClick={clear}
              className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Sepeti Temizle
            </Button>
          )}
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm"
          >
            <div className="rounded-2xl bg-background/80 p-20 text-center backdrop-blur-sm">
              <ShoppingCart className="mx-auto mb-6 h-20 w-20 text-purple-400" />
              <h2 className="mb-4 text-2xl font-bold">Sepetiniz Boş</h2>
              <p className="mb-8 text-lg text-muted-foreground">Harika otomasyonları keşfetmeye başlayın!</p>
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
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl"
                >
                  <div className="rounded-2xl bg-background/80 p-6 backdrop-blur-sm">
                    <div className="flex items-start gap-6">
                      {/* Product Image */}
                      <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 shadow-lg">
                        {item.image_path ? (
                          <Image
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/automation-images/${item.image_path}`}
                            alt={item.title}
                            fill
                            sizes="128px"
                            className="object-cover transition-transform group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-muted-foreground">
                            {item.title.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">Dijital Otomasyon</p>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                              {item.price.toLocaleString('tr-TR')} ₺
                            </span>
                            <span className="text-sm text-muted-foreground line-through">
                              {(item.price * 1.5).toLocaleString('tr-TR')} ₺
                            </span>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => remove(item.id)}
                            className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Kaldır
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="sticky top-24 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm">
                <div className="rounded-2xl bg-background/80 backdrop-blur-sm">
                  <div className="p-6">
                    <h2 className="mb-6 text-xl font-bold">Sipariş Özeti</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground/70">Ara Toplam</span>
                        <span className="font-semibold">{total.toLocaleString('tr-TR')} ₺</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground/70">KDV (%18)</span>
                        <span className="font-semibold">{(total * 0.18).toLocaleString('tr-TR')} ₺</span>
                      </div>
                      <div className="border-t border-border/50 pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">Toplam</span>
                          <span className="text-3xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            {(total * 1.18).toLocaleString('tr-TR')} ₺
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-border/50 p-6">
                    {user ? (
                      <>
                        <Button 
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" 
                          disabled
                        >
                          Ödeme Sistemi Yakında
                        </Button>
                        <p className="mt-3 text-center text-xs text-muted-foreground">
                          Güvenli ödeme ile korunuyorsunuz
                        </p>
                      </>
                    ) : (
                      <>
                        <Button 
                          asChild
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          <Link href="/auth/signin?redirect=/cart">
                            Giriş Yap ve Devam Et
                          </Link>
                        </Button>
                        <p className="mt-3 text-center text-xs text-muted-foreground">
                          Güvenli ödeme ile korunuyorsunuz
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
              </div>
      </main>
    </>
  );
}
