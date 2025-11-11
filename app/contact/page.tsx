'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { IconBox } from '@/components/ui/icon-box';
import { toast } from 'sonner';
import { Mail, Phone, MessageSquare, Clock } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submitting form
    
    // Tüm alanların dolu olduğundan emin ol
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error('Lütfen tüm alanları doldurunuz');
      return;
    }

    // E-posta formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Lütfen geçerli bir e-posta adresi giriniz');
      return;
    }

    setIsSubmitting(true);

    try {
      // Starting email send
      
      // E-posta içeriği
      const emailContent = {
        to: 'info@otomasyonmagazasi.com',
        from: formData.email,
        subject: `İletişim Formu: ${formData.subject}`,
        text: `
          İsim: ${formData.name}
          E-posta: ${formData.email}
          Konu: ${formData.subject}
          
          Mesaj:
          ${formData.message}
        `,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Yeni İletişim Formu Gönderimi</h2>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Ad Soyad:</strong> ${formData.name}</p>
              <p><strong>E-posta:</strong> <a href="mailto:${formData.email}" style="color: #4f46e5; text-decoration: none;">${formData.email}</a></p>
              <p><strong>Konu:</strong> ${formData.subject}</p>
              
              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                <strong>Mesaj:</strong>
                <p style="white-space: pre-line; margin-top: 10px; line-height: 1.6;">${formData.message.replace(/\n/g, '<br>')}</p>
              </div>
            </div>
            
            <p style="font-size: 12px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
              Bu e-posta, otomasyonmagazasi.com üzerindeki iletişim formu aracılığıyla gönderilmiştir.<br>
              Gönderim Tarihi: ${new Date().toLocaleString('tr-TR')}
            </p>
          </div>
        `
      };

      // E-postayı gönder
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailContent),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error(result.message || 'E-posta gönderilemedi');
      }
    } catch (error: any) {
      console.error('Gönderme hatası:', error);
      toast.error(error.message || 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-16 mt-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 text-5xl font-black md:text-6xl lg:text-7xl"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                İletişim
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mx-auto max-w-2xl text-xl text-foreground/70"
            >
              Size nasıl yardımcı olabiliriz? Bize ulaşın!
            </motion.p>
          </div>

          {/* Contact Cards */}
          <div className="mb-12 grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
            {[
              { icon: Mail, label: 'E-posta', value: 'info@otomasyonmagazasi.com', href: 'mailto:info@otomasyonmagazasi.com', gradient: 'from-purple-600 to-blue-600' },
              { icon: Phone, label: 'Telefon', value: '+90 507 420 19 20', href: 'tel:+905074201920', gradient: 'from-pink-600 to-rose-600' },
            ].map((contact, index) => (
              <motion.div
                key={contact.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm transition-all hover:scale-[1.02]"
              >
                <div className="rounded-2xl bg-background/80 p-8 text-center backdrop-blur-sm">
                  <IconBox icon={contact.icon} gradient={contact.gradient} className="mx-auto mb-4" />
                  <h3 className="mb-2 font-bold">{contact.label}</h3>
                  <a href={contact.href} className="text-foreground/70 hover:text-purple-400 transition-colors">
                    {contact.value}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Form & Info Grid */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm"
            >
              <div className="rounded-2xl bg-background/80 p-8 backdrop-blur-sm">
                <h2 className="mb-6 text-2xl font-bold">Mesaj Gönderin</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ad Soyad *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Adınız ve soyadınız"
                        required
                        minLength={2}
                        maxLength={100}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-posta *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Konu *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Konu başlığı"
                      required
                      minLength={5}
                      maxLength={200}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
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
                    disabled={isSubmitting}
                    className="w-full mt-4 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Gönderiliyor...
                      </span>
                    ) : 'Gönder'}
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm"
            >
              <div className="rounded-2xl bg-background/80 p-8 backdrop-blur-sm">
                <h2 className="mb-6 text-2xl font-bold">Çalışma Saatleri</h2>
                <div className="space-y-6">
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
                  <Button variant="outline" asChild className="w-full border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/10">
                    <a href="/faq">SSS&rsquo;ye Git</a>
                  </Button>
                </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
