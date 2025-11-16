'use client';

import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconBox } from '@/components/ui/icon-box';
import { Code, Key, Book, Zap, Shield, Terminal } from 'lucide-react';

const apiEndpoints = [
  {
    method: 'GET',
    endpoint: '/api/automations',
    description: 'Tüm otomasyonları listele',
    params: ['page', 'limit', 'category'],
  },
  {
    method: 'GET',
    endpoint: '/api/automations/:id',
    description: 'Belirli bir otomasyonun detaylarını getir',
    params: ['id'],
  },
  {
    method: 'POST',
    endpoint: '/api/automations',
    description: 'Yeni otomasyon oluştur (Geliştirici)',
    params: ['title', 'description', 'price', 'category_id'],
  },
  {
    method: 'GET',
    endpoint: '/api/categories',
    description: 'Tüm kategorileri listele',
    params: [],
  },
];

export default function ApiDocsPage() {
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-16 mt-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-5xl font-black md:text-6xl lg:text-7xl"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                API Dokümantasyonu
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto max-w-2xl text-xl text-foreground/70"
            >
              Otomasyon Marketi API'sini kullanarak kendi uygulamalarınızı geliştirin
            </motion.p>
          </div>

          {/* Quick Start */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm"
          >
            <div className="rounded-2xl bg-background/80 p-8 backdrop-blur-sm">
              <div className="mb-6 flex items-center gap-3">
                <IconBox icon={Key} size="sm" />
                <h2 className="text-2xl font-bold">Hızlı Başlangıç</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold">1. API Anahtarı Alın</h3>
                  <p className="text-foreground/70">
                    Geliştirici panelinizden API anahtarınızı oluşturun ve güvenli bir yerde saklayın.
                  </p>
                </div>
                
                <div>
                  <h3 className="mb-2 font-semibold">2. Base URL</h3>
                  <div className="rounded-lg bg-background/50 p-4 font-mono text-sm">
                    https://api.otomasyonmagazasi.com/v1
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-2 font-semibold">3. Authentication</h3>
                  <p className="mb-2 text-foreground/70">
                    Tüm isteklerde Authorization header'ı kullanın:
                  </p>
                  <div className="rounded-lg bg-background/50 p-4 font-mono text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* API Endpoints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="mb-6 text-3xl font-bold">API Endpoints</h2>
            <div className="space-y-4">
              {apiEndpoints.map((endpoint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm"
                >
                  <div className="rounded-2xl bg-background/80 p-6 backdrop-blur-sm">
                    <div className="mb-4 flex items-center gap-3">
                      <Badge
                        className={`font-mono ${
                          endpoint.method === 'GET'
                            ? 'bg-green-600'
                            : endpoint.method === 'POST'
                            ? 'bg-blue-600'
                            : 'bg-orange-600'
                        }`}
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-lg font-semibold text-purple-400">
                        {endpoint.endpoint}
                      </code>
                    </div>
                    <p className="mb-4 text-foreground/70">{endpoint.description}</p>
                    {endpoint.params.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-semibold">Parametreler:</p>
                        <div className="flex flex-wrap gap-2">
                          {endpoint.params.map((param, idx) => (
                            <Badge key={idx} variant="outline" className="font-mono">
                              {param}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Shield, title: 'Güvenli', desc: 'SSL şifrelemesi ve API key authentication' },
              { icon: Zap, title: 'Hızlı', desc: 'Düşük latency ve yüksek performans' },
              { icon: Book, title: 'Dokümante', desc: 'Detaylı API dokümantasyonu ve örnekler' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-[1px] shadow-xl backdrop-blur-sm"
              >
                <div className="rounded-2xl bg-background/80 p-6 text-center backdrop-blur-sm">
                  <IconBox icon={feature.icon} className="mx-auto mb-4" />
                  <h3 className="mb-2 font-bold">{feature.title}</h3>
                  <p className="text-sm text-foreground/70">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
