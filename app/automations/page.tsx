import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getAutomations, getCategories } from '@/lib/queries/automations';
import AutomationsLoading from './loading';

const AutomationsClient = dynamic(() => import('./AutomationsClient'), { 
  loading: () => <AutomationsLoading />,
  ssr: true,
});

async function AutomationsData() {
  const [automations, categories] = await Promise.all([
    getAutomations(),
    getCategories(),
  ]);

  return <AutomationsClient automations={automations} categories={categories} />;
}

export default function AutomationsPage() {
  return (
    <Suspense fallback={<AutomationsLoading />}>
      <AutomationsData />
    </Suspense>
  );
}
