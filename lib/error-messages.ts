/**
 * Secure Error Messages
 * 
 * Provides user-friendly error messages for production
 * while keeping detailed errors for development.
 * 
 * @example
 * ```ts
 * import { getErrorMessage } from '@/lib/error-messages';
 * 
 * try {
 *   // operation
 * } catch (error) {
 *   const message = getErrorMessage(error, 'operation');
 *   toast.error(message);
 * }
 * ```
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Generic error messages for production
 * Detailed errors are only shown in development
 */
const GENERIC_ERRORS: Record<string, string> = {
  auth: 'Giriş yaparken bir hata oluştu. Lütfen tekrar deneyin.',
  database: 'Veritabanı işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.',
  network: 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
  validation: 'Girdiğiniz bilgiler geçersiz. Lütfen kontrol edin.',
  permission: 'Bu işlem için yetkiniz bulunmamaktadır.',
  notFound: 'Aradığınız kayıt bulunamadı.',
  server: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
  timeout: 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.',
  default: 'Bir hata oluştu. Lütfen tekrar deneyin.',
};

/**
 * Get user-friendly error message
 */
export function getErrorMessage(
  error: unknown,
  category: keyof typeof GENERIC_ERRORS = 'default',
  operation?: string
): string {
  // In development, show detailed error
  if (isDevelopment && error instanceof Error) {
    return `${operation ? `${operation}: ` : ''}${error.message}`;
  }

  // In production, show generic message
  const genericMessage = GENERIC_ERRORS[category] || GENERIC_ERRORS.default;

  // Add operation context if provided
  return operation ? `${operation}: ${genericMessage}` : genericMessage;
}

/**
 * Get error category from error
 */
export function getErrorCategory(error: unknown): keyof typeof GENERIC_ERRORS {
  if (!(error instanceof Error)) {
    return 'default';
  }

  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || '';

  // Auth errors
  if (
    message.includes('auth') ||
    message.includes('login') ||
    message.includes('signin') ||
    message.includes('signup') ||
    message.includes('unauthorized') ||
    message.includes('forbidden')
  ) {
    return 'auth';
  }

  // Database errors
  if (
    message.includes('database') ||
    message.includes('sql') ||
    message.includes('query') ||
    message.includes('postgres') ||
    message.includes('supabase') ||
    stack.includes('supabase')
  ) {
    return 'database';
  }

  // Network errors
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('failed to fetch')
  ) {
    return 'network';
  }

  // Validation errors
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required') ||
    message.includes('format')
  ) {
    return 'validation';
  }

  // Permission errors
  if (
    message.includes('permission') ||
    message.includes('access denied') ||
    message.includes('unauthorized') ||
    message.includes('forbidden')
  ) {
    return 'permission';
  }

  // Not found errors
  if (
    message.includes('not found') ||
    message.includes('404') ||
    message.includes('does not exist')
  ) {
    return 'notFound';
  }

  // Timeout errors
  if (message.includes('timeout') || message.includes('timed out')) {
    return 'timeout';
  }

  // Server errors
  if (
    message.includes('server') ||
    message.includes('500') ||
    message.includes('internal')
  ) {
    return 'server';
  }

  return 'default';
}

/**
 * Sanitize error for logging (removes sensitive data)
 */
export function sanitizeError(error: unknown): Record<string, any> {
  if (!(error instanceof Error)) {
    return { error: String(error) };
  }

  const sanitized: Record<string, any> = {
    name: error.name,
    message: error.message,
  };

  // Only include stack in development
  if (isDevelopment && error.stack) {
    sanitized.stack = error.stack;
  }

  // Remove sensitive data from message
  sanitized.message = sanitized.message
    .replace(/password[=:]\s*['"]?[^'"]*['"]?/gi, "password='[REDACTED]'")
    .replace(/token[=:]\s*['"]?[^'"]*['"]?/gi, "token='[REDACTED]'")
    .replace(/secret[=:]\s*['"]?[^'"]*['"]?/gi, "secret='[REDACTED]'")
    .replace(/key[=:]\s*['"]?[^'"]*['"]?/gi, "key='[REDACTED]'")
    .replace(/api[_-]?key[=:]\s*['"]?[^'"]*['"]?/gi, "api_key='[REDACTED]'");

  return sanitized;
}

