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
      position="bottom-right"
      richColors
      closeButton
      expand={false}
      visibleToasts={5}
      offset="24px"
      gap={14}
      toastOptions={{
        duration: 5000,
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:shadow-2xl group-[.toaster]:z-[99999] group-[.toaster]:rounded-2xl group-[.toaster]:border',
          description: 'group-[.toast]:text-[13px] group-[.toast]:leading-relaxed group-[.toast]:mt-1',
          actionButton:
            'group-[.toast]:bg-white/20 group-[.toast]:text-white group-[.toast]:rounded-lg group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:font-medium hover:group-[.toast]:bg-white/30',
          cancelButton:
            'group-[.toast]:bg-white/10 group-[.toast]:text-white group-[.toast]:rounded-lg group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:font-medium hover:group-[.toast]:bg-white/20',
          closeButton: 'group-[.toast]:bg-white/20 group-[.toast]:border group-[.toast]:border-white/30 group-[.toast]:text-white hover:group-[.toast]:bg-white/30 hover:group-[.toast]:scale-110 hover:group-[.toast]:rotate-90',
          title: 'group-[.toast]:text-[15px] group-[.toast]:font-semibold group-[.toast]:text-white group-[.toast]:tracking-tight',
          icon: 'group-[.toast]:mr-3 group-[.toast]:w-6 group-[.toast]:h-6',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
