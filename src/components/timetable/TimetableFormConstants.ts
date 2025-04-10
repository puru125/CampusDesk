
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
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

export const timetableSchema = z.object({
  class_id: z.string({
    required_error: "Please select a class",
  }),
  subject_id: z.string({
    required_error: "Please select a subject",
  }),
  teacher_id: z.string({
    required_error: "Please select a teacher",
  }),
  day_of_week: z.number({
    required_error: "Please select a day",
  }).min(1, "Please select a day"),
  start_time: z.string({
    required_error: "Please select a start time",
  }),
  end_time: z.string({
    required_error: "Please select an end time",
  }),
});

export type TimetableFormValues = z.infer<typeof timetableSchema>;
