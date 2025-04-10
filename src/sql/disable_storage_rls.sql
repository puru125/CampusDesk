
-- Disable RLS for storage.objects table (assignments bucket)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Create a storage bucket for assignments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignments', 'assignments', true)
ON CONFLICT (id) DO NOTHING;
