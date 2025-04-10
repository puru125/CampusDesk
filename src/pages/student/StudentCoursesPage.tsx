
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { Course } from "@/types";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Calendar, Info, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EnrolledCourse extends Course {
  enrollment_id: string;
  enrollment_status: string;
  academic_year: string;
  semester: number;
}

const StudentCoursesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [enrollingCourse, setEnrollingCourse] = useState<string | null>(null);
  const [droppingCourse, setDroppingCourse] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;

        // Get student ID first
        const { data: studentData, error: studentError } = await extendedSupabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (studentError) throw studentError;
        setStudentId(studentData.id);

        // Fetch all active courses
        const { data: coursesData, error: coursesError } = await extendedSupabase
          .from('courses')
          .select('*')
          .eq('is_active', true);

        if (coursesError) throw coursesError;

        // Fetch enrolled courses
        const { data: enrollmentsData, error: enrollmentsError } = await extendedSupabase
          .from('student_course_enrollments')
          .select(`
            id,
            course_id,
            status,
            academic_year,
            semester,
            courses (
              id,
              name,
              code,
              description,
              credits,
              duration,
              is_active
            )
          `)
          .eq('student_id', studentData.id);

        if (enrollmentsError) throw enrollmentsError;

        // Format enrolled courses
        const enrolledCoursesFormatted = enrollmentsData.map((enrollment) => ({
          ...enrollment.courses,
          enrollment_id: enrollment.id,
          enrollment_status: enrollment.status,
          academic_year: enrollment.academic_year,
          semester: enrollment.semester
        }));

        setEnrolledCourses(enrolledCoursesFormatted);

        // Filter out courses that the student is already enrolled in or has pending enrollment
        const enrolledCourseIds = new Set(enrollmentsData.map(e => e.course_id));
        const availableCoursesFiltered = coursesData.filter(course => !enrolledCourseIds.has(course.id));
        
        setAvailableCourses(availableCoursesFiltered);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast({
          title: "Error",
          description: "Failed to load courses data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleEnrollCourse = async (courseId: string) => {
    try {
      if (!studentId) return;
      
      setEnrollingCourse(courseId);
      
      // Get current academic year and semester (this would typically come from your system settings)
      const currentYear = new Date().getFullYear().toString();
      const currentSemester = 1; // This is a placeholder - adjust as needed
      
      // Create enrollment request
      const { data, error } = await extendedSupabase.rpc(
        'request_course_enrollment',
        { 
          p_student_id: studentId,
          p_course_id: courseId,
          p_academic_year: currentYear,
          p_semester: currentSemester
        }
      );
      
      if (error) throw error;
      
      toast({
        title: "Enrollment Requested",
        description: "Your course enrollment request has been submitted for approval",
      });
      
      // Refresh the course lists
      navigate(0);
    } catch (error: any) {
      console.error("Error enrolling in course:", error);
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to enroll in course",
        variant: "destructive",
      });
    } finally {
      setEnrollingCourse(null);
    }
  };

  const handleDropCourse = async (enrollmentId: string) => {
    try {
      setDroppingCourse(enrollmentId);
      
      // Update enrollment status to 'dropped'
      const { error } = await extendedSupabase
        .from('student_course_enrollments')
        .update({ status: 'dropped' })
        .eq('id', enrollmentId)
        .eq('student_id', studentId);
      
      if (error) throw error;
      
      toast({
        title: "Course Dropped",
        description: "You have successfully dropped the course",
      });
      
      // Refresh the course lists
      navigate(0);
    } catch (error: any) {
      console.error("Error dropping course:", error);
      toast({
        title: "Action Failed",
        description: error.message || "Failed to drop course",
        variant: "destructive",
      });
    } finally {
      setDroppingCourse(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'dropped':
        return <Badge className="bg-gray-100 text-gray-800">Dropped</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div>
      <PageHeader
        title="My Courses"
        description="Manage your course enrollments and view course details"
        icon={BookOpen}
      />
      
      <Tabs defaultValue="enrolled" className="mt-6">
        <TabsList>
          <TabsTrigger value="enrolled">Enrolled Courses</TabsTrigger>
          <TabsTrigger value="available">Available Courses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="enrolled" className="space-y-4 mt-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <Card key={course.enrollment_id} className="shadow-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{course.name}</CardTitle>
                      {getStatusBadge(course.enrollment_status)}
                    </div>
                    <CardDescription>{course.code}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {course.description || "No description available"}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-gray-500" />
                        <span>Duration: {course.duration}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        <span>Academic Year: {course.academic_year}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Info className="mr-2 h-4 w-4 text-gray-500" />
                        <span>Semester: {course.semester}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {course.enrollment_status === 'approved' && (
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => handleDropCourse(course.enrollment_id)}
                        disabled={droppingCourse === course.enrollment_id}
                      >
                        {droppingCourse === course.enrollment_id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Drop Course
                      </Button>
                    )}
                    {course.enrollment_status === 'pending' && (
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled
                      >
                        Pending Approval
                      </Button>
                    )}
                    {course.enrollment_status === 'dropped' && (
                      <Button 
                        variant="outline" 
                        className="w-full opacity-50"
                        disabled
                      >
                        Dropped
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Enrolled Courses</AlertTitle>
              <AlertDescription>
                You are not enrolled in any courses. Check the Available Courses tab to enroll.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="available" className="space-y-4 mt-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : availableCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course) => (
                <Card key={course.id} className="shadow-sm">
                  <CardHeader>
                    <CardTitle>{course.name}</CardTitle>
                    <CardDescription>{course.code}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {course.description || "No description available"}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Clock className="mr-2 h-4 w-4 text-gray-500" />
                        <span>Duration: {course.duration}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Info className="mr-2 h-4 w-4 text-gray-500" />
                        <span>Credits: {course.credits}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={() => handleEnrollCourse(course.id)}
                      disabled={enrollingCourse === course.id}
                    >
                      {enrollingCourse === course.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Enroll
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Available Courses</AlertTitle>
              <AlertDescription>
                There are no available courses for enrollment at this time.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentCoursesPage;
