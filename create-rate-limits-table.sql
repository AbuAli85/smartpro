-- Create rate_limits table for tracking API rate limits
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups and expiration checks
CREATE INDEX IF NOT EXISTS idx_rate_limits_expires_at ON rate_limits(expires_at);

-- Create function to automatically clean up expired rate limits
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM rate_limits WHERE expires_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run cleanup function periodically
DROP TRIGGER IF EXISTS trigger_cleanup_expired_rate_limits ON rate_limits;
CREATE TRIGGER trigger_cleanup_expired_rate_limits
AFTER INSERT ON rate_limits
EXECUTE PROCEDURE cleanup_expired_rate_limits();

-- Create RLS policies for rate_limits table
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access rate_limits table
CREATE POLICY service_role_policy ON rate_limits
  USING (auth.jwt() ->> 'role' = 'service_role');
