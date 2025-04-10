import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Search, Calendar, Clock, Download, Save, Loader2, AlertCircle } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AttendancePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchTerm, setSearchTerm] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{
    class?: string;
    subject?: string;
    date?: string;
  }>({});
  
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        if (!user) return;
        
        const { data: teacherProfile, error: teacherError } = await extendedSupabase
          .from('teachers')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (teacherError) {
          console.error("Error fetching teacher profile:", teacherError);
          throw teacherError;
        }
        
        setTeacherId(teacherProfile.id);
        console.log("Teacher ID:", teacherProfile.id);
        
        const { data: timetable, error: timetableError } = await extendedSupabase
          .from('timetable_entries')
          .select(`
            class_id,
            subject_id,
            classes(id, name, room),
            subjects(id, name, code)
          `)
          .eq('teacher_id', teacherProfile.id);
          
        if (timetableError) {
          console.error("Error fetching timetable:", timetableError);
          throw timetableError;
        }
        
        console.log("Timetable entries:", timetable);
        
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
        console.log("Unique classes:", uniqueClasses);
        
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
        console.log("Unique subjects:", uniqueSubjects);
        
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
        console.log("Fetching students for class:", selectedClass, "and teacher:", teacherId);
        
        const { data: studentsData, error: studentsError } = await extendedSupabase
          .from('students_view')
          .select('*');
          
        if (studentsError) {
          console.error("Error fetching students:", studentsError);
          throw studentsError;
        }
        
        console.log("All students:", studentsData);
        
        if (studentsData && studentsData.length > 0) {
          const { data: existingAttendance, error: attendanceError } = await extendedSupabase
            .from('attendance_records')
            .select('*')
            .eq('teacher_id', teacherId)
            .eq('class_id', selectedClass)
            .eq('subject_id', selectedSubject)
            .eq('date', selectedDate);
          
          if (attendanceError) {
            console.error("Error fetching attendance:", attendanceError);
            throw attendanceError;
          }
          
          const attendanceMap = new Map();
          existingAttendance?.forEach(record => {
            attendanceMap.set(record.student_id, record.status === 'present');
          });
          
          const formattedAttendance = studentsData.map(student => {
            const isPresent = attendanceMap.has(student.id) 
              ? attendanceMap.get(student.id) 
              : true;
              
            return {
              id: crypto.randomUUID(),
              studentId: student.id,
              studentName: student.full_name || 'Unknown',
              rollNo: student.enrollment_number || 'N/A',
              present: isPresent
            };
          });
          
          setAttendanceData(formattedAttendance);
        } else {
          setAttendanceData([]);
        }
        
      } catch (error) {
        console.error("Error fetching students:", error);
        toast({
          title: "Error",
          description: "Failed to fetch student data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, [selectedClass, selectedSubject, selectedDate, teacherId]);
  
  const filteredAttendance = attendanceData.filter(attendance => 
    attendance.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendance.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const toggleAttendance = (studentId: string) => {
    setAttendanceData(prev => 
      prev.map(item => 
        item.studentId === studentId 
          ? { ...item, present: !item.present } 
          : item
      )
    );
    
    const student = attendanceData.find(item => item.studentId === studentId);
    if (student) {
      const newStatus = !student.present ? 'present' : 'absent';
      toast({
        title: `Marked ${newStatus}`,
        description: `${student.studentName} marked as ${newStatus}`,
        variant: newStatus === 'present' ? 'default' : 'destructive',
      });
    }
  };
  
  const markAllPresent = () => {
    setAttendanceData(prev => 
      prev.map(item => ({ ...item, present: true }))
    );
    
    toast({
      title: "All students marked present",
      description: `${attendanceData.length} students marked as present`,
    });
  };
  
  const markAllAbsent = () => {
    setAttendanceData(prev => 
      prev.map(item => ({ ...item, present: false }))
    );
    
    toast({
      title: "All students marked absent",
      description: `${attendanceData.length} students marked as absent`,
      variant: "destructive",
    });
  };
  
  const validateForm = () => {
    const errors: {
      class?: string;
      subject?: string;
      date?: string;
    } = {};
    
    if (!selectedClass) {
      errors.class = "Please select a class";
    }
    
    if (!selectedSubject) {
      errors.subject = "Please select a subject";
    }
    
    if (!selectedDate) {
      errors.date = "Please select a date";
    } else {
      const selectedDateObj = new Date(selectedDate);
      const today = new Date();
      if (selectedDateObj > today) {
        errors.date = "Cannot mark attendance for future dates";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const saveAttendance = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        variant: "destructive",
      });
      return;
    }
    
    if (!teacherId || !selectedClass || !selectedSubject) {
      toast({
        title: "Error",
        description: "Please select a class and subject",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSaving(true);
      
      const { data: existingRecords } = await extendedSupabase
        .from('attendance_records')
        .select('id')
        .eq('teacher_id', teacherId)
        .eq('class_id', selectedClass)
        .eq('subject_id', selectedSubject)
        .eq('date', selectedDate);
      
      if (existingRecords && existingRecords.length > 0) {
        if (!window.confirm("Attendance records already exist for this date. Do you want to overwrite them?")) {
          setSaving(false);
          return;
        }
        
        await extendedSupabase
          .from('attendance_records')
          .delete()
          .eq('teacher_id', teacherId)
          .eq('class_id', selectedClass)
          .eq('subject_id', selectedSubject)
          .eq('date', selectedDate);
      }
      
      const records = attendanceData.map(item => ({
        teacher_id: teacherId,
        student_id: item.studentId,
        class_id: selectedClass,
        subject_id: selectedSubject,
        date: selectedDate,
        status: item.present ? 'present' : 'absent',
        remarks: null
      }));
      
      const { error } = await extendedSupabase
        .from('attendance_records')
        .insert(records);
        
      if (error) throw error;
      
      const className = classes.find(c => c.id === selectedClass)?.name || 'selected class';
      const subjectName = subjects.find(s => s.id === selectedSubject)?.name || 'selected subject';
      const formattedDate = format(new Date(selectedDate), 'MMMM d, yyyy');
      
      toast({
        title: "Attendance Saved",
        description: `Attendance for ${className} - ${subjectName} on ${formattedDate} has been saved successfully.`,
      });
      
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error",
        description: "Failed to save attendance records",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Mark and manage student attendance"
        icon={CheckCircle2}
      >
        <Button variant="outline" onClick={() => {}}>
          <Download className="mr-2 h-4 w-4" />
          Export Records
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium mb-2">Select Class</label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className={formErrors.class ? "border-red-500" : ""}>
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
          {formErrors.class && (
            <p className="text-sm text-red-500 mt-1">{formErrors.class}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Select Subject</label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className={formErrors.subject ? "border-red-500" : ""}>
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
          {formErrors.subject && (
            <p className="text-sm text-red-500 mt-1">{formErrors.subject}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Select Date</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={formErrors.date ? "border-red-500" : ""}
            max={format(new Date(), "yyyy-MM-dd")}
          />
          {formErrors.date && (
            <p className="text-sm text-red-500 mt-1">{formErrors.date}</p>
          )}
        </div>
      </div>
      
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Search Students</label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name or roll no."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {!selectedClass || !selectedSubject || !selectedDate ? (
        <Alert className="mt-6" variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Required Fields</AlertTitle>
          <AlertDescription>
            Please select a class, subject, and date to mark attendance.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Mark Attendance</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={markAllPresent}>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                Mark All Present
              </Button>
              <Button variant="outline" size="sm" onClick={markAllAbsent}>
                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                Mark All Absent
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
              </div>
            ) : attendanceData.length > 0 ? (
              <>
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
                      {filteredAttendance.map(record => (
                        <tr key={record.id} className="border-b">
                          <td className="px-4 py-3">{record.rollNo}</td>
                          <td className="px-4 py-3">{record.studentName}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={record.present}
                                onCheckedChange={() => toggleAttendance(record.studentId)}
                                className={cn(
                                  "h-5 w-5",
                                  record.present && "bg-green-500 text-white border-green-500"
                                )}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={!record.present}
                                onCheckedChange={() => toggleAttendance(record.studentId)}
                                className={cn(
                                  "h-5 w-5",
                                  !record.present && "bg-red-500 text-white border-red-500"
                                )}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button onClick={saveAttendance} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Attendance
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No Students Found</h3>
                <p className="mt-1 text-gray-500">
                  No students match your search criteria or you haven't been assigned any students.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendancePage;
