
import { z } from "zod";

// Course validation
export const courseSchema = z.object({
  name: z.string()
    .min(3, "Course name is required and must be at least 3 characters")
    .regex(/^[a-zA-Z\s]+$/, "Course name must not contain special characters or numbers"),
  code: z.string().min(2, "Course code is required").nonempty("Course code is required"),
  description: z.string().optional(),
  credits: z.number().min(1, "Credits must be at least 1"),
  departmentId: z.string().optional(),
  duration: z.string().min(1, "Duration is required").nonempty("Duration is required"),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

// Subject validation
export const subjectSchema = z.object({
  name: z.string()
    .min(3, "Subject name is required and must be at least 3 characters")
    .regex(/^[a-zA-Z\s]+$/, "Subject name must not contain special characters or numbers"),
  code: z.string().min(2, "Subject code is required").nonempty("Subject code is required"),
  description: z.string().optional(),
  credits: z.number().min(1, "Credits must be at least 1"),
  courseId: z.string().min(1, "Course is required"),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;

// Teacher validation
export const teacherSchema = z.object({
  fullName: z.string()
    .min(3, "Full name is required and must be at least 3 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name must not contain special characters or numbers")
    .nonempty("Full name is required"),
  email: z.string()
    .email("Please enter a valid email address")
    .nonempty("Email is required"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .nonempty("Password is required"),
  department: z.string()
    .min(2, "Department is required")
    .nonempty("Department is required"),
  specialization: z.string()
    .min(2, "Specialization is required")
    .nonempty("Specialization is required"),
  qualification: z.string()
    .min(2, "Qualification is required")
    .nonempty("Qualification is required"),
  contactNumber: z.string()
    .min(10, "Contact number must be exactly 10 digits")
    .max(10, "Contact number must be exactly 10 digits")
    .regex(/^\d+$/, "Contact number must contain only digits")
    .nonempty("Contact number is required"),
  joiningDate: z.date({
    required_error: "Joining date is required",
    invalid_type_error: "Joining date must be a valid date",
  }),
});

export type TeacherFormValues = z.infer<typeof teacherSchema>;

// Student validation
export const studentSchema = z.object({
  fullName: z.string()
    .min(3, "Full name is required and must be at least 3 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name must not contain special characters or numbers")
    .nonempty("Full name is required"),
  email: z.string()
    .email("Please enter a valid email address")
    .nonempty("Email is required"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .nonempty("Password is required"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
    invalid_type_error: "Date of birth must be a valid date",
  }),
  contactNumber: z.string()
    .min(10, "Contact number must be exactly 10 digits")
    .max(10, "Contact number must be exactly 10 digits")
    .regex(/^\d+$/, "Contact number must contain only digits")
    .nonempty("Contact number is required"),
  address: z.string()
    .min(5, "Address is required")
    .nonempty("Address is required"),
  guardianName: z.string()
    .min(2, "Guardian name is required")
    .nonempty("Guardian name is required"),
  guardianContact: z.string()
    .min(10, "Guardian contact must be exactly 10 digits")
    .max(10, "Guardian contact must be exactly 10 digits")
    .regex(/^\d+$/, "Guardian contact must contain only digits")
    .nonempty("Guardian contact is required"),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

// Fee Structure validation
export const feeStructureSchema = z.object({
  courseId: z.string().optional(),
  academicYear: z.string().min(4, "Academic year is required"),
  semester: z.number().optional(),
  feeType: z.string().min(2, "Fee type is required"),
  amount: z.number().positive("Amount must be greater than 0"),
});

export type FeeStructureFormValues = z.infer<typeof feeStructureSchema>;

// Exam validation
export const examSchema = z.object({
  title: z.string().min(3, "Title is required"),
  subjectId: z.string().min(1, "Subject is required"),
  examDate: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  room: z.string().optional(),
  description: z.string().optional(),
  maxMarks: z.number().positive("Maximum marks must be greater than 0"),
  passingMarks: z.number().positive("Passing marks must be greater than 0"),
});

export type ExamFormValues = z.infer<typeof examSchema>;

// Timetable entry validation
export const timetableEntrySchema = z.object({
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  dayOfWeek: z.number().min(0).max(6, "Day of week must be between 0 and 6"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

export type TimetableEntryFormValues = z.infer<typeof timetableEntrySchema>;

// Payment validation
export const paymentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  feeStructureId: z.string().min(1, "Fee structure is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  transactionId: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

// Attendance validation
export const attendanceSchema = z.object({
  date: z.date({
    required_error: "Date is required",
    invalid_type_error: "Please select a valid date",
  }),
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  status: z.string().min(1, "Status is required"),
  remarks: z.string().optional(),
});

export type AttendanceFormValues = z.infer<typeof attendanceSchema>;

// Study Material validation
export const studyMaterialSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional(),
  subjectId: z.string().min(1, "Subject is required"),
  file: z.instanceof(File, { message: "File is required" })
    .refine((file) => file.size <= 10 * 1024 * 1024, "File size must be less than 10MB"),
});

export type StudyMaterialFormValues = z.infer<typeof studyMaterialSchema>;

// Add YearSessionValues interface for filtering
export interface YearSessionValues {
  year?: string;
  session?: string;
}

// Toast variant type to ensure we use valid values
export type ToastVariant = "default" | "destructive" | "warning";
