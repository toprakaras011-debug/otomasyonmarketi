import { supabase } from './supabase';
import { ADMIN_EMAILS, getEmailRedirectUrl } from './config';
import { VALIDATION, TIMEOUTS, RETRY_CONFIG } from './constants';
import { parseAuthError, parseProfileError, retryWithBackoff, AuthError } from './utils/error-handler';
// logger import removed - no logging to avoid blocking route

export const signUp = async (
  email: string,
  password: string,
  username: string,
  fullName?: string,
  phone?: string,
  role?: 'user' | 'developer'
) => {
  try {
    // Validate inputs
    if (!email || typeof email !== 'string') {
      throw new Error('E-posta adresi gereklidir.');
    }
    if (!password || typeof password !== 'string') {
      throw new Error('Şifre gereklidir.');
    }
    if (!username || typeof username !== 'string') {
      throw new Error('Kullanıcı adı gereklidir.');
    }

    // Trim and normalize email
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      throw new Error('E-posta adresi boş olamaz.');
    }

    const normalizedEmail = trimmedEmail.toLowerCase();

    // Email validation
    if (!VALIDATION.EMAIL.REGEX.test(normalizedEmail)) {
      throw new Error('Geçerli bir e-posta adresi giriniz.');
    }

    // Password validation
    if (password.length < VALIDATION.PASSWORD.MIN_LENGTH) {
      throw new Error(`Şifre en az ${VALIDATION.PASSWORD.MIN_LENGTH} karakter olmalıdır.`);
    }

    // Username validation
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      throw new Error('Kullanıcı adı boş olamaz.');
    }
    if (trimmedUsername.length < VALIDATION.USERNAME.MIN_LENGTH) {
      throw new Error(`Kullanıcı adı en az ${VALIDATION.USERNAME.MIN_LENGTH} karakter olmalıdır.`);
    }
    if (trimmedUsername.length > VALIDATION.USERNAME.MAX_LENGTH) {
      throw new Error(`Kullanıcı adı en fazla ${VALIDATION.USERNAME.MAX_LENGTH} karakter olabilir.`);
    }
    if (!VALIDATION.USERNAME.REGEX.test(trimmedUsername)) {
      throw new Error('Kullanıcı adı sadece harf, rakam, alt çizgi ve tire içerebilir.');
    }

    // Phone validation (if provided)
    let normalizedPhone = phone?.trim() || null;
    if (normalizedPhone) {
      // Remove all non-digit characters except +
      normalizedPhone = normalizedPhone.replace(/[^\d+]/g, '');
      
      // Check if phone includes country code (starts with +)
      if (normalizedPhone.startsWith('+')) {
        // International format: validate length
        const digitsOnly = normalizedPhone.substring(1);
        if (digitsOnly.length < VALIDATION.PHONE.INTERNATIONAL_MIN || digitsOnly.length > VALIDATION.PHONE.INTERNATIONAL_MAX) {
          throw new Error(`Geçerli bir telefon numarası giriniz (${VALIDATION.PHONE.INTERNATIONAL_MIN}-${VALIDATION.PHONE.INTERNATIONAL_MAX} haneli).`);
        }
      } else {
        // Turkish phone numbers should be 10 digits (without country code) or 11 digits (with leading 0)
        if (normalizedPhone.length !== VALIDATION.PHONE.TURKEY_LENGTH && normalizedPhone.length !== VALIDATION.PHONE.TURKEY_LENGTH + 1) {
          throw new Error(`Geçerli bir telefon numarası giriniz (${VALIDATION.PHONE.TURKEY_LENGTH} veya ${VALIDATION.PHONE.TURKEY_LENGTH + 1} haneli).`);
        }
        // If 11 digits and starts with 0, remove the leading 0
        if (normalizedPhone.length === VALIDATION.PHONE.TURKEY_LENGTH + 1 && normalizedPhone.startsWith('0')) {
          normalizedPhone = normalizedPhone.substring(1);
        }
      }
    }

    const metadata: Record<string, any> = {
      username: trimmedUsername,
    };

    if (fullName?.trim()) {
      metadata.full_name = fullName.trim();
    }

    if (normalizedPhone) {
      metadata.phone = normalizedPhone;
    }

    // Email verification is ENABLED via Supabase Dashboard
    // Users must verify their email before they can login
    // To enable: Supabase Dashboard > Authentication > Settings > Email Auth > Enable "Enable email confirmations"
    const emailRedirectTo = getEmailRedirectUrl('signup');

    // Attempt sign up - email verification is ENABLED
    // Users will receive an email with a verification link
    // After clicking the link, they will be redirected to /auth/callback which will complete the signup
    // Note: Supabase Dashboard must have "Enable email confirmations" ENABLED
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: password, // Don't trim password
      options: {
        emailRedirectTo, // Redirect URL after email verification
        data: metadata,
      },
    });

    if (authError) {
      // No logging to avoid blocking route in client components
      
      // Use error handler utility
      const parsedError = parseAuthError(authError, { operation: 'Kayıt', email: normalizedEmail, username: trimmedUsername });
      
      // Special handling for email already exists - check if profile exists
      if (parsedError.code === 'USER_EXISTS') {
        try {
          // Check if username is already taken
          const { data: profileByUsername } = await supabase
            .from('user_profiles')
            .select('id, username')
            .eq('username', trimmedUsername)
            .maybeSingle();

          // Profile exists - username conflict
          type ProfileData = { id: string; username: string } | null;
          const profile = profileByUsername as ProfileData;
          if (profile && profile.username === trimmedUsername) {
            throw new AuthError(
              'Username already exists',
              'USERNAME_EXISTS',
              'Bu kullanıcı adı zaten kullanılıyor. Lütfen farklı bir kullanıcı adı seçin.',
              true,
              409
            );
          }

          // If username is available but email is registered, it's likely an orphaned account
          throw new AuthError(
            'Email registered but profile missing',
            'ORPHANED_ACCOUNT',
            'Bu e-posta adresi kayıtlı görünüyor ancak profil bulunamadı. Bu durum genellikle hesap silme işleminden sonra oluşur. Lütfen giriş yapın veya şifre sıfırlama sayfasını kullanın. Eğer sorun devam ederse destek ekibiyle iletişime geçin.',
            true,
            422
          );
        } catch (profileError: any) {
          // If it's our custom AuthError, throw it
          if (profileError instanceof AuthError) {
            throw profileError;
          }
          // Otherwise, continue with default error
        }
      }
      
      throw parsedError;
    }

    if (!authData.user) {
      throw new Error('Kullanıcı oluşturulamadı. Lütfen tekrar deneyin.');
    }

    // Wait a moment to ensure session is fully established
    // This is important for RLS policies to work correctly
    await new Promise(resolve => setTimeout(resolve, TIMEOUTS.SESSION_CHECK));

    // Verify session is established before creating profile
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession) {
      // No logging to avoid blocking route
      // Session not established yet - trigger will create profile
      // Return success, profile will be created by trigger
      return {
        user: authData.user,
        session: null,
      };
    }

    // Create user profile
    const profileData: any = {
      id: authData.user.id,
      username: trimmedUsername,
      full_name: fullName?.trim() || null,
      phone: normalizedPhone || null,
    };

    // Check if user email is in admin list
    const userEmail = normalizedEmail.toLowerCase();
    const isAdminEmail = ADMIN_EMAILS.includes(userEmail);
    
    if (isAdminEmail) {
      // No logging to avoid blocking route
      profileData.role = 'admin';
      profileData.is_admin = true;
    }

    // Add role if provided (default is 'user')
    if (role) {
      // If developer, set developer flags
      if (role === 'developer') {
        profileData.is_developer = true;
      }
    }

    // Check if username already exists before creating profile
    // This prevents duplicate username errors
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id, username')
      .ilike('username', trimmedUsername)
      .maybeSingle();

    if (existingProfile && existingProfile.username.toLowerCase() === trimmedUsername.toLowerCase()) {
      throw new AuthError(
        'Username already exists',
        'USERNAME_EXISTS',
        'Bu kullanıcı adı zaten kullanılıyor. Lütfen farklı bir kullanıcı adı seçin.',
        true,
        409
      );
    }

    // Use upsert instead of insert to handle potential race conditions
    // This prevents errors if profile already exists
    // Note: RLS policy requires auth.uid() = id, so session must be established
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'id',
      });

    if (profileError) {
      // No logging to avoid blocking route
      
      // Use error handler utility
      const parsedError = parseProfileError(profileError, { operation: 'Profil oluşturma', userId: authData.user.id });
      
      // Handle RLS/401 errors with retry
      if (parsedError.code === 'RLS_ERROR') {
        // Check if session exists
        const { data: { session: checkSession } } = await supabase.auth.getSession();
        
        if (!checkSession) {
          // No session - trigger will create profile
          return {
            user: authData.user,
            session: null,
          };
        }
        
        // Session exists, retry with exponential backoff
        try {
          await retryWithBackoff(
            async () => {
              const { error: retryError } = await supabase
                .from('user_profiles')
                .upsert(profileData, {
                  onConflict: 'id',
                });
              
              if (retryError) {
                throw retryError;
              }
            },
            RETRY_CONFIG.MAX_ATTEMPTS,
            RETRY_CONFIG.INITIAL_DELAY,
            RETRY_CONFIG.MAX_DELAY,
            RETRY_CONFIG.BACKOFF_MULTIPLIER
          );
          
          // Retry succeeded
          return {
            user: authData.user,
            session: checkSession,
          };
        } catch (retryError) {
          // Retry failed - trigger will create profile
          return {
            user: authData.user,
            session: checkSession,
          };
        }
      }
      
      // Throw other errors
      throw parsedError;
    }

    return authData;
  } catch (error: any) {
    // No logging to avoid blocking route

    // If it's already a user-friendly error message, re-throw it
    if (error?.message && typeof error.message === 'string') {
      const technicalTerms = ['AuthApiError', 'Supabase', 'API', 'JWT', 'token', 'PostgresError'];
      const isTechnicalError = technicalTerms.some(term => 
        error.message.includes(term)
      );

      if (!isTechnicalError) {
        throw error; // Re-throw user-friendly errors as-is
      }
    }

    // Otherwise, provide a generic error
    throw new Error(error?.message || 'Kayıt oluşturulamadı. Lütfen tekrar deneyin.');
  }
};

export const signIn = async (email: string, password: string) => {
  // No logging to avoid blocking route
  
  try {
    // Basic validation
    if (!email || !password) {
      throw new Error('E-posta ve şifre gereklidir.');
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Attempt sign in - let Supabase handle validation
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password,
    });

    // No logging to avoid blocking route

    if (error) {
      const errorDetails = error as any;
      // No logging to avoid blocking route
      
      // Check for specific error codes and messages
      const errorMessage = error.message?.toLowerCase() || '';
      const errorCode = error.status;

      // 400 Bad Request - usually invalid credentials or user doesn't exist in auth.users
      if (errorCode === 400) {
        // Check if it's specifically invalid credentials
        if (
          errorMessage.includes('invalid login credentials') ||
          errorMessage.includes('invalid_credentials') ||
          errorMessage.includes('invalid email or password') ||
          errorMessage.includes('email not confirmed') ||
          errorMessage.includes('email_not_confirmed') ||
          errorMessage.includes('email address not confirmed') ||
          errorMessage.includes('credentials')
        ) {
          throw new Error('E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.');
        }
        
        // Generic 400 error - could be orphaned profile (user_profiles exists but auth.users doesn't)
        // Or could be other validation errors
        // No logging to avoid blocking route
        throw new Error('Giriş yapılamadı. Bu e-posta adresi ile kayıtlı bir hesap bulunamadı veya hesap geçersiz. Lütfen kayıt olun veya şifrenizi sıfırlayın.');
      }

      // Invalid credentials (non-400 errors)
      if (
        errorMessage.includes('invalid login credentials') ||
        errorMessage.includes('invalid_credentials') ||
        errorMessage.includes('invalid email or password') ||
        errorMessage.includes('email not confirmed') ||
        errorMessage.includes('email_not_confirmed') ||
        errorMessage.includes('email address not confirmed')
      ) {
        throw new Error('E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.');
      }

      // User not found
      if (
        errorMessage.includes('user not found') ||
        errorMessage.includes('user_not_found') ||
        errorMessage.includes('no user found')
      ) {
        throw new Error('Bu e-posta adresi ile kayıtlı bir hesap bulunamadı. Lütfen kayıt olun.');
      }

      // Too many requests (rate limiting)
      if (errorCode === 429 || errorMessage.includes('too many requests') || errorMessage.includes('rate limit')) {
        throw new Error('Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.');
      }

      // Forbidden
      if (errorCode === 403 || errorMessage.includes('forbidden')) {
        throw new Error('Giriş yapma izniniz yok. Lütfen destek ekibiyle iletişime geçin.');
      }

      // Network errors
      if (
        errorMessage.includes('network') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('networkerror')
      ) {
        throw new Error('Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.');
      }

      // Timeout errors
      if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        throw new Error('Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.');
      }

      // Generic error - use original message if available, otherwise provide fallback
      const userFriendlyMessage = error.message || 'Giriş yapılamadı. Lütfen tekrar deneyin.';
      throw new Error(userFriendlyMessage);
    }

    // Verify we got user data
    if (!data || !data.user) {
      // No logging to avoid blocking route
      throw new Error('Giriş başarısız. Kullanıcı bilgisi alınamadı. Lütfen tekrar deneyin.');
    }

    // Verify user email matches (case-insensitive)
    if (data.user.email?.toLowerCase() !== normalizedEmail) {
      // No logging to avoid blocking route
    }

    // EMAIL VERIFICATION CHECK - REQUIRED
    // Users must verify their email before they can login
    // This prevents unauthorized access and ensures email addresses are valid
    const isOAuthUser = data.user.app_metadata?.provider && data.user.app_metadata.provider !== 'email';
    
    // No logging to avoid blocking route
    
    // Email verification is REQUIRED - users cannot login without verifying email
    // OAuth users are exempt as their email is already verified by the provider
    if (!isOAuthUser && !data.user.email_confirmed_at) {
      // No logging to avoid blocking route
      
      // Sign out the user immediately if they somehow got a session
      await supabase.auth.signOut();
      
      throw new Error('E-posta adresiniz doğrulanmamış. Lütfen e-postanıza gönderilen doğrulama linkine tıklayın. E-posta gelmediyse "/auth/verify-email" sayfasından tekrar gönderebilirsiniz.');
    }

    // No logging to avoid blocking route
    // Wait a moment to ensure session is fully established
    // This is especially important for admin accounts
    await new Promise(resolve => setTimeout(resolve, TIMEOUTS.SESSION_CHECK));

    // No logging to avoid blocking route

    return data;
  } catch (error: any) {
    // No logging to avoid blocking route
    
    // If it's already an AuthError, re-throw it
    if (error instanceof AuthError) {
      throw error;
    }
    
    // Use error handler utility
    const parsedError = parseAuthError(error, { operation: 'Giriş', email });
    throw parsedError;
  }
};

/**
 * Sign out the current user
 * Clears session, cookies, and local storage
 * @returns Promise with error if any
 */
export const signOut = async () => {
  try {
    // No logging to avoid blocking route
    
    // First, clear Supabase session storage keys explicitly
    if (typeof window !== 'undefined') {
      // Clear Supabase auth tokens from localStorage
      const supabaseStorageKey = 'supabase.auth.token';
      localStorage.removeItem(supabaseStorageKey);
      
      // Also clear any other Supabase-related keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.') || key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear sessionStorage as well
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('supabase.') || key.startsWith('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    // Sign out from Supabase - this should trigger SIGNED_OUT event
    const { error } = await supabase.auth.signOut({
      scope: 'global' // Sign out from all sessions
    });
    
    if (error) {
      // No logging to avoid blocking route
      // Even if there's an error, try to clear local state
      if (typeof window !== 'undefined') {
        // Clear any cached data
        localStorage.clear();
        sessionStorage.clear();
      }
      return { error };
    }
    
    // No logging to avoid blocking route
    
    // Double-check: Clear any remaining cached data
    if (typeof window !== 'undefined') {
      // Wait a bit for auth state change to propagate
      await new Promise(resolve => setTimeout(resolve, TIMEOUTS.SESSION_CHECK));
      
      // Final cleanup
      localStorage.clear();
      sessionStorage.clear();
    }
    
    return { error: null };
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    // No logging to avoid blocking route
    
    // Clear local state even on exception
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    
    return { error: errorObj };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      // 403 errors are common when user is not authenticated - don't throw, just return null
      if (error.status === 403 || error.message.includes('JWT')) {
        return null;
      }
      // No logging to avoid blocking route
      throw error;
    }
    return user;
  } catch (error: any) {
    // Silently fail for auth errors - user might not be logged in
    if (error?.status === 403 || error?.message?.includes('JWT')) {
      return null;
    }
    // No logging to avoid blocking route
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const resetPassword = async (email: string) => {
  try {
    // Validate email
    if (!email || typeof email !== 'string') {
      throw new Error('E-posta adresi gereklidir.');
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      throw new Error('E-posta adresi boş olamaz.');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new Error('Geçerli bir e-posta adresi giriniz.');
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
      (typeof window !== 'undefined' ? window.location.origin : '');

    const redirectTo = `${siteUrl || window.location.origin}/auth/reset-password`;

    // No logging to avoid blocking route

    const { data, error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo,
      // Add captcha token if available (for production)
    });

    if (error) {
      // No logging to avoid blocking route

      // Provide user-friendly error messages
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes('user not found') || errorMessage.includes('email not found')) {
        throw new Error('Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.');
      } else if (errorMessage.includes('rate limit') || error.status === 429) {
        throw new Error('Çok fazla istek yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.');
      } else if (errorMessage.includes('email') && errorMessage.includes('invalid')) {
        throw new Error('Geçerli bir e-posta adresi giriniz.');
      } else if (errorMessage.includes('email not confirmed')) {
        throw new Error('E-posta adresiniz henüz doğrulanmamış. Lütfen önce e-posta doğrulama linkine tıklayın.');
      }

      throw new Error(error.message || 'Şifre sıfırlama e-postası gönderilemedi. Lütfen tekrar deneyin.');
    }

    // No logging to avoid blocking route

    return data;
  } catch (error: any) {
    // Log in all environments for debugging
    // No logging to avoid blocking route

    // Re-throw user-friendly errors
    if (error?.message && typeof error.message === 'string') {
      const technicalTerms = ['AuthApiError', 'Supabase', 'API', 'JWT', 'token', 'PostgresError'];
      const isTechnicalError = technicalTerms.some(term => 
        error.message.includes(term)
      );

      if (!isTechnicalError) {
        throw error; // Re-throw user-friendly errors as-is
      }
    }

    throw new Error(error?.message || 'Şifre sıfırlama e-postası gönderilemedi. Lütfen tekrar deneyin.');
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    // Validate password
    if (!newPassword || typeof newPassword !== 'string') {
      throw new Error('Şifre gereklidir.');
    }

    if (newPassword.length < 8) {
      throw new Error('Şifre en az 8 karakter olmalıdır.');
    }

    // Strong password validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      throw new Error('Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.');
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      // No logging to avoid blocking route

      // Provide user-friendly error messages
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes('session') || errorMessage.includes('token') || errorMessage.includes('expired')) {
        throw new Error('Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir şifre sıfırlama isteği gönderin.');
      } else if (errorMessage.includes('weak') || errorMessage.includes('password')) {
        throw new Error('Şifre çok zayıf. Daha güçlü bir şifre seçin.');
      } else if (errorMessage.includes('rate limit') || error.status === 429) {
        throw new Error('Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.');
      }

      throw new Error(error.message || 'Şifre güncellenemedi. Lütfen tekrar deneyin.');
    }

    return data;
  } catch (error: any) {
    // Re-throw user-friendly errors
    if (error?.message && typeof error.message === 'string') {
      const technicalTerms = ['AuthApiError', 'Supabase', 'API', 'JWT', 'token', 'PostgresError'];
      const isTechnicalError = technicalTerms.some(term => 
        error.message.includes(term)
      );

      if (!isTechnicalError) {
        throw error; // Re-throw user-friendly errors as-is
      }
    }

    throw new Error(error?.message || 'Şifre güncellenemedi. Lütfen tekrar deneyin.');
  }
};

/**
 * Sign in with OAuth provider (Google, GitHub, etc.)
 * 
 * @param provider - OAuth provider name ('google' | 'github')
 * @param redirectTo - URL to redirect after successful authentication
 * @returns Promise that resolves when OAuth flow is initiated
 * 
 * @example
 * ```ts
 * await signInWithOAuth('google', '/dashboard');
 * ```
 */
export const signInWithOAuth = async (
  provider: 'google' | 'github',
  redirectTo: string = '/dashboard'
) => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('OAuth sadece tarayıcıda çalışır.');
    }

    const origin = window.location.origin;
    // Use server-side route handler for secure cookie-based session management
    const callbackUrl = `${origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;
    
    // No logging to avoid blocking route

    // Verify localStorage is available
    try {
      const testKey = 'supabase.oauth.test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      // No logging to avoid blocking route
    } catch (storageError) {
      const errorObj = storageError instanceof Error ? storageError : new Error(String(storageError));
      // No logging to avoid blocking route
      throw new Error('Tarayıcı depolama erişimi engellenmiş. Lütfen tarayıcı ayarlarınızı kontrol edin.');
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      // No logging to avoid blocking route
      // Daha açıklayıcı hata mesajları
      if (error.message?.includes('configuration') || error.message?.includes('provider')) {
        throw new Error(`${provider} OAuth yapılandırılmamış. Lütfen yöneticiye bildirin.`);
      }
      throw new Error(error.message || `${provider} ile giriş yapılamadı. Lütfen tekrar deneyin.`);
    }

    if (!data || !data.url) {
      // No logging to avoid blocking route
      throw new Error(`${provider} OAuth yapılandırması eksik. Lütfen yöneticiye bildirin.`);
    }

    // No logging to avoid blocking route
    return data;
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    // No logging to avoid blocking route
    throw errorObj;
  }
};

/**
 * Sign up with OAuth provider (Google, GitHub, etc.)
 * This is essentially the same as signInWithOAuth since OAuth providers
 * handle both sign-in and sign-up automatically.
 * 
 * @param provider - OAuth provider name ('google' | 'github')
 * @param redirectTo - URL to redirect after successful authentication
 * @returns Promise that resolves when OAuth flow is initiated
 * 
 * @example
 * ```ts
 * await signUpWithOAuth('google', '/dashboard');
 * ```
 */
export const signUpWithOAuth = async (
  provider: 'google' | 'github',
  redirectTo: string = '/dashboard'
) => {
  // OAuth providers handle both sign-in and sign-up automatically
  // So we can use the same function
  return signInWithOAuth(provider, redirectTo);
};
