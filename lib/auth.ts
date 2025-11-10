import { supabase } from './supabase';

export const signUp = async (
  email: string,
  password: string,
  username: string,
  fullName?: string,
  phone?: string
) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create user');

  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: authData.user.id,
      username,
      full_name: fullName,
      phone,
    });

  if (profileError) throw profileError;

  return authData;
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      // Provide more user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('E-posta veya şifre hatalı. Lütfen tekrar deneyin.');
      } else if (error.message.includes('Email not confirmed')) {
        throw new Error('E-posta adresiniz henüz doğrulanmamış. Lütfen e-posta kutunuzu kontrol edin.');
      } else if (error.status === 400) {
        throw new Error('Geçersiz e-posta veya şifre formatı.');
      } else if (error.status === 403) {
        throw new Error('Giriş yapma izniniz yok. Lütfen destek ekibiyle iletişime geçin.');
      }
      throw error;
    }
    return data;
  } catch (error: any) {
    console.error('Sign in exception:', error);
    throw error;
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
