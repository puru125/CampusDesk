
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  is_first_login?: boolean;
}

export interface Student {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  gender: string;
  address: string;
  phone_number: string;
  enrollment_date: string;
  course_id: string;
  guardian_name: string;
  guardian_email: string;
  guardian_phone_number: string;
  is_active: boolean;
}

export interface Teacher {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  gender: string;
  address: string;
  phone_number: string;
  hire_date: string;
  subject_expertise: string;
  is_active: boolean;
}

export interface Course {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  code: string | null;
  description: string | null;
  credits: number;
  is_active: boolean;
  subjects?: Subject[];
  duration?: string;
  department_id?: string;
}

export interface Subject {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  code: string;
  description: string | null;
  credits: number;
  course_id: string;
  teacher_id?: string | null;
  course?: { id: string; name: string };
}

export interface Classroom {
  id: string;
  name: string;
  room: string;
  capacity: number;
  created_at: string;
  updated_at: string;
}

export interface CourseClassroom {
  id: string;
  course_id: string;
  subject_id: string;
  classroom_id: string;
  created_at: string;
  updated_at: string;
  subject_name?: string;
  classroom_name?: string;
  classroom_room?: string;
  classroom_capacity?: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type UserRole = 'admin' | 'teacher' | 'student';

export interface TeacherView {
  id: string;
  email: string;
  full_name: string;
  contact_number: string | null;
  department: string | null;
  qualification: string | null;
  specialization: string | null;
  joining_date: string | null;
  employee_id: string | null;
  created_at: string | null;
  user_id: string | null;
}

export interface StudentView {
  id: string;
  email: string;
  full_name: string;
  enrollment_number: string | null;
  contact_number: string | null;
  date_of_birth: string | null;
  address: string | null;
  guardian_name: string | null;
  guardian_contact: string | null;
  enrollment_status: string | null;
  enrollment_date: string | null;
  fee_status: string | null;
  total_fees_due: number | null;
  total_fees_paid: number | null;
  created_at: string | null;
  user_id: string | null;
}

export interface Class {
  id: string;
  name: string;
  room: string;
  capacity: number;
  created_at: string;
  updated_at: string;
}

export interface TimetableEntry {
  id: string;
  subject_id: string;
  teacher_id: string;
  class_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  subject?: Subject;
  teacher?: TeacherView;
  class?: Class;
}

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  subject_id: string | null;
  exam_date: string;
  start_time: string;
  end_time: string;
  max_marks: number;
  passing_marks: number;
  room: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  target_role: string;
  created_by: string | null;
  created_by_name?: string | null;
}

export interface AdminProfile {
  id: string;
  contact_number: string | null;
  department: string | null;
  designation: string | null;
  created_at: string;
  updated_at: string;
}

export interface Stats {
  total_students: number;
  total_teachers: number;
  active_courses: number;
  pending_enrollments: number;
  upcoming_exams: number;
  recent_fee_collections: number;
}

export interface DashboardStatsView {
  total_students: number | null;
  total_teachers: number | null;
  active_courses: number | null;
  pending_enrollments: number | null;
  upcoming_exams: number | null;
  recent_fee_collections: number | null;
}

// Defining the types for course classroom management
export interface AssignedClassroom {
  id: string;
  subject_id: string;
  classroom_id: string;
  subject_name?: string;
  classroom_name?: string;
  classroom_room?: string;
  classroom_capacity?: number;
}
