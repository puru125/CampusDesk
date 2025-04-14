
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
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HelpCircle, CheckCircle } from "lucide-react";

const StudentFeedbackPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [rating, setRating] = useState(3);
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

      if (!subject.trim()) {
        throw new Error("Please enter a subject for your feedback");
      }
      
      if (!feedbackText.trim()) {
        throw new Error("Please enter your feedback message");
      }
      
      if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      const { data: studentData, error: studentError } = await extendedSupabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (studentError) throw studentError;

      // The issue is here: The database expects a rating between 1-10
      // But we're accepting 1-5 in our UI, so we need to properly scale it
      // Fix: Ensure rating is exactly between 1-10 by multiplying by 2
      const dbRating = rating * 2;
      
      const { error } = await extendedSupabase
        .from('student_feedback')
        .insert([
          { 
            student_id: studentData.id,
            title: subject,
            message: feedbackText,
            rating: dbRating,
            is_read: false,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });

      navigate("/student/feedback/success");
    } catch (error: any) {
      console.error("Feedback submission error:", error);
      setSubmissionError(error.message || "Failed to submit feedback. Please try again.");
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
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
                <Label htmlFor="rating">Rating (1-5)</Label>
                <div className="py-4">
                  <Slider
                    id="rating"
                    defaultValue={[rating]}
                    value={[rating]}
                    min={1} 
                    max={5}
                    step={1}
                    onValueChange={(value) => setRating(value[0])}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Selected Rating: {rating} / 5
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
