import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface AcademicRecord {
  id: string;
  student_id: string;
  subject_name: string;
  subject_code: string;
  record_type: string;
  score: number;
  max_score: number;
  percentage: number;
  remarks?: string;
  recorded_at: string;
  assignment_title?: string;
  exam_title?: string;
}

interface SubjectSummary {
  subject_name: string;
  subject_code: string;
  total_records: number;
  average_percentage: number;
  highest_score: number;
  lowest_score: number;
  last_updated: string;
}

const AcademicProgressPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [subjectSummaries, setSubjectSummaries] = useState<SubjectSummary[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchStudentId = async () => {
      if (!user) return;

      try {
        const { data, error } = await extendedSupabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setStudentId(data.id);
        }
      } catch (error) {
        console.error("Error fetching student id:", error);
        toast({
          title: "Error",
          description: "Failed to load student information",
          variant: "destructive",
        });
      }
    };

    fetchStudentId();
  }, [user]);

  useEffect(() => {
    if (!studentId) return;
    
    const fetchAcademicRecords = async () => {
      setLoading(true);
      try {
        // Fetch academic records
        const { data: recordsData, error: recordsError } = await extendedSupabase
          .from('student_progress_view')
          .select('*')
          .eq('student_id', studentId)
          .order('recorded_at', { ascending: false });

        if (recordsError) throw recordsError;
        
        // Fetch subject summaries
        const { data: summaryData, error: summaryError } = await extendedSupabase
          .rpc('get_student_progress_summary', { p_student_id: studentId });
        
        if (summaryError) throw summaryError;

        setAcademicRecords(recordsData || []);
        setSubjectSummaries(summaryData || []);
      } catch (error) {
        console.error("Error fetching academic data:", error);
        toast({
          title: "Error",
          description: "Failed to load academic records",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicRecords();
  }, [studentId]);

  const getRecordTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'assignment': 'Assignment',
      'exam': 'Exam',
      'quiz': 'Quiz',
      'project': 'Project',
      'midterm': 'Midterm Exam',
      'final': 'Final Exam'
    };
    
    return labels[type] || type;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return "#22c55e"; // Green
    if (percentage >= 80) return "#84cc16"; // Lime
    if (percentage >= 70) return "#eab308"; // Yellow
    if (percentage >= 60) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const customTooltipFormatter = (value: ValueType, name: NameType) => {
    if (typeof value === 'number') {
      return [`${value.toFixed(1)}%`, name];
    }
    return [value, name];
  };

  if (loading) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Academic Progress</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Academic Progress</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Records</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          {subjectSummaries.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Academic Records</CardTitle>
                <CardDescription>
                  You don't have any academic records yet. Records will appear here once your teachers start adding assessment results.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Performance by Subject</CardTitle>
                  <CardDescription>Average scores across all your subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={subjectSummaries}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subject_code" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip 
                          formatter={customTooltipFormatter}
                          labelFormatter={(value) => {
                            const subject = subjectSummaries.find(s => s.subject_code === value);
                            return subject ? subject.subject_name : value;
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="average_percentage" 
                          name="Average Score (%)" 
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="highest_score" 
                          name="Highest Score (%)" 
                          fill="#22c55e"
                          radius={[4, 4, 0, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subject Summaries</CardTitle>
                  <CardDescription>Breakdown of your performance in each subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Records</TableHead>
                        <TableHead>Average</TableHead>
                        <TableHead>Highest</TableHead>
                        <TableHead>Lowest</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjectSummaries.map((summary) => (
                        <TableRow key={summary.subject_code}>
                          <TableCell className="font-medium">{summary.subject_name}</TableCell>
                          <TableCell>{summary.subject_code}</TableCell>
                          <TableCell>{summary.total_records}</TableCell>
                          <TableCell>
                            <span 
                              className="px-2 py-1 rounded text-white text-xs font-medium"
                              style={{ backgroundColor: getPerformanceColor(summary.average_percentage) }}
                            >
                              {summary.average_percentage.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell>{summary.highest_score.toFixed(1)}%</TableCell>
                          <TableCell>{summary.lowest_score.toFixed(1)}%</TableCell>
                          <TableCell>{formatDate(summary.last_updated)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="detailed" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Academic Records</CardTitle>
              <CardDescription>All your assessment records</CardDescription>
            </CardHeader>
            <CardContent>
              {academicRecords.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No academic records found. Your assessment results will appear here once they are recorded.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {academicRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.subject_name}
                          <div className="text-xs text-muted-foreground">{record.subject_code}</div>
                        </TableCell>
                        <TableCell>{getRecordTypeLabel(record.record_type)}</TableCell>
                        <TableCell>
                          {record.assignment_title || record.exam_title || '-'}
                        </TableCell>
                        <TableCell>
                          {record.score} / {record.max_score}
                        </TableCell>
                        <TableCell>
                          <span 
                            className="px-2 py-1 rounded text-white text-xs font-medium"
                            style={{ backgroundColor: getPerformanceColor(record.percentage) }}
                          >
                            {record.percentage.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(record.recorded_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AcademicProgressPage;
