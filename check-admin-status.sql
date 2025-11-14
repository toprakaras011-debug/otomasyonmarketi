-- Kullanıcının admin durumunu kontrol etme
-- ID: 52e38edf-22cb-4f0c-8eb3-fecb19c77b84

-- 1. Kullanıcı bilgilerini ve email'i kontrol edin
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  up.username,
  up.full_name,
  up.role,
  up.is_admin,
  up.is_developer,
  up.developer_approved,
  up.created_at,
  up.updated_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.id = '52e38edf-22cb-4f0c-8eb3-fecb19c77b84';

-- 2. Eğer admin değilse, admin yap
UPDATE user_profiles
SET 
  role = 'admin',
  is_admin = true,
  updated_at = NOW()
WHERE id = '52e38edf-22cb-4f0c-8eb3-fecb19c77b84';

-- 3. Email'i admin listesine eklemek için (email'i yukarıdaki sorgudan alın)
-- Örnek: UPDATE user_profiles SET role = 'admin', is_admin = true WHERE id = '52e38edf-22cb-4f0c-8eb3-fecb19c77b84';

-- 4. Kontrol edin
SELECT 
  au.email,
  up.username,
  up.role,
  up.is_admin,
  CASE 
    WHEN up.role = 'admin' AND up.is_admin = true THEN '✅ Admin'
    ELSE '❌ Not Admin'
  END as status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.id = '52e38edf-22cb-4f0c-8eb3-fecb19c77b84';

