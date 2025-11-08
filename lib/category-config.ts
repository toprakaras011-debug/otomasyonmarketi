import { LucideIcon, Sparkles, Code2, TrendingUp } from 'lucide-react';

export type CategoryIconKey = 'sparkles' | 'code' | 'trending';

export type CategoryConfig = {
  slug: string;
  name: string;
  description: string;
  gradient: string;
  icon: CategoryIconKey;
  baselineCount: number;
};

export const CATEGORY_CONFIG: CategoryConfig[] = [
  {
    name: 'E-Ticaret',
    slug: 'e-ticaret',
    description: '',
    gradient: 'from-purple-600 via-purple-500 to-pink-600',
    icon: 'trending',
    baselineCount: 250,
  },
  {
    name: 'Sosyal Medya',
    slug: 'sosyal-medya',
    description: '',
    gradient: 'from-blue-600 via-cyan-500 to-blue-600',
    icon: 'sparkles',
    baselineCount: 180,
  },
  {
    name: 'Veri & Raporlama',
    slug: 'veri-raporlama',
    description: '',
    gradient: 'from-pink-600 via-rose-500 to-orange-600',
    icon: 'code',
    baselineCount: 120,
  },
];

export const CATEGORY_ICON_MAP: Record<CategoryIconKey, LucideIcon> = {
  sparkles: Sparkles,
  code: Code2,
  trending: TrendingUp,
};

export const CATEGORY_SLUGS = CATEGORY_CONFIG.map((config) => config.slug);
