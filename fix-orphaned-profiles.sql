-- Orphaned Profiles Fix Script
-- Bu script, user_profiles tablosunda olup auth.users tablosunda olmayan profilleri bulur ve siler

-- 1. Önce orphaned profilleri bulalım (auth.users'da olmayan ama user_profiles'da olan)
SELECT 
  up.id,
  up.username,
  up.full_name,
  up.email,
  up.role,
  up.is_admin,
  up.created_at as profile_created_at,
  'ORPHANED - Will be deleted' as status
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE au.id IS NULL;

-- 2. Eğer yukarıdaki sorgu sonuç döndürürse, bu profiller orphaned (sahipsiz) demektir
-- Bu profilleri silmek için aşağıdaki sorguyu çalıştırın:

-- DİKKAT: Bu sorgu orphaned profilleri SİLECEK!
-- Önce yukarıdaki SELECT sorgusunu çalıştırıp hangi profillerin silineceğini kontrol edin
-- DELETE FROM user_profiles 
-- WHERE id IN (
--   SELECT up.id
--   FROM user_profiles up
--   LEFT JOIN auth.users au ON up.id = au.id
--   WHERE au.id IS NULL
-- );

-- 3. Belirli bir email için orphaned profile bulmak (eğer user_profiles'da email kolonu varsa):
-- SELECT up.* 
-- FROM user_profiles up
-- LEFT JOIN auth.users au ON up.id = au.id
-- WHERE au.id IS NULL 
-- AND up.email = 'kullanici@example.com';

-- 4. Belirli bir kullanıcı ID'si için kontrol:
-- SELECT 
--   CASE 
--     WHEN au.id IS NULL THEN 'ORPHANED - Profile exists but no auth user'
--     WHEN up.id IS NULL THEN 'AUTH ONLY - Auth user exists but no profile'
--     ELSE 'OK - Both exist'
--   END as status,
--   COALESCE(au.id, up.id) as user_id,
--   au.email as auth_email,
--   up.username as profile_username
-- FROM auth.users au
-- FULL OUTER JOIN user_profiles up ON au.id = up.id
-- WHERE COALESCE(au.id, up.id) = 'USER_ID_HERE';

-- 5. Tüm orphaned profilleri güvenli bir şekilde silmek için:
-- Bu sorgu önce sayar, sonra siler (güvenlik için)
-- 
-- DO $$
-- DECLARE
--   deleted_count INTEGER;
-- BEGIN
--   DELETE FROM user_profiles 
--   WHERE id IN (
--     SELECT up.id
--     FROM user_profiles up
--     LEFT JOIN auth.users au ON up.id = au.id
--     WHERE au.id IS NULL
--   );
--   
--   GET DIAGNOSTICS deleted_count = ROW_COUNT;
--   RAISE NOTICE 'Deleted % orphaned profiles', deleted_count;
-- END $$;

