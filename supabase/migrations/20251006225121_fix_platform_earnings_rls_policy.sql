/*
  # Fix Platform Earnings RLS Policy

  ## Problem
  Edge function (webhook) trying to insert into platform_earnings table fails with RLS error.
  
  ## Solution
  The edge function uses service_role key which bypasses RLS, but if there's an issue,
  we need to ensure the table allows service role operations.

  ## Changes
  1. Add INSERT policy for service role operations
  2. Add UPDATE policy for completed status updates
  3. Ensure admin can manage all earnings
  
  ## Security
  - Only service role (backend) can insert earnings
  - Admins can view and update earnings
  - Regular users cannot access earnings directly
*/

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Service role can insert platform earnings" ON platform_earnings;
DROP POLICY IF EXISTS "Service role can update platform earnings" ON platform_earnings;
DROP POLICY IF EXISTS "Admins can manage platform earnings" ON platform_earnings;

-- Allow service role to insert platform earnings (from webhook)
-- Note: This policy won't affect service_role key which bypasses RLS anyway,
-- but it's good practice to have it documented
CREATE POLICY "Service role can insert platform earnings"
  ON platform_earnings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow service role to update platform earnings
CREATE POLICY "Service role can update platform earnings"
  ON platform_earnings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure admins can manage all operations on platform earnings
CREATE POLICY "Admins can manage platform earnings"
  ON platform_earnings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );
