
import { useState, useEffect } from "react";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, BookOpen, Clock, Calendar, Check, X } from "lucide-react";

// Define interfaces correctly
interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  duration: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EnrolledCourse {
  id: string;
  course_id: string;
  status: string;
  academic_year: string;
  semester: number;
  courses: Course;
}

const StudentCoursesPage = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("enrolled");

  useEffect(() => {
    if (user) {
      fetchEnrolledCourses();
      fetchAvailableCourses();
    }
  }, [user]);

  const fetchEnrolledCourses = async () => {
    try {
      // First get the student ID
      const { data: studentData, error: studentError } = await extendedSupabase
        .from('students')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (studentError) throw studentError;

      // Then get their enrolled courses
      const { data, error } = await extendedSupabase
        .from('student_course_enrollments')
        .select(`
          id, 
          course_id, 
          status, 
          academic_year, 
          semester,
          courses:course_id (
            id, name, code, description, credits, 
            duration, is_active, created_at, updated_at
          )
        `)
        .eq('student_id', studentData.id);

      if (error) throw error;
      setEnrolledCourses(data || []);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const { data, error } = await extendedSupabase
        .from('courses')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setAvailableCourses(data || []);
    } catch (error) {
      console.error("Error fetching available courses:", error);
    }
  };

  const renderCourseCard = (course: Course, isEnrolled = false, enrollmentData?: Partial<EnrolledCourse>) => {
    return (
      <Card key={course.id} className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">{course.name}</CardTitle>
            <Badge variant={isEnrolled ? "success" : "outline"}>
              {isEnrolled ? enrollmentData?.status || "Enrolled" : "Available"}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">Code: {course.code}</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">{course.description}</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center">
              <Book className="h-3 w-3 mr-1" />
              <span>Credits: {course.credits}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>Duration: {course.duration}</span>
            </div>
            {isEnrolled && enrollmentData && (
              <>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Year: {enrollmentData.academic_year}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-3 w-3 mr-1" />
                  <span>Semester: {enrollmentData.semester}</span>
                </div>
              </>
            )}
          </div>
          
          {!isEnrolled && (
            <Button size="sm" className="w-full mt-4">
              Enroll Now
            </Button>
          )}
          
          {isEnrolled && (
            <div className="flex justify-between mt-4">
              <Button size="sm" variant="outline" className="text-xs">
                View Details
              </Button>
              {enrollmentData?.status === "pending" && (
                <Badge variant="outline" className="bg-yellow-50">
                  Pending Approval
                </Badge>
              )}
              {enrollmentData?.status === "active" && (
                <Button size="sm" variant="destructive" className="text-xs">
                  <X className="h-3 w-3 mr-1" /> Drop Course
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <PageHeader
        title="My Courses"
        description="View and manage your course enrollments"
        icon={BookOpen}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="enrolled">Enrolled Courses</TabsTrigger>
          <TabsTrigger value="available">Available Courses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="enrolled" className="mt-6">
          {loading ? (
            <div className="text-center py-8">Loading enrolled courses...</div>
          ) : enrolledCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>You haven't enrolled in any courses yet.</p>
              <Button 
                onClick={() => setActiveTab("available")}
                variant="outline" 
                className="mt-4"
              >
                Browse Available Courses
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map(enrollment => 
                renderCourseCard(enrollment.courses, true, {
                  status: enrollment.status,
                  academic_year: enrollment.academic_year,
                  semester: enrollment.semester
                })
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="available" className="mt-6">
          {availableCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No courses are currently available for enrollment.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableCourses
                .filter(course => !enrolledCourses.some(ec => ec.course_id === course.id))
                .map(course => renderCourseCard(course))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentCoursesPage;
