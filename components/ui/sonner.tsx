'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';
import { useEffect } from 'react';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  // NUCLEAR OPTION: Force viewport positioning at runtime with maximum aggression
  useEffect(() => {
    const forceToastPosition = () => {
      const toasters = document.querySelectorAll('[data-sonner-toaster], .sonner-toaster, ol[data-sonner-toaster]');
      toasters.forEach((toaster) => {
        const element = toaster as HTMLElement;
        // Force inline styles (highest specificity)
        element.style.setProperty('position', 'fixed', 'important');
        element.style.setProperty('bottom', '1.5rem', 'important');
        element.style.setProperty('right', '1.5rem', 'important');
        element.style.setProperty('top', 'auto', 'important');
        element.style.setProperty('left', 'auto', 'important');
        element.style.setProperty('z-index', '2147483647', 'important'); // Max z-index
        element.style.setProperty('transform', 'none', 'important');
        element.style.setProperty('margin', '0', 'important');
        element.style.setProperty('padding', '0', 'important');
        element.style.setProperty('inset', 'auto 1.5rem 1.5rem auto', 'important');
      });
    };

    // Run multiple times to ensure it takes effect
    forceToastPosition();
    setTimeout(forceToastPosition, 0);
    setTimeout(forceToastPosition, 50);
    setTimeout(forceToastPosition, 100);
    setTimeout(forceToastPosition, 200);

    // Watch for DOM changes aggressively
    const observer = new MutationObserver(() => {
      forceToastPosition();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'],
    });

    // Also watch for window resize/scroll
    const handleEvent = () => forceToastPosition();
    window.addEventListener('resize', handleEvent);
    window.addEventListener('scroll', handleEvent);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleEvent);
      window.removeEventListener('scroll', handleEvent);
    };
  }, []);

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:z-[99999]',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
