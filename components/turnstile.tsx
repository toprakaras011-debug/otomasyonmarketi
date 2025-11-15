'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        callback?: (token: string) => void;
        'error-callback'?: () => void;
        'expired-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
        size?: 'normal' | 'compact';
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
}

export function Turnstile({ 
  siteKey, 
  onVerify, 
  onError, 
  onExpire,
  theme = 'auto',
  size = 'normal'
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Turnstile script is loaded
    const checkTurnstile = () => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        setIsLoaded(true);
        
        try {
          const widgetId = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              onVerify(token);
            },
            'error-callback': () => {
              onError?.();
            },
            'expired-callback': () => {
              onExpire?.();
            },
            theme,
            size,
          });
          
          widgetIdRef.current = widgetId;
        } catch (error) {
          // No logging to avoid blocking route
        }
      }
    };

    // Check immediately
    checkTurnstile();

    // If not loaded, wait for script
    if (!window.turnstile) {
      const interval = setInterval(() => {
        checkTurnstile();
        if (window.turnstile) {
          clearInterval(interval);
        }
      }, 100);

      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (!window.turnstile) {
          // No logging to avoid blocking route
        }
      }, 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (error) {
            // No logging to avoid blocking route
          }
        }
      };
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          // No logging to avoid blocking route
        }
      }
    };
  }, [siteKey, onVerify, onError, onExpire, theme, size]);

  const reset = () => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (error) {
        // No logging to avoid blocking route
      }
    }
  };

  // Expose reset method via ref (if needed)
  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as any).resetTurnstile = reset;
    }
  }, []);

  return (
    <div className="flex justify-center">
      <div ref={containerRef} className="turnstile-container" />
      {!isLoaded && (
        <div className="text-xs text-muted-foreground mt-2">
          Güvenlik doğrulaması yükleniyor...
        </div>
      )}
    </div>
  );
}

