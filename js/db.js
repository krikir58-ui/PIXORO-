-- profiles table la add pannu da
ALTER TABLE profiles ADD COLUMN is_private_account BOOLEAN DEFAULT false;

-- follow_requests table
CREATE TABLE follow_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_id UUID REFERENCES profiles(id),
  to_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
