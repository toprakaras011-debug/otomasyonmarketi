-- ============================================
-- Fix Infinite Recursion in RLS Policies - V2
-- ============================================
-- Bu script sonsuz döngü sorununu çözer
-- Admin kontrolü için user_profiles tablosunu sorgulamıyor
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
-- 2. HELPER FUNCTION - Admin kontrolü için
-- ============================================
-- Bu fonksiyon admin kontrolünü yapar, sonsuz döngü yok
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  is_admin_val BOOLEAN;
BEGIN
  -- Sadece auth.uid() için kontrol yap, sonsuz döngü yok
  SELECT (is_admin = true OR role = 'admin')
  INTO is_admin_val
  FROM user_profiles
  WHERE id = user_id
  LIMIT 1;
  
  RETURN COALESCE(is_admin_val, false);
END;
$$;

-- ============================================
-- 3. INSERT POLICY (OAuth için kritik)
-- ============================================
CREATE POLICY "profiles_insert_own"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- 4. SELECT POLICY - Kullanıcılar kendi profillerini görebilir
-- ============================================
CREATE POLICY "profiles_select_own"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- ============================================
-- 5. UPDATE POLICY - Kullanıcılar kendi profillerini güncelleyebilir
-- ============================================
CREATE POLICY "profiles_update_own"
ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- 6. ADMIN SELECT POLICY - Sonsuz döngü olmadan
-- ============================================
-- ÖNEMLİ: Helper function kullanıyoruz, user_profiles tablosunu direkt sorgulamıyoruz
CREATE POLICY "profiles_admin_select_all"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  -- Kullanıcı kendi profilini görebilir
  auth.uid() = id
  OR
  -- Admin ise tüm profilleri görebilir (helper function ile)
  is_admin_user(auth.uid())
);

-- ============================================
-- 7. ADMIN UPDATE POLICY - Sonsuz döngü olmadan
-- ============================================
CREATE POLICY "profiles_admin_update_all"
ON user_profiles
FOR UPDATE
TO authenticated
USING (
  -- Kullanıcı kendi profilini güncelleyebilir
  auth.uid() = id
  OR
  -- Admin ise tüm profilleri güncelleyebilir (helper function ile)
  is_admin_user(auth.uid())
)
WITH CHECK (
  -- Kullanıcı kendi profilini güncelleyebilir
  auth.uid() = id
  OR
  -- Admin ise tüm profilleri güncelleyebilir (helper function ile)
  is_admin_user(auth.uid())
);

-- ============================================
-- 8. RLS AKTİF Mİ KONTROL ET
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. POLICY'LERİ KONTROL ET
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
-- 10. TEST
-- ============================================
-- Admin kullanıcı ile test:
-- SELECT * FROM user_profiles WHERE id = auth.uid();
-- SELECT * FROM user_profiles; -- Admin ise tüm profilleri görmeli

