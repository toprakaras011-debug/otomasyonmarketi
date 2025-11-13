-- ============================================
-- VERIFY: RLS Policies for user_profiles
-- ============================================
-- Bu script mevcut RLS policy'lerini kontrol eder
-- ve signup sırasında profile oluşturma sorununu çözer
-- ============================================

-- ============================================
-- 1. MEVCUT POLICY'LERİ KONTROL ET
-- ============================================
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY cmd, policyname;

-- ============================================
-- 2. INSERT POLICY KONTROLÜ
-- ============================================
-- profiles_insert_own policy'si olmalı:
-- - cmd: INSERT
-- - roles: {authenticated}
-- - with_check: (auth.uid() = id)

-- Eğer policy yoksa veya yanlışsa, düzelt:
DROP POLICY IF EXISTS "profiles_insert_own" ON user_profiles;

CREATE POLICY "profiles_insert_own"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. TRIGGER İLE OTOMATIK PROFILE OLUŞTURMA
-- ============================================
-- Signup sırasında session henüz tam kurulmamış olabilir
-- Bu yüzden trigger ile otomatik profile oluşturma ekliyoruz

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
INSERT INTO public.user_profiles (id, username, full_name, phone, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(
    LOWER(REGEXP_REPLACE(
      COALESCE(
        au.raw_user_meta_data->>'username',
        SPLIT_PART(au.email, '@', 1)
      ),
      '[^a-z0-9]', '-', 'g'
    )),
    'user-' || SUBSTRING(au.id::TEXT, 1, 8)
  ) as username,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    NULL
  ) as full_name,
  COALESCE(au.raw_user_meta_data->>'phone', NULL) as phone,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. POLICY'LERİ TEKRAR KONTROL ET
-- ============================================
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check,
  CASE 
    WHEN cmd = 'INSERT' AND with_check = '(auth.uid() = id)' THEN '✅ DOĞRU'
    WHEN cmd = 'SELECT' AND qual LIKE '%auth.uid() = id%' THEN '✅ DOĞRU'
    WHEN cmd = 'UPDATE' AND qual LIKE '%auth.uid() = id%' THEN '✅ DOĞRU'
    ELSE '⚠️ KONTROL ET'
  END as durum
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY cmd, policyname;

-- ============================================
-- 6. TRIGGER KONTROLÜ
-- ============================================
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND trigger_schema = 'auth'
  AND trigger_name = 'on_auth_user_created';

-- ============================================
-- 7. TEST
-- ============================================
-- Yeni kullanıcı kaydı yapıldığında:
-- 1. Trigger otomatik profile oluşturur (SECURITY DEFINER ile RLS bypass)
-- 2. RLS policy insert'e izin verir (auth.uid() = id)
-- 3. Her iki yöntem de çalışır, trigger daha güvenilir

