-- Voting Formatur PC IPM Wirobrajan - Database Schema (Multi-Tenant)

-- Drop existing tables to recreate (CAUTION: DATA LOSS)
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS voters CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS elections CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- 1. Elections Table
CREATE TABLE IF NOT EXISTS elections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_result_published BOOLEAN DEFAULT FALSE
);

-- 2. Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  asal_pimpinan TEXT NOT NULL,
  vision TEXT,
  mission TEXT,
  photo_url TEXT,
  order_number INTEGER
);

-- 3. Voters Table
CREATE TABLE IF NOT EXISTS voters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  is_voted BOOLEAN DEFAULT FALSE
);

-- 4. Votes Table
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES voters(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE
);

-- 5. Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'admin', -- 'superadmin' or 'admin'
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE
);

-- Insert Default Super Admin
INSERT INTO admins (username, password, role) 
VALUES ('superadmin', 'musycab123', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- 6. Storage Buckets (For Candidate Photos)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true) 
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Recreate Policies

-- Elections
CREATE POLICY "Public elections are viewable by everyone." ON elections FOR SELECT USING (true);
CREATE POLICY "Allow anon insert for elections" ON elections FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update for elections" ON elections FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete for elections" ON elections FOR DELETE USING (true);

-- Candidates
CREATE POLICY "Public profiles are viewable by everyone." ON candidates FOR SELECT USING (true);
CREATE POLICY "Allow anon insert for candidates" ON candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update for candidates" ON candidates FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete for candidates" ON candidates FOR DELETE USING (true);

-- Voters
CREATE POLICY "Allow anon select for voters" ON voters FOR SELECT USING (true);
CREATE POLICY "Allow anon insert for voters" ON voters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update for voters" ON voters FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete for voters" ON voters FOR DELETE USING (true);

-- Votes
CREATE POLICY "Allow anon insert for votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon select for votes" ON votes FOR SELECT USING (true);

-- Admins
CREATE POLICY "Allow anon select for admin auth" ON admins FOR SELECT USING (true);
CREATE POLICY "Allow anon insert for admin" ON admins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon update for admin" ON admins FOR UPDATE USING (true);
CREATE POLICY "Allow anon delete for admin" ON admins FOR DELETE USING (true);

-- Storage Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');
CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'photos');
CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'photos');