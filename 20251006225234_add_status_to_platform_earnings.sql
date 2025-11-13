/*
  # Add Status Column to Platform Earnings

  ## Problem
  The stripe-webhook function tries to insert a 'status' field
  but the platform_earnings table doesn't have this column.
  
  ## Solution
  Add status column to track earning status.
  
  ## Changes
  1. Add status column (pending, completed, failed, refunded)
  2. Set default to 'completed'
  3. Add check constraint for valid statuses
  
  ## Notes
  - Most earnings will be 'completed' immediately
  - 'pending' for delayed transfers
  - 'failed' for failed transfers
  - 'refunded' for refunded purchases
*/

-- Add status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'platform_earnings' AND column_name = 'status'
  ) THEN
    ALTER TABLE platform_earnings
    ADD COLUMN status TEXT DEFAULT 'completed' NOT NULL;
  END IF;
END $$;

-- Add check constraint for valid status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'platform_earnings' AND constraint_name = 'platform_earnings_status_check'
  ) THEN
    ALTER TABLE platform_earnings
    ADD CONSTRAINT platform_earnings_status_check
    CHECK (status IN ('pending', 'completed', 'failed', 'refunded'));
  END IF;
END $$;

-- Add index on status for filtering
CREATE INDEX IF NOT EXISTS idx_platform_earnings_status
  ON platform_earnings(status);

-- Add helpful comment
COMMENT ON COLUMN platform_earnings.status IS 'Status of the platform earning: pending, completed, failed, or refunded';
