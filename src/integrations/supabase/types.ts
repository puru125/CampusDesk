export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      academic_sessions: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_current: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_current?: boolean
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_current?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          id: string
          is_read: boolean
          message: string
          related_entity: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          id?: string
          is_read?: boolean
          message: string
          related_entity?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          id?: string
          is_read?: boolean
          message?: string
          related_entity?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string
          credits: number
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          credits: number
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          credits?: number
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      fee_structures: {
        Row: {
          academic_year: string
          amount: number
          course_id: string | null
          created_at: string
          fee_type: string
          id: string
          is_active: boolean
          semester: number | null
          updated_at: string
        }
        Insert: {
          academic_year: string
          amount: number
          course_id?: string | null
          created_at?: string
          fee_type: string
          id?: string
          is_active?: boolean
          semester?: number | null
          updated_at?: string
        }
        Update: {
          academic_year?: string
          amount?: number
          course_id?: string | null
          created_at?: string
          fee_type?: string
          id?: string
          is_active?: boolean
          semester?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          admin_remarks: string | null
          amount: number
          created_at: string
          fee_structure_id: string | null
          id: string
          payment_date: string
          payment_method: string
          receipt_number: string
          status: string
          student_id: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          admin_remarks?: string | null
          amount: number
          created_at?: string
          fee_structure_id?: string | null
          id?: string
          payment_date?: string
          payment_method: string
          receipt_number: string
          status: string
          student_id: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_remarks?: string | null
          amount?: number
          created_at?: string
          fee_structure_id?: string | null
          id?: string
          payment_date?: string
          payment_method?: string
          receipt_number?: string
          status?: string
          student_id?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_view"
            referencedColumns: ["id"]
          },
        ]
      }
      student_course_enrollments: {
        Row: {
          academic_year: string | null
          admin_remarks: string | null
          course_id: string
          created_at: string
          id: string
          semester: number | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          admin_remarks?: string | null
          course_id: string
          created_at?: string
          id?: string
          semester?: number | null
          status: string
          student_id: string
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          admin_remarks?: string | null
          course_id?: string
          created_at?: string
          id?: string
          semester?: number | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_course_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_course_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_view"
            referencedColumns: ["id"]
          },
        ]
      }
      student_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          student_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_notifications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_notifications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students_view"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          contact_number: string | null
          created_at: string
          current_semester: number | null
          date_of_birth: string | null
          enrollment_date: string | null
          enrollment_number: string
          enrollment_status: string | null
          fee_status: string | null
          first_login: boolean
          guardian_contact: string | null
          guardian_name: string | null
          id: string
          last_payment_date: string | null
          total_fees_due: number | null
          total_fees_paid: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_number?: string | null
          created_at?: string
          current_semester?: number | null
          date_of_birth?: string | null
          enrollment_date?: string | null
          enrollment_number: string
          enrollment_status?: string | null
          fee_status?: string | null
          first_login?: boolean
          guardian_contact?: string | null
          guardian_name?: string | null
          id?: string
          last_payment_date?: string | null
          total_fees_due?: number | null
          total_fees_paid?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          contact_number?: string | null
          created_at?: string
          current_semester?: number | null
          date_of_birth?: string | null
          enrollment_date?: string | null
          enrollment_number?: string
          enrollment_status?: string | null
          fee_status?: string | null
          first_login?: boolean
          guardian_contact?: string | null
          guardian_name?: string | null
          id?: string
          last_payment_date?: string | null
          total_fees_due?: number | null
          total_fees_paid?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      teacher_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_notifications_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_notifications_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers_view"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          contact_number: string | null
          created_at: string
          department: string | null
          employee_id: string
          first_login: boolean
          id: string
          joining_date: string | null
          qualification: string | null
          specialization: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_number?: string | null
          created_at?: string
          department?: string | null
          employee_id: string
          first_login?: boolean
          id?: string
          joining_date?: string | null
          qualification?: string | null
          specialization?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_number?: string | null
          created_at?: string
          department?: string | null
          employee_id?: string
          first_login?: boolean
          id?: string
          joining_date?: string | null
          qualification?: string | null
          specialization?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          is_first_login: boolean
          last_login: string | null
          password_hash: string
          profile_completed: boolean
          profile_completion_percentage: number
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          is_first_login?: boolean
          last_login?: string | null
          password_hash: string
          profile_completed?: boolean
          profile_completion_percentage?: number
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          is_first_login?: boolean
          last_login?: string | null
          password_hash?: string
          profile_completed?: boolean
          profile_completion_percentage?: number
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_dashboard_stats_view: {
        Row: {
          active_courses: number | null
          pending_enrollments: number | null
          recent_fee_collections: number | null
          total_students: number | null
          total_teachers: number | null
          upcoming_exams: number | null
        }
        Relationships: []
      }
      students_view: {
        Row: {
          address: string | null
          contact_number: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          enrollment_date: string | null
          enrollment_number: string | null
          enrollment_status: string | null
          fee_status: string | null
          full_name: string | null
          guardian_contact: string | null
          guardian_name: string | null
          id: string | null
          total_fees_due: number | null
          total_fees_paid: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers_view: {
        Row: {
          contact_number: string | null
          created_at: string | null
          department: string | null
          email: string | null
          employee_id: string | null
          full_name: string | null
          id: string | null
          joining_date: string | null
          qualification: string | null
          specialization: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_student: {
        Args: {
          p_email: string
          p_full_name: string
          p_date_of_birth: string
          p_contact_number?: string
          p_address?: string
          p_guardian_name?: string
          p_guardian_contact?: string
        }
        Returns: string
      }
      add_teacher: {
        Args: {
          p_email: string
          p_full_name: string
          p_department: string
          p_specialization: string
          p_qualification: string
          p_contact_number?: string
          p_joining_date?: string
        }
        Returns: string
      }
      approve_payment: {
        Args: {
          p_admin_id: string
          p_payment_id: string
          p_admin_remarks?: string
        }
        Returns: boolean
      }
      authenticate_user: {
        Args: { p_email: string; p_password: string }
        Returns: {
          id: string
          email: string
          full_name: string
          role: string
          is_first_login: boolean
          profile_completed: boolean
          profile_completion_percentage: number
        }[]
      }
      calculate_profile_completion: {
        Args: { p_user_id: string }
        Returns: number
      }
      check_first_login: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      create_user_with_default_password: {
        Args: { p_email: string; p_full_name: string; p_role: string }
        Returns: string
      }
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_students: number
          total_teachers: number
          active_courses: number
          pending_enrollments: number
          upcoming_exams: number
          recent_fee_collections: number
        }[]
      }
      get_all_students: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          email: string
          full_name: string
          enrollment_number: string
          date_of_birth: string
          enrollment_date: string
          enrollment_status: string
          contact_number: string
          address: string
          fee_status: string
          created_at: string
        }[]
      }
      get_all_teachers: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_id: string
          email: string
          full_name: string
          employee_id: string
          department: string
          specialization: string
          qualification: string
          joining_date: string
          contact_number: string
          created_at: string
        }[]
      }
      initialize_system: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      process_enrollment_request: {
        Args: {
          p_admin_id: string
          p_enrollment_id: string
          p_status: string
          p_admin_remarks?: string
        }
        Returns: boolean
      }
      record_fee_payment: {
        Args: {
          p_student_id: string
          p_fee_structure_id: string
          p_amount: number
          p_payment_method: string
          p_transaction_id?: string
        }
        Returns: string
      }
      reject_payment: {
        Args: {
          p_admin_id: string
          p_payment_id: string
          p_admin_remarks: string
        }
        Returns: boolean
      }
      request_course_enrollment: {
        Args: {
          p_student_id: string
          p_course_id: string
          p_academic_year: string
          p_semester: number
        }
        Returns: string
      }
      reset_password_after_first_login: {
        Args: { p_user_id: string; p_new_password: string }
        Returns: boolean
      }
      update_profile: {
        Args: { p_user_id: string; p_profile_data: Json }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
