
import { z } from "zod";

export const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

export const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", 
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
  "17:00", "17:30", "18:00", "18:30", "19:00"
];

export const timetableSchema = z.object({
  class_id: z.string({
    required_error: "Class is required",
  }),
  subject_id: z.string({
    required_error: "Subject is required",
  }),
  teacher_id: z.string({
    required_error: "Teacher is required",
  }),
  day_of_week: z.number({
    required_error: "Day of week is required",
  }),
  start_time: z.string({
    required_error: "Start time is required",
  }),
  end_time: z.string({
    required_error: "End time is required",
  }),
});

export type TimetableFormValues = z.infer<typeof timetableSchema>;
