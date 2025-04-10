
-- Create function to get course classroom assignments
CREATE OR REPLACE FUNCTION public.get_course_classroom_assignments(p_course_id UUID)
RETURNS TABLE (
  id UUID,
  subject_id UUID,
  classroom_id UUID,
  subject_name TEXT,
  classroom_name TEXT,
  classroom_room TEXT,
  classroom_capacity INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cc.id,
    cc.subject_id,
    cc.classroom_id,
    s.name AS subject_name,
    c.name AS classroom_name,
    c.room AS classroom_room,
    c.capacity AS classroom_capacity
  FROM 
    public.course_classrooms cc
  JOIN 
    public.subjects s ON cc.subject_id = s.id
  JOIN 
    public.classes c ON cc.classroom_id = c.id
  WHERE 
    cc.course_id = p_course_id;
END;
$$;

-- Create function to create a new course classroom assignment
CREATE OR REPLACE FUNCTION public.create_course_classroom_assignment(
  p_course_id UUID,
  p_subject_id UUID,
  p_classroom_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_assignment_id UUID;
BEGIN
  INSERT INTO public.course_classrooms (
    course_id,
    subject_id,
    classroom_id
  ) VALUES (
    p_course_id,
    p_subject_id,
    p_classroom_id
  )
  RETURNING id INTO v_assignment_id;
  
  RETURN v_assignment_id;
END;
$$;

-- Create function to update an existing course classroom assignment
CREATE OR REPLACE FUNCTION public.update_course_classroom_assignment(
  p_assignment_id UUID,
  p_classroom_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.course_classrooms
  SET 
    classroom_id = p_classroom_id,
    updated_at = NOW()
  WHERE 
    id = p_assignment_id;
    
  RETURN FOUND;
END;
$$;

-- Create function to delete a course classroom assignment
CREATE OR REPLACE FUNCTION public.delete_course_classroom_assignment(
  p_assignment_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.course_classrooms
  WHERE id = p_assignment_id;
  
  RETURN FOUND;
END;
$$;
