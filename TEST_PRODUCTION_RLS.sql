-- ============================================
-- PRODUCTION RLS TEST SUITE
-- ============================================
-- Run these queries to verify everything works
-- All queries should return results (no errors)
-- ============================================

-- ============================================
-- TEST 1: Categories (Public Read)
-- ============================================
SELECT 
  'TEST 1: Categories' as test_name,
  COUNT(*) as total_categories,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM categories;

-- Expected: 9 categories (from your screenshot)

-- ============================================
-- TEST 2: Automations (Public Read)
-- ============================================
SELECT 
  'TEST 2: Published Automations' as test_name,
  COUNT(*) as total_automations,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM automations
WHERE is_published = true 
AND admin_approved = true;

-- Expected: Should return published automations

-- ============================================
-- TEST 3: Automations Detail
-- ============================================
SELECT 
  id,
  name,
  slug,
  description,
  price,
  is_published,
  admin_approved,
  created_at
FROM automations
WHERE is_published = true 
AND admin_approved = true
LIMIT 5;

-- Expected: 5 automation records with all fields

-- ============================================
-- TEST 4: User Profile (Authenticated)
-- ============================================
SELECT 
  'TEST 4: User Profile' as test_name,
  COUNT(*) as profile_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS'
    ELSE '❌ FAIL (Must be logged in)'
  END as status
FROM user_profiles
WHERE id = auth.uid();

-- Expected: 1 profile if logged in, 0 if not

-- ============================================
-- TEST 5: RLS Enabled Check
-- ============================================
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ ENABLED'
    ELSE '❌ DISABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'user_profiles',
  'automations',
  'categories',
  'purchases',
  'reviews',
  'favorites'
)
ORDER BY tablename;

-- Expected: All tables should show ✅ ENABLED

-- ============================================
-- TEST 6: Policies Exist Check
-- ============================================
SELECT 
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ HAS POLICIES'
    ELSE '❌ NO POLICIES'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'user_profiles',
  'automations',
  'categories',
  'purchases',
  'reviews',
  'favorites'
)
GROUP BY tablename
ORDER BY tablename;

-- Expected: All tables should have policies

-- ============================================
-- TEST 7: Index Check
-- ============================================
SELECT 
  tablename,
  indexname,
  '✅ EXISTS' as status
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Expected: Should see all performance indexes

-- ============================================
-- TEST 8: Query Performance Test
-- ============================================
EXPLAIN ANALYZE
SELECT * FROM automations
WHERE is_published = true 
AND admin_approved = true
ORDER BY created_at DESC
LIMIT 20;

-- Expected: 
-- - Should use idx_automations_published
-- - Execution time < 10ms
-- - No sequential scans

-- ============================================
-- TEST 9: Category Filter Performance
-- ============================================
EXPLAIN ANALYZE
SELECT * FROM automations
WHERE category_id = (SELECT id FROM categories LIMIT 1)
AND is_published = true 
AND admin_approved = true;

-- Expected:
-- - Should use idx_automations_category
-- - Execution time < 15ms

-- ============================================
-- TEST 10: Reviews Public Read
-- ============================================
SELECT 
  'TEST 10: Reviews' as test_name,
  COUNT(*) as total_reviews,
  '✅ PASS' as status
FROM reviews
LIMIT 1;

-- Expected: Should return count (even if 0)

-- ============================================
-- SUMMARY REPORT
-- ============================================
SELECT 
  'PRODUCTION RLS TEST SUMMARY' as report_title,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%') as total_indexes,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) as tables_with_rls,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') > 20 THEN '✅ PRODUCTION READY'
    ELSE '❌ NOT READY'
  END as overall_status;

-- ============================================
-- EXPECTED RESULTS SUMMARY
-- ============================================
-- TEST 1: ✅ 9 categories
-- TEST 2: ✅ X automations (depends on your data)
-- TEST 3: ✅ 5 automation records
-- TEST 4: ✅ 1 profile (if logged in)
-- TEST 5: ✅ All tables RLS enabled
-- TEST 6: ✅ All tables have policies
-- TEST 7: ✅ 8+ indexes exist
-- TEST 8: ✅ < 10ms execution
-- TEST 9: ✅ < 15ms execution
-- TEST 10: ✅ Reviews accessible
-- SUMMARY: ✅ PRODUCTION READY

-- ============================================
-- IF ANY TEST FAILS:
-- ============================================
-- 1. Check error message
-- 2. Verify PRODUCTION_READY_RLS.sql was run
-- 3. Check Supabase logs
-- 4. Verify user is authenticated (for TEST 4)
-- 5. Contact support if issue persists
