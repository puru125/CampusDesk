
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, AlertCircle, Loader2 } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  remarks: string | null;
  subject_id: string;
  subjects: {
    name: string;
    code: string;
  };
}

interface AttendanceSummary {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  total_classes: number;
  present_count: number;
  absent_count: number;
  percentage: number;
}

const StudentAttendancePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);
  const [overallAttendance, setOverallAttendance] = useState({
    total: 0,
    present: 0,
    percentage: 0,
  });
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        if (!user) return;

        // Show loading toast
        toast({
          title: "Loading attendance data",
          description: "Please wait while we fetch your attendance records...",
        });

        // Get student ID first
        const { data: studentData, error: studentError } = await extendedSupabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (studentError) throw studentError;

        // Fetch attendance records
        const { data: recordsData, error: recordsError } = await extendedSupabase
          .from('attendance_records')
          .select(`
            id,
            date,
            status,
            remarks,
            subject_id,
            subjects (
              name,
              code
            )
          `)
          .eq('student_id', studentData.id)
          .order('date', { ascending: false });

        if (recordsError) throw recordsError;

        setAttendanceRecords(recordsData || []);

        // Show success toast for data loaded
        toast({
          title: "Data loaded successfully",
          description: `Loaded ${recordsData?.length || 0} attendance records`,
        });

        // Calculate attendance summary by subject
        const subjectMap = new Map<string, AttendanceSummary>();
        let totalClasses = 0;
        let totalPresent = 0;

        recordsData?.forEach(record => {
          const subjectId = record.subject_id;
          
          if (!subjectMap.has(subjectId)) {
            subjectMap.set(subjectId, {
              subject_id: subjectId,
              subject_name: record.subjects.name,
              subject_code: record.subjects.code,
              total_classes: 0,
              present_count: 0,
              absent_count: 0,
              percentage: 0,
            });
          }
          
          const summary = subjectMap.get(subjectId)!;
          summary.total_classes += 1;
          
          if (record.status.toLowerCase() === 'present') {
            summary.present_count += 1;
            totalPresent += 1;
          } else {
            summary.absent_count += 1;
          }
          
          summary.percentage = (summary.present_count / summary.total_classes) * 100;
          totalClasses += 1;
        });

        const summaryArray = Array.from(subjectMap.values());
        setAttendanceSummary(summaryArray);
        
        // Calculate overall attendance
        setOverallAttendance({
          total: totalClasses,
          present: totalPresent,
          percentage: totalClasses > 0 ? (totalPresent / totalClasses) * 100 : 0,
        });
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        toast({
          title: "Error",
          description: "Failed to load attendance data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [user, toast]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Show toast when switching tabs
    toast({
      title: `Viewing ${value === 'summary' ? 'Subject Summary' : 'Attendance Records'}`,
      description: `Switched to ${value === 'summary' ? 'summary view' : 'detailed records view'}`,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'MMM d, yyyy') : dateString;
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'present') {
      return <Badge className="bg-green-100 text-green-800">Present</Badge>;
    } else if (statusLower === 'absent') {
      return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
    } else if (statusLower === 'late') {
      return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>;
    } else {
      return <Badge>{status}</Badge>;
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) {
      return "bg-green-500";
    } else if (percentage >= 60) {
      return "bg-yellow-500";
    } else {
      return "bg-red-500";
    }
  };

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Track your class attendance and view attendance records"
        icon={Calendar}
      />
      
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Overall Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Attendance Rate</p>
                    <p className="text-2xl font-bold">{overallAttendance.percentage.toFixed(1)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Classes Attended</p>
                    <p className="text-lg">
                      {overallAttendance.present} / {overallAttendance.total}
                    </p>
                  </div>
                </div>
                
                <Progress value={overallAttendance.percentage} className="h-2">
                  <div 
                    className={`h-full ${getAttendanceColor(overallAttendance.percentage)}`} 
                    style={{ width: `${overallAttendance.percentage}%` }} 
                  />
                </Progress>
                
                {overallAttendance.percentage < 75 && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Attendance Warning</AlertTitle>
                    <AlertDescription>
                      Your attendance is below the required 75%. Please improve your attendance to avoid academic penalties.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="summary" onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="summary">Subject Summary</TabsTrigger>
              <TabsTrigger value="records">Attendance Records</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4 mt-4">
              {attendanceSummary.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attendanceSummary.map((summary) => (
                    <Card key={summary.subject_id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{summary.subject_name}</CardTitle>
                        <p className="text-sm text-gray-500">{summary.subject_code}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Attendance: {summary.percentage.toFixed(1)}%</span>
                            <span>
                              {summary.present_count} / {summary.total_classes} classes
                            </span>
                          </div>
                          <Progress value={summary.percentage} className="h-2">
                            <div 
                              className={`h-full ${getAttendanceColor(summary.percentage)}`} 
                              style={{ width: `${summary.percentage}%` }} 
                            />
                          </Progress>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Data</AlertTitle>
                  <AlertDescription>
                    No attendance records found for any subjects.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="records" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {attendanceRecords.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendanceRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{formatDate(record.date)}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{record.subjects.name}</p>
                                <p className="text-sm text-gray-500">{record.subjects.code}</p>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                            <TableCell>{record.remarks || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500">No attendance records found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default StudentAttendancePage;
