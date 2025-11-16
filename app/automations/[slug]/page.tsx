import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Navbar } from '@/components/navbar';
import AutomationDetailClient from './AutomationDetailClient';
import { getAutomationBySlug, getAutomationReviews, checkUserPurchase } from '@/lib/queries/automation-detail';
import { createClient } from '@/lib/supabase/server';

// Note: revalidate export removed - not compatible with cacheComponents: true in Next.js 16
// Caching is handled by cacheComponents configuration

async function AutomationData({ slug }: { slug: string }) {
  const [automation, reviews, supabase] = await Promise.all([
    getAutomationBySlug(slug),
    Promise.resolve(null), // Will fetch after we have automation.id
    createClient(),
  ]);

  if (!automation) {
    notFound();
  }

  const [reviewsData, { data: { user } }] = await Promise.all([
    getAutomationReviews(automation.id),
    supabase.auth.getUser(),
  ]);

  const hasPurchased = user ? await checkUserPurchase(automation.id, user.id) : false;

  return (
    <AutomationDetailClient 
      automation={automation} 
      initialReviews={reviewsData} 
      initialHasPurchased={hasPurchased}
      currentUser={user}
    />
  );
}

export default async function AutomationDetailPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  // Handle both sync and async params (Next.js 15 compatibility)
  const resolvedParams = params instanceof Promise ? await params : params;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="h-96 animate-pulse bg-muted/10 rounded-lg" />
        </div>
      }>
        <AutomationData slug={resolvedParams.slug} />
      </Suspense>
    </main>
  );
}
