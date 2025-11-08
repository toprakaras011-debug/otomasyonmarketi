import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import AutomationDetailClient from './AutomationDetailClient';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function AutomationDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();

  const { data: automation } = await supabase
    .from('automations')
    .select('*, category:categories(*), developer:user_profiles(*)')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!automation) {
    notFound();
  }

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, user:user_profiles(*)')
    .eq('automation_id', automation.id)
    .order('created_at', { ascending: false });

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
        automation={automation} 
        initialReviews={reviews || []} 
        initialHasPurchased={hasPurchased}
        currentUser={user}
      />
    </main>
  );
}
