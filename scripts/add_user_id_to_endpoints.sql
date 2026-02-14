-- Add user_id column to endpoints table (nullable first)
ALTER TABLE endpoints ADD COLUMN IF NOT EXISTS user_id UUID;

-- Delete existing endpoints since they are shared anyway
DELETE FROM health_checks WHERE endpoint_id IN (SELECT id FROM endpoints WHERE user_id IS NULL);
DELETE FROM endpoints WHERE user_id IS NULL;

-- Now make user_id NOT NULL with a default
ALTER TABLE endpoints ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE endpoints ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Add foreign key constraint to auth.users
ALTER TABLE endpoints ADD CONSTRAINT endpoints_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_endpoints_user_id ON endpoints(user_id);

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Allow public to view endpoints" ON endpoints;
DROP POLICY IF EXISTS "Allow public to create endpoints" ON endpoints;
DROP POLICY IF EXISTS "Allow public to delete endpoints" ON endpoints;
DROP POLICY IF EXISTS "Allow public to update endpoints" ON endpoints;

-- Create new RLS policies to ensure users can only see their own endpoints
CREATE POLICY "Allow users to view own endpoints" ON endpoints
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to create own endpoints" ON endpoints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own endpoints" ON endpoints
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own endpoints" ON endpoints
  FOR DELETE USING (auth.uid() = user_id);
