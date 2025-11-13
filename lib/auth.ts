import { supabase } from './supabase';

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

    const emailRedirectTo = `${(siteUrl || 'http://localhost:3000')}/auth/callback`;

    // Attempt sign up with optional email verification
    // User can login immediately, but email verification is still sent
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: password, // Don't trim password
      options: {
        emailRedirectTo,
        data: metadata,
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

    // Create user profile
    const profileData: any = {
      id: authData.user.id,
      username: trimmedUsername,
      full_name: fullName?.trim() || null,
      phone: normalizedPhone || null,
    };

    // Add role if provided (default is 'user')
    if (role) {
      // If developer, set developer flags
      if (role === 'developer') {
        profileData.is_developer = true;
      }
    }

    // Use upsert instead of insert to handle potential race conditions
    // This prevents errors if profile already exists
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'id',
      });

    if (profileError) {
      // Log error in all environments for debugging
      console.error('Profile creation error:', {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
      });

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
        profileError.message || 'Profil oluşturulamadı. Lütfen tekrar deneyin.'
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

      // Invalid credentials
      if (
        errorMessage.includes('invalid login credentials') ||
        errorMessage.includes('invalid_credentials') ||
        errorMessage.includes('invalid email or password') ||
        errorMessage.includes('email not confirmed') ||
        errorMessage.includes('email_not_confirmed') ||
        errorMessage.includes('email address not confirmed') ||
        (errorCode === 400 && errorMessage.includes('credentials'))
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
  try {
    if (typeof window === 'undefined') {
      throw new Error('OAuth sadece tarayıcıda çalışır');
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('GitHub OAuth error:', error);
      throw new Error(error.message || 'GitHub ile giriş yapılamadı');
    }

    return data;
  } catch (error: any) {
    // Re-throw user-friendly errors
    if (error?.message && !error.message.includes('OAuth')) {
      throw error;
    }
    throw new Error(error?.message || 'GitHub ile giriş yapılamadı');
  }
};

export const signInWithGoogle = async () => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('OAuth sadece tarayıcıda çalışır');
    }

    // Clear any existing session first to prevent conflicts
    await supabase.auth.signOut();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google OAuth error:', error);
      throw new Error(error.message || 'Google ile giriş yapılamadı');
    }

    return data;
  } catch (error: any) {
    console.error('Google OAuth function error:', error);
    // Re-throw user-friendly errors
    if (error?.message && !error.message.includes('OAuth')) {
      throw error;
    }
    throw new Error(error?.message || 'Google ile giriş yapılamadı');
  }
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
