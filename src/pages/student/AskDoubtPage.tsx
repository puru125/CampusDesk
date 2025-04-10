
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

interface Teacher {
  id: string;
  full_name: string;
  department?: string;
  specialization?: string;
}

const AskDoubtPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [teacherId, setTeacherId] = useState("");
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

  // Fetch teachers
  const { data: teachers, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await extendedSupabase
        .from("teachers_view")
        .select(`
          id,
          full_name,
          department,
          specialization
        `)
        .order("full_name");

      if (error) {
        console.error("Error fetching teachers:", error);
        return [];
      }
      
      return data as Teacher[];
    },
    enabled: !!studentData?.id,
  });

  // Fetch subjects when a teacher is selected
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["teacher-subjects", teacherId],
    queryFn: async () => {
      if (!teacherId) return [];

      const { data, error } = await extendedSupabase
        .from("teacher_subjects")
        .select(`
          subject_id,
          subjects(id, name, code)
        `)
        .eq("teacher_id", teacherId);
      
      if (error) {
        console.error("Error fetching teacher subjects:", error);
        return [];
      }
      
      return data.map(item => ({
        id: item.subjects.id,
        name: item.subjects.name,
        code: item.subjects.code
      }));
    },
    enabled: !!teacherId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      if (!user || !studentData?.id) {
        throw new Error("User not authenticated");
      }

      if (!teacherId) {
        throw new Error("Please select a teacher");
      }

      // Create a new doubt entry
      const { error } = await extendedSupabase
        .from("student_doubts")
        .insert([
          {
            student_id: studentData.id,
            teacher_id: teacherId,
            subject_id: subjectId || null,
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
                <Label htmlFor="teacher">Teacher</Label>
                <Select
                  value={teacherId}
                  onValueChange={(value) => {
                    setTeacherId(value);
                    setSubjectId(""); // Reset subject when teacher changes
                  }}
                >
                  <SelectTrigger id="teacher">
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingTeachers ? (
                      <SelectItem value="loading" disabled>
                        Loading teachers...
                      </SelectItem>
                    ) : teachers && teachers.length > 0 ? (
                      teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.full_name} {teacher.specialization ? `(${teacher.specialization})` : ''}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-teachers" disabled>
                        No teachers available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {teacherId && subjects && subjects.length > 0 && (
                <div>
                  <Label htmlFor="subject">Subject (Optional)</Label>
                  <Select
                    value={subjectId}
                    onValueChange={setSubjectId}
                  >
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select a subject (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingSubjects ? (
                        <SelectItem value="loading" disabled>
                          Loading subjects...
                        </SelectItem>
                      ) : (
                        subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name} {subject.code && `(${subject.code})`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

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
