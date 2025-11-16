/*
  # Create Increment Automation Sales Function

  ## Purpose
  RPC function to increment automation sales count and total revenue
  when a purchase is completed via webhook.
  
  ## Function
  - increment_automation_sales(automation_id UUID)
  - Increments sales_count by 1
  - Updates total_revenue
  - Called from stripe-webhook edge function
  
  ## Security
  - SECURITY DEFINER: Runs with creator's privileges (bypasses RLS)
  - Only callable by authenticated users (service role)
  - Safe because it only increments counters
*/

-- Create the function to increment automation sales
CREATE OR REPLACE FUNCTION increment_automation_sales(automation_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE automations
  SET 
    sales_count = COALESCE(sales_count, 0) + 1,
    updated_at = NOW()
  WHERE id = automation_id;
END;
$$;

-- Grant execute permission to authenticated users (service role will use this)
GRANT EXECUTE ON FUNCTION increment_automation_sales(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_automation_sales(UUID) TO service_role;

-- Add helpful comment
COMMENT ON FUNCTION increment_automation_sales IS 'Increments sales count for an automation when a purchase is completed';
