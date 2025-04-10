
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, MessageSquare } from "lucide-react";

const FeedbackSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-12 max-w-md">
      <Card className="shadow-lg border-green-100">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. We appreciate your input and will review it shortly.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full" 
            onClick={() => navigate("/student/feedback")}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Submit Another Feedback
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate("/")}
          >
            <Home className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FeedbackSuccessPage;
