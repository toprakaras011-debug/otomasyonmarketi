'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Book, MessageCircle, FileText, CircleHelp as HelpCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const helpCategories = [
  {
    icon: Book,
    title: 'Başlangıç Rehberi',
    description: 'Platforma nasıl başlayacağınızı öğrenin',
    articles: [
      { title: 'Hesap Nasıl Oluşturulur?', slug: 'hesap-olusturma' },
      { title: 'İlk Otomasyonunuzu Nasıl Satın Alırsınız?', slug: 'otomasyon-satin-alma' },
      { title: 'Ödeme Yöntemleri', slug: 'odeme-yontemleri' },
    ]
  },
  {
    icon: Zap,
    title: 'Otomasyon Kullanımı',
    description: 'Otomasyonları nasıl kullanacağınızı öğrenin',
    articles: [
      { title: 'Otomasyon Nasıl Kurulur?', slug: 'otomasyon-kurulum' },
      { title: 'API Entegrasyonu', slug: 'api-entegrasyonu' },
      { title: 'Sorun Giderme', slug: 'sorun-giderme' },
    ]
  },
  {
    icon: MessageCircle,
    title: 'Geliştirici Rehberi',
    description: 'Otomasyon geliştirmeye başlayın',
    articles: [
      { title: 'Geliştirici Hesabı Nasıl Açılır?', slug: 'gelistirici-hesabi' },
      { title: 'Otomasyon Nasıl Eklenir?', slug: 'otomasyon-ekleme' },
      { title: 'Ödeme Alma Süreci', slug: 'odeme-alma' },
    ]
  },
  {
    icon: FileText,
    title: 'Hesap Yönetimi',
    description: 'Hesabınızı yönetin ve güvenliğinizi sağlayın',
    articles: [
      { title: 'Profil Bilgilerini Güncelleme', slug: 'profil-guncelleme' },
      { title: 'Şifre Değiştirme', slug: 'sifre-degistirme' },
      { title: 'Hesap Silme', slug: 'hesap-silme' },
    ]
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Yardım Merkezi
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Size nasıl yardımcı olabiliriz?
          </p>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Makale ara..."
              className="pl-12 py-6 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-12">
          {helpCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-3">
                      <Icon className="h-6 w-6 text-purple-400" />
                    </div>
                    <CardTitle className="text-2xl">{category.title}</CardTitle>
                  </div>
                  <p className="text-muted-foreground">{category.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article, idx) => (
                      <li key={idx}>
                        <Link
                          href={`/help/${article.slug}`}
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          <HelpCircle className="h-4 w-4" />
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-primary/20">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Sorunuzu Bulamadınız mı?</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Destek ekibimiz size yardımcı olmak için burada
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/contact">
                <Card className="cursor-pointer hover:scale-105 transition-transform">
                  <CardContent className="pt-6 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-3 text-blue-400" />
                    <h3 className="font-semibold mb-2">Bize Ulaşın</h3>
                    <p className="text-sm text-muted-foreground">Mesaj gönderin</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/faq">
                <Card className="cursor-pointer hover:scale-105 transition-transform">
                  <CardContent className="pt-6 text-center">
                    <HelpCircle className="h-12 w-12 mx-auto mb-3 text-purple-400" />
                    <h3 className="font-semibold mb-2">SSS</h3>
                    <p className="text-sm text-muted-foreground">Sık sorulan sorular</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
