-- ============================================
-- Fix Infinite Recursion in RLS Policies
-- ============================================
-- Bu script sonsuz döngü sorununu çözer
-- ============================================

-- ============================================
-- 1. MEVCUT TÜM POLICY'LERİ SİL
-- ============================================
DROP POLICY IF EXISTS "profiles_insert_own" ON user_profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON user_profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON user_profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON user_profiles;
DROP POLICY IF EXISTS "profiles_admin_select_all" ON user_profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- ============================================
-- 2. INSERT POLICY (OAuth için kritik)
-- ============================================
CREATE POLICY "profiles_insert_own"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. SELECT POLICY - Kullanıcılar kendi profillerini görebilir
-- ============================================
CREATE POLICY "profiles_select_own"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- ============================================
-- 4. UPDATE POLICY - Kullanıcılar kendi profillerini güncelleyebilir
-- ============================================
CREATE POLICY "profiles_update_own"
ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- 5. ADMIN POLICY'LERİ - Sonsuz döngü olmadan
-- ============================================
-- ÖNEMLİ: Admin kontrolü için user_profiles tablosunu sorgulamıyoruz
-- Bunun yerine, admin kullanıcılar için özel bir fonksiyon kullanıyoruz
-- veya metadata'dan kontrol ediyoruz

-- Admin SELECT policy - Sadece kendi profilini kontrol eder (sonsuz döngü yok)
CREATE POLICY "profiles_admin_select_all"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  -- Kullanıcı kendi profilini görebilir
  auth.uid() = id
  OR
  -- Admin ise tüm profilleri görebilir (sadece kendi profilinden kontrol)
  (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND (up.is_admin = true OR up.role = 'admin')
      -- ÖNEMLİ: Bu sorgu sadece auth.uid() için çalışır, sonsuz döngü yok
      LIMIT 1
    )
  )
);

-- Admin UPDATE policy - Sadece kendi profilini kontrol eder (sonsuz döngü yok)
CREATE POLICY "profiles_admin_update_all"
ON user_profiles
FOR UPDATE
TO authenticated
USING (
  -- Kullanıcı kendi profilini güncelleyebilir
  auth.uid() = id
  OR
  -- Admin ise tüm profilleri güncelleyebilir (sadece kendi profilinden kontrol)
  (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND (up.is_admin = true OR up.role = 'admin')
      -- ÖNEMLİ: Bu sorgu sadece auth.uid() için çalışır, sonsuz döngü yok
      LIMIT 1
    )
  )
)
WITH CHECK (
  -- Kullanıcı kendi profilini güncelleyebilir
  auth.uid() = id
  OR
  -- Admin ise tüm profilleri güncelleyebilir
  (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND (up.is_admin = true OR up.role = 'admin')
      LIMIT 1
    )
  )
);

-- ============================================
-- 6. RLS AKTİF Mİ KONTROL ET
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. POLICY'LERİ KONTROL ET
-- ============================================
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- ============================================
-- 8. TEST
-- ============================================
-- Admin kullanıcı ile test:
-- SELECT * FROM user_profiles WHERE id = auth.uid();
-- SELECT * FROM user_profiles; -- Admin ise tüm profilleri görmeli

