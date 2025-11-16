-- ============================================
-- ERROR LOGS MIGRATION
-- ============================================
-- Creates error logging infrastructure
-- Enables comprehensive error tracking
-- ============================================

-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  stack TEXT,
  level VARCHAR(20) NOT NULL CHECK (level IN ('error', 'warning', 'info', 'debug')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('auth', 'database', 'api', 'ui', 'performance', 'security', 'unknown')),
  
  -- User context
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  
  -- Request context
  url TEXT,
  user_agent TEXT,
  session_id VARCHAR(100),
  
  -- Application context
  build_version VARCHAR(50),
  environment VARCHAR(20) DEFAULT 'production',
  
  -- Additional data (JSON)
  additional_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_level ON error_logs(level);
CREATE INDEX IF NOT EXISTS idx_error_logs_category ON error_logs(category);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_error_logs_environment ON error_logs(environment);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_error_logs_level_category_created 
ON error_logs(level, category, created_at DESC);

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read error logs
CREATE POLICY "error_logs_admin_read"
ON error_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR is_admin = true)
  )
);

-- System can insert error logs (via service role)
CREATE POLICY "error_logs_system_insert"
ON error_logs FOR INSERT
WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON error_logs TO authenticated;
GRANT INSERT ON error_logs TO anon, authenticated;

-- Create function to clean old error logs (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete error logs older than 90 days
  DELETE FROM error_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log the cleanup
  INSERT INTO error_logs (message, level, category, environment, additional_data)
  VALUES (
    'Cleaned up old error logs',
    'info',
    'unknown',
    'system',
    jsonb_build_object('deleted_count', deleted_count)
  );
  
  RETURN deleted_count;
END;
$$;

-- Create function to get error statistics
CREATE OR REPLACE FUNCTION get_error_statistics(
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '7 days',
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  level VARCHAR(20),
  category VARCHAR(50),
  count BIGINT,
  latest_occurrence TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    el.level,
    el.category,
    COUNT(*) as count,
    MAX(el.created_at) as latest_occurrence
  FROM error_logs el
  WHERE el.created_at BETWEEN p_start_date AND p_end_date
  GROUP BY el.level, el.category
  ORDER BY count DESC, latest_occurrence DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION cleanup_old_error_logs() TO authenticated;
GRANT EXECUTE ON FUNCTION get_error_statistics(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO authenticated;

-- Create view for error summary (admin only)
CREATE OR REPLACE VIEW error_summary AS
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  level,
  category,
  COUNT(*) as error_count,
  COUNT(DISTINCT user_id) as affected_users,
  COUNT(DISTINCT session_id) as affected_sessions
FROM error_logs
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at), level, category
ORDER BY hour DESC, error_count DESC;

-- Grant view access to admins only
GRANT SELECT ON error_summary TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "error_summary_admin_read"
ON error_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND (role = 'admin' OR is_admin = true)
  )
);

-- Update table statistics
ANALYZE error_logs;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if table was created
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'error_logs'
-- ORDER BY ordinal_position;

-- Check indexes
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'error_logs';

-- Test error statistics function
-- SELECT * FROM get_error_statistics();

-- Test cleanup function (dry run)
-- SELECT cleanup_old_error_logs();
