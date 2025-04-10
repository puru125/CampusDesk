
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageHeader from "@/components/ui/page-header";
import { Book, BookOpen, Users, Clock, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CourseEditForm from "./CourseEditForm";
import SubjectsEditList from "./SubjectsEditList";
import TeacherAssignmentForm from "./TeacherAssignmentForm";
import ClassScheduleEdit from "./ClassScheduleEdit";

const CourseEditModule = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("course-details");

  // Fetch course data with error handling and retry mechanisms
  const { data: course, isLoading: courseLoading, error: courseError } = useQuery({
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
    retry: 2, // Retry failed requests up to 2 times
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Handle deletion of a course
  const deleteCourse = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);
      
      if (error) {
        console.error("Error deleting course:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      navigate("/courses");
    },
    onError: (error) => {
      console.error("Failed to delete course:", error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle back navigation
  const handleBackClick = () => {
    navigate("/courses");
  };

  // Handle confirming course deletion
  const handleDeleteConfirm = () => {
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
            disabled={deleteCourse.isPending}
          >
            {deleteCourse.isPending ? (
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
