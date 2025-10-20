'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/navbar';
import { useCart } from '@/components/cart-context';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Trash2 } from 'lucide-react';
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
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Sepet</h1>
          {items.length > 0 && (
            <Button variant="outline" onClick={clear}>
              <Trash2 className="mr-2 h-4 w-4" /> Sepeti Temizle
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground mb-6">Sepetiniz boş.</p>
            <Button asChild>
              <Link href="/automations">Otomasyonları Keşfet</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md bg-muted">
                      {item.image_path ? (
                        <Image
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/automation-images/${item.image_path}`}
                          alt={item.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl text-muted-foreground">
                          {item.title.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <Badge variant="secondary" className="mt-1">{item.price.toLocaleString('tr-TR')} ₺</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => remove(item.id)}>Kaldır</Button>
                      <Button disabled variant="secondary">
                        Ödeme devre dışı
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <h2 className="text-xl font-bold">Özet</h2>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span>Toplam</span>
                    <span className="text-2xl font-bold text-primary">{total.toLocaleString('tr-TR')} ₺</span>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between gap-3">
                  <Button className="flex-1" disabled>
                    Ödeme sistemi devre dışı
                  </Button>
                                  </CardFooter>
              </Card>
            </div>
          </div>
        )}
              </div>
    </main>
  );
}
