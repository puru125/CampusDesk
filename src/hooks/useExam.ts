
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useExam = (examId?: string) => {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ["exam", examId],
    queryFn: async () => {
      if (!examId) return null;
      const { data, error } = await supabase
        .from("exams")
        .select(`
          *,
          exam_questions (*)
        `)
        .eq("id", examId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!examId,
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async ({ examId, studentId, answers }: {
      examId: string;
      studentId: string;
      answers: Record<string, string>;
    }) => {
      const { data, error } = await supabase
        .from("exam_submissions")
        .insert({
          exam_id: examId,
          student_id: studentId,
          answers,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your answers have been submitted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit answers. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    exam,
    examLoading,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    submitAnswerMutation,
  };
};
