
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Search, BookOpen, Download, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TeacherStudentsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  
  useEffect(() => {
    const fetchTeacherStudents = async () => {
      try {
        if (!user) return;
        
        // Get teacher profile
        const { data: teacherProfile, error: teacherError } = await supabase
          .from('teachers')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (teacherError) throw teacherError;
        
        setTeacherData(teacherProfile);
        
        // Get assigned courses through subjects
        const { data: teacherSubjects, error: subjectsError } = await supabase
          .from('teacher_subjects')
          .select(`
            subject_id,
            subjects(
              id,
              name,
              course_id,
              courses(id, name, code)
            )
          `)
          .eq('teacher_id', teacherProfile.id);
          
        if (subjectsError) throw subjectsError;
        
        // Extract unique courses
        const coursesMap = new Map();
        teacherSubjects?.forEach(ts => {
          const course = ts.subjects?.courses;
          if (course) {
            coursesMap.set(course.id, course);
          }
        });
        
        const coursesData = Array.from(coursesMap.values());
        setCourses(coursesData);
        
        // Get course IDs
        const courseIds = coursesData.map(course => course.id);
        
        if (courseIds.length === 0) {
          setStudents([]);
          setLoading(false);
          return;
        }
        
        // Get students enrolled in these courses
        const { data: enrollmentsData, error: enrollmentsError } = await supabase
          .from('student_course_enrollments')
          .select(`
            id,
            status,
            course_id,
            student_id,
            academic_year,
            semester,
            students(
              id,
              enrollment_number,
              user_id,
              users:user_id(
                id,
                email,
                full_name
              )
            ),
            courses(
              id,
              name,
              code
            )
          `)
          .in('course_id', courseIds)
          .eq('status', 'approved');
          
        if (enrollmentsError) throw enrollmentsError;
        
        // Format student data
        const studentsData = enrollmentsData?.map(enrollment => ({
          id: enrollment.students?.id,
          userId: enrollment.students?.users?.id,
          enrollmentId: enrollment.id,
          name: enrollment.students?.users?.full_name,
          email: enrollment.students?.users?.email,
          enrollmentNumber: enrollment.students?.enrollment_number,
          course: enrollment.courses?.name,
          courseId: enrollment.courses?.id,
          courseCode: enrollment.courses?.code,
          academicYear: enrollment.academic_year,
          semester: enrollment.semester,
        })) || [];
        
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching student data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch student data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherStudents();
  }, [user, toast]);

  // Filter students based on search term and selected course
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === "" || 
      (student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (student.enrollmentNumber && student.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCourse = selectedCourse === "" || student.courseId === selectedCourse;
    
    return matchesSearch && matchesCourse;
  });
  
  return (
    <div>
      <PageHeader
        title="My Students"
        description="View and manage students in your courses"
        icon={Users}
      />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-6 mb-6">
        <div className="relative w-full md:w-auto md:flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search students..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full md:w-[200px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Courses" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Courses</SelectItem>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name} {course.code && `(${course.code})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-institute-600" />
            Student List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
            </div>
          ) : filteredStudents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Enrollment Number</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={`${student.id}-${student.courseId}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{student.enrollmentNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div>{student.course}</div>
                        <div className="text-xs text-gray-500">{student.courseCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>{student.academicYear}</TableCell>
                    <TableCell>{student.semester}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No Students Found</h3>
              <p className="mt-1 text-gray-500">
                {courses.length === 0
                  ? "You don't have any courses assigned yet."
                  : "No students match your current search or filter criteria."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherStudentsPage;
