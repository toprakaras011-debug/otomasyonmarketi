-- ============================================
-- SUPABASE RLS POLICY'LERİ - TAM ÇÖZÜM
-- ============================================
-- Bu script'i Supabase SQL Editor'de çalıştırın
-- ============================================

-- ÖNEMLİ: Önce mevcut policy'leri kontrol edin
-- SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- ============================================
-- 1. MEVCUT POLICY'LERİ TEMİZLE (İSTEĞE BAĞLI)
-- ============================================
-- DİKKAT: Bu komutlar tüm policy'leri siler, sadece gerekirse kullanın
-- DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
-- DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
-- DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
-- DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- ============================================
-- 2. SELECT POLICY'LERİ (OKUMA İZİNLERİ)
-- ============================================

-- Policy 1: Kullanıcılar kendi profillerini görebilir
CREATE POLICY "Users can view own profile"
ON user_profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: ✅ ÖNEMLİ - Admin'ler TÜM profilleri görebilir (kendi profilleri dahil)
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

-- ============================================
-- 3. UPDATE POLICY'LERİ (GÜNCELLEME İZİNLERİ)
-- ============================================

-- Policy 3: Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 4: Admin'ler tüm profilleri güncelleyebilir
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

-- ============================================
-- 4. INSERT POLICY'LERİ (EKLEME İZİNLERİ)
-- ============================================

-- Policy 5: Kullanıcılar kendi profillerini oluşturabilir (trigger ile otomatik)
CREATE POLICY "Users can insert own profile"
ON user_profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- 5. TEST QUERIES
-- ============================================

-- Test 1: Admin hesabının kendi profilini görebildiğini test et
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

-- Test 2: Admin hesabının tüm profilleri görebildiğini test et
-- (Sadece admin hesabıyla çalışmalı)
SELECT COUNT(*) as total_profiles
FROM user_profiles;

-- Test 3: Admin hesabının bilgilerini kontrol et
SELECT 
  u.id,
  u.email,
  p.username,
  p.is_admin,
  p.role,
  p.created_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'ftnakras01@gmail.com';  -- ⚠️ Admin email'inizi yazın

-- ============================================
-- 6. RLS AKTİF Mİ KONTROL ET
-- ============================================
-- Supabase Dashboard > Table Editor > user_profiles > Settings
-- "Enable Row Level Security" checkbox'ı işaretli olmalı

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
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- ============================================
-- ÖNEMLİ NOTLAR:
-- ============================================
-- 1. Policy'ler sırayla oluşturulmalı (önce SELECT, sonra UPDATE)
-- 2. Admin policy'si mutlaka olmalı (kendi profilini görebilmek için)
-- 3. RLS aktif olmalı
-- 4. Admin hesabının is_admin = true VEYA role = 'admin' olmalı
-- 5. Her policy'den sonra test edin
-- ============================================

