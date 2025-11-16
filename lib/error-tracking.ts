/**
 * Error Tracking Service
 * 
 * Centralized error tracking with support for Sentry integration.
 * Currently uses console logging, but ready for Sentry.
 */

interface ErrorTrackingConfig {
  dsn?: string;
  environment?: string;
  enabled?: boolean;
}

class ErrorTrackingService {
  private config: ErrorTrackingConfig;
  private isInitialized = false;

  constructor(config: ErrorTrackingConfig = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      environment: process.env.NODE_ENV || 'development',
      ...config,
    };
  }

  /**
   * Initialize error tracking
   */
  async init() {
    if (this.isInitialized) return;

    // TODO: Initialize Sentry
    // if (this.config.enabled && this.config.dsn) {
    //   const Sentry = await import('@sentry/nextjs');
    //   Sentry.init({
    //     dsn: this.config.dsn,
    //     environment: this.config.environment,
    //     tracesSampleRate: 1.0,
    //     debug: this.config.environment === 'development',
    //   });
    //   this.isInitialized = true;
    // }

    if (typeof window !== 'undefined') {
      // Track unhandled errors
      window.addEventListener('error', (event) => {
        this.captureException(event.error, {
          type: 'unhandledError',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        });
      });

      // Track unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.captureException(
          event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
          {
            type: 'unhandledRejection',
          }
        );
      });
    }

    console.log('[ERROR-TRACKING] Error tracking initialized');
    this.isInitialized = true;
  }

  /**
   * Capture an exception
   */
  captureException(error: Error, context: Record<string, any> = {}) {
    const errorData = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : 'server',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      },
    };

    // Always log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR-TRACKING] Exception captured:', errorData);
    }

    // TODO: Send to Sentry
    // if (this.config.enabled && typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { contexts: { custom: context } });
    // }
  }

  /**
   * Capture a message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context: Record<string, any> = {}) {
    if (process.env.NODE_ENV === 'development') {
      console[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log'](
        '[ERROR-TRACKING] Message captured:',
        { message, level, context }
      );
    }

    // TODO: Send to Sentry
    // if (this.config.enabled && typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureMessage(message, { level, contexts: { custom: context } });
    // }
  }

  /**
   * Set user context
   */
  setUser(user: { id?: string; email?: string; username?: string }) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ERROR-TRACKING] User context set:', user);
    }

    // TODO: Set Sentry user
    // if (this.config.enabled && typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.setUser(user);
    // }
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ERROR-TRACKING] Breadcrumb:', { message, category, data });
    }

    // TODO: Add Sentry breadcrumb
    // if (this.config.enabled && typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.addBreadcrumb({ message, category, data, level: 'info' });
    // }
  }
}

// Singleton instance
export const errorTracking = new ErrorTrackingService({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV === 'production',
});

// Auto-initialize
if (typeof window !== 'undefined') {
  errorTracking.init();
}

