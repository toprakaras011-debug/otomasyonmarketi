'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { useCart } from '@/components/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, User, Phone, MapPin, Shield, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function GuestCheckoutPage() {
  const router = useRouter();
  const { items, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save guest order to database
      const response = await fetch('/api/checkout/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
          })),
          customerInfo: {
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sipariş oluşturulamadı');
      }

      toast.success('Siparişiniz alındı!', {
        description: 'Ödeme işleminiz yakında tamamlanacak.',
      });

      // Redirect to success page or payment page
      setTimeout(() => {
        router.push(`/checkout/success?orderId=${data.orderId || 'guest'}`);
      }, 1500);
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  const finalTotal = total * 1.18; // KDV dahil

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
            className="mb-8"
          >
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Sepete Dön
            </Link>
            <div>
              <h1 className="text-4xl font-black md:text-5xl mb-2">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Misafir Ödeme
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Üye olmadan hızlıca ödeme yapabilirsiniz
              </p>
            </div>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Checkout Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Contact Information Card */}
              <Card className="overflow-hidden border-purple-500/20 bg-background/80 backdrop-blur-sm shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">İletişim Bilgileri</CardTitle>
                      <CardDescription>Ödeme için gerekli bilgileri doldurun</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold">
                        <User className="h-4 w-4 text-purple-400" />
                        Ad Soyad *
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Adınız ve soyadınız"
                        className="h-12 border-purple-500/20 focus:border-purple-500 focus:ring-purple-500/20"
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold">
                          <Mail className="h-4 w-4 text-purple-400" />
                          E-posta *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="ornek@email.com"
                          className="h-12 border-purple-500/20 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold">
                          <Phone className="h-4 w-4 text-purple-400" />
                          Telefon *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="05XX XXX XX XX"
                          className="h-12 border-purple-500/20 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="flex items-center gap-2 text-sm font-semibold">
                        <MapPin className="h-4 w-4 text-purple-400" />
                        Adres (Opsiyonel)
                      </Label>
                      <Input
                        id="address"
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Adres bilgisi"
                        className="h-12 border-purple-500/20 focus:border-purple-500 focus:ring-purple-500/20"
                      />
                    </div>

                    {/* Security Badges */}
                    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span>SSL Güvenli Ödeme</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock className="h-4 w-4 text-green-500" />
                        <span>Verileriniz Korunuyor</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>7/24 Destek</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/50 text-lg font-semibold transition-all hover:scale-[1.02]"
                        size="lg"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            İşleniyor...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Ödemeye Geç
                          </span>
                        )}
                      </Button>
                      <p className="mt-3 text-center text-xs text-muted-foreground">
                        Ödeme işleminiz 256-bit SSL şifreleme ile korunmaktadır
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="sticky top-24">
                <Card className="overflow-hidden border-purple-500/20 bg-background/80 backdrop-blur-sm shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold">Sipariş Özeti</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {/* Items List */}
                    <div className="space-y-4 mb-6">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-start gap-4 rounded-xl border border-purple-500/10 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 p-4">
                          {item.image_path ? (
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                              <Image
                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/automation-images/${item.image_path}`}
                                alt={item.title}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-xl font-bold text-purple-400">
                              {item.title.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">Dijital Otomasyon</p>
                            <p className="text-sm font-bold text-purple-400 mt-2">
                              {item.price.toLocaleString('tr-TR')} ₺
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-3 border-t border-border/50 pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ara Toplam</span>
                        <span className="font-semibold">{total.toLocaleString('tr-TR')} ₺</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">KDV (%18)</span>
                        <span className="font-semibold">{(total * 0.18).toLocaleString('tr-TR')} ₺</span>
                      </div>
                      <div className="border-t border-border/50 pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">Toplam</span>
                          <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            {finalTotal.toLocaleString('tr-TR')} ₺
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Trust Badge */}
                    <div className="mt-6 rounded-xl border border-green-500/20 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5 p-4">
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <Shield className="h-5 w-5" />
                        <span className="font-semibold">Güvenli Ödeme Garantisi</span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Tüm ödemeleriniz SSL şifreleme ile korunmaktadır
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}
