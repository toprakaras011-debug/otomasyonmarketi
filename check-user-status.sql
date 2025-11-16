-- Kullanıcı durumunu kontrol etme sorgusu
-- ftnakras01@gmail.com kullanıcısının mevcut durumunu gösterir

SELECT 
  au.id as user_id,
  au.email,
  au.email_confirmed_at,
  au.created_at as auth_created_at,
  up.username,
  up.full_name,
  up.role,
  up.is_admin,
  up.is_developer,
  up.developer_approved,
  up.created_at as profile_created_at,
  up.updated_at as profile_updated_at,
  CASE 
    WHEN up.role = 'admin' OR up.is_admin = true THEN '✅ Admin'
    WHEN up.is_developer = true THEN '👨‍💻 Developer'
    ELSE '👤 User'
  END as user_type
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'ftnakras01@gmail.com';

-- Eğer kullanıcı bulunamazsa, auth.users'da var mı kontrol et
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'ftnakras01@gmail.com';

-- Eğer user_profiles'da yoksa, oluştur
-- (Sadece auth.users'da varsa ama user_profiles'da yoksa çalıştırın)
-- INSERT INTO user_profiles (id, username, role, is_admin, created_at, updated_at)
-- SELECT 
--   id,
--   COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)) as username,
--   'admin' as role,
--   true as is_admin,
--   NOW() as created_at,
--   NOW() as updated_at
-- FROM auth.users
-- WHERE email = 'ftnakras01@gmail.com'
-- AND id NOT IN (SELECT id FROM user_profiles);

