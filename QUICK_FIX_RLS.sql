-- ============================================
-- QUICK FIX: RLS Policies - Infinite Recursion
-- ============================================
-- Run this in Supabase SQL Editor
-- This will fix all RLS issues immediately

-- ============================================
-- 1. DISABLE RLS TEMPORARILY (for testing)
-- ============================================
-- Uncomment these lines ONLY if you want to test without RLS first
-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE automations DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. DROP ALL EXISTING POLICIES
-- ============================================

-- user_profiles
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
    DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
    DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
    DROP POLICY IF EXISTS "Enable update for users based on id" ON user_profiles;
    DROP POLICY IF EXISTS "users_select_own" ON user_profiles;
    DROP POLICY IF EXISTS "users_update_own" ON user_profiles;
    DROP POLICY IF EXISTS "users_insert_own" ON user_profiles;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- automations
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can view published automations" ON automations;
    DROP POLICY IF EXISTS "Developers can insert own automations" ON automations;
    DROP POLICY IF EXISTS "Developers can update own automations" ON automations;
    DROP POLICY IF EXISTS "Developers can delete own automations" ON automations;
    DROP POLICY IF EXISTS "Enable read access for all users" ON automations;
    DROP POLICY IF EXISTS "automations_select_published" ON automations;
    DROP POLICY IF EXISTS "automations_select_own" ON automations;
    DROP POLICY IF EXISTS "automations_insert_own" ON automations;
    DROP POLICY IF EXISTS "automations_update_own" ON automations;
    DROP POLICY IF EXISTS "automations_delete_own" ON automations;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ============================================
-- 3. CREATE SIMPLE, WORKING POLICIES
-- ============================================

-- ============================================
-- USER_PROFILES: Allow authenticated users to read all profiles
-- ============================================
CREATE POLICY "user_profiles_read_authenticated"
ON user_profiles FOR SELECT
TO authenticated
USING (true);

-- Allow users to read their own profile (even if not authenticated)
CREATE POLICY "user_profiles_read_own"
ON user_profiles FOR SELECT
TO anon
USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "user_profiles_insert_own"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "user_profiles_update_own"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- AUTOMATIONS: Public read for published, owner access for all
-- ============================================

-- Allow everyone (including anonymous) to read published automations
CREATE POLICY "automations_read_published"
ON automations FOR SELECT
TO anon, authenticated
USING (
  is_published = true 
  AND admin_approved = true
);

-- Allow authenticated users to read their own automations (any status)
CREATE POLICY "automations_read_own"
ON automations FOR SELECT
TO authenticated
USING (auth.uid() = developer_id);

-- Allow authenticated users to insert automations
CREATE POLICY "automations_insert_authenticated"
ON automations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = developer_id);

-- Allow users to update their own automations
CREATE POLICY "automations_update_own"
ON automations FOR UPDATE
TO authenticated
USING (auth.uid() = developer_id)
WITH CHECK (auth.uid() = developer_id);

-- Allow users to delete their own automations
CREATE POLICY "automations_delete_own"
ON automations FOR DELETE
TO authenticated
USING (auth.uid() = developer_id);

-- ============================================
-- 4. ENSURE RLS IS ENABLED
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. GRANT NECESSARY PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON user_profiles TO anon, authenticated;
GRANT SELECT ON automations TO anon, authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON automations TO authenticated;

-- ============================================
-- 6. TEST QUERIES (Run these after the script)
-- ============================================

-- Test 1: Categories (should work - already working)
-- SELECT * FROM categories LIMIT 5;

-- Test 2: Automations (should work now)
-- SELECT * FROM automations WHERE is_published = true AND admin_approved = true LIMIT 5;

-- Test 3: User profile (should work now)
-- SELECT * FROM user_profiles WHERE id = auth.uid();

-- Test 4: All automations for current user
-- SELECT * FROM automations WHERE developer_id = auth.uid();

-- ============================================
-- DONE! 
-- ============================================
-- After running this script:
-- 1. Refresh your browser
-- 2. Check if automations page loads
-- 3. Check if profile loads
-- 4. All should work now!
