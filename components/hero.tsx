'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Shield, TrendingUp, Rocket, Globe, Code2, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

type HeroStats = {
  automations: number;
  developers: number;
  users: number;
  integrations: number;
  estimatedHours: number;
  efficiencyMultiplier: number;
};

type HeroProps = {
  initialStats: HeroStats;
};

const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const PARTICLE_CONFIG = Array.from({ length: 12 }, (_, index) => {
  const seed = index + 1;
  const left = (pseudoRandom(seed) * 100).toFixed(6);
  const top = (pseudoRandom(seed * 1.37) * 100).toFixed(6);
  const duration = 3 + pseudoRandom(seed * 1.73) * 2;
  const delay = pseudoRandom(seed * 2.11) * 2;

  return {
    left,
    top,
    duration,
    delay,
  };
});

export function Hero({ initialStats }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  const [stats, setStats] = useState({
    ...initialStats,
    loading: false,
  });

  useEffect(() => {
    setIsMounted(true);
    setStats({ ...initialStats, loading: false });
  }, [initialStats]);

  const formatWithPlus = (value: number, suffix?: string) => {
    if (!value) {
      return suffix ? `0 ${suffix}` : '0';
    }

    const formatted = value >= 1000
      ? new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
      : new Intl.NumberFormat('tr-TR').format(value);

    return suffix ? `${formatted}+ ${suffix}` : `${formatted}+`;
  };

  const primaryStats = useMemo(() => ([
    {
      icon: Zap,
      label: 'Verimlilik Artışı',
      value: stats.loading ? '...' : `${stats.efficiencyMultiplier}x`,
      gradient: 'from-purple-600 to-purple-500',
      bg: 'from-purple-500/10 to-transparent',
    },
    {
      icon: Globe,
      label: 'Canlı Entegrasyon',
      value: stats.loading ? '...' : formatWithPlus(stats.integrations),
      gradient: 'from-blue-600 to-cyan-500',
      bg: 'from-blue-500/10 to-transparent',
    },
    {
      icon: Code2,
      label: 'Tasarruf Edilen Saat',
      value: stats.loading ? '...' : formatWithPlus(stats.estimatedHours, 'Saat'),
      gradient: 'from-pink-600 to-rose-500',
      bg: 'from-pink-500/10 to-transparent',
    },
  ]), [stats]);

  const secondaryStats = useMemo(() => ([
    {
      icon: Sparkles,
      label: 'Hazır Otomasyon',
      value: stats.loading ? '...' : formatWithPlus(stats.automations),
      gradient: 'from-purple-600 via-purple-500 to-pink-600',
      bg: 'from-purple-500/15 via-transparent to-pink-500/15',
    },
    {
      icon: Users,
      label: 'Profesyonel Geliştirici',
      value: stats.loading ? '...' : formatWithPlus(stats.developers),
      gradient: 'from-blue-600 via-cyan-500 to-blue-600',
      bg: 'from-blue-500/15 via-transparent to-cyan-500/15',
    },
    {
      icon: TrendingUp,
      label: 'Aktif Kullanıcı',
      value: stats.loading ? '...' : formatWithPlus(stats.users),
      gradient: 'from-pink-600 via-rose-500 to-orange-600',
      bg: 'from-pink-500/15 via-transparent to-orange-500/15',
    },
  ]), [stats]);

  return (
    <section ref={containerRef} className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-20 md:pt-40 md:pb-32 lg:pt-48 lg:pb-40">
      {/* Advanced Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Gradient Orbs with Advanced Animations */}
        <motion.div 
          className="absolute -top-[40%] -right-[20%] h-[800px] w-[800px] rounded-full bg-purple-600/30 blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-[40%] -left-[20%] h-[800px] w-[800px] rounded-full bg-blue-600/30 blur-[120px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-pink-500/20 blur-[100px]"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Floating Particles */}
        {isMounted && (
          <div className="pointer-events-none absolute inset-0">
            {PARTICLE_CONFIG.map((particle, index) => (
              <motion.div
                key={index}
                className="absolute h-1 w-1 rounded-full bg-purple-400/40"
                style={{
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  delay: particle.delay,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <motion.div style={{ y, opacity }} className="container relative mx-auto px-4">
        <div className="mx-auto max-w-6xl text-center">
          {/* Main Heading with Advanced Typography */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mb-6 text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
          >
            <span className="relative inline-block">
              <span className="absolute -inset-1 block -skew-y-3 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-sky-500 opacity-30 blur-lg" />
              <span className="relative bg-gradient-to-r from-purple-500 via-rose-500 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_6px_20px_rgba(236,72,153,0.35)]">
                İşinizi Otomatikleştirin
              </span>
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_6px_18px_rgba(59,130,246,0.28)] dark:from-purple-200 dark:via-pink-200 dark:to-cyan-200">
              Geleceği Yakalayın
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-4 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl md:text-2xl"
          >
            <span className="block text-balance text-foreground/85">
              <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text font-semibold text-transparent">
                Yapay zeka destekli otomasyon çözümleri
              </span>{' '}
              ile e-ticaret, sosyal medya ve veri analitiği süreçlerinizi tek panelden yönetin.
            </span>
            <span className="mt-4 flex flex-wrap items-center justify-center gap-3 text-balance text-[clamp(1.05rem,2vw,1.3rem)] font-semibold text-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-purple-600 dark:text-purple-200">
                ai optimizasyonu
              </span>
              <span className="inline-flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-500" />
                <span>
                  Zamandan tasarruf edin, verimliliği{' '}
                  <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                    10x
                  </span>{' '}
                  artırın.
                </span>
              </span>
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
          >
            <Button
              size="lg"
              className="group relative h-14 overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 px-8 text-lg font-bold shadow-2xl shadow-purple-500/50 transition-all hover:scale-105 hover:shadow-purple-500/70"
              asChild
            >
              <Link href="/automations">
                <span className="relative z-10 flex items-center">
                  Mağazayı Keşfet
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 border-2 border-purple-500/50 bg-background/50 px-8 text-lg font-bold backdrop-blur-sm transition-all hover:scale-105 hover:border-purple-500 hover:bg-purple-500/10"
              asChild
            >
              <Link href="/developer/register">
                <Rocket className="mr-2 h-5 w-5" />
                Geliştirici Ol
              </Link>
            </Button>
          </motion.div>

          {/* 3D Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-20 perspective-[2000px]"
          >
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-20 blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 p-1 shadow-2xl backdrop-blur-xl">
                <div className="rounded-xl bg-transparent p-8 backdrop-blur-sm">
                  <div className="grid gap-4 md:grid-cols-3">
                    {primaryStats.map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + i * 0.1 }}
                        className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${stat.bg} p-6 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-2xl`}
                      >
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
                        />
                        <div className="relative">
                          <div className={`mb-3 inline-flex rounded-lg bg-gradient-to-br ${stat.gradient} p-3 shadow-lg`}>
                            <stat.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className={`text-3xl font-black bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</div>
                          <div className="mt-1 text-sm font-medium text-foreground/70">{stat.label}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-3"
          >
            {secondaryStats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bg} p-8 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl`}
              >
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
                />
                
                {/* Animated glow orb */}
                <motion.div
                  className={`absolute -right-12 -bottom-12 h-32 w-32 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 dark:opacity-20 blur-3xl`}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                
                <div className="relative">
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`inline-flex rounded-xl bg-gradient-to-br ${stat.gradient} p-2.5 shadow-lg`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-2 w-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50"
                    />
                  </div>
                  <div className={`mb-2 text-5xl font-black bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-foreground/70">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {[
              { icon: Zap, title: 'Hızlı Entegrasyon', desc: 'Dakikalar içinde kurulum', color: 'purple' },
              { icon: Shield, title: 'Güvenli Ödeme', desc: 'SSL korumalı işlemler', color: 'blue' },
              { icon: TrendingUp, title: '%85 Gelir', desc: 'Geliştiriciler için', color: 'pink' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/5 p-6 text-left backdrop-blur-sm transition-all hover:border-white/20"
              >
                <div className={`flex-shrink-0 rounded-xl bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-500/10 p-3`}>
                  <feature.icon className={`h-6 w-6 text-${feature.color}-400`} />
                </div>
                <div>
                  <h3 className="mb-1 font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Gradient Line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
    </section>
  );
}
