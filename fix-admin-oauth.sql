-- Fix admin role for ftnakras01@gmail.com
-- This script updates the user_profiles table to set admin role
-- Run this in Supabase SQL Editor

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

-- Step 2: Update admin role (if user exists)
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

-- Step 3: If profile doesn't exist, create it
INSERT INTO user_profiles (id, username, role, is_admin, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(
    LOWER(REGEXP_REPLACE(au.email, '[^a-z0-9]', '-', 'g')),
    'admin-' || SUBSTRING(au.id::text, 1, 8)
  ) as username,
  'admin' as role,
  true as is_admin,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
WHERE au.email = 'ftnakras01@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = au.id
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

