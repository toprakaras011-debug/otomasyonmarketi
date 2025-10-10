'use client';

import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, Zap, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Hakkımızda</h1>
            <p className="text-lg text-muted-foreground">
              Türkiye&rsquo;nin ilk otomasyon marketplace platformu
            </p>
          </div>

          <div className="prose prose-invert max-w-none mb-12">
            <p className="text-lg leading-relaxed mb-6">
              Otomasyon Mağazası, işletmelerin ve bireylerin günlük iş süreçlerini otomatikleştirmelerine yardımcı olan
              hazır otomasyon çözümlerini tek bir platformda toplayan Türkiye&rsquo;nin ilk marketplace&rsquo;idir.
            </p>

            <p className="text-lg leading-relaxed mb-6">
              Misyonumuz, geliştiricilerin yeteneklerini sergileyebilecekleri ve kullanıcıların ihtiyaç duydukları
              otomasyon çözümlerine kolayca ulaşabilecekleri güvenli bir ekosistem oluşturmaktır.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            <Card>
              <CardHeader>
                <Target className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Vizyonumuz</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Türkiye&rsquo;de otomasyon kültürünü yaygınlaştırmak ve her işletmenin dijital dönüşüm sürecinde
                  yanında olmak.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Topluluk</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Binlerce geliştirici ve on binlerce kullanıcıdan oluşan büyüyen bir topluluk oluşturduk.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Hız ve Verimlilik</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Kullanıcılarımızın zaman kazanmasını ve işlerini daha verimli yürütmelerini sağlıyoruz.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 mb-2 text-primary" />
                <CardTitle>Güvenlik</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tüm otomasyonlar detaylı inceleme sürecinden geçer ve güvenlik standartlarına uygunluğu sağlanır.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-primary/10 to-blue-600/10 border-primary/20">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">Neden Otomasyon Mağazası?</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Türkiye&rsquo;nin en geniş otomasyon çözümleri koleksiyonu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Güvenli ödeme sistemi ve %20 adil komisyon oranı</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>7/24 geliştirici ve kullanıcı desteği</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Detaylı dokümantasyon ve kurulum rehberleri</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Sürekli güncellenen ve geliştirilen platform</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
