'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Shield, TrendingUp, Rocket, Globe, Code2, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useCallback, memo } from 'react';

type HeroStats = {
  automations: number;
  developers: number;
  users: number;
  integrations: number;
  estimatedHours: number;
  efficiencyMultiplier: number;
};

type StatDescriptor = {
  icon: LucideIcon;
  label: string;
  value: string;
  gradient: string;
  bg: string;
};

type FeatureCard = {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: 'purple' | 'blue' | 'pink';
};

type HeroProps = {
  initialStats: HeroStats | null;
};

const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Reduced particles for better performance
const PARTICLE_CONFIG = Array.from({ length: 6 }, (_, index) => {
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

function HeroComponent({ initialStats }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], isMobile ? ["0%", "0%"] : ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], isMobile ? [1, 1] : [1, 0.3]);

  const [stats, setStats] = useState({
    automations: initialStats?.automations ?? 1,
    developers: initialStats?.developers ?? 3,
    users: initialStats?.users ?? 1,
    integrations: initialStats?.integrations ?? 1,
    estimatedHours: initialStats?.estimatedHours ?? 60,
    efficiencyMultiplier: initialStats?.efficiencyMultiplier ?? 8,
    loading: false,
  });

  useEffect(() => {
    setIsMounted(true);
    if (initialStats) {
      setStats({ ...initialStats, loading: false });
    }
    // Detect mobile for performance optimization
    setIsMobile(window.innerWidth < 768);
    // Ensure container has explicit position for framer-motion scroll tracking
    if (containerRef.current) {
      const element = containerRef.current;
      // Force position relative if not already set
      if (getComputedStyle(element).position === 'static') {
        element.style.position = 'relative';
      }
    }
  }, [initialStats]);

  const formatWithPlus = useCallback((value: number, suffix?: string) => {
    if (!value) {
      return suffix ? `0 ${suffix}` : '0';
    }

    const formatted = value >= 1000
      ? new Intl.NumberFormat('tr-TR', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
      : new Intl.NumberFormat('tr-TR').format(value);

    return suffix ? `${formatted}+ ${suffix}` : `${formatted}+`;
  }, []);

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

  const featureCards: FeatureCard[] = useMemo(() => [
    { icon: Zap, title: 'Hızlı Entegrasyon', desc: 'Dakikalar içinde kurulum', color: 'purple' },
    { icon: Shield, title: 'Güvenli Ödeme', desc: 'SSL korumalı işlemler', color: 'blue' },
    { icon: TrendingUp, title: '%85 Gelir', desc: 'Geliştiriciler için', color: 'pink' },
  ], []);

  const secondaryStats = useMemo(() => ([
    {
      icon: Sparkles,
      label: 'Workflow & Otomasyon',
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
    <section 
      ref={containerRef} 
      className="relative overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 xl:pt-48 xl:pb-40"
      style={{ position: 'relative' }}
    >
      {/* Advanced Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Gradient Orbs - Optimized animations for performance */}
        <motion.div 
          className="absolute -top-[40%] -right-[20%] h-[800px] w-[800px] rounded-full bg-purple-600/30 blur-[120px]"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          style={{ willChange: 'opacity' }}
        />
        <motion.div 
          className="absolute -bottom-[40%] -left-[20%] h-[800px] w-[800px] rounded-full bg-blue-600/30 blur-[120px]"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ willChange: 'opacity' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-pink-500/20 blur-[100px]" />
        
        {/* Floating Particles - Only show on desktop (lg and above) */}
        {isMounted && (
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
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

      <motion.div style={{ y, opacity }} className="container relative mx-auto px-4 gpu-accelerated">
        <div className="mx-auto max-w-6xl text-center">
          {/* Main Heading with Advanced Typography */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
            className="mb-4 text-3xl font-black leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl"
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mb-6 max-w-4xl"
          >
            <p className="mb-4 text-base leading-relaxed text-foreground/80 sm:text-lg md:text-xl lg:text-2xl md:leading-relaxed">
              <span className="block text-balance mb-3">
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text font-semibold text-transparent">
                  Workflow automation ve yapay zeka destekli otomasyon çözümleri
                </span>{' '}
                ile e-ticaret, sosyal medya ve veri analitiği workflow'larınızı tek panelden yönetin.
              </span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.span 
                className="inline-flex items-center gap-2.5 rounded-full border border-purple-500/40 bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-blue-500/15 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-purple-700 shadow-lg shadow-purple-500/20 dark:text-purple-200 dark:border-purple-400/40"
                whileHover={{ scale: 1.05, borderColor: 'rgba(168, 85, 247, 0.6)' }}
                transition={{ duration: 0.2 }}
              >
                <Zap className="h-4 w-4 text-purple-500" />
                AI Optimizasyonu
              </motion.span>
              <motion.span 
                className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-emerald-500/10 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-foreground/90 shadow-lg shadow-blue-500/10"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <TrendingUp className="h-4 w-4 text-cyan-500" />
                <span>
                  Verimliliği{' '}
                  <span className="bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 bg-clip-text font-bold text-transparent">
                    10x
                  </span>{' '}
                  artırın
                </span>
              </motion.span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="mb-10 flex flex-row items-center justify-center gap-4 md:mb-12 lg:mb-16"
          >
            <Button
              size="lg"
              className="group relative h-12 min-h-[56px] overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 px-6 text-base font-bold shadow-2xl shadow-purple-500/50 transition-all hover:scale-105 hover:shadow-purple-500/70 sm:h-14 sm:px-8 sm:text-lg touch-manipulation"
              asChild
            >
              <Link href="/automations" className="touch-manipulation">
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
              className="h-12 min-h-[56px] border-2 border-purple-500/50 bg-background/50 px-6 text-base font-bold backdrop-blur-sm transition-all hover:scale-105 hover:border-purple-500 hover:bg-purple-500/10 sm:h-14 sm:px-8 sm:text-lg touch-manipulation"
              asChild
            >
              <Link href="/developer/register" className="touch-manipulation">
                <Rocket className="mr-2 h-5 w-5" />
                Geliştirici Ol
              </Link>
            </Button>
          </motion.div>

          {/* 3D Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-12 perspective-[2000px] md:mb-16 lg:mb-20"
          >
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-20 blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 p-1 shadow-2xl backdrop-blur-xl">
                <div className="rounded-xl bg-transparent p-4 backdrop-blur-sm sm:p-6 md:p-8">
                  <div className="grid gap-4 md:grid-cols-3">
                    {primaryStats.map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                        className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${stat.bg} p-4 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-2xl sm:p-5 md:p-6`}
                      >
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
                        />
                        <div className="relative">
                          <div className={`mb-3 inline-flex rounded-lg bg-gradient-to-br ${stat.gradient} p-3 shadow-lg`}>
                            <stat.icon className="h-6 w-6 text-white" />
                          </div>
                          <div className={`text-2xl font-black bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent sm:text-3xl`}>{stat.value}</div>
                          <div className="mt-1 text-xs font-medium text-foreground/70 sm:text-sm">{stat.label}</div>
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
            transition={{ duration: 0.35, delay: 0.25 }}
            className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 md:mb-12 lg:mb-16"
          >
            {secondaryStats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bg} p-5 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl sm:p-6 md:p-8`}
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
                  <div className={`mb-2 text-3xl font-black bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent sm:text-4xl md:text-5xl`}>
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-foreground/70 sm:text-sm">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6"
          >
            {featureCards.map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4 text-left backdrop-blur-sm transition-all hover:border-white/20 sm:gap-4 sm:p-6"
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

export const Hero = memo(HeroComponent);
