
import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Class, Subject, TeacherView } from "@/types";

interface TimetableDataProviderProps {
  children: (data: {
    classes: Class[] | undefined;
    subjects: Subject[] | undefined;
    teachers: TeacherView[] | undefined;
    isLoading: boolean;
  }) => ReactNode;
}

export const TimetableDataProvider = ({ children }: TimetableDataProviderProps) => {
  const { toast } = useToast();

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
            description: "Failed to fetch classes",
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

  // Query to fetch available subjects
  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select(`
          *,
          course:courses(id, name)
        `)
          .order("name");

        if (error) {
          console.error("Error fetching subjects:", error);
          toast({
            title: "Error",
            description: "Failed to fetch subjects",
            variant: "destructive",
          });
          return [];
        }

        return data as Subject[];
      } catch (error) {
        console.error("Error in fetch function:", error);
        return [];
      }
    },
  });

  // Query to fetch available teachers
  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("teachers_view")
          .select("*")
          .order("full_name");

        if (error) {
          console.error("Error fetching teachers:", error);
          toast({
            title: "Error",
            description: "Failed to fetch teachers",
            variant: "destructive",
          });
          return [];
        }

        return data as TeacherView[];
      } catch (error) {
        console.error("Error in fetch function:", error);
        return [];
      }
    },
  });

  const isLoading = classesLoading || subjectsLoading || teachersLoading;

  return (
    <>
      {children({
        classes,
        subjects,
        teachers,
        isLoading
      })}
    </>
  );
};
