
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
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

const AssignmentDetailsPage = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [savingGrades, setSavingGrades] = useState(false);
  
  useEffect(() => {
    // Mock data for the assignment
    const mockAssignment = {
      id: assignmentId,
      title: "Database Normalization",
      description: "Complete the database normalization exercise. Identify the normal forms and apply normalization techniques to the given database schema.",
      subject: "Database Systems",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "active",
      totalSubmissions: 28,
      pendingGrading: 12,
      maxScore: 100,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    };
    
    // Mock data for submissions
    const mockSubmissions = [
      {
        id: "1",
        studentId: "1",
        studentName: "Rajesh Kumar",
        rollNo: "CS2301",
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "submitted",
        score: "",
        feedback: "",
        fileName: "database_normalization_rajesh.pdf",
      },
      {
        id: "2",
        studentId: "2",
        studentName: "Priya Sharma",
        rollNo: "CS2302",
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: "submitted",
        score: "",
        feedback: "",
        fileName: "normalization_exercise_priya.pdf",
      },
      {
        id: "3",
        studentId: "3",
        studentName: "Amit Singh",
        rollNo: "CS2303",
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: "submitted",
        score: "85",
        feedback: "Good work on identifying the normal forms. Could improve on explaining the steps taken.",
        fileName: "amit_normalization.pdf",
      },
      {
        id: "4",
        studentId: "4",
        studentName: "Neha Patel",
        rollNo: "CS2304",
        submittedAt: null,
        status: "pending",
        score: "",
        feedback: "",
        fileName: "",
      },
    ];
    
    setAssignment(mockAssignment);
    setSubmissions(mockSubmissions);
    setLoading(false);
  }, [assignmentId]);
  
  const handleScoreChange = (submissionId: string, value: string) => {
    setSubmissions(prev => 
      prev.map(sub => 
        sub.id === submissionId 
          ? { ...sub, score: value } 
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
      
      // In a real implementation, this would save to the database
      console.log("Saving grades:", submissions.filter(sub => sub.status === "submitted"));
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
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
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
      </div>
    );
  }
  
  const pendingCount = submissions.filter(sub => sub.status === "pending").length;
  const submittedCount = submissions.filter(sub => sub.status === "submitted").length;
  const gradedCount = submissions.filter(sub => sub.status === "submitted" && sub.score).length;
  
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
              <Badge variant="outline" className="mb-4">{assignment.subject}</Badge>
              <p className="text-gray-700 mb-4">{assignment.description}</p>
              
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Due Date:</span>
                  </div>
                  <span className="font-medium">{format(assignment.dueDate, "PPP")}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Created:</span>
                  </div>
                  <span className="font-medium">{format(assignment.createdAt, "PPP")}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>Max Score:</span>
                  </div>
                  <span className="font-medium">{assignment.maxScore} points</span>
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
                  <span>{submittedCount} / {submissions.length}</span>
                </div>
                <Progress value={(submittedCount / submissions.length) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Graded</span>
                  <span>{gradedCount} / {submittedCount}</span>
                </div>
                <Progress value={submittedCount > 0 ? (gradedCount / submittedCount) * 100 : 0} className="h-2" />
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
            Needs Grading ({submissions.filter(s => s.status === "submitted" && !s.score).length})
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
                            <div className="font-medium">{submission.studentName}</div>
                            <div className="text-sm text-gray-500">{submission.rollNo}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {submission.status === "submitted" ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Submitted
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                              Pending
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {submission.submittedAt ? format(submission.submittedAt, "PPP 'at' h:mm a") : "Not submitted"}
                        </td>
                        <td className="px-4 py-3">
                          {submission.score ? `${submission.score}/${assignment.maxScore}` : "Not graded"}
                        </td>
                        <td className="px-4 py-3">
                          {submission.status === "submitted" && (
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" disabled={!submission.fileName}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
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
                      <div key={submission.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{submission.studentName}</h3>
                            <div className="text-sm text-gray-500">{submission.rollNo}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              Submitted: {format(submission.submittedAt, "PPP 'at' h:mm a")}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" disabled={!submission.fileName}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1">
                            <label className="block text-sm font-medium mb-2">Score</label>
                            <Input
                              type="number"
                              min="0"
                              max={assignment.maxScore}
                              placeholder={`Out of ${assignment.maxScore}`}
                              value={submission.score}
                              onChange={(e) => handleScoreChange(submission.id, e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2">Feedback</label>
                            <Textarea
                              placeholder="Provide feedback to the student"
                              value={submission.feedback}
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
