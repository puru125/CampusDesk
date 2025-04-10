
import { useParams } from "react-router-dom";
import CourseEditModule from "@/components/courses/CourseEditModule";

const CourseEditPage = () => {
  const { courseId } = useParams();
  
  if (!courseId) {
    return <div className="p-6 text-center">
      <h2 className="text-xl font-semibold text-red-500">Error</h2>
      <p className="mt-2">Course ID is required to edit a course.</p>
    </div>;
  }
  
  return <CourseEditModule courseId={courseId} />;
};

export default CourseEditPage;
