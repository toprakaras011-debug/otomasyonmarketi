'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';
import { useEffect } from 'react';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  // Force viewport positioning at runtime
  useEffect(() => {
    const forceToastPosition = () => {
      // Find all Sonner toaster containers
      const toasters = document.querySelectorAll('[data-sonner-toaster], .sonner-toaster');
      toasters.forEach((toaster) => {
        const element = toaster as HTMLElement;
        element.style.position = 'fixed';
        element.style.bottom = '1.5rem';
        element.style.right = '1.5rem';
        element.style.top = 'auto';
        element.style.left = 'auto';
        element.style.zIndex = '99999';
        element.style.transform = 'none';
        element.style.margin = '0';
        element.style.padding = '0';
      });
    };

    // Run immediately
    forceToastPosition();

    // Watch for DOM changes (Sonner might add toasts dynamically)
    const observer = new MutationObserver(forceToastPosition);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also run periodically to catch any missed updates (every 500ms)
    const interval = setInterval(forceToastPosition, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
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
