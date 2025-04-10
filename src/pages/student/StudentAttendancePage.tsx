
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Calendar, Loader2, AlertCircle } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  remarks: string | null;
  subject_id: string;
  subject?: {
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

        // Fetch attendance records with subject details using a join
        const { data: recordsData, error: recordsError } = await extendedSupabase
          .from('attendance_records')
          .select(`
            id,
            date,
            status,
            remarks,
            subject_id,
            subjects:subject_id(name, code)
          `)
          .eq('student_id', studentData.id);

        if (recordsError) throw recordsError;

        // Process the data if we have it
        if (recordsData) {
          // Transform data to the expected AttendanceRecord format
          const formattedRecords: AttendanceRecord[] = recordsData.map((record: any) => ({
            id: record.id,
            date: record.date,
            status: record.status,
            remarks: record.remarks,
            subject_id: record.subject_id,
            subject: record.subjects
          }));

          setAttendanceRecords(formattedRecords);

          // Calculate attendance summary by subject
          const subjectMap = new Map<string, AttendanceSummary>();
          let totalClasses = 0;
          let totalPresent = 0;

          formattedRecords.forEach(record => {
            if (!record.subject) return; // Skip if subject data is missing
            
            const subjectId = record.subject_id;
            
            if (!subjectMap.has(subjectId)) {
              subjectMap.set(subjectId, {
                subject_id: subjectId,
                subject_name: record.subject.name,
                subject_code: record.subject.code,
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

          toast({
            title: "Data loaded",
            description: "Your attendance records have been loaded successfully",
          });
        }
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
    
    toast({
      title: `Viewing ${value === 'summary' ? 'Summary' : 'Records'}`,
      description: `Switched to ${value === 'summary' ? 'summary view' : 'detailed records'}`,
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
                    <span className="text-2xl font-bold">
                      {overallAttendance.percentage.toFixed(1)}%
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {overallAttendance.present} of {overallAttendance.total} classes attended
                    </p>
                  </div>
                  {overallAttendance.percentage < 75 && (
                    <Badge variant="destructive" className="ml-auto">
                      Below required attendance
                    </Badge>
                  )}
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      overallAttendance.percentage >= 75 
                        ? "bg-green-500" 
                        : overallAttendance.percentage >= 60 
                        ? "bg-yellow-500" 
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(overallAttendance.percentage, 100)}%` }}
                  ></div>
                </div>
                
                {overallAttendance.percentage < 75 && (
                  <Alert variant="destructive">
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
          
          <Tabs defaultValue="summary" value={activeTab} onValueChange={handleTabChange}>
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
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {summary.percentage.toFixed(1)}%
                            </span>
                            <span className="text-sm text-gray-500">
                              {summary.present_count} of {summary.total_classes} classes
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                summary.percentage >= 75 
                                  ? "bg-green-500" 
                                  : summary.percentage >= 60 
                                  ? "bg-yellow-500" 
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${Math.min(summary.percentage, 100)}%` }}
                            ></div>
                          </div>
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
                              {record.subject ? (
                                <div>
                                  <p className="font-medium">{record.subject.name}</p>
                                  <p className="text-sm text-gray-500">{record.subject.code}</p>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Unknown</span>
                              )}
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
