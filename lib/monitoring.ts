/**
 * Error Tracking and Performance Monitoring
 * 
 * This module provides centralized error tracking and performance monitoring.
 * Currently uses console logging, but can be extended with Sentry or other services.
 */

interface ErrorContext {
  userId?: string;
  email?: string;
  path?: string;
  userAgent?: string;
  timestamp?: string;
  [key: string]: any;
}

class MonitoringService {
  private isProduction: boolean;
  private isDevelopment: boolean;
  private errorQueue: Array<{ error: Error; context: ErrorContext }> = [];

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Log an error with context
   */
  captureError(error: Error, context: ErrorContext = {}) {
    const errorData = {
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
      },
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        url: typeof window !== 'undefined' ? window.location.href : 'server',
      },
    };

    // Always log in development
    if (this.isDevelopment) {
      console.error('[MONITORING] Error captured:', errorData);
    }

    // In production, queue errors for batch sending
    if (this.isProduction) {
      this.errorQueue.push({ error, context });
      // Flush queue if it gets too large
      if (this.errorQueue.length > 50) {
        this.flushErrorQueue();
      }
    }

    // TODO: Integrate with Sentry
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { contexts: { custom: context } });
    // }
  }

  /**
   * Log a warning
   */
  captureWarning(message: string, context: ErrorContext = {}) {
    if (this.isDevelopment) {
      console.warn('[MONITORING] Warning:', { message, context });
    }

    // TODO: Integrate with Sentry
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureMessage(message, { level: 'warning', contexts: { custom: context } });
    // }
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric: string, value: number, context: ErrorContext = {}) {
    if (this.isDevelopment) {
      console.log('[MONITORING] Performance:', { metric, value, context });
    }

    // TODO: Integrate with analytics
    // analytics.track(metric, { value, ...context });
  }

  /**
   * Track user action
   */
  trackEvent(eventName: string, properties: Record<string, any> = {}) {
    if (this.isDevelopment) {
      console.log('[MONITORING] Event:', { eventName, properties });
    }

    // TODO: Integrate with analytics
    // analytics.track(eventName, properties);
  }

  /**
   * Flush error queue (for batch sending)
   */
  private flushErrorQueue() {
    // TODO: Send errors to monitoring service
    console.warn('[MONITORING] Error queue flushed:', this.errorQueue.length);
    this.errorQueue = [];
  }

  /**
   * Initialize monitoring (call this in app initialization)
   */
  init() {
    if (typeof window !== 'undefined') {
      // Track unhandled errors
      window.addEventListener('error', (event) => {
        this.captureError(event.error, {
          path: window.location.pathname,
          userAgent: navigator.userAgent,
        });
      });

      // Track unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(
          event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
          {
            path: window.location.pathname,
            userAgent: navigator.userAgent,
            type: 'unhandledRejection',
          }
        );
      });
    }

    console.log('[MONITORING] Monitoring service initialized');
  }
}

// Singleton instance
export const monitoring = new MonitoringService();

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  monitoring.init();
}

