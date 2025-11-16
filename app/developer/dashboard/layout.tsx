import { Suspense } from 'react';

export default function DeveloperDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      {children}
    </Suspense>
  );
}

