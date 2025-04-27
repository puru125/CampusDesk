
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ExamForm from "@/components/exams/ExamForm";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Book, FileText } from "lucide-react";

const ManageExamsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: exams, isLoading } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exams")
        .select(`
          *,
          exam_questions (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createExamMutation = useMutation({
    mutationFn: async (formData: any) => {
      // Create exam entry with all required fields
      const { data: examData, error: examError } = await supabase
        .from("exams")
        .insert({
          title: formData.title,
          description: formData.description,
          status: "pending",
          // Add required fields that were missing
          exam_date: new Date().toISOString().split('T')[0], // Current date
          start_time: "09:00",
          end_time: "10:00",
          max_marks: formData.marks || 10,
          passing_marks: Math.floor((formData.marks || 10) * 0.4), // 40% passing
        })
        .select()
        .single();

      if (examError) throw examError;

      // Create exam question
      const { error: questionError } = await supabase
        .from("exam_questions")
        .insert({
          exam_id: examData.id,
          question: formData.question,
          options: formData.options.split('\n').filter(Boolean),
          correct_answer: formData.correctAnswer,
          marks: formData.marks,
        });

      if (questionError) throw questionError;

      return examData;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Exam created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create exam. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating exam:", error);
    },
  });

  const handleSubmit = (data: any) => {
    createExamMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Exams"
        description="Create and manage exams"
      >
        <Button onClick={() => navigate("/admin/exams/results")}>
          <FileText className="h-4 w-4 mr-2" />
          View Results
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExamForm onSubmit={handleSubmit} />

        <Card>
          <CardHeader>
            <CardTitle>Recent Exams</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-md" />
                ))}
              </div>
            ) : exams?.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No exams created yet
              </div>
            ) : (
              <div className="space-y-4">
                {exams?.map((exam: any) => (
                  <Card key={exam.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{exam.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {exam.description || "No description"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/exams/${exam.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageExamsPage;
