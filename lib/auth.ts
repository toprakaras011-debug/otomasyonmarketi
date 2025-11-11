import { supabase } from './supabase';

export const signUp = async (
  email: string,
  password: string,
  username: string,
  fullName?: string,
  phone?: string
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

    // Attempt sign up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: password, // Don't trim password
    });

    if (authError) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign up error:', {
          message: authError.message,
          status: authError.status,
          name: authError.name,
        });
      }

      // Check for specific error codes and messages
      const errorMessage = authError.message?.toLowerCase() || '';
      const errorCode = authError.status;

      // Email already exists
      if (
        errorMessage.includes('user already registered') ||
        errorMessage.includes('already registered') ||
        errorMessage.includes('email already exists') ||
        errorCode === 422
      ) {
        throw new Error('Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.');
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

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        username: trimmedUsername,
        full_name: fullName?.trim() || null,
        phone: normalizedPhone || null,
      });

    if (profileError) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Profile creation error:', profileError);
      }

      // Check for specific errors
      const errorMessage = profileError.message?.toLowerCase() || '';
      const errorCode = profileError.code;

      // Username already exists
      if (
        errorCode === '23505' ||
        errorMessage.includes('unique') ||
        errorMessage.includes('duplicate') ||
        errorMessage.includes('already exists')
      ) {
        throw new Error('Bu kullanıcı adı zaten kullanılıyor. Lütfen farklı bir kullanıcı adı seçin.');
      }

      // Generic profile error
      throw new Error('Profil oluşturulamadı. Lütfen tekrar deneyin.');
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
  try {
    // Validate inputs - more robust validation
    if (!email || typeof email !== 'string') {
      throw new Error('E-posta adresi gereklidir.');
    }
    if (!password || typeof password !== 'string') {
      throw new Error('Şifre gereklidir.');
    }

    // Trim and normalize email (but preserve original for error messages)
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      throw new Error('E-posta adresi boş olamaz.');
    }

    // Normalize email to lowercase (Supabase stores emails in lowercase)
    const normalizedEmail = trimmedEmail.toLowerCase();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new Error('Geçerli bir e-posta adresi giriniz.');
    }

    // Password validation - check minimum length (don't trim - spaces might be intentional)
    // Only validate if password is not empty
    if (password.length === 0) {
      throw new Error('Şifre gereklidir.');
    }
    // Minimum length check - but be lenient (let Supabase handle strict validation)
    if (password.length > 0 && password.length < 6) {
      throw new Error('Şifre en az 6 karakter olmalıdır.');
    }

    // Attempt sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: password, // Don't trim password - spaces might be intentional
    });

    if (error) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign in error:', {
          message: error.message,
          status: error.status,
          name: error.name,
        });
      }
      
      // Check for specific error codes and messages
      const errorMessage = error.message?.toLowerCase() || '';
      const errorCode = error.status;

      // Invalid credentials - most common error
      if (
        errorMessage.includes('invalid login credentials') ||
        errorMessage.includes('invalid_credentials') ||
        errorMessage.includes('invalid email or password') ||
        (errorCode === 400 && errorMessage.includes('credentials'))
      ) {
        throw new Error('E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.');
      }

      // Email not confirmed
      if (
        errorMessage.includes('email not confirmed') ||
        errorMessage.includes('email_not_confirmed') ||
        errorMessage.includes('email address not confirmed')
      ) {
        throw new Error('E-posta adresiniz henüz doğrulanmamış. Lütfen e-posta kutunuzu kontrol edin ve doğrulama linkine tıklayın.');
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
      throw new Error('Giriş başarısız. Kullanıcı bilgisi alınamadı. Lütfen tekrar deneyin.');
    }

    // Verify user email matches (case-insensitive)
    if (data.user.email?.toLowerCase() !== normalizedEmail) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Email mismatch:', { expected: normalizedEmail, got: data.user.email });
      }
    }

    // Wait a moment to ensure session is fully established
    // This is especially important for admin accounts
    await new Promise(resolve => setTimeout(resolve, 100));

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

export const signInWithGithub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) throw error;
  return data;
};

export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return data;
};
