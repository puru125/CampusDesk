
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TimetableEntry, Class } from "@/types";
import { startOfWeek, endOfWeek, addDays } from "date-fns";

export const useTimetableData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Query to fetch available classes
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select("*")
          .order("name");

        if (error) {
          console.error("Error fetching classes:", error);
          toast({
            title: "Error",
            description: "Failed to fetch classes. Please try again later.",
            variant: "destructive",
          });
          return [];
        }

        return data as Class[];
      } catch (error) {
        console.error("Error in fetch function:", error);
        return [];
      }
    },
  });

  // Query to fetch timetable entries
  const { data: timetableEntries, isLoading: entriesLoading } = useQuery({
    queryKey: ["timetable", selectedClass, currentWeek],
    queryFn: async () => {
      try {
        let query = supabase
          .from('timetable_entries')
          .select(`
            *,
            class:classes(*),
            subject:subjects(*),
            teacher:teachers_view(*)
          `);

        if (selectedClass) {
          query = query.eq("class_id", selectedClass);
        } else if (user?.role === "teacher") {
          // For teachers, show only their classes
          const { data: teacherData } = await supabase
            .from('teachers')
            .select("id")
            .eq("user_id", user.id)
            .single();

          if (teacherData) {
            query = query.eq("teacher_id", teacherData.id);
          }
        } else if (user?.role === "student") {
          // For students, show classes from their enrolled courses
          // This is a simplified example - in a real app, you'd need to join with enrollments
          const { data: studentData } = await supabase
            .from('students')
            .select("id")
            .eq("user_id", user.id)
            .single();

          if (studentData) {
            // This would need to be customized based on your data model
            // to fetch timetable entries for the student's classes
          }
        }

        const { data, error } = await query.order("day_of_week").order("start_time");

        if (error) {
          console.error("Error fetching timetable entries:", error);
          toast({
            title: "Error",
            description: "Failed to fetch timetable data. Please try again later.",
            variant: "destructive",
          });
          return [];
        }

        return data as TimetableEntry[];
      } catch (error) {
        console.error("Error in fetch function:", error);
        return [];
      }
    },
    enabled: !classesLoading,
  });

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  // Navigate to previous/next week
  const goToPreviousWeek = () => {
    setCurrentWeek(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7));
  };

  const isLoading = classesLoading || entriesLoading;

  return {
    classes,
    timetableEntries,
    selectedClass,
    setSelectedClass,
    weekStart,
    weekEnd,
    goToPreviousWeek,
    goToNextWeek,
    isLoading
  };
};
