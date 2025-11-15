/**
 * Error Handler Utility
 * Centralized error handling for authentication
 */

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public recoverable: boolean = false,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export interface ErrorContext {
  operation?: string;
  userId?: string;
  email?: string;
  [key: string]: any;
}

/**
 * Parse Supabase auth error and return user-friendly message
 */
export function parseAuthError(
  error: any,
  context: ErrorContext = {}
): AuthError {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.status || error?.code;
  const operation = context.operation || 'İşlem';

  // Email signups disabled
  if (
    errorMessage.includes('email signups are disabled') ||
    errorMessage.includes('signups are disabled') ||
    errorMessage.includes('signup is disabled') ||
    errorCode === 403
  ) {
    return new AuthError(
      'Email signups are disabled',
      'EMAIL_SIGNUPS_DISABLED',
      'E-posta ile kayıt şu anda devre dışı. Lütfen yönetici ile iletişime geçin.',
      false,
      403
    );
  }

  // User already registered
  if (
    errorMessage.includes('user already registered') ||
    errorMessage.includes('already registered') ||
    errorMessage.includes('email already exists') ||
    errorCode === 422
  ) {
    return new AuthError(
      'User already registered',
      'USER_EXISTS',
      'Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin veya şifrenizi sıfırlayın.',
      true,
      422
    );
  }

  // Invalid credentials
  if (
    errorCode === 400 ||
    errorMessage.includes('invalid login credentials') ||
    errorMessage.includes('invalid_credentials') ||
    errorMessage.includes('invalid email or password')
  ) {
    return new AuthError(
      'Invalid credentials',
      'INVALID_CREDENTIALS',
      'E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.',
      true,
      400
    );
  }

  // Email not confirmed
  if (
    errorMessage.includes('email not confirmed') ||
    errorMessage.includes('email_not_confirmed') ||
    errorMessage.includes('email address not confirmed')
  ) {
    return new AuthError(
      'Email not confirmed',
      'EMAIL_NOT_CONFIRMED',
      'E-posta adresiniz doğrulanmamış. Lütfen e-postanıza gönderilen doğrulama linkine tıklayın.',
      true,
      400
    );
  }

  // User not found
  if (
    errorMessage.includes('user not found') ||
    errorMessage.includes('user_not_found') ||
    errorMessage.includes('no user found')
  ) {
    return new AuthError(
      'User not found',
      'USER_NOT_FOUND',
      'Bu e-posta adresi ile kayıtlı bir hesap bulunamadı. Lütfen kayıt olun.',
      true,
      404
    );
  }

  // Rate limiting
  if (errorCode === 429 || errorMessage.includes('too many requests') || errorMessage.includes('rate limit')) {
    return new AuthError(
      'Rate limit exceeded',
      'RATE_LIMIT',
      'Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.',
      true,
      429
    );
  }

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('networkerror')
  ) {
    return new AuthError(
      'Network error',
      'NETWORK_ERROR',
      'Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.',
      true
    );
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return new AuthError(
      'Timeout error',
      'TIMEOUT',
      'Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.',
      true
    );
  }

  // Invalid email
  if (errorMessage.includes('invalid email') || errorMessage.includes('email format')) {
    return new AuthError(
      'Invalid email',
      'INVALID_EMAIL',
      'Geçerli bir e-posta adresi giriniz.',
      true,
      400
    );
  }

  // Weak password
  if (errorMessage.includes('password') && errorMessage.includes('weak')) {
    return new AuthError(
      'Weak password',
      'WEAK_PASSWORD',
      'Şifre çok zayıf. Daha güçlü bir şifre seçin.',
      true,
      400
    );
  }

  // Generic error
  return new AuthError(
    error?.message || 'Unknown error',
    'UNKNOWN_ERROR',
    `${operation} başarısız oldu. Lütfen tekrar deneyin.`,
    true,
    errorCode
  );
}

/**
 * Parse profile error and return user-friendly message
 */
export function parseProfileError(error: any, context: ErrorContext = {}): AuthError {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code;
  const status = (error as any)?.status;

  // RLS or 401 errors
  const isRLSOr401 =
    errorCode === 'PGRST301' ||
    errorCode === '42501' ||
    status === 401 ||
    errorMessage.includes('row-level security') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('401');

  if (isRLSOr401) {
    return new AuthError(
      'RLS or unauthorized',
      'RLS_ERROR',
      'Yetkilendirme hatası. Lütfen tekrar deneyin.',
      true,
      401
    );
  }

  // Username already exists
  if (
    errorCode === '23505' ||
    (errorMessage.includes('unique') && errorMessage.includes('username')) ||
    (errorMessage.includes('duplicate') && errorMessage.includes('username')) ||
    (errorMessage.includes('already exists') && errorMessage.includes('username'))
  ) {
    return new AuthError(
      'Username already exists',
      'USERNAME_EXISTS',
      'Bu kullanıcı adı zaten kullanılıyor. Lütfen farklı bir kullanıcı adı seçin.',
      true,
      409
    );
  }

  // Column doesn't exist
  if (errorCode === '42703' || errorMessage.includes('column') || errorMessage.includes('does not exist')) {
    return new AuthError(
      'Database error',
      'DB_ERROR',
      'Veritabanı hatası: Profil kolonu bulunamadı. Lütfen yöneticiye bildirin.',
      false,
      500
    );
  }

  // Generic profile error
  return new AuthError(
    error?.message || 'Profile error',
    'PROFILE_ERROR',
    'Profil oluşturulamadı. Lütfen tekrar deneyin.',
    true,
    status
  );
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelay: number = 500,
  maxDelay: number = 2000,
  backoffMultiplier: number = 2
): Promise<T> {
  let delay = initialDelay;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next attempt (exponential backoff)
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError || new Error('Retry failed');
}

