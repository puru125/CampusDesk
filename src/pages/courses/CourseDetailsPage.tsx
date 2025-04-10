
import { Navigate, useParams } from "react-router-dom";
import CourseEditModule from "@/components/courses/CourseEditModule";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  
  if (!courseId) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Course ID is required to view course details.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Navigate to="/courses" />
        </div>
      </div>
    );
  }
  
  return <CourseEditModule courseId={courseId} />;
};

export default CourseDetailsPage;
