/**
 * Centralized Logging System
 * 
 * Provides structured logging with different log levels.
 * Automatically filters logs in production based on level.
 * 
 * @example
 * ```ts
 * import { logger } from '@/lib/logger';
 * 
 * logger.debug('Debug message', { data });
 * logger.info('Info message', { data });
 * logger.warn('Warning message', { data });
 * logger.error('Error message', { error });
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  // No module-level process.env to avoid blocking route
  // Environment checks are done at runtime inside methods

  /**
   * Check if we're in development (checked at runtime, not module-level)
   */
  private get isDevelopment(): boolean {
    // Only check on server-side (client-side always returns false to avoid blocking)
    if (typeof window !== 'undefined') {
      return false; // Client-side - no detailed logging to avoid blocking
    }
    return process.env.NODE_ENV === 'development';
  }

  /**
   * Check if we're in production (checked at runtime, not module-level)
   */
  private get isProduction(): boolean {
    if (typeof window !== 'undefined') {
      return true; // Client-side - assume production to avoid blocking
    }
    return process.env.NODE_ENV === 'production';
  }

  /**
   * Log a debug message (only in development, and only if explicitly enabled)
   */
  debug(message: string, context?: LogContext): void {
    // Debug logs are disabled by default to reduce console noise
    // Enable with DEBUG=true environment variable if needed
    // Check process.env at runtime to avoid blocking route
    if (typeof window === 'undefined' && this.isDevelopment) {
      const debugEnabled = process.env.DEBUG === 'true';
      if (debugEnabled) {
        console.log(`[DEBUG] ${message}`, context || '');
      }
    }
    // Client-side: no debug logging to avoid blocking route
  }

  /**
   * Log an info message (server-side only to avoid blocking route)
   */
  info(message: string, context?: LogContext): void {
    // Only log on server-side to avoid blocking route in client components
    if (typeof window === 'undefined' && this.isDevelopment) {
      console.log(`[INFO] ${message}`, context || '');
    }
    // Client-side: no info logging to avoid blocking route
  }

  /**
   * Log a warning message (server-side only to avoid blocking route)
   */
  warn(message: string, context?: LogContext): void {
    // Only log on server-side to avoid blocking route in client components
    if (typeof window === 'undefined') {
      console.warn(`[WARN] ${message}`, context || '');
    }
    // Client-side: no warn logging to avoid blocking route
  }

  /**
   * Log an error message (server-side only to avoid blocking route)
   */
  error(message: string, error?: Error | LogContext, context?: LogContext): void {
    // Only log on server-side to avoid blocking route in client components
    if (typeof window === 'undefined') {
      const errorContext = error instanceof Error 
        ? { message: error.message, stack: error.stack, ...context }
        : { ...error, ...context };

      console.error(`[ERROR] ${message}`, errorContext);
    }
    // Client-side: no error logging to avoid blocking route
    // Errors should be handled by user-facing error messages (toast, etc.)
  }

  /**
   * Log with custom level
   */
  log(level: LogLevel, message: string, context?: LogContext): void {
    switch (level) {
      case 'debug':
        this.debug(message, context);
        break;
      case 'info':
        this.info(message, context);
        break;
      case 'warn':
        this.warn(message, context);
        break;
      case 'error':
        this.error(message, context);
        break;
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export default for convenience
export default logger;

