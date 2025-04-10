
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, FileText, Loader2, Save, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

const ExamReportsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [examDetails, setExamDetails] = useState<any>(null);
  
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
        
        // Get exams related to subjects taught by the teacher
        const { data: teacherSubjects, error: subjectsError } = await extendedSupabase
          .from('teacher_subjects')
          .select('subject_id')
          .eq('teacher_id', teacherProfile.id);
          
        if (subjectsError) throw subjectsError;
        
        const subjectIds = teacherSubjects?.map(ts => ts.subject_id) || [];
        
        if (subjectIds.length === 0) {
          setLoading(false);
          return;
        }
        
        const { data: examData, error: examError } = await extendedSupabase
          .from('exams')
          .select(`
            id,
            title,
            exam_date,
            max_marks,
            passing_marks,
            subject_id,
            status,
            subjects(name, code)
          `)
          .in('subject_id', subjectIds)
          .order('exam_date', { ascending: false });
          
        if (examError) throw examError;
        
        setExams(examData || []);
        
        if (examData && examData.length > 0) {
          setSelectedExam(examData[0].id);
          setExamDetails(examData[0]);
        }
        
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch exam data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherData();
  }, [user, toast]);
  
  useEffect(() => {
    if (!selectedExam) return;
    
    const fetchExamDetails = async () => {
      try {
        setLoading(true);
        
        // Get exam details
        const { data: examData, error: examError } = await extendedSupabase
          .from('exams')
          .select(`
            id,
            title,
            exam_date,
            max_marks,
            passing_marks,
            subject_id,
            status,
            subjects(name, code)
          `)
          .eq('id', selectedExam)
          .single();
          
        if (examError) throw examError;
        
        setExamDetails(examData);
        
        // Fetch students who have already submitted reports for this exam
        const { data: existingReports } = await extendedSupabase
          .from('exam_reports')
          .select('student_id, marks_obtained, pass_status, teacher_comments')
          .eq('exam_id', selectedExam);
        
        // Get students assigned to this teacher
        const { data: teacherStudents, error: studentsError } = await extendedSupabase
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
        
        // Format and merge with existing reports data
        const studentList = teacherStudents?.map(ts => {
          const student = ts.students;
          const existingReport = existingReports?.find(r => r.student_id === student.id);
          
          return {
            id: student.id,
            name: student.users?.full_name || 'Unknown',
            roll: student.enrollment_number || 'N/A',
            marks: existingReport ? existingReport.marks_obtained : '',
            passed: existingReport ? existingReport.pass_status : false,
            comments: existingReport ? existingReport.teacher_comments : ''
          };
        }) || [];
        
        setStudents(studentList);
        
      } catch (error) {
        console.error("Error fetching exam details:", error);
        toast({
          title: "Error",
          description: "Failed to fetch exam details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchExamDetails();
  }, [selectedExam, teacherId, toast]);
  
  const handleMarksChange = (studentId: string, marks: string) => {
    const numericMarks = marks === '' ? '' : parseInt(marks, 10);
    
    setStudents(prev => 
      prev.map(student => {
        if (student.id === studentId) {
          const isPassed = numericMarks !== '' && examDetails ? 
            numericMarks >= examDetails.passing_marks : false;
          
          return { 
            ...student, 
            marks: numericMarks, 
            passed: isPassed
          };
        }
        return student;
      })
    );
  };
  
  const handleCommentsChange = (studentId: string, comments: string) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === studentId 
          ? { ...student, comments } 
          : student
      )
    );
  };
  
  const saveExamReports = async () => {
    if (!teacherId || !selectedExam || !examDetails) {
      toast({
        title: "Error",
        description: "Missing required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Validate marks
      const invalidStudents = students.filter(
        student => student.marks !== '' && (
          isNaN(Number(student.marks)) || 
          Number(student.marks) < 0 || 
          Number(student.marks) > examDetails.max_marks
        )
      );
      
      if (invalidStudents.length > 0) {
        toast({
          title: "Invalid marks",
          description: `Some students have invalid marks. Marks should be between 0 and ${examDetails.max_marks}.`,
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }
      
      // Filter out students with no marks
      const reportsToSubmit = students
        .filter(student => student.marks !== '')
        .map(student => ({
          exam_id: selectedExam,
          student_id: student.id,
          marks_obtained: Number(student.marks),
          pass_status: student.passed,
          teacher_comments: student.comments || null
        }));
      
      if (reportsToSubmit.length === 0) {
        toast({
          title: "No data to submit",
          description: "Please enter marks for at least one student.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }
      
      // Check for existing reports
      const { data: existingReports } = await extendedSupabase
        .from('exam_reports')
        .select('id, student_id')
        .eq('exam_id', selectedExam);
      
      // Delete existing reports
      if (existingReports && existingReports.length > 0) {
        await extendedSupabase
          .from('exam_reports')
          .delete()
          .eq('exam_id', selectedExam);
      }
      
      // Insert new reports
      const { error } = await extendedSupabase
        .from('exam_reports')
        .insert(reportsToSubmit);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Exam reports saved successfully",
      });
      
    } catch (error) {
      console.error("Error saving exam reports:", error);
      toast({
        title: "Error",
        description: "Failed to save exam reports",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const exportReports = () => {
    if (!examDetails) return;
    
    // Create CSV content
    const headers = ["Roll No.", "Student Name", "Marks", "Status", "Comments"];
    const csvData = students
      .filter(student => student.marks !== '')
      .map(student => [
        student.roll,
        student.name,
        student.marks,
        student.passed ? "Pass" : "Fail",
        student.comments || ""
      ]);
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    // Create file and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${examDetails.subjects.code}_${format(new Date(examDetails.exam_date), "yyyy-MM-dd")}_reports.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div>
      <PageHeader
        title="Exam Reports"
        description="Create and manage student exam reports"
        icon={BarChart}
      />
      
      <div className="flex justify-between items-center mt-6">
        <div className="w-80">
          <label className="block text-sm font-medium mb-2">Select Exam</label>
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger>
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map(exam => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.title} ({exam.subjects.code}, {format(new Date(exam.exam_date), "dd MMM yyyy")})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {examDetails && (
          <Button variant="outline" onClick={exportReports}>
            <Download className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
        )}
      </div>
      
      {examDetails && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Exam Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Subject</p>
                <p>{examDetails.subjects.name} ({examDetails.subjects.code})</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p>{format(new Date(examDetails.exam_date), "dd MMMM yyyy")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Marks</p>
                <p>Max: {examDetails.max_marks}, Passing: {examDetails.passing_marks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Student Reports</CardTitle>
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
                    <th className="px-4 py-3 text-left font-medium">Marks ({examDetails?.max_marks})</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id} className="border-b">
                      <td className="px-4 py-3">{student.roll}</td>
                      <td className="px-4 py-3">{student.name}</td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          min={0}
                          max={examDetails?.max_marks}
                          className="w-20"
                          value={student.marks}
                          onChange={(e) => handleMarksChange(student.id, e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        {student.marks === '' ? (
                          <span className="text-gray-400">Not graded</span>
                        ) : student.passed ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Pass</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Fail</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Textarea
                          placeholder="Add comments"
                          className="min-h-[60px]"
                          value={student.comments}
                          onChange={(e) => handleCommentsChange(student.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No Students Found</h3>
              <p className="mt-1 text-gray-500">
                No students are assigned to you for this exam.
              </p>
            </div>
          )}
        </CardContent>
        {students.length > 0 && (
          <CardFooter className="flex justify-end">
            <Button 
              onClick={saveExamReports} 
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Reports
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default ExamReportsPage;
