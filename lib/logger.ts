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
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Log a warning message (always shown)
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context || '');
  }

  /**
   * Log an error message (always shown)
   */
  error(message: string, error?: Error | LogContext, context?: LogContext): void {
    const errorContext = error instanceof Error 
      ? { message: error.message, stack: error.stack, ...context }
      : { ...error, ...context };

    console.error(`[ERROR] ${message}`, errorContext);
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

