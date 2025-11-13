-- ============================================
-- OAuth Callback için RLS Policy Düzeltmesi
-- ============================================
-- Bu script'i Supabase SQL Editor'de çalıştırın
-- ============================================

-- ÖNEMLİ: Önce mevcut policy'leri kontrol edin
-- SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- ============================================
-- 1. MEVCUT TÜM POLICY'LERİ SİL (Güvenli)
-- ============================================
-- Önce tüm mevcut policy'leri temizleyelim
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
-- 2. DOĞRU INSERT POLICY (OAuth için kritik)
-- ============================================
-- Authenticated kullanıcılar kendi profillerini oluşturabilir
CREATE POLICY "profiles_insert_own"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. DOĞRU SELECT POLICY (Güvenlik için)
-- ============================================
-- Kullanıcılar kendi profillerini görebilir
CREATE POLICY "profiles_select_own"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Public read yerine authenticated users için select
-- (Eğer public read gerekiyorsa, sadece belirli alanlar için yapın)

-- ============================================
-- 4. DOĞRU UPDATE POLICY
-- ============================================
-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "profiles_update_own"
ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- 5. ADMIN POLICY'LERİ (İsteğe bağlı)
-- ============================================
-- Admin'ler tüm profilleri görebilir
CREATE POLICY "profiles_admin_select_all"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND (up.is_admin = true OR up.role = 'admin')
  )
);

-- Admin'ler tüm profilleri güncelleyebilir
CREATE POLICY "profiles_admin_update_all"
ON user_profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND (up.is_admin = true OR up.role = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid()
    AND (up.is_admin = true OR up.role = 'admin')
  )
);

-- ============================================
-- 6. RLS AKTİF Mİ KONTROL ET
-- ============================================
-- RLS aktif olmalı
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS durumunu kontrol et:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';

-- ============================================
-- 7. POLICY'LERİ KONTROL ET
-- ============================================
-- Tüm policy'leri listele:
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
-- 8. TEST QUERY
-- ============================================
-- OAuth callback'ten sonra bu query ile test edin:
-- SELECT * FROM user_profiles WHERE id = auth.uid();

-- ============================================
-- ÖNEMLİ NOTLAR:
-- ============================================
-- 1. INSERT policy'si mutlaka "WITH CHECK (auth.uid() = id)" olmalı
-- 2. Policy'ler "TO authenticated" olmalı (public değil)
-- 3. RLS aktif olmalı
-- 4. OAuth callback'te auth.uid() doğru çalışıyor olmalı
-- ============================================

