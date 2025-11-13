-- ftnakras01 kullanıcısını admin yap
-- UUID: fe1f19d5-b201-4754-a900-88500fa8cc52

-- Yöntem 1: UUID ile direkt güncelleme (EN HIZLI)
UPDATE user_profiles 
SET 
  role = 'admin', 
  is_admin = true,
  updated_at = NOW()
WHERE id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';

-- Yöntem 2: Email ile güncelleme (alternatif)
UPDATE user_profiles 
SET 
  role = 'admin', 
  is_admin = true,
  updated_at = NOW()
WHERE id IN (
  SELECT id 
  FROM auth.users 
  WHERE email = 'ftnakras01@gmail.com'
);

-- Yöntem 3: Username ile güncelleme (alternatif)
UPDATE user_profiles 
SET 
  role = 'admin', 
  is_admin = true,
  updated_at = NOW()
WHERE username = 'ftnakras01';

-- KONTROL: Güncelleme başarılı mı kontrol et
SELECT 
  up.id,
  au.email,
  up.username,
  up.full_name,
  up.role,
  up.is_admin,
  up.is_developer,
  CASE 
    WHEN up.role = 'admin' OR up.is_admin = true THEN '✅ ADMIN'
    WHEN up.is_developer = true THEN '👨‍💻 DEVELOPER'
    ELSE '👤 USER'
  END as user_type,
  up.updated_at
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE up.username = 'ftnakras01' 
   OR au.email = 'ftnakras01@gmail.com'
   OR up.id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';

