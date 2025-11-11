-- ============================================
-- HIZLI ADMIN DÜZELTME (Email ile)
-- ============================================
-- Bu script'i Supabase SQL Editor'de çalıştırın
-- ============================================

-- ✅ DOĞRU YÖNTEM: Email ile admin yap
-- user_profiles tablosunda user_email kolonu YOK!
-- Email bilgisi auth.users tablosunda
UPDATE user_profiles
SET 
  is_admin = true,
  role = 'admin',
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'ftnakras01@gmail.com'  -- ⚠️ Admin email'iniz
);

-- ✅ KONTROL: Admin hesabının güncellendiğini doğrula
SELECT 
  u.id,
  u.email,
  p.username,
  p.is_admin,
  p.role,
  p.updated_at
FROM auth.users u
INNER JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'ftnakras01@gmail.com';

-- ============================================
-- NOT: Eğer user_profiles tablosunda kayıt yoksa
-- ============================================
-- Önce profile oluşturmanız gerekebilir:
-- INSERT INTO user_profiles (id, username, is_admin, role, created_at, updated_at)
-- SELECT 
--   id,
--   split_part(email, '@', 1) as username,
--   true as is_admin,
--   'admin' as role,
--   NOW() as created_at,
--   NOW() as updated_at
-- FROM auth.users
-- WHERE email = 'ftnakras01@gmail.com'
-- ON CONFLICT (id) DO UPDATE SET
--   is_admin = true,
--   role = 'admin',
--   updated_at = NOW();

