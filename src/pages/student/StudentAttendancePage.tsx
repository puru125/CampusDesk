
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Calendar, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  remarks: string | null;
  subject_name: string;
  teacher_name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface AttendanceSummary {
  subjectId: string;
  subjectName: string;
  totalClasses: number;
  present: number;
  absent: number;
  percentage: number;
}

const StudentAttendancePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary[]>([]);
  const [overallAttendance, setOverallAttendance] = useState({
    totalClasses: 0,
    present: 0,
    percentage: 0
  });

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        if (!user) return;

        // Get student ID first
        const { data: studentData, error: studentError } = await extendedSupabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (studentError) throw studentError;

        // Fetch attendance records
        const { data: records, error: recordsError } = await extendedSupabase
          .from('attendance_records')
          .select(`
            id,
            date,
            status,
            remarks,
            subjects:subject_id(id, name),
            teachers:teacher_id(
              id, 
              users:user_id(full_name)
            )
          `)
          .eq('student_id', studentData.id)
          .order('date', { ascending: false });

        if (recordsError) throw recordsError;

        if (records && records.length > 0) {
          // Process attendance records
          const formattedRecords = records.map(record => ({
            id: record.id,
            date: record.date,
            status: record.status,
            remarks: record.remarks,
            subject_name: record.subjects ? record.subjects.name : 'Unknown Subject',
            teacher_name: record.teachers && record.teachers.users 
              ? record.teachers.users.full_name 
              : 'Unknown Teacher'
          }));

          setAttendanceRecords(formattedRecords);

          // Get unique subjects
          const uniqueSubjects: Subject[] = [];
          const subjectMap = new Map();
          
          records.forEach(record => {
            if (record.subjects && !subjectMap.has(record.subjects.id)) {
              subjectMap.set(record.subjects.id, true);
              uniqueSubjects.push({
                id: record.subjects.id,
                name: record.subjects.name
              });
            }
          });
          
          setSubjects(uniqueSubjects);

          // Calculate attendance summary by subject
          const summaryMap = new Map<string, AttendanceSummary>();
          
          records.forEach(record => {
            if (!record.subjects) return;
            
            const subjectId = record.subjects.id;
            const existing = summaryMap.get(subjectId) || {
              subjectId,
              subjectName: record.subjects.name,
              totalClasses: 0,
              present: 0,
              absent: 0,
              percentage: 0
            };
            
            existing.totalClasses += 1;
            
            if (record.status === 'present') {
              existing.present += 1;
            } else if (record.status === 'absent') {
              existing.absent += 1;
            }
            
            existing.percentage = Math.round((existing.present / existing.totalClasses) * 100);
            
            summaryMap.set(subjectId, existing);
          });
          
          const summaryArray = Array.from(summaryMap.values());
          setAttendanceSummary(summaryArray);

          // Calculate overall attendance
          const totalClasses = records.length;
          const presentCount = records.filter(r => r.status === 'present').length;
          const percentage = Math.round((presentCount / totalClasses) * 100);
          
          setOverallAttendance({
            totalClasses,
            present: presentCount,
            percentage
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

  const getAttendanceStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return "bg-green-600";
    if (percentage >= 60) return "bg-yellow-600";
    return "bg-red-600";
  };

  const filteredRecords = selectedSubject === "all" 
    ? attendanceRecords
    : attendanceRecords.filter(record => {
        const subjectInfo = subjects.find(s => s.id === selectedSubject);
        return record.subject_name === subjectInfo?.name;
      });

  return (
    <div>
      <PageHeader
        title="My Attendance"
        description="Track your class attendance and view attendance statistics"
        icon={Calendar}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2 flex items-center">
              <span className={getAttendanceColor(overallAttendance.percentage)}>
                {overallAttendance.percentage}%
              </span>
            </div>
            <Progress 
              value={overallAttendance.percentage} 
              className="h-2 mb-2"
              indicatorClassName={getProgressColor(overallAttendance.percentage)}
            />
            <p className="text-sm text-gray-500">
              Present: {overallAttendance.present} / {overallAttendance.totalClasses} classes
            </p>
          </CardContent>
        </Card>
        
        {attendanceSummary.slice(0, 2).map(summary => (
          <Card key={summary.subjectId}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{summary.subjectName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                <span className={getAttendanceColor(summary.percentage)}>
                  {summary.percentage}%
                </span>
              </div>
              <Progress 
                value={summary.percentage} 
                className="h-2 mb-2"
                indicatorClassName={getProgressColor(summary.percentage)}
              />
              <p className="text-sm text-gray-500">
                Present: {summary.present} / {summary.totalClasses} classes
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Tabs defaultValue="records" className="mt-6">
        <TabsList>
          <TabsTrigger value="records">Attendance Records</TabsTrigger>
          <TabsTrigger value="summary">Subject Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="records" className="mt-4 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Attendance History</h3>
            
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRecords.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {format(new Date(record.date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{record.subject_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(record.status)}
                            <span>{getAttendanceStatusBadge(record.status)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{record.teacher_name}</TableCell>
                        <TableCell>{record.remarks || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Records Found</AlertTitle>
              <AlertDescription>
                No attendance records found for the selected criteria.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="summary" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : attendanceSummary.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Total Classes</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Attendance %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceSummary.map((summary) => (
                      <TableRow key={summary.subjectId}>
                        <TableCell className="font-medium">{summary.subjectName}</TableCell>
                        <TableCell>{summary.totalClasses}</TableCell>
                        <TableCell>{summary.present}</TableCell>
                        <TableCell>{summary.absent}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className={getAttendanceColor(summary.percentage)}>
                              {summary.percentage}%
                            </span>
                            <Progress 
                              value={summary.percentage} 
                              className="h-2 w-24"
                              indicatorClassName={getProgressColor(summary.percentage)}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Summary Available</AlertTitle>
              <AlertDescription>
                No attendance data available to generate summary.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentAttendancePage;
