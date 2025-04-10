
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, ThumbsUp, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentFeedbackPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitFeedback = async (type: "feedback" | "complaint") => {
    try {
      if (!title.trim() || !message.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      // Get student ID first if not anonymous
      let studentId = null;
      if (!isAnonymous && user) {
        const { data, error } = await extendedSupabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        studentId = data.id;
      }

      // Submit feedback/complaint
      const { error } = await extendedSupabase
        .from('student_feedback')
        .insert({
          student_id: isAnonymous ? null : studentId,
          title,
          category,
          message,
          type,
          is_anonymous: isAnonymous,
          status: 'pending'
        });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: type === "feedback" 
          ? "Your feedback has been submitted successfully" 
          : "Your complaint has been submitted successfully",
      });
      
      // Reset form
      setTitle("");
      setCategory("general");
      setMessage("");
      setIsAnonymous(false);
      
      // Redirect to confirmation page
      navigate("/student/feedback/success");
    } catch (error: any) {
      console.error(`Error submitting ${type}:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to submit your ${type}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Feedback & Complaints"
        description="Submit your feedback or complaints to improve your learning experience"
        icon={MessageSquare}
      />
      
      <Tabs defaultValue="feedback" className="mt-6">
        <TabsList>
          <TabsTrigger value="feedback">Submit Feedback</TabsTrigger>
          <TabsTrigger value="complaint">File a Complaint</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feedback" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit Feedback</CardTitle>
              <CardDescription>
                Share your suggestions or appreciation with us
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback-title">Title</Label>
                <Input
                  id="feedback-title"
                  placeholder="Brief title for your feedback"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedback-category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="course">Course Content</SelectItem>
                    <SelectItem value="teaching">Teaching Quality</SelectItem>
                    <SelectItem value="facility">Facilities</SelectItem>
                    <SelectItem value="website">Website/Portal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedback-message">Your Feedback</Label>
                <Textarea
                  id="feedback-message"
                  placeholder="Share your thoughts, suggestions or appreciation..."
                  className="min-h-[150px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous-feedback"
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous(!isAnonymous)}
                  className="rounded border-gray-300 text-institute-600 shadow-sm focus:border-institute-300 focus:ring focus:ring-institute-200 focus:ring-opacity-50"
                />
                <Label htmlFor="anonymous-feedback" className="text-sm font-normal">
                  Submit anonymously
                </Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSubmitFeedback("feedback")}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ThumbsUp className="mr-2 h-4 w-4" />
                )}
                Submit Feedback
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="complaint" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>File a Complaint</CardTitle>
              <CardDescription>
                Report issues or problems that need attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="complaint-title">Title</Label>
                <Input
                  id="complaint-title"
                  placeholder="Brief title for your complaint"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="complaint-category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="academic">Academic Issue</SelectItem>
                    <SelectItem value="staff">Staff Behavior</SelectItem>
                    <SelectItem value="facility">Facilities</SelectItem>
                    <SelectItem value="fees">Fees & Payment</SelectItem>
                    <SelectItem value="discrimination">Discrimination/Harassment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="complaint-message">Complaint Details</Label>
                <Textarea
                  id="complaint-message"
                  placeholder="Describe your complaint in detail. Include relevant dates, persons involved, and any steps already taken..."
                  className="min-h-[150px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="anonymous-complaint"
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous(!isAnonymous)}
                  className="rounded border-gray-300 text-institute-600 shadow-sm focus:border-institute-300 focus:ring focus:ring-institute-200 focus:ring-opacity-50"
                />
                <Label htmlFor="anonymous-complaint" className="text-sm font-normal">
                  Submit anonymously
                </Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleSubmitFeedback("complaint")}
                disabled={isSubmitting} 
                variant="destructive"
                className="w-full"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <AlertTriangle className="mr-2 h-4 w-4" />
                )}
                Submit Complaint
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentFeedbackPage;
