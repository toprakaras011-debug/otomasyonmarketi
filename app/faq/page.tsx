'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';

const faqCategories = [
  {
    category: 'Genel',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    questions: [
      {
        question: 'Otomasyon Mağazası nedir?',
        answer: 'Otomasyon Mağazası, geliştiricilerin hazır otomasyon çözümlerini sunduğu ve kullanıcıların ihtiyaçlarına uygun otomasyonları bulup satın aldığı Türkiye\'nin ilk otomasyon marketplace platformudur.'
      },
      {
        question: 'Nasıl kayıt olabilirim?',
        answer: 'Sağ üst köşedeki "Kayıt Ol" butonuna tıklayarak e-posta adresiniz ve şifrenizle hızlıca kayıt olabilirsiniz. Kayıt olduktan sonra tüm özelliklere erişim sağlayabilirsiniz.'
      },
      {
        question: 'Ücretsiz deneme var mı?',
        answer: 'Platformda gezinmek ve otomasyonları incelemek ücretsizdir. Bazı geliştiriciler demo versiyonları sunmaktadır. Satın almadan önce detaylı açıklamaları ve değerlendirmeleri inceleyebilirsiniz.'
      },
    ]
  },
  {
    category: 'Satın Alma',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    questions: [
      {
        question: 'Nasıl otomasyon satın alabilirim?',
        answer: 'Beğendiğiniz otomasyonun detay sayfasına giderek "Satın Al" butonuna tıklayın. Ödeme işleminizi tamamladıktan sonra otomasyon anında hesabınıza tanımlanır.'
      },
      {
        question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
        answer: 'Kredi kartı, banka kartı ve havale ile ödeme yapabilirsiniz. Tüm ödemeler SSL sertifikası ile güvence altındadır.'
      },
      {
        question: 'İade politikanız nedir?',
        answer: 'Satın aldığınız otomasyon açıklamaya uygun değilse veya çalışmıyorsa 7 gün içinde iade talebinde bulunabilirsiniz. İade talepleri incelenerek sonuçlandırılır.'
      },
      {
        question: 'Satın aldığım otomasyonu nasıl indiririm?',
        answer: 'Satın alma işleminden sonra "Dashboard" sayfanızdaki "Satın Alımlar" bölümünden otomasyonunuzu indirebilir ve dokümantasyona erişebilirsiniz.'
      },
    ]
  },
  {
    category: 'Geliştirici',
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
    questions: [
      {
        question: 'Geliştirici olarak nasıl kayıt olabilirim?',
        answer: 'Üye olduktan sonra "Geliştirici Ol" sayfasından geliştirici sözleşmesini kabul ederek geliştirici hesabı oluşturabilirsiniz. Onaylandıktan sonra otomasyon eklemeye başlayabilirsiniz.'
      },
      {
        question: 'Komisyon oranı nedir?',
        answer: 'Her satıştan %15 platform komisyonu alınır. Geriye kalan %85 gelir doğrudan geliştirici hesabınıza aktarılır. Bu, sektördeki en adil oranlardan biridir.'
      },
      {
        question: 'Ödemeler nasıl yapılır?',
        answer: 'Bakiyeniz 100 ₺\'yi geçtiğinde ödeme talebi oluşturabilirsiniz. Talepler 7 iş günü içinde belirlediğiniz banka hesabına aktarılır.'
      },
      {
        question: 'Otomasyonlarım nasıl onaylanır?',
        answer: 'Eklediğiniz otomasyonlar platform yönetimi tarafından güvenlik ve kalite kontrolünden geçirilir. Onaylanan otomasyonlar marketplace\'te yayınlanır.'
      },
    ]
  },
  {
    category: 'Teknik',
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    questions: [
      {
        question: 'Otomasyonları nasıl kurarım?',
        answer: 'Her otomasyon detaylı kurulum dokümantasyonu ile birlikte gelir. Adım adım talimatları takip ederek kolayca kurulum yapabilirsiniz. Sorun yaşarsanız geliştirici ile iletişime geçebilirsiniz.'
      },
      {
        question: 'Hangi platformları destekliyorsunuz?',
        answer: 'Otomasyonlar farklı platformları destekler. Her otomasyonun detay sayfasında desteklenen platformlar ve sistem gereksinimleri belirtilmiştir.'
      },
      {
        question: 'Teknik destek alabilir miyim?',
        answer: 'Evet, satın aldığınız otomasyonlar için geliştiriciden destek alabilirsiniz. Ayrıca platform olarak da genel destek sağlıyoruz.'
      },
    ]
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Sık Sorulan Sorular
            </h1>
            <p className="text-xl text-muted-foreground">
              Merak ettiğiniz her şey burada
            </p>
          </div>

          <div className="space-y-8">
            {faqCategories.map((category, idx) => (
              <div key={idx}>
                <Badge variant="outline" className={`mb-4 ${category.color}`}>
                  {category.category}
                </Badge>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((item, qIdx) => (
                    <AccordionItem
                      key={qIdx}
                      value={`${idx}-${qIdx}`}
                      className="border border-border/50 rounded-lg px-6 bg-card/30"
                    >
                      <AccordionTrigger className="text-left hover:text-primary">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          <Card className="mt-12 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-primary/20">
            <CardContent className="py-12 text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-3">Sorunuzu bulamadınız mı?</h2>
              <p className="text-muted-foreground mb-6">
                Destek ekibimiz size yardımcı olmaktan mutluluk duyar
              </p>
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Link href="/contact">Bize Ulaşın</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  );
}
