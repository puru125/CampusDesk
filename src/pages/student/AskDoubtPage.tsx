
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HelpCircle, Send, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const AskDoubtPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Fetch student ID
  const { data: studentData } = useQuery({
    queryKey: ["student-id", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await extendedSupabase
        .from("students")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch subjects for the student
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["student-subjects", studentData?.id],
    queryFn: async () => {
      if (!studentData?.id) return [];
      
      const { data, error } = await extendedSupabase
        .from("subjects")
        .select(`
          id,
          name,
          code,
          teacher_id
        `)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!studentData?.id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      if (!user || !studentData?.id) {
        throw new Error("User not authenticated");
      }

      if (!subjectId) {
        throw new Error("Please select a subject");
      }

      // Get teacher ID for the selected subject
      const { data: subjectData, error: subjectError } = await extendedSupabase
        .from("subjects")
        .select("teacher_id")
        .eq("id", subjectId)
        .single();

      if (subjectError || !subjectData?.teacher_id) {
        throw new Error("Subject has no assigned teacher");
      }

      // Create a new doubt entry
      const { error } = await extendedSupabase
        .from("student_doubts")
        .insert([
          {
            student_id: studentData.id,
            teacher_id: subjectData.teacher_id,
            subject_id: subjectId,
            title,
            question,
            status: "pending"
          }
        ]);

      if (error) throw error;

      toast({
        title: "Doubt Submitted",
        description: "Your question has been sent to the teacher.",
      });

      // Redirect to a success page or doubts list
      navigate("/student/doubts");
    } catch (error: any) {
      console.error("Doubt submission error:", error);
      setSubmissionError(error.message || "Failed to submit doubt. Please try again.");
      toast({
        title: "Error",
        description: "Failed to submit doubt",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Ask a Doubt"
        description="Submit your questions to get help from teachers"
        icon={HelpCircle}
      />

      <div className="container mx-auto py-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={subjectId}
                  onValueChange={setSubjectId}
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingSubjects ? (
                      <SelectItem value="loading" disabled>
                        Loading subjects...
                      </SelectItem>
                    ) : (
                      subjects?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  type="text"
                  id="title"
                  placeholder="Enter a title for your question"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  placeholder="Describe your doubt or question in detail"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-32"
                  required
                />
              </div>

              {submissionError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{submissionError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Question"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AskDoubtPage;
