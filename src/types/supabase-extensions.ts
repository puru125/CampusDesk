import { Database } from "@/integrations/supabase/types";
import { createClient } from '@supabase/supabase-js';

// Define the table types
export type StudentDoubtsTable = {
  Row: {
    id: string;
    student_id: string;
    teacher_id: string;
    subject_id: string | null;
    title: string;
    question: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    student_id: string;
    teacher_id: string;
    subject_id?: string | null;
    title: string;
    question: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    student_id?: string;
    teacher_id?: string;
    subject_id?: string | null;
    title?: string;
    question?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "student_doubts_student_id_fkey";
      columns: ["student_id"];
      referencedRelation: "students";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "student_doubts_teacher_id_fkey";
      columns: ["teacher_id"];
      referencedRelation: "teachers";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "student_doubts_subject_id_fkey";
      columns: ["subject_id"];
      referencedRelation: "subjects";
      referencedColumns: ["id"];
    }
  ];
};

export type DoubtAnswersTable = {
  Row: {
    id: string;
    doubt_id: string;
    teacher_id: string;
    answer: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    doubt_id: string;
    teacher_id: string;
    answer: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    doubt_id?: string;
    teacher_id?: string;
    answer?: string;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "doubt_answers_doubt_id_fkey";
      columns: ["doubt_id"];
      referencedRelation: "student_doubts";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "doubt_answers_teacher_id_fkey";
      columns: ["teacher_id"];
      referencedRelation: "teachers";
      referencedColumns: ["id"];
    }
  ];
};

export type StudentFeedbackTable = {
  Row: {
    id: string;
    student_id: string;
    title: string;
    message: string;
    rating: number;
    is_read: boolean;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    student_id: string;
    title: string;
    message: string;
    rating: number;
    is_read?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    student_id?: string;
    title?: string;
    message?: string;
    rating?: number;
    is_read?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "student_feedback_student_id_fkey";
      columns: ["student_id"];
      referencedRelation: "students";
      referencedColumns: ["id"];
    }
  ];
};

export type StudentTimetableView = {
  Row: {
    id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    class_id: string;
    class_name: string;
    room: string;
    subject_id: string;
    subject_name: string;
    subject_code: string;
    teacher_id: string;
    teacher_name: string;
  };
  Relationships: [
    {
      foreignKeyName: "timetable_entries_class_id_fkey";
      columns: ["class_id"];
      referencedRelation: "classes";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "timetable_entries_subject_id_fkey";
      columns: ["subject_id"];
      referencedRelation: "subjects";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "timetable_entries_teacher_id_fkey";
      columns: ["teacher_id"];
      referencedRelation: "teachers";
      referencedColumns: ["id"];
    }
  ];
};

export type AssignmentsTable = {
  Row: {
    id: string;
    teacher_id: string;
    subject_id: string | null;
    title: string;
    description: string | null;
    due_date: string;
    max_score: number;
    status: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    teacher_id: string;
    subject_id?: string | null;
    title: string;
    description?: string | null;
    due_date: string;
    max_score?: number;
    status?: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    teacher_id?: string;
    subject_id?: string | null;
    title?: string;
    description?: string | null;
    due_date?: string;
    max_score?: number;
    status?: string;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "assignments_teacher_id_fkey";
      columns: ["teacher_id"];
      referencedRelation: "teachers";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "assignments_subject_id_fkey";
      columns: ["subject_id"];
      referencedRelation: "subjects";
      referencedColumns: ["id"];
    }
  ];
};

export type AssignmentSubmissionsTable = {
  Row: {
    id: string;
    assignment_id: string;
    student_id: string;
    file_path: string | null;
    file_name: string | null;
    submission_text: string | null;
    submitted_at: string;
    status: string;
    score: number | null;
    feedback: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    assignment_id: string;
    student_id: string;
    file_path?: string | null;
    file_name?: string | null;
    submission_text?: string | null;
    submitted_at?: string;
    status?: string;
    score?: number | null;
    feedback?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    assignment_id?: string;
    student_id?: string;
    file_path?: string | null;
    file_name?: string | null;
    submission_text?: string | null;
    submitted_at?: string;
    status?: string;
    score?: number | null;
    feedback?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "assignment_submissions_assignment_id_fkey";
      columns: ["assignment_id"];
      referencedRelation: "assignments";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "assignment_submissions_student_id_fkey";
      columns: ["student_id"];
      referencedRelation: "students";
      referencedColumns: ["id"];
    }
  ];
};

export type TeacherStudentsTable = {
  Row: {
    id: string;
    teacher_id: string;
    student_id: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    teacher_id: string;
    student_id: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    teacher_id?: string;
    student_id?: string;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "teacher_students_teacher_id_fkey";
      columns: ["teacher_id"];
      referencedRelation: "teachers";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "teacher_students_student_id_fkey";
      columns: ["student_id"];
      referencedRelation: "students";
      referencedColumns: ["id"];
    }
  ];
};

export type AttendanceRecordsTable = {
  Row: {
    id: string;
    teacher_id: string;
    student_id: string;
    class_id: string;
    subject_id: string;
    date: string;
    status: string;
    remarks: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    teacher_id: string;
    student_id: string;
    class_id: string;
    subject_id: string;
    date: string;
    status: string;
    remarks?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    teacher_id?: string;
    student_id?: string;
    class_id?: string;
    subject_id?: string;
    date?: string;
    status?: string;
    remarks?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "attendance_records_teacher_id_fkey";
      columns: ["teacher_id"];
      referencedRelation: "teachers";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "attendance_records_student_id_fkey";
      columns: ["student_id"];
      referencedRelation: "students";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "attendance_records_class_id_fkey";
      columns: ["class_id"];
      referencedRelation: "classes";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "attendance_records_subject_id_fkey";
      columns: ["subject_id"];
      referencedRelation: "subjects";
      referencedColumns: ["id"];
    }
  ];
};

export type ExamReportsTable = {
  Row: {
    id: string;
    exam_id: string;
    student_id: string;
    marks_obtained: number;
    pass_status: boolean;
    teacher_comments: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    exam_id: string;
    student_id: string;
    marks_obtained: number;
    pass_status: boolean;
    teacher_comments?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    exam_id?: string;
    student_id?: string;
    marks_obtained?: number;
    pass_status?: boolean;
    teacher_comments?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "exam_reports_exam_id_fkey";
      columns: ["exam_id"];
      referencedRelation: "exams";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "exam_reports_student_id_fkey";
      columns: ["student_id"];
      referencedRelation: "students";
      referencedColumns: ["id"];
    }
  ];
};

export type StudentNotificationsTable = {
  Row: {
    id: string;
    student_id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    student_id: string;
    title: string;
    message: string;
    is_read?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    student_id?: string;
    title?: string;
    message?: string;
    is_read?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "student_notifications_student_id_fkey";
      columns: ["student_id"];
      referencedRelation: "students";
      referencedColumns: ["id"];
    }
  ];
};

export type StudyMaterialsTable = {
  Row: {
    id: string;
    teacher_id: string;
    subject_id: string;
    title: string;
    description: string | null;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    file_url: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    teacher_id: string;
    subject_id: string;
    title: string;
    description?: string | null;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    file_url: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    teacher_id?: string;
    subject_id?: string;
    title?: string;
    description?: string | null;
    file_name?: string;
    file_path?: string;
    file_size?: number;
    file_type?: string;
    file_url?: string;
    created_at?: string;
    updated_at?: string;
  };
  Relationships: [
    {
      foreignKeyName: "study_materials_teacher_id_fkey";
      columns: ["teacher_id"];
      referencedRelation: "teachers";
      referencedColumns: ["id"];
    },
    {
      foreignKeyName: "study_materials_subject_id_fkey";
      columns: ["subject_id"];
      referencedRelation: "subjects";
      referencedColumns: ["id"];
    }
  ];
};

// Define the extended database schema using proper intersection types
export interface ExtendedDatabase extends Database {
  public: {
    Tables: Database["public"]["Tables"] & {
      student_doubts: StudentDoubtsTable;
      doubt_answers: DoubtAnswersTable;
      assignments: AssignmentsTable;
      assignment_submissions: AssignmentSubmissionsTable;
      teacher_students: TeacherStudentsTable;
      attendance_records: AttendanceRecordsTable;
      exam_reports: ExamReportsTable;
      student_feedback: StudentFeedbackTable;
      student_notifications: StudentNotificationsTable;
      study_materials: StudyMaterialsTable;
    };
    Views: Database["public"]["Views"] & {
      student_timetable_view: StudentTimetableView;
    };
    Functions: Database["public"]["Functions"];
    Enums: Database["public"]["Enums"];
    CompositeTypes: Database["public"]["CompositeTypes"];
  };
}

// Create an extended version of the supabase client
export type ExtendedSupabaseClient = ReturnType<typeof createClient<ExtendedDatabase>>;
