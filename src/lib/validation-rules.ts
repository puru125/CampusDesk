
import * as z from "zod";

// Common validation patterns
export const PATTERNS = {
  PHONE: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  NAME: /^[a-zA-Z\s'-]{2,}$/,
  ENROLLMENT_NUMBER: /^[A-Za-z][0-9]{8,}$/,
  EMPLOYEE_ID: /^[A-Za-z][0-9]{8,}$/,
};

// Common validation error messages
export const ERROR_MESSAGES = {
  REQUIRED: "This field is required",
  PHONE: "Please enter a valid phone number",
  EMAIL: "Please enter a valid email address",
  NAME: "Please enter a valid name (letters, spaces, hyphens and apostrophes only)",
  DATE: "Please enter a valid date",
  LENGTH_MIN: (field: string, min: number) => `${field} must be at least ${min} characters`,
  LENGTH_MAX: (field: string, max: number) => `${field} must be less than ${max} characters`,
};

// Reusable schema parts
export const commonSchemas = {
  fullName: z
    .string()
    .min(3, { message: ERROR_MESSAGES.LENGTH_MIN("Full name", 3) })
    .max(100, { message: ERROR_MESSAGES.LENGTH_MAX("Full name", 100) })
    .regex(PATTERNS.NAME, { message: ERROR_MESSAGES.NAME }),
  
  email: z
    .string()
    .email({ message: ERROR_MESSAGES.EMAIL })
    .max(100, { message: ERROR_MESSAGES.LENGTH_MAX("Email", 100) }),
  
  contactNumber: z
    .string()
    .regex(PATTERNS.PHONE, { message: ERROR_MESSAGES.PHONE })
    .optional()
    .or(z.literal("")),
  
  requiredText: (fieldName: string, min = 2, max = 100) => 
    z.string()
      .min(min, { message: ERROR_MESSAGES.LENGTH_MIN(fieldName, min) })
      .max(max, { message: ERROR_MESSAGES.LENGTH_MAX(fieldName, max) }),
  
  optionalText: (fieldName: string, min = 2, max = 100) => 
    z.string()
      .min(min, { message: ERROR_MESSAGES.LENGTH_MIN(fieldName, min) })
      .max(max, { message: ERROR_MESSAGES.LENGTH_MAX(fieldName, max) })
      .optional()
      .or(z.literal("")),
  
  date: z.date({
    required_error: ERROR_MESSAGES.REQUIRED,
    invalid_type_error: ERROR_MESSAGES.DATE,
  }),
  
  address: z
    .string()
    .min(5, { message: ERROR_MESSAGES.LENGTH_MIN("Address", 5) })
    .max(200, { message: ERROR_MESSAGES.LENGTH_MAX("Address", 200) })
    .optional()
    .or(z.literal("")),
};

// Student form validation schema
export const studentSchema = z.object({
  fullName: commonSchemas.fullName,
  email: commonSchemas.email,
  dateOfBirth: commonSchemas.date,
  contactNumber: commonSchemas.contactNumber,
  address: commonSchemas.address,
  guardianName: commonSchemas.optionalText("Guardian name", 3, 100),
  guardianContact: z
    .string()
    .regex(PATTERNS.PHONE, { message: ERROR_MESSAGES.PHONE })
    .optional()
    .or(z.literal("")),
});

// Teacher form validation schema
export const teacherSchema = z.object({
  fullName: commonSchemas.fullName,
  email: commonSchemas.email,
  department: commonSchemas.requiredText("Department"),
  specialization: commonSchemas.requiredText("Specialization"),
  qualification: commonSchemas.requiredText("Qualification"),
  joiningDate: commonSchemas.date,
  contactNumber: commonSchemas.contactNumber,
});

// Year session schema for filters
export const yearSessionSchema = z.object({
  year: z.string().regex(/^\d{4}$/, { message: "Please enter a valid year" }),
  session: z.string().optional(),
});

// Export types for the schemas
export type StudentFormValues = z.infer<typeof studentSchema>;
export type TeacherFormValues = z.infer<typeof teacherSchema>;
export type YearSessionValues = z.infer<typeof yearSessionSchema>;
