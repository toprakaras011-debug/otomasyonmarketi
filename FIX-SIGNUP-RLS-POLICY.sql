-- ============================================
-- FIX: Signup RLS Policy - Profile Creation
-- ============================================
-- Bu script signup sırasında profile oluşturma sorununu çözer
-- Email verification zorunlu olduğu için kullanıcı authenticated olmayabilir
-- ============================================

-- ============================================
-- 1. MEVCUT INSERT POLICY'Yİ KONTROL ET
-- ============================================
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles' AND cmd = 'INSERT';

-- ============================================
-- 2. INSERT POLICY'Yİ GÜNCELLE
-- ============================================
-- Mevcut policy'yi sil
DROP POLICY IF EXISTS "profiles_insert_own" ON user_profiles;

-- Yeni policy: Kullanıcı kendi profilini oluşturabilir
-- auth.uid() kontrolü yapıyoruz - signup sonrası session kurulduğunda çalışır
CREATE POLICY "profiles_insert_own"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. Database Trigger ile Otomatik Profile Oluşturma
-- ============================================
-- Bu trigger, auth.users'a yeni kullanıcı eklendiğinde otomatik profile oluşturur
-- SECURITY DEFINER ile RLS bypass edilir, bu yüzden signup sırasında sorun olmaz

-- Trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  username_candidate TEXT;
  username_base TEXT;
  counter INTEGER := 0;
  metadata_full_name TEXT;
  metadata_username TEXT;
BEGIN
  -- Metadata'dan bilgileri al
  metadata_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NULL
  );
  metadata_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NULL
  );
  
  -- Username oluştur
  IF metadata_username IS NOT NULL THEN
    username_base := LOWER(REGEXP_REPLACE(metadata_username, '[^a-z0-9]', '-', 'g'));
  ELSIF NEW.email IS NOT NULL THEN
    username_base := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9]', '-', 'g'));
  ELSE
    username_base := 'user-' || SUBSTRING(NEW.id::TEXT, 1, 8);
  END IF;
  
  -- Unique username bul
  username_candidate := username_base;
  WHILE EXISTS (SELECT 1 FROM user_profiles WHERE username = username_candidate) LOOP
    counter := counter + 1;
    username_candidate := username_base || '-' || counter::TEXT;
  END LOOP;
  
  -- Profile oluştur (SECURITY DEFINER ile RLS bypass)
  INSERT INTO public.user_profiles (
    id, 
    username, 
    full_name,
    phone,
    is_developer,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    username_candidate,
    metadata_full_name,
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'role', 'user') = 'developer' THEN true
      ELSE false
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Trigger oluştur (eğer yoksa)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. MEVCUT KULLANICILAR İÇİN PROFILE OLUŞTUR
-- ============================================
-- Eğer auth.users'da profile olmayan kullanıcılar varsa, onlar için de profile oluştur
INSERT INTO public.user_profiles (id, username, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(
    LOWER(REGEXP_REPLACE(au.email, '[^a-z0-9]', '-', 'g')),
    'user-' || SUBSTRING(au.id::TEXT, 1, 8)
  ) as username,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. POLICY'LERİ KONTROL ET
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
-- 6. TEST
-- ============================================
-- Yeni kullanıcı kaydı yapıldığında:
-- 1. Trigger otomatik profile oluşturur
-- 2. RLS policy insert'e izin verir (auth.uid() = id)
-- 3. Her iki yöntem de çalışır

