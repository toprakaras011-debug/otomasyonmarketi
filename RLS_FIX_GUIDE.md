# 🚨 RLS Infinite Recursion Fix Guide

**Problem:** `infinite recursion detected in policy for relation "user_profiles"`  
**Cause:** RLS policies have circular dependencies  
**Impact:** All database queries failing with 500 errors

---

## 🔴 Critical Issue

### Error Messages:
```
infinite recursion detected in policy for relation "user_profiles"
Failed to load resource: the server responded with a status of 500
```

### Affected Tables:
- ✅ `user_profiles` - CRITICAL
- ✅ `automations` - CRITICAL
- ✅ `purchases`
- ✅ `reviews`
- ✅ `favorites`
- ✅ `payouts`
- ✅ `platform_earnings`
- ✅ `blog_posts`
- ✅ `categories`

---

## ✅ Solution

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `kizewqavkosvrwfnbxme`
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Fix Script
1. Open the file: `FIX_RLS_INFINITE_RECURSION.sql`
2. Copy ALL contents
3. Paste into Supabase SQL Editor
4. Click **RUN** button

### Step 3: Verify
Run these test queries:
```sql
-- Test 1: Check user profile
SELECT * FROM user_profiles WHERE id = auth.uid();

-- Test 2: Check automations
SELECT * FROM automations 
WHERE is_published = true 
AND admin_approved = true 
LIMIT 5;

-- Test 3: Check categories
SELECT * FROM categories LIMIT 5;
```

If all queries return results (not errors), the fix is successful! ✅

---

## 🔍 What Was Fixed

### Problem: Circular Dependencies
**Before:**
```sql
-- BAD: Policy references itself
CREATE POLICY "complex_policy" ON user_profiles
USING (
  EXISTS (
    SELECT 1 FROM user_profiles  -- ← Circular reference!
    WHERE id = auth.uid()
  )
);
```

**After:**
```sql
-- GOOD: Simple, direct check
CREATE POLICY "users_select_own" ON user_profiles
USING (auth.uid() = id);  -- ← No circular reference
```

### Key Changes:

#### 1. **Simplified Policies**
- Removed complex subqueries
- Direct `auth.uid()` comparisons
- No table self-references

#### 2. **Clear Naming Convention**
```
{table}_{action}_{scope}

Examples:
- users_select_own
- automations_select_published
- reviews_insert_own
```

#### 3. **Separate Policies for Each Action**
- SELECT (read)
- INSERT (create)
- UPDATE (modify)
- DELETE (remove)

---

## 📋 Policy Summary

### user_profiles
```sql
✅ users_select_own    - Users can read their own profile
✅ users_update_own    - Users can update their own profile
✅ users_insert_own    - Users can create their own profile
```

### automations
```sql
✅ automations_select_published - Everyone can read published automations
✅ automations_select_own       - Developers can read their own automations
✅ automations_insert_own       - Developers can create automations
✅ automations_update_own       - Developers can update their automations
✅ automations_delete_own       - Developers can delete their automations
```

### purchases
```sql
✅ purchases_select_own - Users can read their own purchases
✅ purchases_insert_own - Users can create purchases
```

### reviews
```sql
✅ reviews_select_all   - Everyone can read reviews
✅ reviews_insert_own   - Users can create reviews
✅ reviews_update_own   - Users can update their reviews
✅ reviews_delete_own   - Users can delete their reviews
```

### favorites
```sql
✅ favorites_select_own - Users can read their favorites
✅ favorites_insert_own - Users can add favorites
✅ favorites_delete_own - Users can remove favorites
```

### payouts
```sql
✅ payouts_select_own - Developers can read their payouts
✅ payouts_insert_own - Developers can request payouts
```

### categories
```sql
✅ categories_select_all - Everyone can read categories
```

### blog_posts
```sql
✅ blog_posts_select_published - Everyone can read published posts
```

---

## 🧪 Testing

### Test 1: User Profile
```javascript
// Should work
const { data, error } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', user.id)
  .single();

console.log('Profile:', data);
console.log('Error:', error); // Should be null
```

### Test 2: Automations List
```javascript
// Should work
const { data, error } = await supabase
  .from('automations')
  .select('*')
  .eq('is_published', true)
  .eq('admin_approved', true);

console.log('Automations:', data);
console.log('Error:', error); // Should be null
```

### Test 3: Categories
```javascript
// Should work
const { data, error } = await supabase
  .from('categories')
  .select('*');

console.log('Categories:', data);
console.log('Error:', error); // Should be null
```

---

## 🚨 If Still Not Working

### Check 1: RLS Enabled?
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`

### Check 2: Policies Exist?
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Should see all policies listed above.

### Check 3: User Authenticated?
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User ID:', session?.user?.id);
```

User must be logged in for most operations.

---

## 🔧 Advanced Debugging

### Enable Postgres Logs
1. Supabase Dashboard → Settings → Database
2. Enable "Log Statements"
3. Check logs for detailed error messages

### Test with Service Role Key
```javascript
// Bypass RLS for testing
const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY // ⚠️ Server-side only!
);

const { data, error } = await supabaseAdmin
  .from('user_profiles')
  .select('*');

// If this works, RLS policies are the issue
```

---

## 📊 Before vs After

### Before (Broken)
```
❌ infinite recursion detected
❌ 500 Internal Server Error
❌ No data loading
❌ Site completely broken
```

### After (Fixed)
```
✅ Queries execute successfully
✅ 200 OK responses
✅ Data loads correctly
✅ Site fully functional
```

---

## 🎯 Prevention

### Best Practices:

1. **Keep Policies Simple**
   - Direct comparisons only
   - No subqueries if possible
   - No self-referencing

2. **Test Each Policy**
   - Test immediately after creation
   - Use SQL Editor test queries
   - Check browser console

3. **Use Naming Convention**
   - `{table}_{action}_{scope}`
   - Clear and descriptive
   - Easy to identify

4. **Document Policies**
   - Comment what each policy does
   - Note any special conditions
   - Keep this guide updated

---

## 📞 Support

### If You Need Help:

1. **Check Supabase Logs**
   - Dashboard → Logs → Postgres Logs
   - Look for detailed error messages

2. **Supabase Discord**
   - https://discord.supabase.com
   - #help channel

3. **Supabase Docs**
   - https://supabase.com/docs/guides/auth/row-level-security
   - RLS examples and patterns

---

## ✅ Checklist

After running the fix:

- [ ] SQL script executed successfully
- [ ] No errors in SQL Editor
- [ ] Test queries return data
- [ ] Browser console shows no 500 errors
- [ ] Automations page loads
- [ ] User profile loads
- [ ] Categories page loads
- [ ] All features working

---

**Status:** 🟢 READY TO FIX  
**Estimated Time:** 5 minutes  
**Difficulty:** Easy (just run SQL script)  
**Impact:** CRITICAL (fixes entire site)

---

**Last Updated:** 11 Kasım 2025  
**Version:** 1.0
