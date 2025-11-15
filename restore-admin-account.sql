-- Restore Admin Account for ftnakras01@gmail.com
-- Run this in Supabase SQL Editor

-- Step 1: Check if user exists in auth.users
DO $$
DECLARE
  user_id UUID;
  user_email TEXT := 'ftnakras01@gmail.com';
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE NOTICE 'User % does not exist in auth.users. You need to recreate the user first.', user_email;
    RETURN;
  END IF;
  
  RAISE NOTICE 'Found user ID: %', user_id;
  
  -- Step 2: Ensure profile exists
  INSERT INTO user_profiles (id, username, email, role, is_admin, is_developer, developer_approved, created_at, updated_at)
  VALUES (
    user_id,
    'ftnakras01',
    user_email,
    'admin',
    true,
    true,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    is_admin = true,
    is_developer = true,
    developer_approved = true,
    updated_at = NOW();
  
  RAISE NOTICE 'Profile restored/updated for user: %', user_email;
  
  -- Step 3: Verify
  IF EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = user_id AND is_admin = true AND role = 'admin'
  ) THEN
    RAISE NOTICE 'SUCCESS: Admin account restored for %', user_email;
  ELSE
    RAISE EXCEPTION 'Failed to restore admin account';
  END IF;
END $$;

-- Step 4: Verify the restoration
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.username,
  p.role,
  p.is_admin,
  p.is_developer,
  p.developer_approved
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE u.email = 'ftnakras01@gmail.com';

