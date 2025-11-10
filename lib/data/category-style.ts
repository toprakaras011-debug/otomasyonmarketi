export type IconKey =
  | 'sparkles'
  | 'trending'
  | 'code'
  | 'shield'
  | 'globe'
  | 'users';

export type CategoryStyleDefinition = {
  slug: string;
  name: string;
  iconKey: IconKey;
  gradientFrom: string;
  gradientTo: string;
};

export const CATEGORY_STYLES: CategoryStyleDefinition[] = [
  {
    slug: 'sosyal-medya',
    name: 'Sosyal Medya',
    iconKey: 'sparkles',
    gradientFrom: '#2563eb',
    gradientTo: '#1d4ed8',
  },
  {
    slug: 'e-ticaret-pazaryeri',
    name: 'E-Ticaret & Pazaryeri',
    iconKey: 'trending',
    gradientFrom: '#3b82f6',
    gradientTo: '#2563eb',
  },
  {
    slug: 'crm-musteri-yonetimi',
    name: 'CRM & Müşteri Yönetimi',
    iconKey: 'code',
    gradientFrom: '#f59e0b',
    gradientTo: '#d97706',
  },
  {
    slug: 'finans-faturalama',
    name: 'Finans & Faturalama',
    iconKey: 'shield',
    gradientFrom: '#10b981',
    gradientTo: '#047857',
  },
  {
    slug: 'veri-raporlama',
    name: 'Veri & Raporlama',
    iconKey: 'trending',
    gradientFrom: '#db2777',
    gradientTo: '#9d174d',
  },
  {
    slug: 'yapay-zeka-entegrasyonlari',
    name: 'Yapay Zeka Entegrasyonları',
    iconKey: 'sparkles',
    gradientFrom: '#ec4899',
    gradientTo: '#be185d',
  },
  {
    slug: 'bildirim-email',
    name: 'Bildirim & E-posta',
    iconKey: 'globe',
    gradientFrom: '#06b6d4',
    gradientTo: '#0ea5e9',
  },
  {
    slug: 'kisisel-verimlilik-takvim',
    name: 'Kişisel Verimlilik & Takvim',
    iconKey: 'users',
    gradientFrom: '#06b6d4',
    gradientTo: '#0891b2',
  },
  {
    slug: 'insan-kaynaklari',
    name: 'İnsan Kaynakları',
    iconKey: 'users',
    gradientFrom: '#f97316',
    gradientTo: '#ea580c',
  },
];

export const CATEGORY_STYLE_MAP: Record<string, CategoryStyleDefinition> = CATEGORY_STYLES.reduce(
  (acc, style) => {
    acc[style.slug] = style;
    return acc;
  },
  {} as Record<string, CategoryStyleDefinition>
);

export const FALLBACK_CATEGORY_STYLE: CategoryStyleDefinition = {
  slug: 'other',
  name: 'Genel',
  iconKey: 'trending',
  gradientFrom: '#3730a3',
  gradientTo: '#1d4ed8',
};
