'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      toast.success('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitting(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              İletişim
            </h1>
            <p className="text-xl text-muted-foreground">
              Size nasıl yardımcı olabiliriz? Bize ulaşın!
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 mb-12 max-w-2xl mx-auto">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-purple-500/10 mb-4">
                  <Mail className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">E-posta</h3>
                <a href="mailto:info@otomasyonmagazasi.com" className="text-muted-foreground hover:text-primary">
                  info@otomasyonmagazasi.com
                </a>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/10 mb-4">
                  <Phone className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">Telefon</h3>
                <a href="tel:+905074201920" className="text-muted-foreground hover:text-primary">
                  +90 507 420 19 20
                </a>
              </CardContent>
            </Card>

          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mesaj Gönderin</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Ad Soyad *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Adınız ve soyadınız"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-posta *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="ornek@email.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Konu *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      placeholder="Mesajınızın konusu"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Mesajınız *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={6}
                      placeholder="Mesajınızı buraya yazın..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      'Gönderiliyor...'
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Mesaj Gönder
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600/5 to-blue-600/5">
              <CardHeader>
                <CardTitle>Çalışma Saatleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Destek Ekibi</h3>
                  <p className="text-muted-foreground mb-1">Pazartesi - Cuma: 09:00 - 18:00</p>
                  <p className="text-muted-foreground">Cumartesi: 10:00 - 16:00</p>
                  <p className="text-muted-foreground">Pazar: Kapalı</p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">Hızlı Destek</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Acil durumlar için e-posta desteğimiz 7/24 aktiftir. Mesajlarınız en geç 24 saat içinde yanıtlanır.
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-3">Sık Sorulan Sorular</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bize ulaşmadan önce sık sorulan sorular sayfamızı inceleyerek hızlı çözüm bulabilirsiniz.
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <a href="/faq">SSS&rsquo;ye Git</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
