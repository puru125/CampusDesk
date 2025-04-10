import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HelpCircle, CheckCircle } from "lucide-react";

const StudentFeedbackPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get student ID
      const { data: studentData, error: studentError } = await extendedSupabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (studentError) throw studentError;

      // Create a new feedback entry
      // IMPORTANT: Replace "student_feedback" with an existing table
      // or set up a new method to handle feedback
      const { error } = await extendedSupabase
        .from('student_notifications') // Example: using student_notifications table
        .insert([
          { 
            student_id: studentData.id,
            title: "New Feedback",
            message: `Subject: ${subject}, Rating: ${rating}, Feedback: ${feedbackText}`,
            is_read: false,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });

      // Redirect to a success page
      navigate("/student/feedback/success");
    } catch (error: any) {
      console.error("Feedback submission error:", error);
      setSubmissionError(error.message || "Failed to submit feedback. Please try again.");
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Feedback"
        description="Share your thoughts and suggestions to help us improve"
        icon={HelpCircle}
      />

      <div className="container mx-auto py-6">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  type="text"
                  id="subject"
                  placeholder="Enter subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="Enter your feedback"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="rating">Rating</Label>
                <Slider
                  id="rating"
                  defaultValue={[rating]}
                  max={10}
                  step={1}
                  onValueChange={(value) => setRating(value[0])}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Selected Rating: {rating} / 10
                </p>
              </div>

              {submissionError && (
                <Alert variant="destructive">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{submissionError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentFeedbackPage;
