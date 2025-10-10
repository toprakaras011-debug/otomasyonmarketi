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
    description:
      'Instagram, TikTok, X (Twitter) ve YouTube için paylaşım, yorum, DM ve içerik planlama otomasyonları.',
    icon: 'Share2',
    gradientFrom: '#2563eb',
    gradientTo: '#1d4ed8',
  },
  {
    slug: 'e-ticaret-pazaryeri',
    name: 'E-Ticaret & Pazaryeri Otomasyonları',
    description:
      'Trendyol, Shopify, WooCommerce, Etsy için ürün yükleme, stok senkronizasyonu ve sipariş bildirimi.',
    icon: 'ShoppingCart',
    gradientFrom: '#9333ea',
    gradientTo: '#6d28d9',
  },
  {
    slug: 'crm-musteri-yonetimi',
    name: 'CRM & Müşteri Yönetimi',
    description:
      'HubSpot, Notion, Google Sheets, Airtable entegrasyonlarıyla otomatik müşteri kaydı ve e-posta takibi.',
    icon: 'Users',
    gradientFrom: '#f59e0b',
    gradientTo: '#d97706',
  },
  {
    slug: 'finans-faturalama',
    name: 'Finans & Faturalama',
    description:
      'Excel, Paraşüt, Mikro, Logo, Stripe veya Supabase tabanlı gelir raporu otomasyonları.',
    icon: 'PiggyBank',
    gradientFrom: '#10b981',
    gradientTo: '#047857',
  },
  {
    slug: 'veri-raporlama',
    name: 'Veri & Raporlama',
    description:
      'Google Sheets, Notion, API to Sheet ile veri toplama ve dashboard oluşturma otomasyonları.',
    icon: 'BarChart3',
    gradientFrom: '#db2777',
    gradientTo: '#9d174d',
  },
  {
    slug: 'yapay-zeka-entegrasyonlari',
    name: 'Yapay Zeka Entegrasyonları',
    description:
      'ChatGPT, Midjourney, Claude ve Gemini API destekli içerik veya görsel üretim otomasyonları.',
    icon: 'Sparkles',
    gradientFrom: '#a855f7',
    gradientTo: '#7c3aed',
  },
  {
    slug: 'bildirim-email',
    name: 'Bildirim & E-posta Sistemleri',
    description:
      'Slack, Telegram, WhatsApp, Discord botlarıyla otomatik bildirim ve müşteri destek mesajları.',
    icon: 'BellRing',
    gradientFrom: '#06b6d4',
    gradientTo: '#0ea5e9',
  },
  {
    slug: 'kisisel-verimlilik-takvim',
    name: 'Kişisel Verimlilik & Takvim',
    description:
      'Google Calendar, Todoist, Notion ile görev planlama, alışkanlık takibi ve hatırlatıcı otomasyonları.',
    icon: 'CalendarDays',
    gradientFrom: '#6366f1',
    gradientTo: '#4338ca',
  },
];
