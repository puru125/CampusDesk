import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Search, Download, Edit, Eye, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

const ExamReportsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [studentReports, setStudentReports] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
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
        
        // Get teacher's subjects
        const { data: teacherSubjectsData, error: subjectsError } = await extendedSupabase
          .from('teacher_subjects')
          .select(`
            subject_id,
            subjects:subject_id(id, name, code)
          `)
          .eq('teacher_id', teacherProfile.id);
          
        if (subjectsError) throw subjectsError;
        
        const formattedSubjects = teacherSubjectsData?.map(item => ({
          id: item.subject_id,
          name: item.subjects?.name || 'Unknown Subject',
          code: item.subjects?.code || ''
        })) || [];
        
        setSubjects(formattedSubjects);
        
        if (formattedSubjects.length > 0) {
          setSelectedSubject(formattedSubjects[0].id);
        }
        
        // Get teacher's assigned students
        const { data: teacherStudentsData, error: studentsError } = await extendedSupabase
          .from('teacher_students')
          .select('student_id')
          .eq('teacher_id', teacherProfile.id);
          
        if (studentsError) throw studentsError;
        
        if (teacherStudentsData && teacherStudentsData.length > 0) {
          const studentIds = teacherStudentsData.map(ts => ts.student_id);
          
          // Get detailed student information
          const { data: studentDetails, error: detailsError } = await extendedSupabase
            .from('students_view')
            .select('*')
            .in('id', studentIds);
            
          if (detailsError) throw detailsError;
          
          setStudents(studentDetails || []);
        }
        
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch teacher data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherData();
  }, [user, toast]);
  
  useEffect(() => {
    const fetchExams = async () => {
      if (!selectedSubject) return;
      
      try {
        setLoading(true);
        
        // Get exams for the selected subject
        const { data: examsData, error: examsError } = await extendedSupabase
          .from('exams')
          .select('*')
          .eq('subject_id', selectedSubject)
          .order('exam_date', { ascending: false });
          
        if (examsError) throw examsError;
        
        setExams(examsData || []);
        
        if (examsData && examsData.length > 0) {
          setSelectedExam(examsData[0].id);
        } else {
          setSelectedExam("");
        }
        
      } catch (error) {
        console.error("Error fetching exams:", error);
        toast({
          title: "Error",
          description: "Failed to fetch exam data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchExams();
  }, [selectedSubject, toast]);
  
  useEffect(() => {
    const fetchExamReports = async () => {
      if (!selectedExam) {
        setStudentReports([]);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get exam reports for the selected exam
        const { data: reportsData, error: reportsError } = await extendedSupabase
          .from('exam_reports')
          .select('*')
          .eq('exam_id', selectedExam);
          
        if (reportsError) throw reportsError;
        
        // Find the selected exam details
        const selectedExamDetails = exams.find(exam => exam.id === selectedExam);
        
        // Generate report for each student - including ones who haven't taken the exam yet
        const reports = students.map(student => {
          // Find existing report for this student
          const existingReport = reportsData?.find(report => report.student_id === student.id);
          
          return {
            id: existingReport?.id || `new-${student.id}`,
            examId: selectedExam,
            studentId: student.id,
            studentName: student.full_name || 'Unknown',
            rollNo: student.enrollment_number || 'N/A',
            marksObtained: existingReport?.marks_obtained || null,
            maxMarks: selectedExamDetails?.max_marks || 100,
            passingMarks: selectedExamDetails?.passing_marks || 35,
            passStatus: existingReport?.pass_status || false,
            teacherComments: existingReport?.teacher_comments || '',
            hasReport: !!existingReport,
            submissionDate: existingReport?.created_at ? format(new Date(existingReport.created_at), 'PPP') : '-'
          };
        });
        
        setStudentReports(reports);
        
      } catch (error) {
        console.error("Error fetching exam reports:", error);
        toast({
          title: "Error",
          description: "Failed to fetch exam reports",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchExamReports();
  }, [selectedExam, exams, students]);
  
  // Filter students based on search term
  const filteredReports = studentReports.filter(report => 
    report.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get the selected exam details
  const selectedExamDetails = exams.find(exam => exam.id === selectedExam);
  
  return (
    <div>
      <PageHeader
        title="Exam Reports"
        description="Manage student exam results and performance"
        icon={FileText}
      >
        <Button variant="outline" onClick={() => {}}>
          <Download className="mr-2 h-4 w-4" />
          Export Reports
        </Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label className="block text-sm font-medium mb-2">Select Subject</label>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger>
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
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Select Exam</label>
          <Select value={selectedExam} onValueChange={setSelectedExam} disabled={exams.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder={exams.length === 0 ? "No exams available" : "Select Exam"} />
            </SelectTrigger>
            <SelectContent>
              {exams.map(exam => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.title} - {format(new Date(exam.exam_date), 'PP')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {selectedExamDetails && (
        <Card className="mt-4 bg-slate-50">
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Exam Date</p>
                <p>{format(new Date(selectedExamDetails.exam_date), 'PPP')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Timing</p>
                <p>{selectedExamDetails.start_time} - {selectedExamDetails.end_time}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total/Passing Marks</p>
                <p>{selectedExamDetails.max_marks} / {selectedExamDetails.passing_marks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-6">
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
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Student Exam Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
            </div>
          ) : selectedExam ? (
            filteredReports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium">Roll No.</th>
                      <th className="px-4 py-3 text-left font-medium">Student Name</th>
                      <th className="px-4 py-3 text-center font-medium">Marks</th>
                      <th className="px-4 py-3 text-center font-medium">Result</th>
                      <th className="px-4 py-3 text-left font-medium">Last Updated</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map(report => (
                      <tr key={report.id} className="border-b">
                        <td className="px-4 py-3">{report.rollNo}</td>
                        <td className="px-4 py-3">{report.studentName}</td>
                        <td className="px-4 py-3 text-center">
                          {report.marksObtained !== null ? (
                            <span>{report.marksObtained} / {report.maxMarks}</span>
                          ) : (
                            <span className="text-gray-400">Not graded</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {report.hasReport ? (
                            report.passStatus ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                Pass
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                Fail
                              </span>
                            )
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">{report.submissionDate}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {report.hasReport ? (
                              <>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Exam Report Details</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm font-medium">Student</p>
                                          <p className="text-sm text-gray-500">{report.studentName}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">Roll No.</p>
                                          <p className="text-sm text-gray-500">{report.rollNo}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">Marks Obtained</p>
                                          <p className="text-sm text-gray-500">{report.marksObtained} / {report.maxMarks}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium">Result</p>
                                          <p className="text-sm text-gray-500">
                                            {report.passStatus ? 'Pass' : 'Fail'}
                                          </p>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">Teacher Comments</p>
                                        <p className="text-sm text-gray-500 border p-2 rounded mt-1">
                                          {report.teacherComments || 'No comments provided.'}
                                        </p>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                              </>
                            ) : (
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Add Grade
                              </Button>
                            )}
                          </div>
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
                  No students match your search criteria.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No Exam Selected</h3>
              <p className="mt-1 text-gray-500">
                Please select a subject and an exam to view student reports.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamReportsPage;
