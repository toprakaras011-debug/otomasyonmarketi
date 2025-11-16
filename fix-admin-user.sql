-- Admin kullanıcıyı düzeltme sorgusu
-- ftnakras01@gmail.com kullanıcısını admin yap

-- Önce kullanıcıyı bul (auth.users tablosundan)
-- Sonra user_profiles tablosunu güncelle

-- Yöntem 1: Email ile user id'yi bulup güncelle
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

-- Yöntem 2: Eğer user id'yi biliyorsanız (daha hızlı)
-- UPDATE user_profiles 
-- SET role = 'admin', is_admin = true, updated_at = NOW()
-- WHERE id = 'USER_ID_BURAYA';

-- Kontrol et - Email ile user_profiles'i kontrol et
SELECT 
  up.id,
  au.email,
  up.username,
  up.role,
  up.is_admin,
  up.created_at,
  up.updated_at
FROM user_profiles up
INNER JOIN auth.users au ON up.id = au.id
WHERE au.email = 'ftnakras01@gmail.com';

-- Alternatif: Tüm admin kullanıcıları listele
SELECT 
  up.id,
  au.email,
  up.username,
  up.role,
  up.is_admin
FROM user_profiles up
INNER JOIN auth.users au ON up.id = au.id
WHERE up.role = 'admin' OR up.is_admin = true;

