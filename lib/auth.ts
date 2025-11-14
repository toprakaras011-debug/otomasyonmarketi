import { supabase } from './supabase';
import { logger } from './logger';

// Admin email list - matches callback route
const ADMIN_EMAILS = [
  'ftnakras01@gmail.com',
].map(email => email.toLowerCase());

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new Error('Geçerli bir e-posta adresi giriniz.');
    }

    // Password validation
    if (password.length < 6) {
      throw new Error('Şifre en az 6 karakter olmalıdır.');
    }

    // Username validation
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      throw new Error('Kullanıcı adı boş olamaz.');
    }
    if (trimmedUsername.length < 3) {
      throw new Error('Kullanıcı adı en az 3 karakter olmalıdır.');
    }
    if (trimmedUsername.length > 30) {
      throw new Error('Kullanıcı adı en fazla 30 karakter olabilir.');
    }
    // Username should only contain alphanumeric characters, underscores, and hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      throw new Error('Kullanıcı adı sadece harf, rakam, alt çizgi ve tire içerebilir.');
    }

    // Phone validation (if provided)
    let normalizedPhone = phone?.trim() || null;
    if (normalizedPhone) {
      // Remove all non-digit characters
      normalizedPhone = normalizedPhone.replace(/\D/g, '');
      // Turkish phone numbers should be 10 digits (without country code) or 11 digits (with leading 0)
      if (normalizedPhone.length !== 10 && normalizedPhone.length !== 11) {
        throw new Error('Geçerli bir telefon numarası giriniz (10 veya 11 haneli).');
      }
      // If 11 digits and starts with 0, remove the leading 0
      if (normalizedPhone.length === 11 && normalizedPhone.startsWith('0')) {
        normalizedPhone = normalizedPhone.substring(1);
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

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
      (typeof window !== 'undefined' ? window.location.origin : '');

    // Note: Email verification is disabled in code, but Supabase may still send emails
    // To completely disable email verification emails, go to Supabase Dashboard:
    // Authentication > Settings > Email Auth > Disable "Enable email confirmations"
    const emailRedirectTo = `${(siteUrl || 'http://localhost:3000')}/auth/callback`;

    // Attempt sign up - email verification is disabled
    // Users can login immediately without email verification
    // Note: Supabase Dashboard must have "Enable email confirmations" disabled to stop emails
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: password, // Don't trim password
      options: {
        // emailRedirectTo is kept for backwards compatibility but emails should be disabled in Supabase Dashboard
        emailRedirectTo,
        data: metadata,
        // Note: There's no way to disable email sending from code - must be done in Supabase Dashboard
      },
    });

    if (authError) {
      // Log error in all environments for debugging
      console.error('Sign up error:', {
        message: authError.message,
        status: authError.status,
        name: authError.name,
        code: authError.code,
      });

      // Check for specific error codes and messages
      const errorMessage = authError.message?.toLowerCase() || '';
      const errorCode = authError.status;

      // Email already exists - but check if profile exists
      if (
        errorMessage.includes('user already registered') ||
        errorMessage.includes('already registered') ||
        errorMessage.includes('email already exists') ||
        errorCode === 422
      ) {
        // Check if profile exists - if not, this might be an orphaned account
        try {
          // Try to get profile by username
          const { data: profileByUsername } = await supabase
            .from('user_profiles')
            .select('id, username')
            .eq('username', trimmedUsername)
            .maybeSingle();

          // Profile exists - username conflict
          if (profileByUsername && profileByUsername.username === trimmedUsername) {
            throw new Error('Bu kullanıcı adı zaten kullanılıyor. Lütfen farklı bir kullanıcı adı seçin.');
          }

          // If username is available but email is registered, it's likely an orphaned account
          // (user exists in auth.users but not in user_profiles)
          // This happens when account is deleted but auth record remains
          // We can't create profile here because we don't have the user's auth token
          // Provide helpful message
          throw new Error('Bu e-posta adresi kayıtlı görünüyor ancak profil bulunamadı. Bu durum genellikle hesap silme işleminden sonra oluşur. Lütfen giriş yapın veya şifre sıfırlama sayfasını kullanın. Eğer sorun devam ederse destek ekibiyle iletişime geçin.');
        } catch (profileError: any) {
          // If profile check fails, check if it's our custom error
          if (profileError.message && (profileError.message.includes('Bu e-posta') || profileError.message.includes('Bu kullanıcı'))) {
            throw profileError;
          }
          // Otherwise, continue with default error
        }

        throw new Error('Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin veya şifrenizi sıfırlayın.');
      }

      // Invalid email
      if (errorMessage.includes('invalid email') || errorMessage.includes('email format')) {
        throw new Error('Geçerli bir e-posta adresi giriniz.');
      }

      // Weak password
      if (errorMessage.includes('password') && errorMessage.includes('weak')) {
        throw new Error('Şifre çok zayıf. Daha güçlü bir şifre seçin.');
      }

      // Too many requests
      if (errorCode === 429 || errorMessage.includes('too many requests') || errorMessage.includes('rate limit')) {
        throw new Error('Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.');
      }

      // Network errors
      if (
        errorMessage.includes('network') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('failed to fetch')
      ) {
        throw new Error('Bağlantı hatası. İnternet bağlantınızı kontrol edip tekrar deneyin.');
      }

      // Generic error
      throw new Error(authError.message || 'Kayıt oluşturulamadı. Lütfen tekrar deneyin.');
    }

    if (!authData.user) {
      throw new Error('Kullanıcı oluşturulamadı. Lütfen tekrar deneyin.');
    }

    // Wait a moment to ensure session is fully established
    // This is important for RLS policies to work correctly
    await new Promise(resolve => setTimeout(resolve, 300));

    // Verify session is established before creating profile
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession) {
      console.warn('[DEBUG] signUp - No session after signup, waiting for trigger to create profile');
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
      console.log('[DEBUG] signUp - Admin email detected, setting admin role', {
        email: userEmail,
        userId: authData.user.id,
      });
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

    // Use upsert instead of insert to handle potential race conditions
    // This prevents errors if profile already exists
    // Note: RLS policy requires auth.uid() = id, so session must be established
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'id',
      });

    if (profileError) {
      // Type assertion for TypeScript
      const error = profileError as { message?: string; code?: string; details?: string; hint?: string; status?: number };
      
      // Log error in all environments for debugging
      console.error('Profile creation error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId: authData.user.id,
        hasSession: !!authData.session,
      });

      // Check for specific errors
      const errorMessage = error.message?.toLowerCase() || '';
      const errorCode = error.code;

      // RLS policy violation or 401 Unauthorized
      // Check error code, message, or hint for 401/RLS indicators
      const is401Error = 
        errorCode === 'PGRST301' ||
        errorMessage.includes('401') ||
        errorMessage.includes('unauthorized') ||
        error.status === 401 ||
        error.code === '401';
      
      const isRLSError =
        errorMessage.includes('row-level security') ||
        errorMessage.includes('violates row-level security') ||
        errorCode === '42501';
      
      const is401OrRLSError = isRLSError || is401Error;
      
      if (is401OrRLSError) {
        // This might happen if session is not fully established
        // Check if session exists
        const { data: { session: checkSession } } = await supabase.auth.getSession();
        
        if (!checkSession) {
          console.warn('[DEBUG] signUp - No session, trigger will create profile automatically');
          // No session - trigger will create profile
          // Continue without throwing error - trigger will handle it
          return {
            user: authData.user,
            session: null,
          };
        }
        
        // Session exists, try again after a short delay
        console.warn('[DEBUG] signUp - Profile creation RLS/401 error, retrying after delay...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { error: retryError } = await supabase
          .from('user_profiles')
          .upsert(profileData, {
            onConflict: 'id',
          });
        
        if (retryError) {
          console.error('[DEBUG] signUp - Profile creation retry failed:', retryError);
          // If retry also fails, the trigger should create the profile
          // Continue without throwing error - trigger will handle it
          console.warn('[DEBUG] signUp - Profile creation failed, but trigger should create it automatically');
          // Don't throw error - trigger will create profile
          return {
            user: authData.user,
            session: checkSession,
          };
        } else {
          console.log('[DEBUG] signUp - Profile creation succeeded on retry');
        }
      }

      // Username already exists - but only throw if it's not a 401/RLS error
      const is401OrRLS = 
        errorMessage.includes('row-level security') ||
        errorMessage.includes('401') ||
        errorMessage.includes('unauthorized') ||
        errorCode === '42501' ||
        errorCode === 'PGRST301' ||
        (profileError as any)?.status === 401;
      
      if (
        (errorCode === '23505' ||
        errorMessage.includes('unique') ||
        errorMessage.includes('duplicate') ||
        errorMessage.includes('already exists')) &&
        !is401OrRLS
      ) {
        throw new Error('Bu kullanıcı adı zaten kullanılıyor. Lütfen farklı bir kullanıcı adı seçin.');
      }
      
      // If we get here and it's not a 401/RLS error, it's a different error
      // But if it's 401/RLS, we already handled it above and returned
      // So only throw if it's a different error
      const isStill401OrRLS = 
        errorMessage.includes('row-level security') ||
        errorMessage.includes('violates row-level security') ||
        errorCode === '42501' ||
        errorCode === 'PGRST301' ||
        (profileError as any)?.status === 401 ||
        errorMessage.includes('401') ||
        errorMessage.includes('unauthorized');
      
      if (!isStill401OrRLS) {
        // This is a different error, throw it
        throw new Error(profileError.message || 'Profil oluşturulamadı. Lütfen tekrar deneyin.');
      }
      
      // If we get here, it was a 401/RLS error that we handled
      // Return success - trigger will create profile
      return {
        user: authData.user,
        session: authData.session,
      };
    }
    
    // If profileError exists but wasn't a 401/RLS error, handle other errors
    // (This code should not be reached if 401/RLS was handled above)
    // But TypeScript needs this check
    if (profileError) {
      const error = profileError as { message?: string; code?: string; status?: number };
      const errorMessage = error.message?.toLowerCase() || '';
      const errorCode = error.code;
      
      // Check if this is a 401/RLS error that we already handled
      const is401OrRLS = 
        errorMessage.includes('row-level security') ||
        errorMessage.includes('violates row-level security') ||
        errorCode === '42501' ||
        errorCode === 'PGRST301' ||
        error.status === 401 ||
        errorMessage.includes('401') ||
        errorMessage.includes('unauthorized');
      
      // Skip if already handled
      if (is401OrRLS) {
        // Already handled above, return success
        return {
          user: authData.user,
          session: authData.session,
        };
      }
      
      // Column doesn't exist error
      if (
        errorCode === '42703' ||
        errorMessage.includes('column') ||
        errorMessage.includes('does not exist')
      ) {
        throw new Error('Veritabanı hatası: Profil kolonu bulunamadı. Lütfen yöneticiye bildirin.');
      }

      // Generic profile error with more details
      throw new Error(
        error.message || 'Profil oluşturulamadı. Lütfen tekrar deneyin.'
      );
    }

    return authData;
  } catch (error: any) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sign up exception:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      });
    }

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
  console.log('[DEBUG] lib/auth.ts - signIn START', {
    emailLength: email?.length || 0,
    passwordLength: password?.length || 0,
    hasEmail: !!email,
    hasPassword: !!password,
  });
  
  try {
    // Basic validation
    if (!email || !password) {
      console.warn('[DEBUG] lib/auth.ts - signIn validation failed: missing email or password', {
        hasEmail: !!email,
        hasPassword: !!password,
      });
      throw new Error('E-posta ve şifre gereklidir.');
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();
    console.log('[DEBUG] lib/auth.ts - signIn normalized email', {
      originalEmail: email,
      normalizedEmail,
    });

    console.log('[DEBUG] lib/auth.ts - signIn calling supabase.auth.signInWithPassword', {
      normalizedEmail,
      passwordLength: password.length,
    });

    // Attempt sign in - let Supabase handle validation
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password,
    });

    console.log('[DEBUG] lib/auth.ts - signIn supabase response', {
      hasData: !!data,
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      hasError: !!error,
      errorMessage: error?.message,
      errorStatus: error?.status,
      userId: data?.user?.id,
      userEmail: data?.user?.email,
      emailConfirmed: data?.user?.email_confirmed_at,
      provider: data?.user?.app_metadata?.provider,
    });

    if (error) {
      const errorDetails = error as any;
      console.error('[DEBUG] lib/auth.ts - signIn error received', {
        message: error.message,
        status: error.status,
        name: error.name,
        code: errorDetails.code,
        details: errorDetails.details,
        hint: errorDetails.hint,
        fullError: error, // Log full error for debugging
      });
      
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
        console.error('[DEBUG] lib/auth.ts - 400 error - possible orphaned profile or invalid request', {
          errorMessage,
          hint: 'User might exist in user_profiles but not in auth.users. Check Supabase dashboard.',
        });
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
      console.error('[DEBUG] lib/auth.ts - signIn failed: no user data', {
        hasData: !!data,
        hasUser: !!data?.user,
      });
      throw new Error('Giriş başarısız. Kullanıcı bilgisi alınamadı. Lütfen tekrar deneyin.');
    }

    // Verify user email matches (case-insensitive)
    if (data.user.email?.toLowerCase() !== normalizedEmail) {
      console.warn('[DEBUG] lib/auth.ts - signIn email mismatch', {
        expected: normalizedEmail,
        got: data.user.email,
        normalizedGot: data.user.email?.toLowerCase(),
      });
    }

    // Email verification check - removed to allow login without email verification
    // Users can login immediately after signup, email verification is optional
    const isOAuthUser = data.user.app_metadata?.provider && data.user.app_metadata.provider !== 'email';
    
    console.log('[DEBUG] lib/auth.ts - signIn email verification check (optional)', {
      isOAuthUser,
      provider: data.user.app_metadata?.provider,
      emailConfirmed: !!data.user.email_confirmed_at,
      emailConfirmedAt: data.user.email_confirmed_at,
    });
    
    // Email verification is now optional - users can login without verifying email
    // This allows immediate access after signup

    console.log('[DEBUG] lib/auth.ts - signIn waiting for session to be established (100ms)');
    // Wait a moment to ensure session is fully established
    // This is especially important for admin accounts
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('[DEBUG] lib/auth.ts - signIn SUCCESS', {
      userId: data.user.id,
      userEmail: data.user.email,
      hasSession: !!data.session,
      isOAuthUser,
      emailConfirmed: !!data.user.email_confirmed_at,
    });

    return data;
  } catch (error: any) {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sign in exception:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      });
    }

    // If it's already a user-friendly error message, re-throw it
    if (error?.message && typeof error.message === 'string') {
      // Check if it's a user-friendly message (doesn't contain technical terms)
      const technicalTerms = ['AuthApiError', 'Supabase', 'API', 'JWT', 'token'];
      const isTechnicalError = technicalTerms.some(term => 
        error.message.includes(term)
      );

      if (!isTechnicalError) {
        throw error; // Re-throw user-friendly errors as-is
      }
    }

    // Otherwise, provide a generic error
    throw new Error(error?.message || 'Giriş yapılamadı. Lütfen tekrar deneyin.');
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      // 403 errors are common when user is not authenticated - don't throw, just return null
      if (error.status === 403 || error.message.includes('JWT')) {
        return null;
      }
      console.error('Get current user error:', error);
      throw error;
    }
    return user;
  } catch (error: any) {
    // Silently fail for auth errors - user might not be logged in
    if (error?.status === 403 || error?.message?.includes('JWT')) {
      return null;
    }
    console.error('Get current user exception:', error);
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

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Password reset request:', {
        email: trimmedEmail,
        redirectTo,
      });
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo,
      // Add captcha token if available (for production)
    });

    if (error) {
      console.error('Password reset error:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });

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

    // Log success in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Password reset email sent successfully');
    }

    return data;
  } catch (error: any) {
    // Log in all environments for debugging
    console.error('Password reset exception:', {
      message: error?.message,
      name: error?.name,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });

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
      console.error('Update password error:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });

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
    logger.debug('OAuth sign in initiated', { provider, redirectTo });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      logger.error('OAuth sign in error', error);
      throw new Error(error.message || `${provider} ile giriş yapılamadı. Lütfen tekrar deneyin.`);
    }

    logger.info('OAuth sign in successful', { provider, url: data.url });
    return data;
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error('OAuth sign in exception', errorObj);
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
