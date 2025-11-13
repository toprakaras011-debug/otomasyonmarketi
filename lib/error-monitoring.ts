/**
 * Advanced Error Monitoring and Logging System
 * Provides comprehensive error tracking for production
 */

interface ErrorContext {
  userId?: string;
  userEmail?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
  sessionId?: string;
  buildVersion?: string;
  environment?: string;
  additionalData?: Record<string, any>;
}

interface ErrorReport {
  message: string;
  stack?: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  category: 'auth' | 'database' | 'api' | 'ui' | 'performance' | 'security' | 'unknown';
  context?: ErrorContext;
}

class ErrorMonitoring {
  private static instance: ErrorMonitoring;
  private isProduction: boolean;
  private sessionId: string;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.sessionId = this.generateSessionId();
    
    // Initialize error handlers
    if (typeof window !== 'undefined') {
      this.initializeGlobalErrorHandlers();
    }
  }

  static getInstance(): ErrorMonitoring {
    if (!ErrorMonitoring.instance) {
      ErrorMonitoring.instance = new ErrorMonitoring();
    }
    return ErrorMonitoring.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeGlobalErrorHandlers(): void {
    // Catch unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        level: 'error',
        category: 'ui',
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          }
        }
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        level: 'error',
        category: 'unknown',
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          additionalData: {
            reason: event.reason,
          }
        }
      });
    });
  }

  private getContext(): ErrorContext {
    const context: ErrorContext = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      environment: process.env.NODE_ENV || 'unknown',
      buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'unknown',
    };

    if (typeof window !== 'undefined') {
      context.url = window.location.href;
      context.userAgent = navigator.userAgent;
    }

    return context;
  }

  /**
   * Capture and report an error
   */
  captureError(errorReport: Partial<ErrorReport>): void {
    const fullReport: ErrorReport = {
      message: errorReport.message || 'Unknown error',
      stack: errorReport.stack,
      level: errorReport.level || 'error',
      category: errorReport.category || 'unknown',
      context: {
        ...this.getContext(),
        ...errorReport.context,
      }
    };

    // Always log to console in development
    if (!this.isProduction) {
      console.group(`🚨 Error [${fullReport.level}] - ${fullReport.category}`);
      console.error('Message:', fullReport.message);
      if (fullReport.stack) {
        console.error('Stack:', fullReport.stack);
      }
      console.log('Context:', fullReport.context);
      console.groupEnd();
    }

    // Send to external service in production
    if (this.isProduction) {
      this.sendToExternalService(fullReport);
    }

    // Store locally for debugging
    this.storeLocally(fullReport);
  }

  /**
   * Capture authentication errors
   */
  captureAuthError(error: Error, additionalContext?: Record<string, any>): void {
    this.captureError({
      message: error.message,
      stack: error.stack,
      level: 'error',
      category: 'auth',
      context: {
        additionalData: additionalContext,
      }
    });
  }

  /**
   * Capture database errors
   */
  captureDatabaseError(error: Error, query?: string, params?: any): void {
    this.captureError({
      message: error.message,
      stack: error.stack,
      level: 'error',
      category: 'database',
      context: {
        additionalData: {
          query: query ? this.sanitizeQuery(query) : undefined,
          params: params ? this.sanitizeParams(params) : undefined,
        }
      }
    });
  }

  /**
   * Capture API errors
   */
  captureAPIError(error: Error, endpoint?: string, method?: string, statusCode?: number): void {
    this.captureError({
      message: error.message,
      stack: error.stack,
      level: 'error',
      category: 'api',
      context: {
        additionalData: {
          endpoint,
          method,
          statusCode,
        }
      }
    });
  }

  /**
   * Capture performance issues
   */
  capturePerformanceIssue(metric: string, value: number, threshold: number): void {
    this.captureError({
      message: `Performance issue: ${metric} (${value}ms) exceeded threshold (${threshold}ms)`,
      level: 'warning',
      category: 'performance',
      context: {
        additionalData: {
          metric,
          value,
          threshold,
        }
      }
    });
  }

  /**
   * Log info messages
   */
  logInfo(message: string, additionalData?: Record<string, any>): void {
    this.captureError({
      message,
      level: 'info',
      category: 'unknown',
      context: {
        additionalData,
      }
    });
  }

  private sanitizeQuery(query: string): string {
    // Remove sensitive data from queries
    return query
      .replace(/password\s*=\s*'[^']*'/gi, "password = '[REDACTED]'")
      .replace(/token\s*=\s*'[^']*'/gi, "token = '[REDACTED]'")
      .replace(/secret\s*=\s*'[^']*'/gi, "secret = '[REDACTED]'");
  }

  private sanitizeParams(params: any): any {
    if (!params || typeof params !== 'object') return params;
    
    const sanitized = { ...params };
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
    
    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  private async sendToExternalService(errorReport: ErrorReport): Promise<void> {
    try {
      // Example: Send to your logging service
      // Replace with your actual logging service (Sentry, LogRocket, etc.)
      
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      });

      if (!response.ok) {
        console.warn('Failed to send error to external service:', response.statusText);
      }
    } catch (error) {
      console.warn('Error sending to external service:', error);
    }
  }

  private storeLocally(errorReport: ErrorReport): void {
    try {
      if (typeof window === 'undefined') return;

      const storageKey = 'error_logs';
      const maxLogs = 50; // Keep last 50 errors
      
      const existingLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const updatedLogs = [errorReport, ...existingLogs].slice(0, maxLogs);
      
      localStorage.setItem(storageKey, JSON.stringify(updatedLogs));
    } catch (error) {
      console.warn('Failed to store error locally:', error);
    }
  }

  /**
   * Get stored error logs (for debugging)
   */
  getStoredLogs(): ErrorReport[] {
    try {
      if (typeof window === 'undefined') return [];
      return JSON.parse(localStorage.getItem('error_logs') || '[]');
    } catch {
      return [];
    }
  }

  /**
   * Clear stored error logs
   */
  clearStoredLogs(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('error_logs');
      }
    } catch (error) {
      console.warn('Failed to clear stored logs:', error);
    }
  }
}

// Export singleton instance
export const errorMonitoring = ErrorMonitoring.getInstance();

// Export helper functions
export const captureError = (error: Error, category?: ErrorReport['category'], additionalContext?: Record<string, any>) => {
  errorMonitoring.captureError({
    message: error.message,
    stack: error.stack,
    level: 'error',
    category: category || 'unknown',
    context: {
      additionalData: additionalContext,
    }
  });
};

export const captureAuthError = (error: Error, additionalContext?: Record<string, any>) => {
  errorMonitoring.captureAuthError(error, additionalContext);
};

export const captureDatabaseError = (error: Error, query?: string, params?: any) => {
  errorMonitoring.captureDatabaseError(error, query, params);
};

export const captureAPIError = (error: Error, endpoint?: string, method?: string, statusCode?: number) => {
  errorMonitoring.captureAPIError(error, endpoint, method, statusCode);
};

export const logInfo = (message: string, additionalData?: Record<string, any>) => {
  errorMonitoring.logInfo(message, additionalData);
};

export default errorMonitoring;
