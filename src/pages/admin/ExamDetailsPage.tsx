
import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/ui/page-header";

const ExamDetailsPage = () => {
  const { examId } = useParams();

  const { data: exam, isLoading } = useQuery({
    queryKey: ["exam", examId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exams")
        .select(`
          *,
          exam_questions (*),
          exam_submissions (
            *,
            students (
              *,
              users (
                full_name,
                email
              )
            )
          )
        `)
        .eq("id", examId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-100 w-1/3 rounded" />
        <div className="h-32 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={exam?.title || "Exam Details"}
        description={exam?.description || "View exam details and submissions"}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Questions</CardTitle>
          </CardHeader>
          <CardContent>
            {exam?.exam_questions?.map((question: any, index: number) => (
              <div key={question.id} className="mb-6 last:mb-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Question {index + 1}</h3>
                  <Badge>{question.marks} marks</Badge>
                </div>
                <p className="mb-2">{question.question}</p>
                <div className="space-y-2">
                  {question.options.map((option: string, i: number) => (
                    <div
                      key={i}
                      className={`p-2 rounded-md border ${
                        option === question.correct_answer
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {exam?.exam_submissions?.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No submissions yet
              </div>
            ) : (
              <div className="space-y-4">
                {exam?.exam_submissions?.map((submission: any) => (
                  <Card key={submission.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">
                          {submission.students?.users?.full_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Score: {submission.score || "Pending"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          submission.status === "completed" ? "default" : "outline"
                        }
                      >
                        {submission.status}
                      </Badge>
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

export default ExamDetailsPage;
