
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/ui/page-header";
import { Book, BookOpen, Users, Clock, ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CourseEditForm from "./CourseEditForm";
import SubjectsEditList from "./SubjectsEditList";
import TeacherAssignmentForm from "./TeacherAssignmentForm";
import ClassScheduleEdit from "./ClassScheduleEdit";

interface CourseEditModuleProps {
  courseId: string;
}

const CourseEditModule = ({ courseId }: CourseEditModuleProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("course-details");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch course data with error handling and retry mechanisms
  const { data: course, isLoading: courseLoading, error: courseError, refetch } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select(`
            *,
            subjects(*)
          `)
          .eq("id", courseId)
          .single();

        if (error) {
          console.error("Error fetching course:", error);
          setError("Failed to fetch course details. Please try again.");
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error("Failed to fetch course details:", error);
        toast({
          title: "Error",
          description: "Failed to fetch course details. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!courseId,
    retry: 2,
    staleTime: 1000 * 60 * 5,
  });

  // Check for dependencies before deletion
  const checkDependencies = async () => {
    try {
      // Check for teacher assignments
      const { data: teacherSubjects, error: tsError } = await supabase
        .from("teacher_subjects")
        .select("id")
        .in("subject_id", course?.subjects?.map(s => s.id) || []);
      
      if (tsError) throw tsError;
      
      if (teacherSubjects && teacherSubjects.length > 0) {
        return "Cannot delete course with assigned teachers. Please remove teacher assignments first.";
      }
      
      // Check for student enrollments
      const { data: enrollments, error: enError } = await supabase
        .from("student_course_enrollments")
        .select("id")
        .eq("course_id", courseId);
      
      if (enError) throw enError;
      
      if (enrollments && enrollments.length > 0) {
        return "Cannot delete course with student enrollments. Please remove enrollments first.";
      }
      
      // Check for timetable entries
      const subjectIds = course?.subjects?.map(s => s.id) || [];
      if (subjectIds.length > 0) {
        const { data: timetableEntries, error: ttError } = await supabase
          .from("timetable_entries")
          .select("id")
          .in("subject_id", subjectIds);
        
        if (ttError) throw ttError;
        
        if (timetableEntries && timetableEntries.length > 0) {
          return "Cannot delete course with scheduled classes. Please remove timetable entries first.";
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error checking dependencies:", error);
      return "An error occurred while checking course dependencies.";
    }
  };

  // Handle deletion of a course
  const deleteCourse = useMutation({
    mutationFn: async () => {
      setIsDeleting(true);
      
      // First check dependencies
      const dependencyError = await checkDependencies();
      if (dependencyError) {
        throw new Error(dependencyError);
      }
      
      // Delete subjects first (cascade delete would be better in the database)
      if (course?.subjects && course.subjects.length > 0) {
        const { error: subjectError } = await supabase
          .from("subjects")
          .delete()
          .eq("course_id", courseId);
        
        if (subjectError) throw subjectError;
      }
      
      // Then delete the course
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);
      
      if (error) throw error;
      
      return "Course deleted successfully";
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      navigate("/courses");
    },
    onError: (error: Error) => {
      console.error("Failed to delete course:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsDeleting(false);
    }
  });

  // Handle back navigation
  const handleBackClick = () => {
    navigate("/courses");
  };

  // Handle confirming course deletion
  const handleDeleteConfirm = async () => {
    if (confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      deleteCourse.mutate();
    }
  };

  if (courseLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
      </div>
    );
  }

  if (courseError || (!course && !courseLoading)) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-center">
          <h3 className="mt-2 text-xl font-semibold text-gray-900">Course not found</h3>
          <p className="mt-1 text-gray-500">The course you're looking for doesn't exist or you don't have permission to access it.</p>
          <div className="mt-6">
            <Button onClick={handleBackClick}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Course Management"
        description={`Edit details for ${course?.name}`}
        icon={BookOpen}
      >
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleBackClick}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Course"
            )}
          </Button>
        </div>
      </PageHeader>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="course-details" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="course-details" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            Course Details
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex items-center">
            <Book className="mr-2 h-4 w-4" />
            Subjects
          </TabsTrigger>
          <TabsTrigger value="teachers" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Teacher Assignment
          </TabsTrigger>
          <TabsTrigger value="classes" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Class Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="course-details" className="space-y-4">
          <CourseEditForm 
            course={course} 
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["course", courseId] });
              queryClient.invalidateQueries({ queryKey: ["courses"] });
              toast({
                title: "Success",
                description: "Course details updated successfully",
              });
              refetch();
            }} 
          />
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <SubjectsEditList 
            courseId={courseId} 
            subjects={course?.subjects || []} 
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["course", courseId] });
              toast({
                title: "Success",
                description: "Subjects updated successfully",
              });
              refetch();
            }}
          />
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <TeacherAssignmentForm 
            courseId={courseId}
            subjects={course?.subjects || []}
            onSuccess={() => {
              toast({
                title: "Success",
                description: "Teacher assignments updated successfully",
              });
            }}
          />
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <ClassScheduleEdit 
            courseId={courseId}
            subjects={course?.subjects || []}
            onSuccess={() => {
              toast({
                title: "Success",
                description: "Class schedule updated successfully",
              });
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseEditModule;
