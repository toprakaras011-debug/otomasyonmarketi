'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const AutomationsClient = dynamic(() => import('./AutomationsClient'), { ssr: false });
import { CATEGORY_DEFINITIONS } from '@/lib/constants/categories';
import { logger } from '@/lib/logger';

// Note: revalidate and dynamic exports removed - not compatible with cacheComponents: true in Next.js 16
// Caching is handled by cacheComponents configuration

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Supabase environment variables are not configured.');
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });

        const blockedSlugs = ['test', 'debug', 'demo', 'example'];
        
        const {
          data: automationsData,
          error: automationsError,
        } = await supabase
          .from('automations')
          .select('id,title,slug,description,price,image_url,image_path,total_sales,rating_avg,created_at,is_published,admin_approved, category:categories(id,name,slug), developer:user_profiles(id,username,avatar_url)')
          .eq('is_published', true)
          .eq('admin_approved', true)
          .order('created_at', { ascending: false })
          .limit(100);
        
        const filteredAutomations = (automationsData || []).filter(
          (automation: any) => !blockedSlugs.includes(automation.slug?.toLowerCase() || '')
        );

        const {
          data: categoriesData,
          error: categoriesError,
        } = await supabase
          .from('categories')
          .select('id,name,slug')
          .order('name');

        if (automationsError || categoriesError) {
          throw new Error(automationsError?.message || categoriesError?.message || 'Unknown error');
        }

        setAutomations(filteredAutomations);
        setCategories(categoriesData || []);

      } catch (error: any) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        logger.error('Automations page exception', errorObj);
        setError(error?.message || 'Bilinmeyen hata');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (error) {
    return <div>Hata: {error}</div>;
  }

  return (
    <>
      <AutomationsClient
        automations={automations}
        categories={categories}
      />
    </>
  );
}
