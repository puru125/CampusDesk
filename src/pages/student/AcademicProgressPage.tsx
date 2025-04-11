
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface SubjectSummary {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  total_records: number;
  average_percentage: number;
  highest_score: number;
  lowest_score: number;
  last_updated: string;
}

interface AcademicRecord {
  id: string;
  subject_name: string;
  subject_code: string;
  record_type: string;
  score: number;
  max_score: number;
  percentage: number;
  recorded_at: string;
  assignment_title?: string;
  exam_title?: string;
  remarks?: string;
}

const recordTypeColors = {
  assignment: "#4CAF50",
  quiz: "#2196F3",
  exam: "#F44336",
  midterm: "#FF9800",
  project: "#9C27B0",
  test: "#607D8B",
  other: "#795548",
};

const getRecordTypeColor = (type: string): string => {
  return (recordTypeColors as any)[type.toLowerCase()] || recordTypeColors.other;
};

const getGradeFromPercentage = (percentage: number): string => {
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B";
  if (percentage >= 70) return "C";
  if (percentage >= 60) return "D";
  return "F";
};

const AcademicProgressPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subjectSummaries, setSubjectSummaries] = useState<SubjectSummary[]>([]);
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

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
    if (studentId) {
      Promise.all([
        fetchSubjectSummaries(studentId),
        fetchAcademicRecords(studentId)
      ]).then(() => {
        setLoading(false);
      });
    }
  }, [studentId]);

  const fetchSubjectSummaries = async (studentId: string) => {
    try {
      const { data, error } = await extendedSupabase
        .rpc('get_student_progress_summary', { p_student_id: studentId });

      if (error) {
        throw error;
      }

      if (data) {
        setSubjectSummaries(data);
      }
    } catch (error) {
      console.error("Error fetching subject summaries:", error);
      toast({
        title: "Error",
        description: "Failed to load academic progress summary",
        variant: "destructive",
      });
    }
  };

  const fetchAcademicRecords = async (studentId: string) => {
    try {
      const { data, error } = await extendedSupabase
        .from('student_progress_view')
        .select('*')
        .eq('student_id', studentId)
        .order('recorded_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setRecords(data);
      }
    } catch (error) {
      console.error("Error fetching academic records:", error);
      toast({
        title: "Error",
        description: "Failed to load academic records",
        variant: "destructive",
      });
    }
  };

  const getFilteredRecords = () => {
    if (selectedSubject === "all") {
      return records;
    }
    return records.filter(record => record.subject_id === selectedSubject);
  };

  const getSubjectName = (subjectId: string): string => {
    const subject = subjectSummaries.find(s => s.subject_id === subjectId);
    return subject ? subject.subject_name : "Unknown Subject";
  };

  const getRecordTypeDistribution = () => {
    const distribution: Record<string, number> = {};
    
    getFilteredRecords().forEach(record => {
      const type = record.record_type.toLowerCase();
      distribution[type] = (distribution[type] || 0) + 1;
    });
    
    return Object.keys(distribution).map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: distribution[type],
      color: getRecordTypeColor(type)
    }));
  };

  const getPerformanceBySubject = () => {
    return subjectSummaries.map(subject => ({
      name: subject.subject_code,
      average: parseFloat(subject.average_percentage.toFixed(1)),
      highest: parseFloat(subject.highest_score.toFixed(1)),
      lowest: parseFloat(subject.lowest_score.toFixed(1)),
    }));
  };

  const calculateOverallPerformance = () => {
    if (subjectSummaries.length === 0) return { average: 0, highest: 0, lowest: 0, grade: 'N/A' };
    
    const weightedSum = subjectSummaries.reduce((sum, subject) => sum + subject.average_percentage, 0);
    const average = weightedSum / subjectSummaries.length;
    
    const highest = Math.max(...subjectSummaries.map(s => s.highest_score));
    const lowest = Math.min(...subjectSummaries.map(s => s.lowest_score));
    
    return {
      average: parseFloat(average.toFixed(1)),
      highest: parseFloat(highest.toFixed(1)),
      lowest: parseFloat(lowest.toFixed(1)),
      grade: getGradeFromPercentage(average)
    };
  };

  const overallPerformance = calculateOverallPerformance();

  if (loading) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Academic Progress Tracker</h1>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Academic Progress Tracker</h1>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-5xl font-bold">
                {overallPerformance.grade}
              </div>
              <div className="text-2xl font-semibold text-muted-foreground">
                {overallPerformance.average}%
              </div>
            </div>
            <div className="flex justify-between mt-4 text-xs text-muted-foreground">
              <div>Highest: {overallPerformance.highest}%</div>
              <div>Lowest: {overallPerformance.lowest}%</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Subjects Tracked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subjectSummaries.length}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {subjectSummaries.slice(0, 4).map(subject => (
                <Badge key={subject.subject_id} variant="outline" className="justify-start text-xs py-1">
                  {subject.subject_code}
                </Badge>
              ))}
              {subjectSummaries.length > 4 && (
                <Badge variant="outline" className="justify-start text-xs py-1">
                  +{subjectSummaries.length - 4} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.length}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.keys(recordTypeColors).slice(0, 4).map(type => (
                <Badge 
                  key={type} 
                  variant="outline" 
                  className="text-xs"
                  style={{ backgroundColor: (recordTypeColors as any)[type] + '20', borderColor: (recordTypeColors as any)[type] }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="records">Detailed Records</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Subject</CardTitle>
                <CardDescription>Average, highest, and lowest scores per subject</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getPerformanceBySubject()}
                      margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, ""]}
                      />
                      <Legend />
                      <Bar dataKey="average" name="Average" fill="#4CAF50" />
                      <Bar dataKey="highest" name="Highest" fill="#2196F3" />
                      <Bar dataKey="lowest" name="Lowest" fill="#FFC107" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assessment Type Distribution</CardTitle>
                <CardDescription>Breakdown of assessment types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getRecordTypeDistribution()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {getRecordTypeDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string) => [value, name]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.slice(0, 5).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.subject_code}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          style={{ 
                            backgroundColor: getRecordTypeColor(record.record_type) + '20', 
                            borderColor: getRecordTypeColor(record.record_type),
                            color: getRecordTypeColor(record.record_type)
                          }}
                        >
                          {record.record_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.record_type === 'assignment' ? record.assignment_title : 
                         record.record_type === 'exam' ? record.exam_title : 
                         record.record_type}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{record.score}/{record.max_score}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({record.percentage}%)
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(record.recorded_at), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Academic Records</CardTitle>
                <div className="flex items-center">
                  <label htmlFor="subject-filter" className="mr-2 text-sm">
                    Filter by Subject:
                  </label>
                  <select 
                    id="subject-filter"
                    className="px-3 py-1 border rounded-md text-sm"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="all">All Subjects</option>
                    {subjectSummaries.map(subject => (
                      <option key={subject.subject_id} value={subject.subject_id}>
                        {subject.subject_name} ({subject.subject_code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredRecords().map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.subject_code} - {record.subject_name}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          style={{ 
                            backgroundColor: getRecordTypeColor(record.record_type) + '20', 
                            borderColor: getRecordTypeColor(record.record_type),
                            color: getRecordTypeColor(record.record_type)
                          }}
                        >
                          {record.record_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.record_type === 'assignment' ? record.assignment_title : 
                         record.record_type === 'exam' ? record.exam_title : 
                         record.record_type}
                      </TableCell>
                      <TableCell>
                        {record.score}/{record.max_score}
                        <div className="text-xs text-muted-foreground">
                          {record.percentage.toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={record.percentage >= 60 ? "default" : "destructive"}>
                          {getGradeFromPercentage(record.percentage)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {record.remarks || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {format(new Date(record.recorded_at), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {getFilteredRecords().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AcademicProgressPage;
