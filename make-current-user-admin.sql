-- Mevcut kullanıcıyı admin yapmak için
-- Email adresinizi aşağıdaki sorguda değiştirin

-- 1. Önce kullanıcıyı bulun
SELECT 
  au.id,
  au.email,
  up.username,
  up.role,
  up.is_admin
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'ftnakras01@gmail.com';  -- ⚠️ Email'inizi buraya yazın

-- 2. Kullanıcıyı admin yap
UPDATE user_profiles
SET 
  role = 'admin',
  is_admin = true,
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'ftnakras01@gmail.com'  -- ⚠️ Email'inizi buraya yazın
);

-- 3. Kontrol edin
SELECT 
  au.email,
  up.username,
  up.role,
  up.is_admin,
  up.updated_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'ftnakras01@gmail.com';  -- ⚠️ Email'inizi buraya yazın

