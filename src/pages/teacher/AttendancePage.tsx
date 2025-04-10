
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Search, Calendar, Clock, Download, Save, Loader2 } from "lucide-react";
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

const AttendancePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [searchTerm, setSearchTerm] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  
  useEffect(() => {
    // Mock data for attendances and classes
    const mockClasses = [
      { id: "1", name: "Database Systems", code: "CS301" },
      { id: "2", name: "Web Development", code: "CS302" },
      { id: "3", name: "Data Structures", code: "CS201" },
    ];
    
    const mockAttendanceData = [
      { id: "1", studentId: "1", studentName: "Rajesh Kumar", rollNo: "CS2301", present: true },
      { id: "2", studentId: "2", studentName: "Priya Sharma", rollNo: "CS2302", present: true },
      { id: "3", studentId: "3", studentName: "Amit Singh", rollNo: "CS2303", present: false },
      { id: "4", studentId: "4", studentName: "Neha Patel", rollNo: "CS2304", present: true },
      { id: "5", studentId: "5", studentName: "Vijay Mehta", rollNo: "CS2305", present: true },
    ];
    
    setClasses(mockClasses);
    setSelectedClass(mockClasses[0].id);
    setAttendanceData(mockAttendanceData);
    setLoading(false);
  }, []);
  
  // Filter students based on search term
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
  };
  
  const markAllPresent = () => {
    setAttendanceData(prev => 
      prev.map(item => ({ ...item, present: true }))
    );
  };
  
  const markAllAbsent = () => {
    setAttendanceData(prev => 
      prev.map(item => ({ ...item, present: false }))
    );
  };
  
  const saveAttendance = async () => {
    try {
      setSaving(true);
      
      // In a real implementation, this would save to the database
      console.log("Saving attendance:", { 
        date: selectedDate, 
        classId: selectedClass, 
        records: attendanceData 
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Attendance Saved",
        description: "Attendance records have been saved successfully",
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
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} ({cls.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Select Date</label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        
        <div>
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
      </div>
      
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
          ) : filteredAttendance.length > 0 ? (
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
                No students match your search criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendancePage;
