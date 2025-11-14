import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import AutomationDetailClient from './AutomationDetailClient';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function AutomationDetailPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const supabase = await createClient();
  
  // Handle both sync and async params (Next.js 15 compatibility)
  const resolvedParams = params instanceof Promise ? await params : params;

  // Block access to test/debug slugs
  const blockedSlugs = ['test', 'debug', 'demo', 'example'];
  if (blockedSlugs.includes(resolvedParams.slug.toLowerCase())) {
    console.log('[DEBUG] automations/[slug]/page.tsx - Blocked slug access', {
      slug: resolvedParams.slug,
    });
    notFound();
  }

  const { data: automation } = await supabase
    .from('automations')
    .select('id,developer_id,title,slug,description,long_description,price,image_url,image_path,file_path,tags,is_featured,total_sales,rating_avg,rating_count,created_at,updated_at,is_published,admin_approved, category:categories(id,name,slug,color,created_at), developer:user_profiles(id,username,avatar_url)')
    .eq('slug', resolvedParams.slug)
    .eq('is_published', true)
    .maybeSingle();

  if (!automation) {
    notFound();
  }

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id,automation_id,user_id,rating,comment,created_at,updated_at, user:user_profiles(id,username,avatar_url)')
    .eq('automation_id', automation.id)
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: { user } } = await supabase.auth.getUser();

  let hasPurchased = false;
  if (user) {
    const { data: purchaseData } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('automation_id', automation.id)
      .eq('status', 'completed')
      .maybeSingle();
    hasPurchased = !!purchaseData;
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <AutomationDetailClient 
        automation={automation as any} 
        initialReviews={(reviews || []) as any} 
        initialHasPurchased={hasPurchased}
        currentUser={user}
      />
    </main>
  );
}
