
-- Create a storage bucket for study materials if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', true)
ON CONFLICT (id) DO NOTHING;

-- Add placeholder policy (since we disabled RLS on the study_materials table)
INSERT INTO storage.policies (name, definition, bucket_id)
VALUES (
  'Public Read Access for Study Materials', 
  '(bucket_id = ''study-materials''::text)',
  'study-materials'
)
ON CONFLICT (name, bucket_id) DO NOTHING;
