
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Save, Calendar, Loader2, Check, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AttendanceRecordPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [remarks, setRemarks] = useState("");
  
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        if (!user) return;
        
        // Get teacher profile
        const { data: teacherProfile, error: teacherError } = await extendedSupabase
          .from('teachers')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (teacherError) throw teacherError;
        
        setTeacherId(teacherProfile.id);
        
        // Get teacher's classes and subjects
        const { data: timetable, error: timetableError } = await extendedSupabase
          .from('timetable_entries')
          .select(`
            class_id,
            subject_id,
            classes(id, name, room),
            subjects(id, name, code)
          `)
          .eq('teacher_id', teacherProfile.id);
          
        if (timetableError) throw timetableError;
        
        // Extract unique classes
        const uniqueClasses = timetable?.reduce((acc: any[], entry) => {
          if (entry.classes && !acc.some(c => c.id === entry.classes.id)) {
            acc.push({
              id: entry.classes.id,
              name: entry.classes.name,
              room: entry.classes.room
            });
          }
          return acc;
        }, []) || [];
        
        setClasses(uniqueClasses);
        
        // Extract unique subjects
        const uniqueSubjects = timetable?.reduce((acc: any[], entry) => {
          if (entry.subjects && !acc.some(s => s.id === entry.subjects.id)) {
            acc.push({
              id: entry.subjects.id,
              name: entry.subjects.name,
              code: entry.subjects.code
            });
          }
          return acc;
        }, []) || [];
        
        setSubjects(uniqueSubjects);
        
        if (uniqueClasses.length > 0) {
          setSelectedClass(uniqueClasses[0].id);
        }
        
        if (uniqueSubjects.length > 0) {
          setSelectedSubject(uniqueSubjects[0].id);
        }
        
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch class data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherData();
  }, [user, toast]);
  
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass || !teacherId) return;
      
      try {
        setLoading(true);
        
        // Get students in the selected class
        const { data: classStudents, error: studentsError } = await extendedSupabase
          .from('teacher_students')
          .select(`
            student_id,
            students(
              id,
              enrollment_number,
              user_id,
              users:user_id(
                full_name,
                email
              )
            )
          `)
          .eq('teacher_id', teacherId);
          
        if (studentsError) throw studentsError;
        
        const formattedStudents = classStudents?.map(cs => {
          const student = cs.students;
          return {
            id: student.id,
            name: student.users?.full_name || 'Unknown',
            roll: student.enrollment_number || 'N/A',
            present: true // Default to present
          };
        }) || [];
        
        setStudents(formattedStudents);
        setAttendanceData(formattedStudents.map(student => ({
          student_id: student.id,
          status: 'present'
        })));
        
      } catch (error) {
        console.error("Error fetching students:", error);
        toast({
          title: "Error",
          description: "Failed to fetch students",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [selectedClass, teacherId, toast]);
  
  const toggleAttendance = (studentId: string) => {
    // Update attendance status
    setAttendanceData(prev => 
      prev.map(item => 
        item.student_id === studentId 
          ? { ...item, status: item.status === 'present' ? 'absent' : 'present' } 
          : item
      )
    );
    
    // Update students UI state
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, present: !student.present } 
          : student
      )
    );
  };
  
  const markAllPresent = () => {
    setAttendanceData(prev => 
      prev.map(item => ({ ...item, status: 'present' }))
    );
    
    setStudents(prev => 
      prev.map(student => ({ ...student, present: true }))
    );
  };
  
  const markAllAbsent = () => {
    setAttendanceData(prev => 
      prev.map(item => ({ ...item, status: 'absent' }))
    );
    
    setStudents(prev => 
      prev.map(student => ({ ...student, present: false }))
    );
  };
  
  const saveAttendanceRecords = async () => {
    if (!teacherId || !selectedClass || !selectedSubject) {
      toast({
        title: "Error",
        description: "Missing required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Check if records already exist for this date, class and subject
      const { data: existingRecords } = await extendedSupabase
        .from('attendance_records')
        .select('id')
        .eq('teacher_id', teacherId)
        .eq('class_id', selectedClass)
        .eq('subject_id', selectedSubject)
        .eq('date', date);
      
      if (existingRecords && existingRecords.length > 0) {
        // Ask user confirmation to overwrite
        if (!window.confirm("Attendance records already exist for this date. Do you want to overwrite them?")) {
          setSubmitting(false);
          return;
        }
        
        // Delete existing records
        await extendedSupabase
          .from('attendance_records')
          .delete()
          .eq('teacher_id', teacherId)
          .eq('class_id', selectedClass)
          .eq('subject_id', selectedSubject)
          .eq('date', date);
      }
      
      // Prepare records to insert
      const records = attendanceData.map(item => ({
        teacher_id: teacherId,
        student_id: item.student_id,
        class_id: selectedClass,
        subject_id: selectedSubject,
        date: date,
        status: item.status,
        remarks: remarks
      }));
      
      // Insert attendance records
      const { error } = await extendedSupabase
        .from('attendance_records')
        .insert(records);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Attendance records saved successfully",
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error("Error saving attendance records:", error);
      toast({
        title: "Error",
        description: "Failed to save attendance records",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div>
      <PageHeader
        title="Generate Attendance Records"
        description="Create and manage student attendance records"
        icon={FileText}
      />
      
      {success && (
        <Alert className="my-4 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Attendance records have been saved successfully.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium mb-2">Select Class</label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} ({cls.room})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Select Subject</label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Select Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={format(new Date(), "yyyy-MM-dd")}
          />
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Remarks (Optional)</label>
        <Textarea
          placeholder="Add any general remarks about today's attendance"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="h-20"
        />
      </div>
      
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Mark Attendance</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllPresent}>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Mark All Present
            </Button>
            <Button variant="outline" size="sm" onClick={markAllAbsent}>
              <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
              Mark All Absent
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
            </div>
          ) : students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium">Roll No.</th>
                    <th className="px-4 py-3 text-left font-medium">Student Name</th>
                    <th className="px-4 py-3 text-center font-medium">Present</th>
                    <th className="px-4 py-3 text-center font-medium">Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id} className="border-b">
                      <td className="px-4 py-3">{student.roll}</td>
                      <td className="px-4 py-3">{student.name}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={student.present}
                            onCheckedChange={() => !student.present && toggleAttendance(student.id)}
                            className={cn(
                              "h-5 w-5",
                              student.present && "bg-green-500 text-white border-green-500"
                            )}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={!student.present}
                            onCheckedChange={() => student.present && toggleAttendance(student.id)}
                            className={cn(
                              "h-5 w-5",
                              !student.present && "bg-red-500 text-white border-red-500"
                            )}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No Students Found</h3>
              <p className="mt-1 text-gray-500">
                No students are assigned to you for this class.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={saveAttendanceRecords} 
            disabled={submitting || students.length === 0}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Attendance Records
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AttendanceRecordPage;
