
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, FileText, Calendar, Loader2, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { format, isPast, isFuture } from "date-fns";
import { Input } from "@/components/ui/input";

interface Exam {
  id: string;
  title: string;
  description: string | null;
  exam_date: string;
  start_time: string;
  end_time: string;
  max_marks: number;
  passing_marks: number;
  room: string | null;
  status: string;
  subject_name: string;
}

interface ExamResult {
  id: string;
  exam_id: string;
  marks_obtained: number;
  pass_status: boolean;
  teacher_comments: string | null;
  exam_title: string;
  exam_date: string;
  subject_name: string;
  max_marks: number;
  passing_marks: number;
}

const StudentExamsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchExamsData = async () => {
      try {
        if (!user) return;

        // Get student ID first
        const { data: studentData, error: studentError } = await extendedSupabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (studentError) throw studentError;

        // Get enrolled course subjects
        const { data: enrollments, error: enrollmentsError } = await extendedSupabase
          .from('student_course_enrollments')
          .select(`
            course_id,
            courses(
              subjects(id)
            )
          `)
          .eq('student_id', studentData.id)
          .eq('status', 'approved');

        if (enrollmentsError) throw enrollmentsError;

        // Extract subject IDs from enrollments
        const subjectIds: string[] = [];
        enrollments?.forEach(enrollment => {
          if (enrollment.courses && enrollment.courses.subjects) {
            enrollment.courses.subjects.forEach((subject: any) => {
              subjectIds.push(subject.id);
            });
          }
        });

        if (subjectIds.length === 0) {
          setLoading(false);
          return;
        }

        // Fetch exams for enrolled subjects
        const { data: examsData, error: examsError } = await extendedSupabase
          .from('exams')
          .select(`
            id,
            title,
            description,
            exam_date,
            start_time,
            end_time,
            max_marks,
            passing_marks,
            room,
            status,
            subjects:subject_id(id, name)
          `)
          .in('subject_id', subjectIds)
          .order('exam_date', { ascending: false });

        if (examsError) throw examsError;

        if (examsData && examsData.length > 0) {
          // Format exams data
          const formattedExams = examsData.map(exam => ({
            id: exam.id,
            title: exam.title,
            description: exam.description,
            exam_date: exam.exam_date,
            start_time: exam.start_time,
            end_time: exam.end_time,
            max_marks: exam.max_marks,
            passing_marks: exam.passing_marks,
            room: exam.room,
            status: exam.status,
            subject_name: exam.subjects ? exam.subjects.name : 'Unknown Subject'
          }));

          setExams(formattedExams);
        }

        // Fetch exam results
        const { data: resultsData, error: resultsError } = await extendedSupabase
          .from('exam_reports')
          .select(`
            id,
            exam_id,
            marks_obtained,
            pass_status,
            teacher_comments,
            exams:exam_id(
              title,
              exam_date,
              max_marks,
              passing_marks,
              subjects:subject_id(name)
            )
          `)
          .eq('student_id', studentData.id);

        if (resultsError) throw resultsError;

        if (resultsData && resultsData.length > 0) {
          // Format results data
          const formattedResults = resultsData.map(result => ({
            id: result.id,
            exam_id: result.exam_id,
            marks_obtained: result.marks_obtained,
            pass_status: result.pass_status,
            teacher_comments: result.teacher_comments,
            exam_title: result.exams ? result.exams.title : 'Unknown Exam',
            exam_date: result.exams ? result.exams.exam_date : '',
            subject_name: result.exams && result.exams.subjects ? result.exams.subjects.name : 'Unknown Subject',
            max_marks: result.exams ? result.exams.max_marks : 0,
            passing_marks: result.exams ? result.exams.passing_marks : 0
          }));

          setResults(formattedResults);
        }
      } catch (error) {
        console.error("Error fetching exams data:", error);
        toast({
          title: "Error",
          description: "Failed to load exams data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchExamsData();
  }, [user, toast]);

  const getExamStatusBadge = (exam: Exam) => {
    const examDate = new Date(exam.exam_date);
    
    if (isPast(examDate) && !isSameDay(examDate, new Date())) {
      return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
    } else if (isSameDay(examDate, new Date())) {
      return <Badge className="bg-blue-100 text-blue-800">Today</Badge>;
    } else if (isFuture(examDate)) {
      return <Badge className="bg-green-100 text-green-800">Upcoming</Badge>;
    }
    
    return <Badge>{exam.status}</Badge>;
  };

  const getResultStatusBadge = (result: ExamResult) => {
    if (result.pass_status) {
      return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    }
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  };

  const getPercentage = (obtained: number, total: number) => {
    return Math.round((obtained / total) * 100);
  };

  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResults = results.filter(result =>
    result.exam_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Exams & Results"
        description="View your exam schedule and results"
        icon={FileText}
      />
      
      <div className="my-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search exams or subjects..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="upcoming" className="mt-6">
        <TabsList>
          <TabsTrigger value="upcoming">Exam Schedule</TabsTrigger>
          <TabsTrigger value="results">Exam Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredExams.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExams.map((exam) => (
                      <TableRow key={exam.id}>
                        <TableCell className="font-medium">{exam.subject_name}</TableCell>
                        <TableCell>
                          <div>
                            <div>{exam.title}</div>
                            {exam.description && (
                              <div className="text-sm text-gray-500">{exam.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(exam.exam_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{`${exam.start_time} - ${exam.end_time}`}</TableCell>
                        <TableCell>{exam.room || "TBA"}</TableCell>
                        <TableCell>{getExamStatusBadge(exam)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Exams Found</AlertTitle>
              <AlertDescription>
                No upcoming exams found for your enrolled courses.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="results" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredResults.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.subject_name}</TableCell>
                        <TableCell>{result.exam_title}</TableCell>
                        <TableCell>{format(new Date(result.exam_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{`${result.marks_obtained}/${result.max_marks}`}</TableCell>
                        <TableCell>
                          {getPercentage(result.marks_obtained, result.max_marks)}%
                        </TableCell>
                        <TableCell>{getResultStatusBadge(result)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Results Found</AlertTitle>
              <AlertDescription>
                No exam results available yet.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentExamsPage;
