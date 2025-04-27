
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/ui/page-header";
import ExamQuestion from "@/components/exams/ExamQuestion";
import { useToast } from "@/hooks/use-toast";

const StudentExamsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: studentData } = useQuery({
    queryKey: ["student-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: exams, isLoading } = useQuery({
    queryKey: ["student-exams", studentData?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exams")
        .select(`
          *,
          exam_questions (*),
          exam_submissions (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!studentData?.id,
  });

  const submitExamMutation = useMutation({
    mutationFn: async ({ examId, answers }: { examId: string; answers: Record<string, string> }) => {
      const { data, error } = await supabase
        .from("exam_submissions")
        .insert({
          exam_id: examId,
          student_id: studentData?.id,
          answers,
          status: "submitted",
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit answers. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitExam = (examId: string, answers: Record<string, string>) => {
    submitExamMutation.mutate({ examId, answers });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Exams"
        description="View and take your exams"
      />

      <div className="space-y-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-md" />
            ))}
          </div>
        ) : exams?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-6">
              <p className="text-muted-foreground">No exams available</p>
            </CardContent>
          </Card>
        ) : (
          exams?.map((exam: any) => {
            const submission = exam.exam_submissions?.find(
              (sub: any) => sub.student_id === studentData?.id
            );

            return (
              <Card key={exam.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{exam.title}</CardTitle>
                    {submission ? (
                      <Badge variant={submission.status === "completed" ? "default" : "outline"}>
                        {submission.score ? `Score: ${submission.score}` : submission.status}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not attempted</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {submission ? (
                    <div className="space-y-4">
                      {exam.exam_questions.map((question: any, index: number) => (
                        <div key={question.id} className="border p-4 rounded-md">
                          <div className="flex justify-between mb-2">
                            <h3 className="font-medium">Question {index + 1}</h3>
                            <span className="text-sm text-muted-foreground">
                              {question.marks} marks
                            </span>
                          </div>
                          <p className="mb-2">{question.question}</p>
                          <p>
                            Your answer:{" "}
                            <span className="font-medium">
                              {submission.answers[question.id]}
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {exam.exam_questions.map((question: any, index: number) => (
                        <ExamQuestion
                          key={question.id}
                          question={question.question}
                          options={question.options}
                          marks={question.marks}
                          onAnswer={(answer) => {
                            const answers = {
                              [question.id]: answer,
                            };
                            handleSubmitExam(exam.id, answers);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentExamsPage;
