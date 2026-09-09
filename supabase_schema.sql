-- ==============================================================================
-- SKRIP AMAN (TIDAK MENGHAPUS DATA / NON-DESTRUCTIVE)
-- ==============================================================================

-- 1. Elections Table
CREATE TABLE IF NOT EXISTS elections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_result_published BOOLEAN DEFAULT FALSE,
  level TEXT DEFAULT 'Pimpinan Ranting',
  max_selected_formaturs INTEGER DEFAULT 9
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
  role TEXT DEFAULT 'admin',
  election_id UUID REFERENCES elections(id) ON DELETE CASCADE
);

-- Insert Default Super Admin jika belum ada
INSERT INTO admins (username, password, role) 
VALUES ('superadmin', 'musycab123', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- 6. Storage Buckets (Untuk foto kandidat)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true) 
ON CONFLICT (id) DO NOTHING;

-- 7. App Settings Table
CREATE TABLE IF NOT EXISTS app_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  background_type TEXT DEFAULT 'default', -- 'default', 'youtube', or 'image'
  background_value TEXT,
  CHECK (id = 1)
);
INSERT INTO app_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ==============================================================================
-- AKTIFKAN RLS (Hanya mengontrol izin akses, data TIDAK terhapus)
-- ==============================================================================
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- POLICIES (Menggunakan IF NOT EXISTS untuk mencegah error duplikasi)
-- ==============================================================================

-- Elections Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'elections' AND policyname = 'Public elections are viewable by everyone.') THEN
    CREATE POLICY "Public elections are viewable by everyone." ON elections FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'elections' AND policyname = 'Allow anon insert for elections') THEN
    CREATE POLICY "Allow anon insert for elections" ON elections FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'elections' AND policyname = 'Allow anon update for elections') THEN
    CREATE POLICY "Allow anon update for elections" ON elections FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'elections' AND policyname = 'Allow anon delete for elections') THEN
    CREATE POLICY "Allow anon delete for elections" ON elections FOR DELETE USING (true);
  END IF;
END $$;

-- Candidates Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'candidates' AND policyname = 'Public profiles are viewable by everyone.') THEN
    CREATE POLICY "Public profiles are viewable by everyone." ON candidates FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'candidates' AND policyname = 'Allow anon insert for candidates') THEN
    CREATE POLICY "Allow anon insert for candidates" ON candidates FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'candidates' AND policyname = 'Allow anon update for candidates') THEN
    CREATE POLICY "Allow anon update for candidates" ON candidates FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'candidates' AND policyname = 'Allow anon delete for candidates') THEN
    CREATE POLICY "Allow anon delete for candidates" ON candidates FOR DELETE USING (true);
  END IF;
END $$;

-- Voters Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'voters' AND policyname = 'Allow anon select for voters') THEN
    CREATE POLICY "Allow anon select for voters" ON voters FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'voters' AND policyname = 'Allow anon insert for voters') THEN
    CREATE POLICY "Allow anon insert for voters" ON voters FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'voters' AND policyname = 'Allow anon update for voters') THEN
    CREATE POLICY "Allow anon update for voters" ON voters FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'voters' AND policyname = 'Allow anon delete for voters') THEN
    CREATE POLICY "Allow anon delete for voters" ON voters FOR DELETE USING (true);
  END IF;
END $$;

-- Votes Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'votes' AND policyname = 'Allow anon insert for votes') THEN
    CREATE POLICY "Allow anon insert for votes" ON votes FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'votes' AND policyname = 'Allow anon select for votes') THEN
    CREATE POLICY "Allow anon select for votes" ON votes FOR SELECT USING (true);
  END IF;
END $$;

-- Admins Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admins' AND policyname = 'Allow anon select for admin auth') THEN
    CREATE POLICY "Allow anon select for admin auth" ON admins FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admins' AND policyname = 'Allow anon insert for admin') THEN
    CREATE POLICY "Allow anon insert for admin" ON admins FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admins' AND policyname = 'Allow anon update for admin') THEN
    CREATE POLICY "Allow anon update for admin" ON admins FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admins' AND policyname = 'Allow anon delete for admin') THEN
    CREATE POLICY "Allow anon delete for admin" ON admins FOR DELETE USING (true);
  END IF;
END $$;

-- Storage Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access') THEN
    CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Admin Insert') THEN
    CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Admin Update') THEN
    CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE USING (bucket_id = 'photos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Admin Delete') THEN
    CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE USING (bucket_id = 'photos');
  END IF;
END $$;

-- App Settings Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Public can view settings') THEN
    CREATE POLICY "Public can view settings" ON app_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_settings' AND policyname = 'Allow anon update settings') THEN
    CREATE POLICY "Allow anon update settings" ON app_settings FOR UPDATE USING (true);
  END IF;
END $$;