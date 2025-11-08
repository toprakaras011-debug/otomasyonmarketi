'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface PrefetchLinkProps extends React.ComponentProps<typeof Link> {
  prefetchOnHover?: boolean;
}

export function PrefetchLink({ 
  prefetchOnHover = true, 
  children, 
  ...props 
}: PrefetchLinkProps) {
  const router = useRouter();
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!prefetchOnHover || !linkRef.current) return;

    const handleMouseEnter = () => {
      if (typeof props.href === 'string') {
        router.prefetch(props.href);
      }
    };

    const element = linkRef.current;
    element.addEventListener('mouseenter', handleMouseEnter, { passive: true });

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [props.href, prefetchOnHover, router]);

  return (
    <Link ref={linkRef} {...props}>
      {children}
    </Link>
  );
}
