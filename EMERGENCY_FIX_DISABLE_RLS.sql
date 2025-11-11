-- ============================================
-- EMERGENCY FIX: Temporarily Disable RLS
-- ============================================
-- ⚠️ WARNING: This disables security temporarily
-- Use this ONLY for testing to verify RLS is the issue
-- Re-enable RLS after confirming it works!

-- ============================================
-- OPTION 1: Disable RLS (TESTING ONLY)
-- ============================================

ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE automations DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;

-- ============================================
-- After testing, if site works, then RLS was the issue
-- Then run QUICK_FIX_RLS.sql to properly fix policies
-- ============================================

-- ============================================
-- To RE-ENABLE RLS after testing:
-- ============================================
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
