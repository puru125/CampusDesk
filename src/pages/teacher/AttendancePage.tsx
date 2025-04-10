
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { CheckSquare, ClipboardCheck, Download, Save, Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const AttendancePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      // Mock classes
      const mockClasses = [
        { id: "1", name: "Database Systems (CS301)", time: "10:00 - 11:30", room: "A101" },
        { id: "2", name: "Web Development (CS302)", time: "13:00 - 14:30", room: "B202" },
        { id: "3", name: "Data Structures (CS201)", time: "15:00 - 16:30", room: "C303" },
      ];
      
      // Mock students
      const mockStudents = [
        { id: "s1", name: "Ravi Kumar", enrollmentNumber: "S202301001" },
        { id: "s2", name: "Priya Sharma", enrollmentNumber: "S202301002" },
        { id: "s3", name: "Amit Patel", enrollmentNumber: "S202301003" },
        { id: "s4", name: "Neha Singh", enrollmentNumber: "S202301004" },
        { id: "s5", name: "Rahul Gupta", enrollmentNumber: "S202301005" },
        { id: "s6", name: "Sonia Verma", enrollmentNumber: "S202301006" },
        { id: "s7", name: "Deepak Sharma", enrollmentNumber: "S202301007" },
        { id: "s8", name: "Ananya Reddy", enrollmentNumber: "S202301008" },
      ];
      
      // Set initial attendance status
      const initialAttendance: Record<string, string> = {};
      mockStudents.forEach(student => {
        initialAttendance[student.id] = Math.random() > 0.2 ? "present" : "absent";
      });
      
      setClasses(mockClasses);
      setSelectedClass(mockClasses[0].id);
      setAttendanceData(mockStudents);
      setAttendance(initialAttendance);
      setLoading(false);
    }, 1500);
  }, []);
  
  const handlePreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setSelectedDate(previousDay);
  };
  
  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };
  
  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendance({
      ...attendance,
      [studentId]: status,
    });
  };
  
  const handleMarkAll = (status: string) => {
    const newAttendance = { ...attendance };
    attendanceData.forEach(student => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
  };
  
  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      
      // In a real implementation, this would save to Supabase
      console.log("Saving attendance:", {
        classId: selectedClass,
        date: format(selectedDate, "yyyy-MM-dd"),
        attendance,
      });
      
      toast({
        title: "Attendance Saved",
        description: "Attendance has been recorded successfully",
      });
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const getSelectedClass = () => {
    return classes.find(c => c.id === selectedClass) || null;
  };
  
  return (
    <div>
      <PageHeader
        title="Attendance Management"
        description="Record and manage student attendance"
        icon={ClipboardCheck}
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6 mb-6">
        <div className="w-full md:w-64">
          <Select value={selectedClass} onValueChange={setSelectedClass} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handlePreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center bg-white border rounded-md px-3 py-1">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span>{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
          </div>
          <Button variant="outline" size="icon" onClick={handleNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {getSelectedClass() && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{getSelectedClass()?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <span className="font-medium mr-2">Time:</span>
                <span>{getSelectedClass()?.time}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Room:</span>
                <span>{getSelectedClass()?.room}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Students:</span>
                <span>{attendanceData.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Record Attendance</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleMarkAll("present")}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Mark All Present
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleMarkAll("absent")}>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Enrollment Number</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.enrollmentNumber}</TableCell>
                    <TableCell>
                      <Select 
                        value={attendance[student.id] || "absent"} 
                        onValueChange={(value) => handleAttendanceChange(student.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">
                            <div className="flex items-center">
                              <Badge className="bg-green-50 text-green-700 hover:bg-green-100 mr-2">Present</Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="absent">
                            <div className="flex items-center">
                              <Badge className="bg-red-50 text-red-700 hover:bg-red-100 mr-2">Absent</Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="late">
                            <div className="flex items-center">
                              <Badge className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 mr-2">Late</Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="excused">
                            <div className="flex items-center">
                              <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 mr-2">Excused</Badge>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <ClipboardCheck className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No Students Found</h3>
              <p className="mt-1 text-gray-500">
                No students are enrolled in this class.
              </p>
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Attendance
            </Button>
            <Button onClick={handleSaveAttendance} disabled={saving || loading}>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;
