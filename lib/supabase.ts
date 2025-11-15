import { createClient } from '@supabase/supabase-js';

// No module-level process.env to avoid blocking route
// Environment variables are accessed at runtime when client is created

// Lazy initialization function to access process.env only when needed
function getSupabaseConfig() {
  // Access process.env at runtime, not at module level
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabaseFunctionsUrl =
    process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL ?? `${supabaseUrl}/functions/v1`;

  return {
    url: supabaseUrl || 'https://placeholder.supabase.co',
    anonKey: supabaseAnonKey || 'placeholder-key',
    functionsUrl: supabaseFunctionsUrl,
  };
}

// Create client lazily to avoid module-level process.env access
let supabaseClient: ReturnType<typeof createClient> | null = null;

function createSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const config = getSupabaseConfig();

  supabaseClient = createClient(
    config.url,
    config.anonKey,
    {
      auth: {
        persistSession: true, // ✅ Explicitly enable session persistence
        autoRefreshToken: true, // ✅ Auto-refresh tokens (Supabase handles this automatically)
        detectSessionInUrl: true, // ✅ Detect session in URL (for OAuth callbacks)
        storage: typeof window !== 'undefined' ? window.localStorage : undefined, // ✅ Use localStorage in browser
        storageKey: 'supabase.auth.token', // ✅ Consistent storage key
        flowType: 'pkce', // ✅ Use PKCE flow for better security and stability
        debug: false, // Disable Supabase debug logs in all environments
      },
      functions: {
        url: config.functionsUrl,
      },
    // Global options
    global: {
      headers: {
        'x-client-info': 'otomasyonmagazasi-web',
        'x-application-name': 'otomasyonmagazasi',
      },
    },
    // Realtime options for better connection stability
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  } as any
  );

  return supabaseClient;
}

// Export lazy-initialized client using Proxy
// This ensures process.env is only accessed when the client is actually used
// Don't call createSupabaseClient() at module level - use Proxy to defer initialization
// Only initialize on client-side to avoid SSR blocking route issues
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    // Only access process.env on client-side to avoid blocking route
    if (typeof window === 'undefined') {
      // Server-side: return a no-op object to avoid blocking
      // The actual client will be created when used in client components
      return () => {};
    }
    
    const client = createSupabaseClient();
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
  set(_target, prop, value) {
    // Only access process.env on client-side to avoid blocking route
    if (typeof window === 'undefined') {
      return true; // No-op on server-side
    }
    
    const client = createSupabaseClient();
    (client as any)[prop] = value;
    return true;
  },
});

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
