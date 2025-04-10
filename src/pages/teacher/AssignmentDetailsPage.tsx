
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ArrowLeft, Download, Calendar, Clock, Users, CheckCircle, XCircle, FileCheck, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  max_score: number;
  status: string;
  teacher_id: string;
  subject_id: string | null;
  created_at: string;
  subjects: {
    id: string;
    name: string;
    code: string | null;
  } | null;
}

interface Submission {
  id: string;
  student_id: string;
  student: {
    id: string;
    enrollment_number: string;
    user_id: string;
    users: {
      full_name: string;
    };
  };
  submitted_at: string | null;
  status: string;
  score: number | null;
  feedback: string | null;
  file_name: string | null;
  file_path: string | null;
}

const AssignmentDetailsPage = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [savingGrades, setSavingGrades] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  
  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        if (!user || !assignmentId) return;
        
        // Get teacher profile
        const { data: teacherProfile, error: teacherError } = await supabase
          .from('teachers')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (teacherError) throw teacherError;
        
        // Get assignment details
        const { data: assignmentData, error: assignmentError } = await supabase
          .from('assignments')
          .select(`
            id,
            title,
            description,
            due_date,
            max_score,
            status,
            teacher_id,
            subject_id,
            created_at,
            subjects(id, name, code)
          `)
          .eq('id', assignmentId)
          .eq('teacher_id', teacherProfile.id)
          .single();
          
        if (assignmentError) throw assignmentError;
        
        setAssignment(assignmentData);
        
        // Get count of students assigned to this teacher
        const { count: studentCountResult } = await supabase
          .from('teacher_students')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', teacherProfile.id);
          
        setStudentCount(studentCountResult || 0);
        
        // Get all submissions for this assignment
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('assignment_submissions')
          .select(`
            id,
            student_id,
            submitted_at,
            status,
            score,
            feedback,
            file_name,
            file_path,
            student:student_id(
              id,
              enrollment_number,
              user_id,
              users:user_id(
                full_name
              )
            )
          `)
          .eq('assignment_id', assignmentId);
          
        if (submissionsError) throw submissionsError;
        
        setSubmissions(submissionsData || []);
        
        // Get potential students who haven't submitted yet
        const { data: teacherStudentsData, error: teacherStudentsError } = await supabase
          .from('teacher_students')
          .select(`
            student_id,
            students:student_id(
              id,
              enrollment_number,
              user_id,
              users:user_id(
                full_name
              )
            )
          `)
          .eq('teacher_id', teacherProfile.id);
          
        if (teacherStudentsError) throw teacherStudentsError;
        
        // Add missing students as pending submissions
        const existingStudentIds = submissionsData?.map(s => s.student_id) || [];
        const missingStudents = teacherStudentsData
          ?.filter(ts => !existingStudentIds.includes(ts.student_id))
          .map(ts => ({
            id: `pending-${ts.student_id}`,
            student_id: ts.student_id,
            student: ts.students,
            submitted_at: null,
            status: 'pending',
            score: null,
            feedback: null,
            file_name: null,
            file_path: null
          })) || [];
          
        setSubmissions(prev => [...prev, ...missingStudents]);
      } catch (error) {
        console.error("Error fetching assignment details:", error);
        toast({
          title: "Error",
          description: "Failed to fetch assignment data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignmentDetails();
  }, [user, assignmentId, toast]);
  
  const handleScoreChange = (submissionId: string, value: string) => {
    setSubmissions(prev => 
      prev.map(sub => 
        sub.id === submissionId 
          ? { ...sub, score: value ? Number(value) : null } 
          : sub
      )
    );
  };
  
  const handleFeedbackChange = (submissionId: string, value: string) => {
    setSubmissions(prev => 
      prev.map(sub => 
        sub.id === submissionId 
          ? { ...sub, feedback: value } 
          : sub
      )
    );
  };
  
  const saveGrades = async () => {
    try {
      setSavingGrades(true);
      
      const submissionsToUpdate = submissions.filter(
        sub => sub.status === 'submitted' && !sub.id.startsWith('pending')
      );
      
      // Update submissions in database
      for (const submission of submissionsToUpdate) {
        await supabase
          .from('assignment_submissions')
          .update({
            score: submission.score,
            feedback: submission.feedback,
            status: submission.score !== null ? 'graded' : 'submitted'
          })
          .eq('id', submission.id);
      }
      
      // Refresh submission data
      const { data: refreshedData } = await supabase
        .from('assignment_submissions')
        .select(`
          id,
          student_id,
          submitted_at,
          status,
          score,
          feedback,
          file_name,
          file_path,
          student:student_id(
            id,
            enrollment_number,
            user_id,
            users:user_id(
              full_name
            )
          )
        `)
        .eq('assignment_id', assignmentId);
        
      // Update local state with refreshed data
      if (refreshedData) {
        const pendingSubmissions = submissions.filter(sub => sub.id.startsWith('pending'));
        setSubmissions([...refreshedData, ...pendingSubmissions]);
      }
      
      toast({
        title: "Grades Saved",
        description: "Grades and feedback have been saved successfully",
      });
      
    } catch (error) {
      console.error("Error saving grades:", error);
      toast({
        title: "Error",
        description: "Failed to save grades",
        variant: "destructive",
      });
    } finally {
      setSavingGrades(false);
    }
  };
  
  const downloadSubmission = async (fileUrl: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('assignments')
        .download(fileUrl);
        
      if (error) throw error;
      
      // Create download link
      const downloadUrl = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up URL object
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
      </div>
    );
  }
  
  if (!assignment) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 mx-auto text-red-500" />
        <h3 className="mt-2 text-lg font-medium">Assignment Not Found</h3>
        <p className="mt-1 text-gray-500">
          The assignment you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button 
          variant="outline" 
          onClick={() => navigate("/assignments")}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assignments
        </Button>
      </div>
    );
  }
  
  const pendingCount = submissions.filter(sub => sub.status === "pending").length;
  const submittedCount = submissions.filter(sub => sub.status === "submitted").length;
  const gradedCount = submissions.filter(sub => sub.status === "graded").length;
  
  return (
    <div>
      <PageHeader
        title="Assignment Details"
        description="View and grade student submissions"
        icon={FileText}
      >
        <Button variant="outline" onClick={() => navigate("/assignments")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assignments
        </Button>
      </PageHeader>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">{assignment.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {assignment.subjects && (
                <Badge variant="outline" className="mb-4">{assignment.subjects.name}</Badge>
              )}
              <p className="text-gray-700 mb-4">{assignment.description}</p>
              
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Due Date:</span>
                  </div>
                  <span className="font-medium">{format(parseISO(assignment.due_date), "PPP")}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Created:</span>
                  </div>
                  <span className="font-medium">{format(parseISO(assignment.created_at), "PPP")}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>Max Score:</span>
                  </div>
                  <span className="font-medium">{assignment.max_score} points</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-medium">Submission Statistics</h3>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Total Students</span>
                  <span>{submissions.length}</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Submitted</span>
                  <span>{submittedCount + gradedCount} / {submissions.length}</span>
                </div>
                <Progress 
                  value={((submittedCount + gradedCount) / submissions.length) * 100} 
                  className="h-2" 
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Graded</span>
                  <span>{gradedCount} / {submittedCount + gradedCount}</span>
                </div>
                <Progress 
                  value={(submittedCount + gradedCount) > 0 
                    ? (gradedCount / (submittedCount + gradedCount)) * 100 
                    : 0
                  } 
                  className="h-2" 
                />
              </div>
              
              <div className="flex justify-between mt-4">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download All
                </Button>
                <Button variant="outline" size="sm">
                  <FileCheck className="mr-2 h-4 w-4" />
                  Export Grades
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="submissions" className="mt-6">
        <TabsList>
          <TabsTrigger value="submissions" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            All Submissions ({submissions.length})
          </TabsTrigger>
          <TabsTrigger value="grading" className="flex items-center">
            <FileCheck className="mr-2 h-4 w-4" />
            Needs Grading ({submittedCount})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="submissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left font-medium">Student</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Submitted On</th>
                      <th className="px-4 py-3 text-left font-medium">Score</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map(submission => (
                      <tr key={submission.id} className="border-b">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{submission.student?.users?.full_name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{submission.student?.enrollment_number || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {submission.status === "submitted" ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Submitted
                            </Badge>
                          ) : submission.status === "graded" ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Graded
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              Pending
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {submission.submitted_at 
                            ? format(parseISO(submission.submitted_at), "PPP 'at' h:mm a") 
                            : "Not submitted"
                          }
                        </td>
                        <td className="px-4 py-3">
                          {submission.score !== null 
                            ? `${submission.score}/${assignment.max_score}` 
                            : "Not graded"
                          }
                        </td>
                        <td className="px-4 py-3">
                          {(submission.status === "submitted" || submission.status === "graded") && (
                            <div className="flex space-x-2">
                              {submission.file_path && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => downloadSubmission(
                                    submission.file_path as string,
                                    submission.file_name || 'download'
                                  )}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => document.getElementById(`grade-submission-${submission.id}`)?.scrollIntoView({
                                  behavior: 'smooth'
                                })}
                              >
                                <FileCheck className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="grading" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grade Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {submissions.filter(s => s.status === "submitted").length > 0 ? (
                <div className="space-y-6">
                  {submissions
                    .filter(s => s.status === "submitted")
                    .map(submission => (
                      <div 
                        key={submission.id} 
                        id={`grade-submission-${submission.id}`}
                        className="border rounded-md p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{submission.student?.users?.full_name || 'Unknown'}</h3>
                            <div className="text-sm text-gray-500">{submission.student?.enrollment_number || 'N/A'}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              Submitted: {submission.submitted_at 
                                ? format(parseISO(submission.submitted_at), "PPP 'at' h:mm a") 
                                : "Not submitted"
                              }
                            </div>
                          </div>
                          {submission.file_path && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => downloadSubmission(
                                submission.file_path as string,
                                submission.file_name || 'download'
                              )}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </Button>
                          )}
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1">
                            <label className="block text-sm font-medium mb-2">Score</label>
                            <Input
                              type="number"
                              min="0"
                              max={assignment.max_score}
                              placeholder={`Out of ${assignment.max_score}`}
                              value={submission.score !== null ? submission.score : ''}
                              onChange={(e) => handleScoreChange(submission.id, e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Feedback</label>
                            <Textarea
                              placeholder="Provide feedback to the student"
                              value={submission.feedback || ''}
                              onChange={(e) => handleFeedbackChange(submission.id, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  <div className="flex justify-end mt-4">
                    <Button onClick={saveGrades} disabled={savingGrades}>
                      {savingGrades ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Save All Grades
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileCheck className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No Submissions to Grade</h3>
                  <p className="mt-1 text-gray-500">
                    There are no ungraded submissions at the moment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssignmentDetailsPage;
