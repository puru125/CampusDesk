
import { z } from "zod";

// Course validation
export const courseSchema = z.object({
  name: z.string().min(3, "Course name is required and must be at least 3 characters"),
  code: z.string().min(2, "Course code is required"),
  description: z.string().optional(),
  credits: z.number().min(1, "Credits must be at least 1"),
  departmentId: z.string().optional(),
  duration: z.string().min(1, "Duration is required"),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

// Subject validation
export const subjectSchema = z.object({
  name: z.string().min(3, "Subject name is required and must be at least 3 characters"),
  code: z.string().min(2, "Subject code is required"),
  description: z.string().optional(),
  credits: z.number().min(1, "Credits must be at least 1"),
  courseId: z.string().min(1, "Course is required"),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;

// Teacher validation
export const teacherSchema = z.object({
  fullName: z.string().min(3, "Full name is required and must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().min(2, "Department is required"),
  specialization: z.string().min(2, "Specialization is required"),
  qualification: z.string().min(2, "Qualification is required"),
  contactNumber: z.string().optional(),
  joiningDate: z.date(),
});

export type TeacherFormValues = z.infer<typeof teacherSchema>;

// Student validation
export const studentSchema = z.object({
  fullName: z.string().min(3, "Full name is required and must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  dateOfBirth: z.date(),
  contactNumber: z.string().optional(),
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianContact: z.string().optional(),
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
