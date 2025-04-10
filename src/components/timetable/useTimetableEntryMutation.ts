
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TimetableFormValues } from "./TimetableFormConstants";

export const useTimetableEntryMutation = (onSuccess: () => void) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTimetableEntryMutation = useMutation({
    mutationFn: async (values: TimetableFormValues) => {
      try {
        console.log("Submitting timetable entry:", values);
        
        // First check if there's a conflict
        const { data: existingEntries, error: conflictError } = await supabase
          .from('timetable_entries')
          .select("*")
          .eq("class_id", values.class_id)
          .eq("day_of_week", values.day_of_week)
          .or(`start_time.lte.${values.end_time},end_time.gte.${values.start_time}`);

        if (conflictError) {
          console.error("Error checking for conflicts:", conflictError);
          throw new Error("Failed to check for scheduling conflicts");
        }

        if (existingEntries && existingEntries.length > 0) {
          throw new Error("There is already a class scheduled at this time");
        }

        // Check if end time is after start time
        if (values.start_time >= values.end_time) {
          throw new Error("End time must be after start time");
        }

        // Insert the new timetable entry
        const { data, error } = await supabase.from('timetable_entries').insert({
          class_id: values.class_id,
          subject_id: values.subject_id,
          teacher_id: values.teacher_id,
          day_of_week: values.day_of_week,
          start_time: values.start_time,
          end_time: values.end_time,
        }).select();

        if (error) {
          console.error("Error inserting timetable entry:", error);
          throw error;
        }
        
        console.log("Timetable entry created:", data);
        return data;
      } catch (error) {
        console.error("Error in mutation function:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Timetable entry added successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add timetable entry",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  return { addTimetableEntryMutation, isSubmitting, setIsSubmitting };
};
