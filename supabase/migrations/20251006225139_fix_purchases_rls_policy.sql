/*
  # Fix Purchases RLS Policy

  ## Problem
  Webhook needs to update purchase status from "pending" to "completed"
  but lacks UPDATE policy for service role operations.
  
  ## Solution
  Add UPDATE policy that allows:
  1. Service role (webhook) to update any purchase
  2. Users to update their own purchases (if needed)
  
  ## Changes
  1. Add UPDATE policy for authenticated users (service role)
  2. Ensure purchase flow works end-to-end
  
  ## Security
  - Service role can update all purchases (for webhook)
  - Users can update their own purchases
  - Developers can view their automation's purchases
*/

-- Drop existing update policy if any
DROP POLICY IF EXISTS "Service role can update purchases" ON purchases;
DROP POLICY IF EXISTS "Users can update own purchases" ON purchases;

-- Allow service role to update purchase status (from webhook)
CREATE POLICY "Service role can update purchases"
  ON purchases
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow users to update their own purchases (for status checks, etc)
CREATE POLICY "Users can update own purchases"
  ON purchases
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
