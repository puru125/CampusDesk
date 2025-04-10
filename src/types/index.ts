
export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_first_login: boolean;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  employee_id?: string;
  department?: string;
  specialization?: string;
  qualification?: string;
  joining_date?: string;
  status?: 'active' | 'inactive' | 'on_leave' | string;
  contact_number?: string;
  office_hours?: string;
  availability?: string;
  profile_picture_url?: string;
  resume_url?: string;
  created_at?: string;
  updated_at?: string;
  
  email?: string;
  full_name?: string;
}

export interface Student {
  id: string;
  user_id: string;
  enrollment_number?: string;
  date_of_birth?: string;
  enrollment_date?: string;
  enrollment_status?: 'pending' | 'enrolled' | 'rejected' | string;
  contact_number?: string;
  address?: string;
  guardian_name?: string;
  guardian_contact?: string;
  profile_picture_url?: string;
  fee_status?: 'pending' | 'paid' | 'overdue' | string;
  total_fees_due?: number;
  total_fees_paid?: number;
  last_payment_date?: string;
  created_at?: string;
  updated_at?: string;
  
  email?: string;
  full_name?: string;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  duration: string;
  created_at: string;
  updated_at: string;
  subjects?: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  credits: number;
  course_id: string;
  created_at: string;
  updated_at: string;
  course?: Course;
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
  class_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
  class?: Class;
  subject?: Subject;
  teacher?: Teacher;
}

export interface TeacherSubject {
  id: string;
  teacher_id: string;
  subject_id: string;
  created_at: string;
  updated_at: string;
  teacher?: Teacher;
  subject?: Subject;
}

export interface StudentCourseEnrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrollment_date: string;
  status: 'active' | 'completed' | 'dropped' | 'pending';
  created_at: string;
  updated_at: string;
  student?: Student;
  course?: Course;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  total_students: number;
  total_teachers: number;
  active_courses: number;
  pending_enrollments: number;
  upcoming_exams: number;
  recent_fee_collections: number;
}

export interface StudentView extends Student {
  email: string;
  full_name: string;
}

export interface TeacherView extends Teacher {
  email: string;
  full_name: string;
}
