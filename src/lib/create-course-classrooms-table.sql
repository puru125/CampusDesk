
-- Create the course_classrooms table
CREATE TABLE IF NOT EXISTS public.course_classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  classroom_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subject_id, classroom_id)
);

-- Add some dummy data
INSERT INTO public.classes (name, room, capacity)
VALUES 
  ('Chemistry Lab', 'C101', 35),
  ('Physics Laboratory', 'P201', 30),
  ('Computer Science Lab', 'CS301', 40),
  ('Mathematics Room', 'M101', 50),
  ('Biology Lab', 'B102', 25)
ON CONFLICT DO NOTHING;
