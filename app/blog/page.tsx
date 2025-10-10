'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const blogPosts = [
  {
    id: '1',
    slug: 'otomasyon-nedir',
    title: 'Otomasyon Nedir ve Neden Önemlidir?',
    excerpt: 'İş süreçlerinizi otomatikleştirmenin faydalarını ve otomasyon çözümlerinin işletmenize nasıl değer katabileceğini keşfedin.',
    cover_image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
    published_at: '2025-10-01',
    category: 'Rehber',
  },
  {
    id: '2',
    slug: 'e-ticaret-otomasyonlari',
    title: 'E-Ticaret için En İyi Otomasyon Çözümleri',
    excerpt: 'E-ticaret işletmenizi bir üst seviyeye taşıyacak otomasyon araçları ve stratejileri hakkında her şey.',
    cover_image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800',
    published_at: '2025-09-28',
    category: 'E-Ticaret',
  },
  {
    id: '3',
    slug: 'sosyal-medya-yonetimi',
    title: 'Sosyal Medya Yönetiminde Otomasyon',
    excerpt: 'Sosyal medya hesaplarınızı daha verimli yönetmek için kullanabileceğiniz otomasyon teknikleri.',
    cover_image: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=800',
    published_at: '2025-09-25',
    category: 'Sosyal Medya',
  },
  {
    id: '4',
    slug: 'yapay-zeka-is-akislari',
    title: 'Yapay Zeka ile İş Akışlarınızı Güçlendirin',
    excerpt: 'ChatGPT, OpenAI ve diğer AI araçlarını kullanarak iş süreçlerinizi nasıl optimize edebileceğinizi öğrenin.',
    cover_image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    published_at: '2025-09-20',
    category: 'Yapay Zeka',
  },
  {
    id: '5',
    slug: 'crm-pazarlama-otomasyonu',
    title: 'CRM ve Pazarlama Otomasyonu ile Satışları Artırın',
    excerpt: 'Müşteri ilişkileri ve pazarlama süreçlerinizi otomatikleştirerek daha fazla satış yapın.',
    cover_image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
    published_at: '2025-09-15',
    category: 'Pazarlama',
  },
  {
    id: '6',
    slug: 'finans-fatura-otomasyonu',
    title: 'Finans ve Faturalandırma Otomasyonu',
    excerpt: 'E-fatura, gelir-gider takibi ve banka entegrasyonları ile mali işlemlerinizi kolaylaştırın.',
    cover_image: 'https://images.pexels.com/photos/6863332/pexels-photo-6863332.jpeg?auto=compress&cs=tinysrgb&w=800',
    published_at: '2025-09-10',
    category: 'Finans',
  },
  {
    id: '7',
    slug: 'insan-kaynaklari-otomasyonu',
    title: 'İK Süreçlerinde Otomasyon: Rehber',
    excerpt: 'Personel yönetimi, izin takibi ve onboarding süreçlerini otomatikleştirerek zaman kazanın.',
    cover_image: 'https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=800',
    published_at: '2025-09-05',
    category: 'İnsan Kaynakları',
  },
  {
    id: '8',
    slug: 'api-entegrasyonlari',
    title: 'API Entegrasyonları ile Sistemlerinizi Birleştirin',
    excerpt: 'Farklı platformları birbirine bağlayarak veri akışını otomatikleştirin. Zapier, Make ve daha fazlası.',
    cover_image: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=800',
    published_at: '2025-09-01',
    category: 'API',
  },
  {
    id: '9',
    slug: 'veri-raporlama-otomasyonu',
    title: 'Veri Raporlama ve Analiz Otomasyonu',
    excerpt: 'Google Sheets, Excel ve Power BI ile otomatik raporlar oluşturun ve veri analizi yapın.',
    cover_image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800',
    published_at: '2025-08-28',
    category: 'Veri Analizi',
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Otomasyon dünyasından haberler, rehberler ve ipuçları
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="group h-full overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/50">
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
                <CardHeader>
                  <Badge variant="outline" className="w-fit mb-2 bg-primary/10 border-primary/30">
                    {post.category}
                  </Badge>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.published_at).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
