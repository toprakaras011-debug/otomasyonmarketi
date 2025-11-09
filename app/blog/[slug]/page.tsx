import type { Metadata } from 'next';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const blogPosts: Record<string, any> = {
  'otomasyon-nedir': {
    title: 'Otomasyon Nedir ve Neden Önemlidir?',
    excerpt: 'İş süreçlerinizi otomatikleştirmenin faydalarını ve otomasyon çözümlerinin işletmenize nasıl değer katabileceğini keşfedin.',
    cover_image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1200',
    published_at: '2025-10-01',
    category: 'Rehber',
    author: 'Ahmet Yılmaz',
    reading_time: '5 dakika',
    content: [
      { type: 'h1', text: 'Otomasyon Nedir?' },
      { type: 'p', text: 'Otomasyon, tekrarlayan iş süreçlerinin insan müdahalesi olmadan otomatik olarak gerçekleştirilmesini sağlayan teknolojilerin genel adıdır. Modern işletmeler için otomasyon, verimliliği artırmanın ve maliyetleri düşürmenin en etkili yollarından biridir.' },
      { type: 'h2', text: 'Neden Otomasyon Kullanmalısınız?' },
      { type: 'h3', text: '1. Zaman Tasarrufu' },
      { type: 'p', text: 'Tekrarlayan görevleri otomatikleştirerek, çalışanlarınızın daha değerli işlere odaklanmasını sağlayabilirsiniz. Örneğin, e-posta gönderimi, veri girişi ve raporlama gibi rutin işler otomatikleştirilebilir.' },
      { type: 'h3', text: '2. Hata Oranını Azaltma' },
      { type: 'p', text: 'İnsan hataları iş süreçlerinde ciddi problemlere yol açabilir. Otomasyon, tutarlı ve hatasız işlem garantisi sunar.' },
      { type: 'h3', text: '3. Maliyet Düşürme' },
      { type: 'p', text: 'Uzun vadede otomasyon, işgücü maliyetlerini önemli ölçüde azaltır ve yatırım getirisini maksimize eder.' },
    ]
  },
  'e-ticaret-otomasyonlari': {
    title: 'E-Ticaret için En İyi Otomasyon Çözümleri',
    cover_image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=1200',
    published_at: '2025-09-28',
    category: 'E-Ticaret',
    author: 'Ayşe Demir',
    reading_time: '6 dakika',
    content: [
      { type: 'h1', text: 'E-Ticaret Otomasyonları ile Satışlarınızı Artırın' },
      { type: 'p', text: 'E-ticaret sektöründe rekabet her geçen gün artıyor. Başarılı olmak için sadece iyi ürünler sunmak yetmiyor; verimli ve hızlı operasyonlar da şart.' },
      { type: 'h2', text: 'Sipariş Yönetimi Otomasyonu' },
      { type: 'p', text: 'Sipariş alma, işleme ve takip süreçlerini otomatikleştirmek, müşteri memnuniyetini artırmanın en etkili yollarından biridir.' },
    ]
  },
  'sosyal-medya-yonetimi': {
    title: 'Sosyal Medya Yönetiminde Otomasyon',
    cover_image: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=1200',
    published_at: '2025-09-25',
    category: 'Sosyal Medya',
    author: 'Mehmet Kaya',
    reading_time: '7 dakika',
    content: [
      { type: 'h1', text: 'Sosyal Medya Otomasyonu ile Varlığınızı Güçlendirin' },
      { type: 'p', text: 'Sosyal medya, modern pazarlamanın vazgeçilmez bir parçası. Ancak birden fazla platformda aktif olmak zaman alıcı olabilir.' },
    ]
  },
  'yapay-zeka-is-akislari': {
    title: 'Yapay Zeka ile İş Akışlarınızı Güçlendirin',
    cover_image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200',
    published_at: '2025-09-20',
    category: 'Yapay Zeka',
    author: 'Zeynep Arslan',
    reading_time: '8 dakika',
    content: [
      { type: 'h1', text: 'Yapay Zeka ile İş Süreçlerinizi Dönüştürün' },
      { type: 'p', text: 'ChatGPT, OpenAI ve benzeri yapay zeka araçları, iş süreçlerini köklü bir şekilde değiştiriyor. Bu teknolojileri doğru kullanarak verimliliğinizi katlayabilirsiniz.' },
      { type: 'h2', text: 'AI ile Otomasyon Nasıl Yapılır?' },
      { type: 'p', text: 'Yapay zeka destekli otomasyon araçları, karmaşık görevleri saniyeler içinde tamamlayabilir. E-posta yanıtlama, içerik üretimi, veri analizi gibi işlemlerde AI kullanımı yaygınlaşıyor.' },
      { type: 'h3', text: 'ChatGPT Entegrasyonları' },
      { type: 'p', text: 'ChatGPT API kullanarak müşteri desteği botları, otomatik e-posta yanıtlayıcıları ve içerik üretim sistemleri oluşturabilirsiniz.' },
      { type: 'h3', text: 'Görsel Üretimi' },
      { type: 'p', text: 'Midjourney, DALL-E gibi araçlarla pazarlama materyallerinizi otomatik olarak oluşturabilirsiniz.' },
    ]
  },
  'crm-pazarlama-otomasyonu': {
    title: 'CRM ve Pazarlama Otomasyonu ile Satışları Artırın',
    cover_image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200',
    published_at: '2025-09-15',
    category: 'Pazarlama',
    author: 'Can Yıldız',
    reading_time: '6 dakika',
    content: [
      { type: 'h1', text: 'CRM ve Pazarlama Otomasyonu' },
      { type: 'p', text: 'Müşteri ilişkileri yönetimi ve pazarlama süreçlerini otomatikleştirerek satışlarınızı artırabilirsiniz.' },
      { type: 'h2', text: 'HubSpot ve Pipedrive Entegrasyonları' },
      { type: 'p', text: 'Popüler CRM sistemleri ile entegre çalışan otomasyonlar, müşteri takibi ve satış süreçlerini kolaylaştırır.' },
    ]
  },
  'finans-fatura-otomasyonu': {
    title: 'Finans ve Faturalandırma Otomasyonu',
    cover_image: 'https://images.pexels.com/photos/6863332/pexels-photo-6863332.jpeg?auto=compress&cs=tinysrgb&w=1200',
    published_at: '2025-09-10',
    category: 'Finans',
    author: 'Elif Şahin',
    reading_time: '5 dakika',
    content: [
      { type: 'h1', text: 'Finans İşlemlerinizi Otomatikleştirin' },
      { type: 'p', text: 'E-fatura, gelir-gider takibi ve banka entegrasyonları ile mali işlemlerinizi hızlandırın.' },
      { type: 'h2', text: 'E-Fatura Otomasyonu' },
      { type: 'p', text: 'Türkiye\'de zorunlu hale gelen e-fatura sistemini otomatikleştirerek zaman kazanın.' },
    ]
  },
  'insan-kaynaklari-otomasyonu': {
    title: 'İK Süreçlerinde Otomasyon: Rehber',
    cover_image: 'https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=1200',
    published_at: '2025-09-05',
    category: 'İnsan Kaynakları',
    author: 'Burak Öz',
    reading_time: '7 dakika',
    content: [
      { type: 'h1', text: 'İnsan Kaynakları Süreçlerini Otomatikleştirin' },
      { type: 'p', text: 'Personel yönetimi, izin takibi ve onboarding süreçlerini otomatikleştirerek İK ekibinizin yükünü azaltın.' },
    ]
  },
  'api-entegrasyonlari': {
    title: 'API Entegrasyonları ile Sistemlerinizi Birleştirin',
    cover_image: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=1200',
    published_at: '2025-09-01',
    category: 'API',
    author: 'Deniz Acar',
    reading_time: '8 dakika',
    content: [
      { type: 'h1', text: 'API Entegrasyonları' },
      { type: 'p', text: 'Farklı sistemleri birbirine bağlayarak veri akışını otomatikleştirin. Zapier, Make ve diğer araçlarla entegrasyon yapın.' },
      { type: 'h2', text: 'Zapier vs Make' },
      { type: 'p', text: 'Her iki platform da güçlü otomasyon araçlarıdır. İhtiyaçlarınıza göre en uygun olanı seçebilirsiniz.' },
    ]
  },
  'veri-raporlama-otomasyonu': {
    title: 'Veri Raporlama ve Analiz Otomasyonu',
    cover_image: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=1200',
    published_at: '2025-08-28',
    category: 'Veri Analizi',
    author: 'Cem Kara',
    reading_time: '6 dakika',
    content: [
      { type: 'h1', text: 'Veri Raporlama Otomasyonu' },
      { type: 'p', text: 'Google Sheets, Excel ve Power BI ile otomatik raporlar oluşturun. Veri analizi süreçlerinizi hızlandırın.' },
    ]
  },
};

export function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({
    slug: slug,
  }));
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = blogPosts[params.slug];

  if (!post) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Blog Yazısı Bulunamadı</h1>
          <Button asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Blog&rsquo;a Dön
            </Link>
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <article className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-8">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Blog&rsquo;a Dön
            </Link>
          </Button>

          <div className="mb-8">
            <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/30">
              {post.category}
            </Badge>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              {post.title}
            </h1>
            <div className="flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.published_at).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              {post.reading_time && (
                <span>{post.reading_time}</span>
              )}
            </div>
          </div>

          <div className="relative h-96 overflow-hidden rounded-2xl mb-12 shadow-2xl">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
            />
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            {post.content.map((block: any, index: number) => {
              if (block.type === 'h1') {
                return <h1 key={index} className="text-4xl font-bold mt-12 mb-6">{block.text}</h1>;
              } else if (block.type === 'h2') {
                return <h2 key={index} className="text-3xl font-bold mt-10 mb-4">{block.text}</h2>;
              } else if (block.type === 'h3') {
                return <h3 key={index} className="text-2xl font-bold mt-8 mb-3">{block.text}</h3>;
              } else if (block.type === 'p') {
                return <p key={index} className="mb-6 leading-relaxed text-muted-foreground text-lg">{block.text}</p>;
              }
              return null;
            })}
          </div>

          <div className="mt-16 pt-8 border-t border-border">
            <h3 className="text-2xl font-bold mb-6">İlgili Otomasyonları Keşfedin</h3>
            <Link href="/automations">
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-2 border-primary/20 rounded-2xl p-8 hover:scale-105 hover:border-primary/50 transition-all">
                <p className="text-lg">Bu konuyla ilgili otomasyonları görüntüleyin ve hemen kullanmaya başlayın.</p>
              </div>
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
