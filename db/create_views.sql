
-- Create view for students data
CREATE OR REPLACE VIEW public.students_view AS
SELECT 
  s.id,
  s.user_id,
  u.email,
  u.full_name,
  s.enrollment_number,
  s.date_of_birth,
  s.enrollment_date,
  s.enrollment_status,
  s.contact_number,
  s.address,
  s.fee_status,
  s.created_at,
  s.guardian_name,
  s.guardian_contact,
  s.total_fees_due,
  s.total_fees_paid
FROM 
  students s
JOIN 
  users u ON s.user_id = u.id
ORDER BY 
  s.created_at DESC;

-- Create view for teachers data
CREATE OR REPLACE VIEW public.teachers_view AS
SELECT 
  t.id,
  t.user_id,
  u.email,
  u.full_name,
  t.employee_id,
  t.department,
  t.specialization,
  t.qualification,
  t.joining_date,
  t.contact_number,
  t.created_at
FROM 
  teachers t
JOIN 
  users u ON t.user_id = u.id
ORDER BY 
  t.created_at DESC;

-- Create view for admin dashboard stats
CREATE OR REPLACE VIEW public.admin_dashboard_stats_view AS
SELECT
  (SELECT COUNT(*) FROM students)::INTEGER AS total_students,
  (SELECT COUNT(*) FROM teachers)::INTEGER AS total_teachers,
  (SELECT COUNT(*) FROM courses WHERE is_active = TRUE)::INTEGER AS active_courses,
  (SELECT COUNT(*) FROM student_course_enrollments WHERE status = 'pending')::INTEGER AS pending_enrollments,
  (SELECT COUNT(*) FROM academic_sessions WHERE start_date > CURRENT_DATE)::INTEGER AS upcoming_exams,
  (SELECT COALESCE(SUM(amount), 0) FROM payment_transactions 
   WHERE status = 'completed' AND payment_date > CURRENT_DATE - INTERVAL '30 days')::NUMERIC AS recent_fee_collections;
