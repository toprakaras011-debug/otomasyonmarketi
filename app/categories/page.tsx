import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getCategoriesWithStats } from '@/lib/queries/categories';
import CategoriesLoading from './loading';

const CategoriesClient = dynamic(() => import('./CategoriesClient'), {
  loading: () => <CategoriesLoading />,
  ssr: true,
});

async function CategoriesData() {
  const categoriesWithStats = await getCategoriesWithStats();
  return <CategoriesClient initialCategories={categoriesWithStats} />;
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<CategoriesLoading />}>
      <CategoriesData />
    </Suspense>
  );
}

