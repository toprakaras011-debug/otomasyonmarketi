-- ============================================
-- SUPABASE ADMIN HESABI DÜZELTME SCRIPT'İ
-- ============================================
-- Bu script'i Supabase SQL Editor'de çalıştırın
-- ============================================

-- 1. ÖNCE: Admin hesabının email'ini bulun
-- SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- 2. Admin hesabını user_profiles tablosunda güncelleyin
-- (Email'i kendi admin email'inizle değiştirin)
-- ✅ DOĞRU YÖNTEM: auth.users tablosundan email ile bulup user_profiles'ı güncelle
UPDATE user_profiles
SET 
  is_admin = true,
  role = 'admin',
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'ftnakras01@gmail.com'  -- ⚠️ Admin email'iniz
);

-- ✅ ALTERNATİF: Direkt user ID ile güncelle (daha hızlı)
-- UPDATE user_profiles
-- SET 
--   is_admin = true,
--   role = 'admin',
--   updated_at = NOW()
-- WHERE id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';  -- ⚠️ Admin user ID'niz

-- 3. RLS Policy'leri oluşturun (eğer yoksa)

-- Policy 1: Kullanıcılar kendi profillerini görebilir
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Admin'ler TÜM profilleri görebilir
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles"
ON user_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND (up.is_admin = true OR up.role = 'admin')
  )
);

-- Policy 3: Kullanıcılar kendi profillerini güncelleyebilir
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Admin'ler tüm profilleri güncelleyebilir
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
CREATE POLICY "Admins can update all profiles"
ON user_profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND (up.is_admin = true OR up.role = 'admin')
  )
);

-- 4. RLS'nin aktif olduğunu kontrol edin
-- (Supabase Dashboard > Table Editor > user_profiles > Settings'te kontrol edin)

-- 5. Test: Admin hesabının profilini kontrol edin
-- (Admin hesabıyla giriş yaptıktan sonra çalıştırın)
SELECT 
  id,
  username,
  is_admin,
  role,
  is_developer,
  created_at
FROM user_profiles
WHERE id = auth.uid();

-- 6. Test: Tüm admin hesaplarını listele
SELECT 
  u.id,
  u.email as user_email,
  p.username,
  p.is_admin,
  p.role,
  p.created_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.is_admin = true OR p.role = 'admin';

-- ============================================
-- ÖNEMLİ NOTLAR:
-- ============================================
-- 1. RLS (Row Level Security) aktif olmalı
-- 2. Policy'ler doğru sırayla oluşturulmalı
-- 3. Admin hesabının is_admin = true veya role = 'admin' olmalı
-- 4. Her policy'den sonra test edin
-- ============================================

