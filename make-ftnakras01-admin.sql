-- Make ftnakras01@gmail.com admin
-- UID: fe1f19d5-b201-4754-a900-88500fa8cc52

-- Step 1: Check current status
SELECT 
  au.id as user_id,
  au.email,
  up.username,
  up.role,
  up.is_admin,
  up.created_at
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'ftnakras01@gmail.com';

-- Step 2: Update admin role (if profile exists)
UPDATE user_profiles
SET 
  role = 'admin',
  is_admin = true,
  updated_at = NOW()
WHERE id = 'fe1f19d5-b201-4754-a900-88500fa8cc52';

-- Step 3: If profile doesn't exist, create it
INSERT INTO user_profiles (id, username, role, is_admin, created_at, updated_at)
SELECT 
  'fe1f19d5-b201-4754-a900-88500fa8cc52' as id,
  'ftnakras01' as username,
  'admin' as role,
  true as is_admin,
  NOW() as created_at,
  NOW() as updated_at
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles WHERE id = 'fe1f19d5-b201-4754-a900-88500fa8cc52'
);

-- Step 4: Verify the update
SELECT 
  au.id as user_id,
  au.email,
  up.username,
  up.role,
  up.is_admin,
  CASE 
    WHEN up.role = 'admin' OR up.is_admin = true THEN '✅ ADMIN - Başarılı!'
    ELSE '❌ Admin değil'
  END as status
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'ftnakras01@gmail.com';

