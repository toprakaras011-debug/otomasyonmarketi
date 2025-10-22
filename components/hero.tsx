'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-purple-600/20 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '700ms' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-purple-500/10 blur-[100px]" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-blue-500/10 px-6 py-3 backdrop-blur-sm"
          >
            <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
            <span className="text-sm font-medium bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
              Türkiye'nin İlk Otomasyon Marketplace'i
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-7xl lg:text-8xl"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
              Gücünü Otomasyonla
            </span>
            <br />
            <span className="text-foreground">Keşfet</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10 text-lg text-muted-foreground md:text-xl max-w-3xl mx-auto leading-relaxed"
          >
            E-ticaret, sosyal medya ve veri analitiği için profesyonel otomasyon çözümlerini keşfedin.
            <br className="hidden md:block" />
            {' '}
            <span className="font-semibold text-foreground">Zamandan tasarruf edin, işinizi büyütün.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-20"
          >
            <Button
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-10 py-7 text-lg font-semibold shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-105"
              asChild
            >
              <Link href="/automations">
                Mağazayı Keşfet
                <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-purple-500/50 hover:bg-purple-500/10 px-10 py-7 text-lg font-semibold hover:border-purple-500 transition-all hover:scale-105"
              asChild
            >
              <Link href="/developer/register">Geliştirici Ol</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-16"
          >
            <div className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-8 backdrop-blur-sm hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="mb-3 text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">500+</div>
                <div className="text-sm font-medium text-muted-foreground">Otomasyon Çözümü</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-8 backdrop-blur-sm hover:border-blue-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="mb-3 text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">50+</div>
                <div className="text-sm font-medium text-muted-foreground">Aktif Geliştirici</div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-8 backdrop-blur-sm hover:border-pink-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="mb-3 text-4xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">10K+</div>
                <div className="text-sm font-medium text-muted-foreground">Mutlu Kullanıcı</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <div className="flex items-start gap-4 text-left">
              <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 p-3">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Hızlı Entegrasyon</h3>
                <p className="text-sm text-muted-foreground">Dakikalar içinde kurulum</p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left">
              <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 p-3">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Güvenli Ödeme</h3>
                <p className="text-sm text-muted-foreground">SSL korumalı işlemler</p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left">
              <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-500/10 p-3">
                <TrendingUp className="h-6 w-6 text-pink-400" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">%85 Gelir</h3>
                <p className="text-sm text-muted-foreground">Geliştiriciler için</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
    </section>
  );
}
