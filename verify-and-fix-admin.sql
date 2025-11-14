-- Kullanıcı Admin Durumunu Kontrol ve Düzeltme
-- ID: 52e38edf-22cb-4f0c-8eb3-fecb19c77b84
-- Username: batuflex

-- 1. Kullanıcı bilgilerini ve email'i kontrol edin
SELECT 
  au.id,
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
    WHEN up.role = 'admin' AND up.is_admin = true THEN '✅ Admin'
    ELSE '❌ Not Admin'
  END as admin_status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.id = '52e38edf-22cb-4f0c-8eb3-fecb19c77b84';

-- 2. Admin olarak ayarla (eğer değilse)
UPDATE user_profiles
SET 
  role = 'admin',
  is_admin = true,
  updated_at = NOW()
WHERE id = '52e38edf-22cb-4f0c-8eb3-fecb19c77b84'
  AND (role != 'admin' OR is_admin != true);

-- 3. Email'i admin listesine eklemek için (yukarıdaki sorgudan email'i alın)
-- Örnek: Eğer email 'batuflex@example.com' ise, lib/auth.ts ve app/auth/callback/route.ts dosyalarındaki
-- ADMIN_EMAILS listesine ekleyin

-- 4. Son kontrol
SELECT 
  au.email,
  up.username,
  up.role,
  up.is_admin,
  CASE 
    WHEN up.role = 'admin' AND up.is_admin = true THEN '✅ Admin - Çıkış yapıp tekrar giriş yapın'
    ELSE '❌ Not Admin - Yukarıdaki UPDATE sorgusunu çalıştırın'
  END as status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.id = '52e38edf-22cb-4f0c-8eb3-fecb19c77b84';

