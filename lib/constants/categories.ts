export type CategoryDefinition = {
  slug: string;
  name: string;
  description: string;
  icon: 'ShoppingCart' | 'Share2' | 'BarChart3' | 'Users' | 'PiggyBank' | 'Sparkles' | 'BellRing' | 'CalendarDays';
  gradientFrom: string;
  gradientTo: string;
};

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    slug: 'sosyal-medya',
    name: 'Sosyal Medya Otomasyonları',
    description: '',
    icon: 'Share2',
    gradientFrom: '#2563eb',
    gradientTo: '#1d4ed8',
  },
  {
    slug: 'e-ticaret-pazaryeri',
    name: 'E-Ticaret & Pazaryeri Otomasyonları',
    description: '',
    icon: 'ShoppingCart',
    gradientFrom: '#9333ea',
    gradientTo: '#6d28d9',
  },
  {
    slug: 'crm-musteri-yonetimi',
    name: 'CRM & Müşteri Yönetimi',
    description: '',
    icon: 'Users',
    gradientFrom: '#f59e0b',
    gradientTo: '#d97706',
  },
  {
    slug: 'finans-faturalama',
    name: 'Finans & Faturalama',
    description: '',
    icon: 'PiggyBank',
    gradientFrom: '#10b981',
    gradientTo: '#047857',
  },
  {
    slug: 'veri-raporlama',
    name: 'Veri & Raporlama',
    description: '',
    icon: 'BarChart3',
    gradientFrom: '#db2777',
    gradientTo: '#9d174d',
  },
  {
    slug: 'yapay-zeka-entegrasyonlari',
    name: 'Yapay Zeka Entegrasyonları',
    description: '',
    icon: 'Sparkles',
    gradientFrom: '#ec4899',
    gradientTo: '#be185d',
  },
  {
    slug: 'bildirim-email',
    name: 'Bildirim & E-posta Sistemleri',
    description: '',
    icon: 'BellRing',
    gradientFrom: '#06b6d4',
    gradientTo: '#0ea5e9',
  },
  {
    slug: 'kisisel-verimlilik-takvim',
    name: 'Kişisel Verimlilik & Takvim',
    description: '',
    icon: 'CalendarDays',
    gradientFrom: '#14b8a6',
    gradientTo: '#0d9488',
  },
  {
    slug: 'insan-kaynaklari',
    name: 'İnsan Kaynakları',
    description: '',
    icon: 'Users',
    gradientFrom: '#f97316',
    gradientTo: '#ea580c',
  },
];
