import { useState, useEffect } from "react";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, BookOpen, Clock, Calendar, Check, X, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("enrolled");
  const [studentId, setStudentId] = useState<string | null>(null);
  
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [enrollmentYear, setEnrollmentYear] = useState<string>("");
  const [enrollmentSemester, setEnrollmentSemester] = useState<string>("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [dropDialogOpen, setDropDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrolledCourse | null>(null);
  const [isDropping, setIsDropping] = useState(false);

  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear-1}-${currentYear}`,
    `${currentYear}-${currentYear+1}`,
    `${currentYear+1}-${currentYear+2}`
  ];

  useEffect(() => {
    if (user) {
      fetchStudentId();
    }
  }, [user]);

  useEffect(() => {
    if (studentId) {
      fetchEnrolledCourses();
      fetchAvailableCourses();
    }
  }, [studentId]);

  const fetchStudentId = async () => {
    try {
      const { data: studentData, error: studentError } = await extendedSupabase
        .from('students')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (studentError) throw studentError;
      
      if (studentData) {
        setStudentId(studentData.id);
      }
    } catch (error) {
      console.error("Error fetching student ID:", error);
      toast({
        title: "Error",
        description: "Could not fetch student information",
        variant: "destructive",
      });
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
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
        .eq('student_id', studentId);

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

  const openEnrollDialog = (course: Course) => {
    setSelectedCourse(course);
    setEnrollmentYear(academicYears[0]);
    setEnrollmentSemester("1");
    setEnrollDialogOpen(true);
  };

  const closeEnrollDialog = () => {
    setSelectedCourse(null);
    setEnrollDialogOpen(false);
    setIsEnrolling(false);
  };

  const openDropDialog = (enrollment: EnrolledCourse) => {
    if (enrollment.status === "active" || enrollment.status === "pending") {
      setSelectedEnrollment(enrollment);
      setDropDialogOpen(true);
    } else {
      toast({
        title: "Cannot Drop Course",
        description: `Courses with status "${enrollment.status}" cannot be dropped.`,
        variant: "destructive",
      });
    }
  };

  const closeDropDialog = () => {
    setSelectedEnrollment(null);
    setDropDialogOpen(false);
    setIsDropping(false);
  };

  const enrollInCourse = async () => {
    if (!studentId || !selectedCourse || !enrollmentYear || !enrollmentSemester) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all enrollment details",
        variant: "destructive",
      });
      return;
    }

    const isAlreadyEnrolled = enrolledCourses.some(
      enrollment => 
        enrollment.course_id === selectedCourse.id && 
        enrollment.academic_year === enrollmentYear && 
        enrollment.semester === parseInt(enrollmentSemester)
    );

    if (isAlreadyEnrolled) {
      toast({
        title: "Already Enrolled",
        description: "You are already enrolled in this course for the selected academic year and semester",
        variant: "destructive",
      });
      return;
    }

    setIsEnrolling(true);
    try {
      const { data, error } = await extendedSupabase.rpc(
        'request_course_enrollment',
        {
          p_student_id: studentId,
          p_course_id: selectedCourse.id,
          p_academic_year: enrollmentYear,
          p_semester: parseInt(enrollmentSemester)
        }
      );

      if (error) throw error;

      toast({
        title: "Enrollment Requested",
        description: "Your enrollment request has been submitted for approval",
      });

      fetchEnrolledCourses();
      closeEnrollDialog();
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast({
        title: "Enrollment Failed",
        description: "Could not enroll in the course. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const dropCourse = async () => {
    if (!selectedEnrollment) return;

    setIsDropping(true);
    try {
      const { error } = await extendedSupabase
        .from('student_course_enrollments')
        .delete()
        .eq('id', selectedEnrollment.id);

      if (error) throw error;

      toast({
        title: "Course Dropped",
        description: "You have successfully dropped the course",
      });

      fetchEnrolledCourses();
      closeDropDialog();
    } catch (error) {
      console.error("Error dropping course:", error);
      toast({
        title: "Failed to Drop Course",
        description: "An error occurred while trying to drop the course",
        variant: "destructive",
      });
    } finally {
      setIsDropping(false);
    }
  };

  const goToPayFees = () => {
    navigate("/fees/make-payment");
  };

  const renderCourseCard = (course: Course, isEnrolled = false, enrollmentData?: Partial<EnrolledCourse>) => {
    return (
      <Card key={course.id} className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">{course.name}</CardTitle>
            <Badge variant={isEnrolled ? getStatusVariant(enrollmentData?.status) : "outline"}>
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
            <Button 
              size="sm" 
              className="w-full mt-4"
              onClick={() => openEnrollDialog(course)}
            >
              Enroll Now
            </Button>
          )}
          
          {isEnrolled && (
            <div className="flex justify-between mt-4">
              <Button size="sm" variant="outline" className="text-xs">
                View Details
              </Button>
              
              {enrollmentData?.status === "pending" && (
                <Badge variant="secondary" className="bg-yellow-50">
                  Pending Approval
                </Badge>
              )}

              {enrollmentData?.status === "approved" && (
                <Button size="sm" className="text-xs" onClick={goToPayFees}>
                  <AlertCircle className="h-3 w-3 mr-1" /> Pay Fees
                </Button>
              )}
              
              {(enrollmentData?.status === "active" || enrollmentData?.status === "pending") && (
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="text-xs"
                  onClick={() => openDropDialog(enrollmentData as EnrolledCourse)}
                >
                  <X className="h-3 w-3 mr-1" /> Drop Course
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "approved": return "secondary";
      case "active": return "success";
      case "rejected": return "destructive";
      case "completed": return "success";
      case "dropped": return "destructive";
      default: return "secondary";
    }
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
                  id: enrollment.id,
                  status: enrollment.status,
                  academic_year: enrollment.academic_year,
                  semester: enrollment.semester,
                  course_id: enrollment.course_id
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
                .filter(course => !enrolledCourses.some(ec => ec.course_id === course.id && (ec.status === "active" || ec.status === "pending")))
                .map(course => renderCourseCard(course))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in Course</DialogTitle>
            <DialogDescription>
              Complete the enrollment details below
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="course">Course</Label>
              <div id="course" className="font-medium mt-1">
                {selectedCourse?.name} ({selectedCourse?.code})
              </div>
            </div>

            <div>
              <Label htmlFor="academic-year">Academic Year</Label>
              <Select 
                value={enrollmentYear}
                onValueChange={setEnrollmentYear}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="semester">Semester</Label>
              <Select 
                value={enrollmentSemester}
                onValueChange={setEnrollmentSemester}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEnrollDialog} disabled={isEnrolling}>
              Cancel
            </Button>
            <Button onClick={enrollInCourse} disabled={isEnrolling}>
              {isEnrolling ? "Enrolling..." : "Enroll"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dropDialogOpen} onOpenChange={setDropDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Drop Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to drop this course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedEnrollment && (
            <div className="py-4">
              <div className="font-medium">{selectedEnrollment.courses.name}</div>
              <div className="text-sm text-gray-500">
                {selectedEnrollment.academic_year}, Semester {selectedEnrollment.semester}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDropDialog} disabled={isDropping}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={dropCourse} disabled={isDropping}>
              {isDropping ? "Dropping..." : "Drop Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentCoursesPage;
