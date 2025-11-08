
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap, Shield, TrendingUp, Rocket, Globe, Code2, Users } from 'lucide-react';
import Link from 'next/link';

type HeroStats = {
  automations: number;
  developers: number;
  users: number;
  integrations: number;
  estimatedHours: number;
  efficiencyMultiplier: number;
};

interface HeroProps {
  initialStats: HeroStats;
}

const formatCompact = (value: number, suffix?: string) => {
  if (!value) {
    return suffix ? `0 ${suffix}` : '0';
  }

  const formatter = new Intl.NumberFormat('tr-TR', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  });

  const formatted = formatter.format(value);
  return suffix ? `${formatted}+ ${suffix}` : `${formatted}+`;
};

export function Hero({ initialStats }: HeroProps) {
  const primaryStats = [
    {
      icon: Zap,
      label: 'Verimlilik Artışı',
      value: `${initialStats.efficiencyMultiplier}x`,
    },
    {
      icon: Globe,
      label: 'Canlı Entegrasyon',
      value: formatCompact(initialStats.integrations),
    },
    {
      icon: Code2,
      label: 'Tasarruf Edilen Saat',
      value: formatCompact(initialStats.estimatedHours, 'Saat'),
    },
  ];

  const secondaryStats = [
    {
      icon: Sparkles,
      label: 'Hazır Otomasyon',
      value: formatCompact(initialStats.automations),
    },
    {
      icon: Users,
      label: 'Profesyonel Geliştirici',
      value: formatCompact(initialStats.developers),
    },
    {
      icon: TrendingUp,
      label: 'Aktif Kullanıcı',
      value: formatCompact(initialStats.users),
    },
  ];

  const features = [
    { icon: Zap, title: 'Hızlı Entegrasyon', description: 'Dakikalar içinde kurulum' },
    { icon: Shield, title: 'Güvenli Ödeme', description: 'SSL korumalı işlemler' },
    { icon: TrendingUp, title: '%85 Gelir', description: 'Geliştiriciler için' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-background/90 py-20 sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.12),_transparent_55%)]" aria-hidden />

      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 text-center sm:px-6 lg:px-8">
        <div className="space-y-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-purple-600">
            Yapay Zeka Destekli Otomasyon
          </p>

          <h1 className="text-balance text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            İşinizi Otomatikleştirin, <span className="text-transparent bg-gradient-to-r from-purple-500 via-rose-500 to-sky-400 bg-clip-text">Geleceği Yakalayın</span>
          </h1>

          <p className="mx-auto max-w-3xl text-pretty text-lg text-muted-foreground sm:text-xl">
            Yapay zeka destekli otomasyon çözümlerimizle e-ticaret, sosyal medya ve veri analitiği süreçlerinizi tek panelden yönetin. Zamandan tasarruf edin, verimliliği artırın ve daha hızlı ölçeklenin.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="h-14 px-8 text-base font-semibold" asChild>
              <Link href="/automations" className="flex items-center gap-2">
                Mağazayı Keşfet
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 border-2 border-purple-500/40 px-8 text-base font-semibold"
              asChild
            >
              <Link href="/developer/register" className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Geliştirici Ol
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {primaryStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-purple-500/10 bg-background/60 p-6 text-left shadow-lg"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {secondaryStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-purple-500/10 bg-background/50 p-6 text-left"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-500">{stat.label}</p>
              <p className="mt-3 text-4xl font-black text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 rounded-2xl border border-border bg-background/60 p-6 text-left"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
