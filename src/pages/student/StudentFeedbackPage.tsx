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
import { Star } from "lucide-react";
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
        throw new Error("Rating must be between 1 and 5 stars");
      }

      const { data: studentData, error: studentError } = await extendedSupabase
        .from('students')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (studentError) throw studentError;

      const validRating = rating * 2;
      
      const { error } = await extendedSupabase
        .from('student_feedback')
        .insert([
          { 
            student_id: studentData.id,
            title: subject,
            message: feedbackText,
            rating: validRating,
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

  const renderStars = (currentRating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index} 
        className={`h-8 w-8 cursor-pointer ${index < currentRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
        onClick={() => setRating(index + 1)}
      />
    ));
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
                <Label htmlFor="rating">Rating (1-5 stars)</Label>
                <div className="flex items-center space-x-2">
                  {renderStars(rating)}
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
