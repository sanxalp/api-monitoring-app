-- Add user_id column to endpoints table
ALTER TABLE endpoints ADD COLUMN user_id UUID NOT NULL DEFAULT auth.uid();

-- Add foreign key constraint to auth.users
ALTER TABLE endpoints ADD CONSTRAINT endpoints_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index on user_id for faster queries
CREATE INDEX idx_endpoints_user_id ON endpoints(user_id);

-- Update RLS policies to ensure users can only see their own endpoints
DROP POLICY "Allow public to view endpoints" ON endpoints;
DROP POLICY "Allow public to create endpoints" ON endpoints;
DROP POLICY "Allow public to delete endpoints" ON endpoints;
DROP POLICY "Allow public to update endpoints" ON endpoints;

CREATE POLICY "Allow users to view own endpoints" ON endpoints
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to create own endpoints" ON endpoints
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own endpoints" ON endpoints
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own endpoints" ON endpoints
  FOR DELETE USING (auth.uid() = user_id);
