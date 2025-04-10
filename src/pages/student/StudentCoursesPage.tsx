import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  name: string;
  description: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  academic_year: string;
  semester: number;
  enrollment_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  course?: Course;
}

const getStatusBadgeVariant = (status: string): "default" | "destructive" | "success" | "outline" | "secondary" => {
  switch (status.toLowerCase()) {
    case 'approved':
      return "success";
    case 'rejected':
      return "destructive";
    case 'pending':
      return "secondary"; 
    default:
      return "outline";
  }
};

const StudentCoursesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEnrollmentDialogOpen, setIsEnrollmentDialogOpen] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState<number | null>(null);
  const [enrollmentDate, setEnrollmentDate] = useState<Date | undefined>(
    new Date()
  );
  const [studentId, setStudentId] = useState<string | null>(null);

  const academicYears = ["2023-2024", "2024-2025", "2025-2026"];
  const semesters = [1, 2];

  useEffect(() => {
    if (user) {
      fetchStudentId();
    }
  }, [user]);

  useEffect(() => {
    if (studentId) {
      fetchCourses();
      fetchEnrollments();
    }
  }, [studentId]);

  const fetchStudentId = async () => {
    try {
      const { data, error } = await extendedSupabase
        .from('students')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setStudentId(data.id);
      }
    } catch (error) {
      console.error("Error fetching student ID:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await extendedSupabase
        .from("courses")
        .select("*")
        .order("name");

      if (error) {
        throw error;
      }

      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
    }
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);

      const { data, error } = await extendedSupabase
        .from("student_course_enrollments")
        .select(
          `
          id,
          student_id,
          course_id,
          academic_year,
          semester,
          status,
          created_at,
          updated_at,
          courses (
            id,
            name,
            description,
            credits
          )
        `
        )
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const formattedEnrollments: Enrollment[] = data.map((enrollment: any) => ({
          id: enrollment.id,
          student_id: enrollment.student_id,
          course_id: enrollment.course_id,
          academic_year: enrollment.academic_year,
          semester: enrollment.semester,
          enrollment_date: new Date().toISOString(), // Default value as it doesn't exist yet
          status: enrollment.status,
          created_at: enrollment.created_at,
          updated_at: enrollment.updated_at,
          course: enrollment.courses,
        }));

        setEnrollments(formattedEnrollments);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch enrollments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEnrollmentDialog = () => {
    setAvailableCourses(
      courses.filter(
        (course) =>
          !enrollments.find((enrollment) => enrollment.course_id === course.id)
      )
    );
    setIsEnrollmentDialogOpen(true);
  };

  const closeEnrollmentDialog = () => {
    setIsEnrollmentDialogOpen(false);
    setSelectedCourseId(null);
    setAcademicYear("");
    setSemester(null);
    setEnrollmentDate(undefined);
  };

  const handleEnrollment = async () => {
    if (!selectedCourseId || !academicYear || !semester || !enrollmentDate || !studentId) {
      toast({
        title: "Error",
        description: "Please fill in all the enrollment details.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await extendedSupabase
        .from("student_course_enrollments")
        .insert({
          student_id: studentId,
          course_id: selectedCourseId,
          academic_year: academicYear,
          semester: semester,
          enrollment_date: format(enrollmentDate, "yyyy-MM-dd"),
          status: "pending",
        });

      if (error) {
        throw error;
      }

      fetchEnrollments();
      closeEnrollmentDialog();

      toast({
        title: "Success",
        description: "Enrollment request submitted successfully.",
      });
    } catch (error) {
      console.error("Error submitting enrollment:", error);
      toast({
        title: "Error",
        description: "Failed to submit enrollment request.",
        variant: "destructive",
      });
    }
  };

  const handleUnenroll = async (enrollmentId: string) => {
    try {
      const { error } = await extendedSupabase
        .from("student_course_enrollments")
        .delete()
        .eq("id", enrollmentId);

      if (error) {
        throw error;
      }

      fetchEnrollments();

      toast({
        title: "Success",
        description: "Unenrolled from course successfully.",
      });
    } catch (error) {
      console.error("Error un-enrolling from course:", error);
      toast({
        title: "Error",
        description: "Failed to un-enroll from course.",
        variant: "destructive",
      });
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) =>
    enrollment.course?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="My Courses"
        description="View and manage your course enrollments"
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Input
              type="search"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={openEnrollmentDialog}>Enroll in Course</Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-institute-500"></div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Course Enrollments</CardTitle>
              <CardDescription>
                Here are the courses you are enrolled in.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        {enrollment.course?.name}
                      </TableCell>
                      <TableCell>{enrollment.course?.credits}</TableCell>
                      <TableCell>{enrollment.academic_year}</TableCell>
                      <TableCell>{enrollment.semester}</TableCell>
                      <TableCell>
                        {format(new Date(enrollment.created_at), "PPP")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(enrollment.status)}
                          className={enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                        >
                          {enrollment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnenroll(enrollment.id)}
                        >
                          Unenroll
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Dialog open={isEnrollmentDialogOpen} onOpenChange={closeEnrollmentDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Enroll in a Course</DialogTitle>
              <DialogDescription>
                Select a course to enroll in for the current academic year.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="course" className="text-right">
                  Course
                </Label>
                <div className="col-span-3">
                  <Select
                    value={selectedCourseId || ""}
                    onValueChange={setSelectedCourseId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="academicYear" className="text-right">
                  Academic Year
                </Label>
                <div className="col-span-3">
                  <Select
                    value={academicYear}
                    onValueChange={setAcademicYear}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="semester" className="text-right">
                  Semester
                </Label>
                <div className="col-span-3">
                  <Select
                    value={semester !== null ? semester.toString() : ""}
                    onValueChange={(value) => setSemester(parseInt(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((semester) => (
                        <SelectItem key={semester} value={semester.toString()}>
                          {semester}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="enrollmentDate" className="text-right">
                  Enrollment Date
                </Label>
                <div className="col-span-3">
                  <DatePicker
                    id="enrollmentDate"
                    selected={enrollmentDate}
                    onSelect={setEnrollmentDate}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={closeEnrollmentDialog}>
                Cancel
              </Button>
              <Button type="button" onClick={handleEnrollment}>
                Enroll
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default StudentCoursesPage;
