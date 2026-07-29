-- Voting Formatur PC IPM Wirobrajan - Database Schema

-- 1. Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  asal_pimpinan TEXT NOT NULL,
  vision TEXT,
  mission TEXT,
  photo_url TEXT,
  order_number INTEGER
);

-- 2. Voters Table (Data Diri / Authenticated Voters)
CREATE TABLE IF NOT EXISTS voters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  is_voted BOOLEAN DEFAULT FALSE
);

-- 3. Votes Table
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  voter_id UUID REFERENCES voters(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE
);

-- 4. Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- Insert Default Admin User (using ON CONFLICT so it doesn't duplicate if run twice)
INSERT INTO admins (username, password) 
VALUES ('admin', 'musycab123')
ON CONFLICT (username) DO NOTHING;

-- 5. Storage Buckets (For Candidate Photos)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true) 
ON CONFLICT (id) DO NOTHING;

-- 6. Settings Table (For App Config like Publish Result)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Insert Default Settings
INSERT INTO settings (key, value)
VALUES ('publish_result', 'false')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplicates when running multiple times
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON candidates;
DROP POLICY IF EXISTS "Allow anon insert for candidates" ON candidates;
DROP POLICY IF EXISTS "Allow anon update for candidates" ON candidates;
DROP POLICY IF EXISTS "Allow anon delete for candidates" ON candidates;

DROP POLICY IF EXISTS "Allow anon select for voters" ON voters;
DROP POLICY IF EXISTS "Allow anon insert for voters" ON voters;
DROP POLICY IF EXISTS "Allow anon delete for voters" ON voters;

DROP POLICY IF EXISTS "Allow anon insert for votes" ON votes;
DROP POLICY IF EXISTS "Allow anon select for votes" ON votes;

DROP POLICY IF EXISTS "Allow anon select for admin auth" ON admins;

DROP POLICY IF EXISTS "Allow anon select for settings" ON settings;
DROP POLICY IF EXISTS "Allow anon insert for settings" ON settings;
DROP POLICY IF EXISTS "Allow anon update for settings" ON settings;
DROP POLICY IF EXISTS "Allow admin update for settings" ON settings;

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;

-- Recreate Policies

-- Candidates
CREATE POLICY "Public profiles are viewable by everyone."
  ON candidates FOR SELECT
  USING ( true );

CREATE POLICY "Allow anon insert for candidates"
  ON candidates FOR INSERT
  WITH CHECK ( true );

CREATE POLICY "Allow anon update for candidates"
  ON candidates FOR UPDATE
  USING ( true );

CREATE POLICY "Allow anon delete for candidates"
  ON candidates FOR DELETE
  USING ( true );

-- Voters
CREATE POLICY "Allow anon select for voters"
  ON voters FOR SELECT
  USING ( true );

CREATE POLICY "Allow anon insert for voters"
  ON voters FOR INSERT
  WITH CHECK ( true );

CREATE POLICY "Allow anon delete for voters"
  ON voters FOR DELETE
  USING ( true );

-- Votes
CREATE POLICY "Allow anon insert for votes"
  ON votes FOR INSERT
  WITH CHECK ( true );
  
CREATE POLICY "Allow anon select for votes"
  ON votes FOR SELECT
  USING ( true );

-- Admins
CREATE POLICY "Allow anon select for admin auth"
  ON admins FOR SELECT
  USING ( true );

-- Settings
CREATE POLICY "Allow anon select for settings"
  ON settings FOR SELECT
  USING ( true );

CREATE POLICY "Allow anon insert for settings"
  ON settings FOR INSERT
  WITH CHECK ( true );

CREATE POLICY "Allow anon update for settings"
  ON settings FOR UPDATE
  USING ( true );

-- Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');