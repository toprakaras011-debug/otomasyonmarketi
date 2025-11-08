import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseFunctionsUrl =
  process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL ?? `${supabaseUrl}/functions/v1`;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    functions: {
      url: supabaseFunctionsUrl,
    },
  } as any
);

export type UserProfile = {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  is_developer: boolean;
  developer_approved: boolean;
  balance: number;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  created_at: string;
};

export type Automation = {
  id: string;
  developer_id: string;
  category_id?: string;
  title: string;
  slug: string;
  description: string;
  long_description?: string;
  price: number;
  image_url?: string;
  demo_url?: string;
  file_url?: string;
  documentation?: string;
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  admin_approved: boolean;
  total_sales: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  developer?: UserProfile;
};

export type Purchase = {
  id: string;
  user_id: string;
  automation_id: string;
  price_paid: number;
  platform_commission: number;
  developer_earnings: number;
  payment_provider: string;
  payment_id?: string;
  status: 'pending' | 'completed' | 'refunded';
  purchased_at: string;
  refunded_at?: string;
  automation?: Automation;
};

export type Review = {
  id: string;
  automation_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
};

export type Payout = {
  id: string;
  developer_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  bank_info?: any;
  requested_at: string;
  processed_at?: string;
  notes?: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  automation_id: string;
  created_at: string;
  automation?: Automation;
};

export type BlogPost = {
  id: string;
  author_id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author?: UserProfile;
};
