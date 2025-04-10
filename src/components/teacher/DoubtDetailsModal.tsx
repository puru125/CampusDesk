
import { useState } from "react";
import { format } from "date-fns";
import { StudentDoubt } from "@/components/teacher/StudentDoubtsCard";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Circle, CheckCircle, ClipboardList } from "lucide-react";

interface DoubtDetailsModalProps {
  doubt: StudentDoubt | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: () => void;
}

const DoubtDetailsModal: React.FC<DoubtDetailsModalProps> = ({
  doubt,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!doubt) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "answered":
        return "bg-green-500";
      case "closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !user) return;
    
    setIsSubmitting(true);

    try {
      // Get teacher ID
      const { data: teacherData, error: teacherError } = await extendedSupabase
        .from("teachers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (teacherError) throw teacherError;

      // Insert the answer
      const { error: answerError } = await extendedSupabase
        .from("doubt_answers")
        .insert([
          {
            doubt_id: doubt.id,
            teacher_id: teacherData.id,
            answer,
          }
        ]);

      if (answerError) throw answerError;

      // Update the doubt status
      const { error: statusError } = await extendedSupabase
        .from("student_doubts")
        .update({ status: "answered", updated_at: new Date().toISOString() })
        .eq("id", doubt.id);

      if (statusError) throw statusError;

      toast({
        title: "Answer Submitted",
        description: "Your response has been sent to the student",
      });

      // Notify parent component to refresh data
      onStatusChange();
      onClose();
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your answer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDoubt = async () => {
    setIsSubmitting(true);

    try {
      // Update the doubt status
      const { error } = await extendedSupabase
        .from("student_doubts")
        .update({ status: "closed", updated_at: new Date().toISOString() })
        .eq("id", doubt.id);

      if (error) throw error;

      toast({
        title: "Doubt Closed",
        description: "This doubt has been marked as closed",
      });

      // Notify parent component to refresh data
      onStatusChange();
      onClose();
    } catch (error) {
      console.error("Error closing doubt:", error);
      toast({
        title: "Action Failed",
        description: "There was an error closing this doubt",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{doubt.title}</DialogTitle>
            <Badge variant="outline">
              <Circle className={`h-2 w-2 mr-1 ${getStatusColor(doubt.status)}`} />
              {doubt.status.charAt(0).toUpperCase() + doubt.status.slice(1)}
            </Badge>
          </div>
          <DialogDescription>
            From {doubt.students?.users?.full_name || "Student"} on{" "}
            {format(new Date(doubt.created_at), "MMM d, yyyy 'at' h:mm a")}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500 mb-1">Subject</div>
            <div>{doubt.subjects?.name} ({doubt.subjects?.code})</div>
          </div>

          <div className="mt-4">
            <div className="text-sm text-gray-500 mb-1">Question</div>
            <div className="whitespace-pre-line">{doubt.question}</div>
          </div>

          <Separator className="my-6" />

          {doubt.status === "pending" && (
            <div className="mt-4 space-y-4">
              <h4 className="font-medium flex items-center">
                <ClipboardList className="mr-2 h-4 w-4" />
                Your Response
              </h4>
              <Textarea
                placeholder="Type your answer here..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
          )}

          {doubt.status === "answered" && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Your Response
              </h4>
              <div className="bg-green-50 p-4 rounded-md whitespace-pre-line">
                {/* This would fetch the answer from doubt_answers */}
                This will show the teacher's response once implemented
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          {doubt.status === "pending" ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmitAnswer} disabled={!answer.trim() || isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </Button>
            </>
          ) : doubt.status === "answered" ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button variant="secondary" onClick={handleCloseDoubt} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Mark as Closed"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DoubtDetailsModal;
