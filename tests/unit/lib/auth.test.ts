import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUp, signIn, resetPassword, updatePassword } from '@/lib/auth';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
      upsert: vi.fn().mockReturnThis(),
    })),
  },
}));

describe('Authentication Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should validate email is required', async () => {
      await expect(
        signUp('', 'password123', 'username', 'user')
      ).rejects.toThrow('E-posta adresi gereklidir');
    });

    it('should validate password is required', async () => {
      await expect(
        signUp('test@example.com', '', 'username', 'user')
      ).rejects.toThrow('Şifre gereklidir');
    });

    it('should validate username is required', async () => {
      await expect(
        signUp('test@example.com', 'password123', '', 'user')
      ).rejects.toThrow('Kullanıcı adı gereklidir');
    });

    it('should validate email format', async () => {
      await expect(
        signUp('invalid-email', 'password123', 'username', 'user')
      ).rejects.toThrow('Geçerli bir e-posta adresi giriniz');
    });

    it('should validate password length', async () => {
      await expect(
        signUp('test@example.com', 'short', 'username', 'user')
      ).rejects.toThrow('Şifre en az 6 karakter olmalıdır');
    });

    it('should validate username length', async () => {
      await expect(
        signUp('test@example.com', 'password123', 'ab', 'user')
      ).rejects.toThrow('Kullanıcı adı en az 3 karakter olmalıdır');
    });

    it('should validate username format', async () => {
      await expect(
        signUp('test@example.com', 'password123', 'user name!', 'user')
      ).rejects.toThrow('Kullanıcı adı sadece harf, rakam, alt çizgi ve tire içerebilir');
    });
  });

  describe('signIn', () => {
    it('should validate email is required', async () => {
      await expect(
        signIn('', 'password123')
      ).rejects.toThrow('E-posta ve şifre gereklidir');
    });

    it('should validate password is required', async () => {
      await expect(
        signIn('test@example.com', '')
      ).rejects.toThrow('E-posta ve şifre gereklidir');
    });

    it('should normalize email to lowercase', async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' }, session: null },
        error: null,
      } as any);

      await signIn('TEST@EXAMPLE.COM', 'password123');
      
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  describe('resetPassword', () => {
    it('should validate email is required', async () => {
      await expect(
        resetPassword('')
      ).rejects.toThrow('E-posta adresi gereklidir');
    });

    it('should validate email format', async () => {
      await expect(
        resetPassword('invalid-email')
      ).rejects.toThrow('Geçerli bir e-posta adresi giriniz');
    });

    it('should normalize email to lowercase', async () => {
      const { supabase } = await import('@/lib/supabase');
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      } as any);

      await resetPassword('TEST@EXAMPLE.COM');
      
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/callback?type=recovery'),
        })
      );
    });
  });

  describe('updatePassword', () => {
    it('should validate password is required', async () => {
      await expect(
        updatePassword('')
      ).rejects.toThrow('Şifre gereklidir');
    });

    it('should validate password length', async () => {
      await expect(
        updatePassword('short')
      ).rejects.toThrow('Şifre en az 8 karakter olmalıdır');
    });

    it('should validate strong password requirements', async () => {
      // Missing uppercase
      await expect(
        updatePassword('lowercase123!')
      ).rejects.toThrow(/büyük harf/i);

      // Missing lowercase
      await expect(
        updatePassword('UPPERCASE123!')
      ).rejects.toThrow(/küçük harf/i);

      // Missing number
      await expect(
        updatePassword('Password!')
      ).rejects.toThrow(/rakam/i);

      // Missing special character
      await expect(
        updatePassword('Password123')
      ).rejects.toThrow(/özel karakter/i);
    });
  });
});

