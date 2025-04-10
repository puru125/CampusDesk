export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: string;
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
  teacher_id: string | null;
}

export interface Classroom {
  id: string;
  name: string;
  room: string;
  capacity: number;
  created_at: string;
  updated_at: string;
}
