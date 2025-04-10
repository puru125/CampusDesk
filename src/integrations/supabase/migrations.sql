
-- Create teacher_classes table
CREATE TABLE IF NOT EXISTS teacher_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  class_id UUID NOT NULL REFERENCES classes(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(teacher_id, class_id)
);

-- Create teacher_messages table
CREATE TABLE IF NOT EXISTS teacher_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id),
  student_id UUID NOT NULL REFERENCES students(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add realtime capability for notifications
ALTER TABLE student_notifications REPLICA IDENTITY FULL;
ALTER TABLE teacher_notifications REPLICA IDENTITY FULL;
ALTER TABLE admin_notifications REPLICA IDENTITY FULL;

-- Add realtime capability for messages
ALTER TABLE teacher_messages REPLICA IDENTITY FULL;
