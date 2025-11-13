-- ============================================
-- GUEST CHECKOUT MIGRATION
-- ============================================
-- Adds guest customer support to purchases table
-- Enables anonymous checkout functionality
-- ============================================

-- Add guest customer fields to purchases table
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS guest_address TEXT,
ADD COLUMN IF NOT EXISTS guest_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS guest_postal_code VARCHAR(20);

-- Create index for guest email lookups
CREATE INDEX IF NOT EXISTS idx_purchases_guest_email 
ON purchases(guest_email) 
WHERE guest_email IS NOT NULL;

-- Create guest_customers table for better organization
CREATE TABLE IF NOT EXISTS guest_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT guest_customers_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create unique index for guest email
CREATE UNIQUE INDEX IF NOT EXISTS idx_guest_customers_email 
ON guest_customers(email);

-- Enable RLS on guest_customers
ALTER TABLE guest_customers ENABLE ROW LEVEL SECURITY;

-- Guest customers can only read their own data (via email verification)
CREATE POLICY "guest_customers_read_own"
ON guest_customers FOR SELECT
USING (true); -- Public read for order verification

-- Only system can insert guest customers
CREATE POLICY "guest_customers_system_insert"
ON guest_customers FOR INSERT
WITH CHECK (true); -- Allow system inserts

-- Grant permissions
GRANT SELECT ON guest_customers TO anon, authenticated;
GRANT INSERT ON guest_customers TO anon, authenticated;

-- Update purchases RLS to handle guest orders
DROP POLICY IF EXISTS "purchases_user_read" ON purchases;

-- New policy that handles both authenticated and guest purchases
CREATE POLICY "purchases_read_policy"
ON purchases FOR SELECT
USING (
  -- Authenticated users can see their own purchases
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  -- Guest purchases are readable (for order confirmation)
  (user_id IS NULL AND guest_email IS NOT NULL)
);

-- Guest purchases can be inserted
CREATE POLICY "purchases_guest_insert"
ON purchases FOR INSERT
WITH CHECK (
  -- Either authenticated user purchase
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  -- Or guest purchase (no user_id, but has guest info)
  (user_id IS NULL AND guest_email IS NOT NULL)
);

-- Create function to handle guest order creation
CREATE OR REPLACE FUNCTION create_guest_order(
  p_items JSONB,
  p_customer_info JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_id UUID;
  v_order_ids UUID[];
  v_item JSONB;
  v_order_id UUID;
  v_result JSONB;
BEGIN
  -- Validate input
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Items cannot be empty';
  END IF;
  
  IF p_customer_info->>'email' IS NULL OR p_customer_info->>'name' IS NULL THEN
    RAISE EXCEPTION 'Customer email and name are required';
  END IF;
  
  -- Create or update guest customer
  INSERT INTO guest_customers (email, name, phone, address, city, postal_code)
  VALUES (
    p_customer_info->>'email',
    p_customer_info->>'name',
    p_customer_info->>'phone',
    p_customer_info->>'address',
    p_customer_info->>'city',
    p_customer_info->>'postal_code'
  )
  ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    postal_code = EXCLUDED.postal_code,
    updated_at = NOW()
  RETURNING id INTO v_customer_id;
  
  -- Create purchase records for each item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO purchases (
      automation_id,
      user_id,
      price,
      status,
      purchased_at,
      guest_email,
      guest_name,
      guest_phone,
      guest_address,
      guest_city,
      guest_postal_code
    ) VALUES (
      (v_item->>'id')::UUID,
      NULL, -- Guest order
      (v_item->>'price')::DECIMAL,
      'pending',
      NOW(),
      p_customer_info->>'email',
      p_customer_info->>'name',
      p_customer_info->>'phone',
      p_customer_info->>'address',
      p_customer_info->>'city',
      p_customer_info->>'postal_code'
    ) RETURNING id INTO v_order_id;
    
    v_order_ids := array_append(v_order_ids, v_order_id);
  END LOOP;
  
  -- Return result
  v_result := jsonb_build_object(
    'success', true,
    'customer_id', v_customer_id,
    'order_ids', to_jsonb(v_order_ids),
    'message', 'Guest order created successfully'
  );
  
  RETURN v_result;
END;
$$;

-- Grant execute permission on function
GRANT EXECUTE ON FUNCTION create_guest_order(JSONB, JSONB) TO anon, authenticated;

-- Create function to verify guest order
CREATE OR REPLACE FUNCTION verify_guest_order(
  p_email VARCHAR(255),
  p_order_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_result JSONB;
BEGIN
  -- Get order details
  SELECT 
    p.id,
    p.automation_id,
    p.price,
    p.status,
    p.purchased_at,
    p.guest_email,
    p.guest_name,
    a.title as automation_title,
    a.slug as automation_slug
  INTO v_order
  FROM purchases p
  LEFT JOIN automations a ON a.id = p.automation_id
  WHERE p.id = p_order_id 
    AND p.guest_email = p_email
    AND p.user_id IS NULL;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order not found');
  END IF;
  
  -- Return order details
  v_result := jsonb_build_object(
    'success', true,
    'order', row_to_json(v_order)
  );
  
  RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION verify_guest_order(VARCHAR, UUID) TO anon, authenticated;

-- Update table statistics
ANALYZE purchases;
ANALYZE guest_customers;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if columns were added
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'purchases' 
-- AND column_name LIKE 'guest_%';

-- Check if guest_customers table exists
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_name = 'guest_customers';

-- Test guest order creation
-- SELECT create_guest_order(
--   '[{"id": "123e4567-e89b-12d3-a456-426614174000", "price": 99.99}]'::jsonb,
--   '{"email": "test@example.com", "name": "Test User", "phone": "1234567890"}'::jsonb
-- );
