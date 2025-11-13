'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, Sparkles, BookOpen } from 'lucide-react';
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

      <Navbar />

      <div className="container relative mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-16 mt-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 text-5xl font-black md:text-6xl lg:text-7xl"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Blog
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto max-w-2xl text-xl text-foreground/70"
          >
            Otomasyon dünyasından haberler, rehberler ve ipuçları
          </motion.p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
            >
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:from-purple-500/20 hover:to-blue-500/20">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 opacity-0 blur-xl transition-opacity group-hover:opacity-20" />
                  
                  {/* Card Content */}
                  <div className="relative h-full overflow-hidden rounded-2xl bg-background/80 backdrop-blur-sm">
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20">
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className="border-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
                          <Sparkles className="mr-1 h-3 w-3" />
                          {post.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="mb-3 text-xl font-bold line-clamp-2 transition-colors group-hover:text-purple-400">
                        {post.title}
                      </h3>
                      
                      <p className="mb-4 text-sm leading-relaxed text-foreground/70 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between border-t border-border/50 pt-4">
                        <div className="flex items-center gap-2 text-xs text-foreground/60">
                          <Calendar className="h-3 w-3 text-purple-400" />
                          <span>{new Date(post.published_at).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-purple-400 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
