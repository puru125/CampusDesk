
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, Filter, Loader2, UserPlus, IdCard } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const TeacherStudentsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
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
          .select('subject_id, subjects(id, name, code, course_id)')
          .eq('teacher_id', teacherProfile.id);
          
        if (subjectsError) throw subjectsError;
        
        const subjectIds = teacherSubjects?.map(ts => ts.subject_id) || [];
        
        // Get students assigned to this teacher via teacher_students table
        const { data: teacherStudents, error: studentsError } = await extendedSupabase
          .from('teacher_students')
          .select(`
            student_id,
            students(
              id,
              contact_number,
              enrollment_number,
              enrollment_status,
              user_id,
              users:user_id(
                full_name,
                email
              )
            )
          `)
          .eq('teacher_id', teacherProfile.id);

        if (studentsError) throw studentsError;
        
        // Format students data
        const formattedStudents = teacherStudents?.map(ts => {
          const student = ts.students;
          return {
            id: student.id,
            name: student.users?.full_name || 'Unknown',
            roll: student.enrollment_number || 'N/A',
            email: student.users?.email || 'N/A',
            attendance: "N/A", // This will be calculated later
            grade: "N/A",      // This will be calculated later
            contact: student.contact_number || 'N/A'
          };
        }) || [];
        
        setStudents(formattedStudents);
        
        // Get teacher's classes
        const { data: teacherClasses, error: classesError } = await extendedSupabase
          .from('timetable_entries')
          .select(`
            subjects(id, name, code),
            classes(id, name, room, capacity)
          `)
          .eq('teacher_id', teacherProfile.id);
          
        if (classesError) throw classesError;
        
        // Format classes data - filter out duplicates based on subject ID
        const formattedClasses = teacherClasses?.map(tc => ({
          id: tc.subjects?.id || '',
          name: tc.subjects?.name || 'Unknown Subject',
          code: tc.subjects?.code || ''
        })).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) || [];
        
        setClasses(formattedClasses);
        
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
    
    fetchTeacherStudents();
  }, [user, toast]);
  
  // Filter students based on search term and selected class
  const filteredStudents = students.filter(student => 
    (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedClass === "" || student.class === selectedClass)
  );
  
  return (
    <div>
      <PageHeader
        title="My Students"
        description="View students in your classes"
        icon={Users}
      >
        <Button onClick={() => navigate("/teacher/students/add")}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </PageHeader>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search students..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Classes</SelectItem>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card className="mt-6">
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
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Roll No.</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Contact</th>
                    <th className="px-4 py-3 text-left font-medium">Attendance</th>
                    <th className="px-4 py-3 text-left font-medium">Grade</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="border-b">
                      <td className="px-4 py-3">{student.name}</td>
                      <td className="px-4 py-3">{student.roll}</td>
                      <td className="px-4 py-3">{student.email}</td>
                      <td className="px-4 py-3">{student.contact}</td>
                      <td className="px-4 py-3">{student.attendance}</td>
                      <td className="px-4 py-3">{student.grade}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/teacher/students/${student.id}`)}>View</Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/teacher/students/${student.id}/id-card`)}>
                          <IdCard className="h-4 w-4 mr-1" />
                          ID Card
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No Students Found</h3>
              <p className="mt-1 text-gray-500">
                No students match your search criteria or you haven't been assigned any students yet.
              </p>
              <Button className="mt-4" onClick={() => navigate("/teacher/students/add")}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherStudentsPage;
