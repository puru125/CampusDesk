
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, Loader2, IdCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TeacherFilters from "@/components/teacher/TeacherFilters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const TeacherStudentsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<{
    courseId?: string;
    academicYear?: string;
    semester?: string;
    performanceMetric?: string;
    performanceValue?: string;
  }>({});
  
  useEffect(() => {
    fetchTeacherStudents();
  }, [user]);
  
  useEffect(() => {
    // Apply filters and search term
    let result = [...students];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply course filter if selected
    if (filters.courseId) {
      result = result.filter(student => student.courses.some((c: any) => c.id === filters.courseId));
    }
    
    // Apply academic year filter if selected
    if (filters.academicYear) {
      result = result.filter(student => 
        student.enrollments.some((e: any) => e.academic_year === filters.academicYear)
      );
    }
    
    // Apply semester filter if selected
    if (filters.semester) {
      result = result.filter(student => 
        student.enrollments.some((e: any) => e.semester === parseInt(filters.semester))
      );
    }
    
    // Apply performance filters if selected
    if (filters.performanceMetric && filters.performanceValue) {
      if (filters.performanceMetric === 'attendance') {
        switch(filters.performanceValue) {
          case 'Below 75%':
            result = result.filter(student => parseFloat(student.attendance) < 75);
            break;
          case '75% - 85%':
            result = result.filter(student => 
              parseFloat(student.attendance) >= 75 && parseFloat(student.attendance) <= 85
            );
            break;
          case 'Above 85%':
            result = result.filter(student => parseFloat(student.attendance) > 85);
            break;
        }
      } else if (filters.performanceMetric === 'grades') {
        switch(filters.performanceValue) {
          case 'Below 60%':
            result = result.filter(student => parseFloat(student.grade) < 60);
            break;
          case '60% - 75%':
            result = result.filter(student => 
              parseFloat(student.grade) >= 60 && parseFloat(student.grade) <= 75
            );
            break;
          case '75% - 90%':
            result = result.filter(student => 
              parseFloat(student.grade) > 75 && parseFloat(student.grade) <= 90
            );
            break;
          case 'Above 90%':
            result = result.filter(student => parseFloat(student.grade) > 90);
            break;
        }
      }
    }
    
    setFilteredStudents(result);
  }, [students, searchTerm, filters]);
  
  const fetchTeacherStudents = async () => {
    try {
      if (!user) return;
      
      // Get teacher profile
      const { data: teacherProfile, error: teacherError } = await extendedSupabase
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .single();
          
      if (teacherError) throw teacherError;
      
      // Get teacher's subjects
      const { data: teacherSubjects, error: subjectsError } = await extendedSupabase
        .from('teacher_subjects')
        .select('subject_id, subjects(id, name, code, course_id, courses(id, name))')
        .eq('teacher_id', teacherProfile.id);
          
      if (subjectsError) throw subjectsError;
      
      // Extract unique courses from teacher's subjects
      const uniqueCourses = teacherSubjects?.reduce((acc: any[], ts: any) => {
        if (ts.subjects?.courses && !acc.some(c => c.id === ts.subjects.courses.id)) {
          acc.push({
            id: ts.subjects.courses.id,
            name: ts.subjects.courses.name
          });
        }
        return acc;
      }, []) || [];
      
      setCourses(uniqueCourses);
      
      // Get teacher's assigned students
      const { data: teacherStudentsData, error: studentsError } = await extendedSupabase
        .from('teacher_students')
        .select(`
          id,
          student_id
        `)
        .eq('teacher_id', teacherProfile.id);

      if (studentsError) throw studentsError;
      
      // Once we have the student IDs, get the detailed student information
      if (teacherStudentsData && teacherStudentsData.length > 0) {
        const studentIds = teacherStudentsData.map(ts => ts.student_id);
        
        const { data: studentDetails, error: detailsError } = await extendedSupabase
          .from('students_view')
          .select('*')
          .in('id', studentIds);
            
        if (detailsError) throw detailsError;
        
        // Get enrollments for these students
        const { data: enrollments, error: enrollmentsError } = await extendedSupabase
          .from('student_course_enrollments')
          .select(`
            id,
            student_id,
            course_id,
            courses(id, name),
            academic_year,
            semester,
            status
          `)
          .in('student_id', studentIds)
          .eq('status', 'approved');
          
        if (enrollmentsError) throw enrollmentsError;
        
        // Get attendance for these students
        const { data: attendance, error: attendanceError } = await extendedSupabase
          .from('attendance_records')
          .select('*')
          .in('student_id', studentIds);
          
        if (attendanceError) throw attendanceError;
        
        // Calculate attendance percentage for each student
        const attendanceMap = studentIds.reduce((acc: Record<string, any>, studentId) => {
          const studentAttendance = attendance?.filter(a => a.student_id === studentId) || [];
          const totalClasses = studentAttendance.length;
          const presentClasses = studentAttendance.filter(a => a.status === 'present').length;
          const percentage = totalClasses > 0 ? (presentClasses / totalClasses * 100).toFixed(2) : 'N/A';
          
          acc[studentId] = percentage;
          return acc;
        }, {});
        
        // Format students data with enrollments and courses
        const formattedStudents = studentDetails?.map(student => {
          const studentEnrollments = enrollments?.filter(e => e.student_id === student.id) || [];
          const studentCourses = studentEnrollments.map(e => e.courses).filter(Boolean);
          
          // Calculate random grades for demo purposes (in real app this would come from a grades table)
          const randomGrade = (65 + Math.floor(Math.random() * 35)).toFixed(2);
          
          return {
            id: student.id,
            name: student.full_name || 'Unknown',
            roll: student.enrollment_number || 'N/A',
            email: student.email || 'N/A',
            attendance: attendanceMap[student.id] || 'N/A',
            grade: randomGrade,
            contact: student.contact_number || 'N/A',
            enrollments: studentEnrollments,
            courses: studentCourses
          };
        }) || [];
        
        setStudents(formattedStudents);
        setFilteredStudents(formattedStudents);
      } else {
        setStudents([]);
        setFilteredStudents([]);
      }
      
    } catch (error) {
      console.error("Error fetching teacher students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch student data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };
  
  return (
    <div>
      <PageHeader
        title="My Students"
        description="View and filter students in your classes"
        icon={Users}
      />
      
      <TeacherFilters 
        onFilterChange={handleFilterChange}
        courses={courses}
        showPerformanceFilters={true}
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6 mb-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search students..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Student List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map(student => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.roll}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.contact}</TableCell>
                      <TableCell>
                        <span className={
                          student.attendance === 'N/A' ? 'text-gray-500' :
                          parseFloat(student.attendance) < 75 ? 'text-red-500' :
                          parseFloat(student.attendance) < 85 ? 'text-yellow-500' :
                          'text-green-500'
                        }>
                          {student.attendance === 'N/A' ? 'N/A' : `${student.attendance}%`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={
                          parseFloat(student.grade) < 60 ? 'text-red-500' :
                          parseFloat(student.grade) < 75 ? 'text-yellow-500' :
                          parseFloat(student.grade) < 90 ? 'text-green-500' :
                          'text-blue-500 font-medium'
                        }>
                          {student.grade}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {student.courses.length > 0 
                          ? student.courses.map((c: any) => c?.name || 'Unknown').join(', ')
                          : 'No courses'}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/teacher/students/${student.id}`)}>View</Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/teacher/students/${student.id}/id-card`)}>
                          <IdCard className="h-4 w-4 mr-1" />
                          ID Card
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No Students Found</h3>
              <p className="mt-1 text-gray-500">
                No students match your filter criteria or you haven't been assigned any students yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherStudentsPage;
