-- Add guest checkout fields to purchases table
-- This migration adds support for guest (non-registered) customers

-- Add guest customer fields to purchases table
ALTER TABLE purchases
ADD COLUMN IF NOT EXISTS guest_email TEXT,
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_phone TEXT,
ADD COLUMN IF NOT EXISTS guest_address TEXT;

-- Add index for guest email lookups
CREATE INDEX IF NOT EXISTS idx_purchases_guest_email ON purchases(guest_email) WHERE guest_email IS NOT NULL;

-- Update RLS policies to allow guest purchases
-- Note: You may need to adjust these based on your security requirements

-- Allow inserting purchases with null user_id (for guests)
-- This assumes you already have policies that allow authenticated users
-- You may need to create a separate policy for guest purchases

COMMENT ON COLUMN purchases.guest_email IS 'Email address for guest (non-registered) customers';
COMMENT ON COLUMN purchases.guest_name IS 'Full name for guest customers';
COMMENT ON COLUMN purchases.guest_phone IS 'Phone number for guest customers';
COMMENT ON COLUMN purchases.guest_address IS 'Address for guest customers';

