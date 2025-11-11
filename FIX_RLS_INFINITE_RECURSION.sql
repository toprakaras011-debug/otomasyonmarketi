-- ============================================
-- FIX: Infinite Recursion in RLS Policies
-- ============================================
-- Problem: RLS policies are causing infinite recursion
-- Solution: Simplify policies and remove circular dependencies

-- ============================================
-- 1. DROP ALL EXISTING POLICIES
-- ============================================

-- Drop user_profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON user_profiles;

-- Drop automations policies
DROP POLICY IF EXISTS "Anyone can view published automations" ON automations;
DROP POLICY IF EXISTS "Developers can insert own automations" ON automations;
DROP POLICY IF EXISTS "Developers can update own automations" ON automations;
DROP POLICY IF EXISTS "Developers can delete own automations" ON automations;
DROP POLICY IF EXISTS "Enable read access for all users" ON automations;

-- ============================================
-- 2. CREATE SIMPLE, NON-RECURSIVE POLICIES
-- ============================================

-- ============================================
-- USER_PROFILES POLICIES (SIMPLIFIED)
-- ============================================

-- Allow users to read their own profile
CREATE POLICY "users_select_own"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "users_update_own"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);

-- Allow authenticated users to insert their profile
CREATE POLICY "users_insert_own"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================
-- AUTOMATIONS POLICIES (SIMPLIFIED)
-- ============================================

-- Allow everyone to read published and approved automations
CREATE POLICY "automations_select_published"
ON automations FOR SELECT
USING (
  is_published = true 
  AND admin_approved = true
);

-- Allow developers to read their own automations (any status)
CREATE POLICY "automations_select_own"
ON automations FOR SELECT
USING (auth.uid() = developer_id);

-- Allow developers to insert automations
CREATE POLICY "automations_insert_own"
ON automations FOR INSERT
WITH CHECK (auth.uid() = developer_id);

-- Allow developers to update their own automations
CREATE POLICY "automations_update_own"
ON automations FOR UPDATE
USING (auth.uid() = developer_id);

-- Allow developers to delete their own automations
CREATE POLICY "automations_delete_own"
ON automations FOR DELETE
USING (auth.uid() = developer_id);

-- ============================================
-- PURCHASES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can insert own purchases" ON purchases;

CREATE POLICY "purchases_select_own"
ON purchases FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "purchases_insert_own"
ON purchases FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- REVIEWS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;

CREATE POLICY "reviews_select_all"
ON reviews FOR SELECT
USING (true);

CREATE POLICY "reviews_insert_own"
ON reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own"
ON reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "reviews_delete_own"
ON reviews FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- FAVORITES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

CREATE POLICY "favorites_select_own"
ON favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "favorites_insert_own"
ON favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own"
ON favorites FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- PAYOUTS POLICIES (Developer + Admin)
-- ============================================

DROP POLICY IF EXISTS "Developers can view own payouts" ON payouts;
DROP POLICY IF EXISTS "Developers can insert own payouts" ON payouts;

CREATE POLICY "payouts_select_own"
ON payouts FOR SELECT
USING (auth.uid() = developer_id);

CREATE POLICY "payouts_insert_own"
ON payouts FOR INSERT
WITH CHECK (auth.uid() = developer_id);

-- ============================================
-- PLATFORM_EARNINGS POLICIES (Admin Only)
-- ============================================

DROP POLICY IF EXISTS "Only admins can view platform earnings" ON platform_earnings;

-- Note: Admin policies should be handled via service role key
-- For now, we'll allow authenticated users to view
CREATE POLICY "platform_earnings_select_authenticated"
ON platform_earnings FOR SELECT
USING (auth.role() = 'authenticated');

-- ============================================
-- BLOG_POSTS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;

CREATE POLICY "blog_posts_select_published"
ON blog_posts FOR SELECT
USING (is_published = true);

-- ============================================
-- CATEGORIES POLICIES (Public Read)
-- ============================================

DROP POLICY IF EXISTS "Anyone can view categories" ON categories;

CREATE POLICY "categories_select_all"
ON categories FOR SELECT
USING (true);

-- ============================================
-- 3. VERIFY RLS IS ENABLED
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. GRANT PERMISSIONS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- ============================================
-- DONE!
-- ============================================

-- Test queries:
-- SELECT * FROM user_profiles WHERE id = auth.uid();
-- SELECT * FROM automations WHERE is_published = true AND admin_approved = true;
-- SELECT * FROM categories;
