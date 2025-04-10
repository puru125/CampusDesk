
import { Database } from "@/integrations/supabase/types";
import { createClient } from '@supabase/supabase-js';

// Extend the existing Database type to include our new tables
export interface ExtendedDatabase extends Database {
  public: {
    Tables: {
      // Include all existing tables from Database.public.Tables
      ...Database["public"]["Tables"],
      
      // Add new tables
      student_doubts: {
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
      
      doubt_answers: {
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
      
      assignments: {
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
      
      assignment_submissions: {
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
      
      teacher_students: {
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
      }
    };
  };
}

// Create an extended version of the supabase client
export type ExtendedSupabaseClient = ReturnType<typeof createClient<ExtendedDatabase>>;
