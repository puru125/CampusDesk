
import { Navigate, useParams } from "react-router-dom";
import CourseEditModule from "@/components/courses/CourseEditModule";

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  
  if (!courseId) {
    return <Navigate to="/courses" />;
  }
  
  return <CourseEditModule courseId={courseId} />;
};

export default CourseDetailsPage;
