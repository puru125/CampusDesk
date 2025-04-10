
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, ArrowLeft, Calendar, Clock, Edit, Download, Search,
  CheckCircle, XCircle, Eye, Loader2, BarChart, Filter
} from "lucide-react";
import { format } from "date-fns";

const AssignmentDetailsPage = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      // Mock assignment data
      const mockAssignment = {
        id: assignmentId,
        title: "Database Normalization",
        description: "Complete the normalization exercises and submit your solutions in a PDF document. Make sure to include explanations for each step of the normalization process.",
        subject: "Database Systems",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "active",
        totalSubmissions: 28,
        pendingGrading: 12,
        maxScore: 100,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      };
      
      // Mock submissions data
      const mockSubmissions = [
        {
          id: "1",
          studentId: "s1",
          studentName: "Ravi Kumar",
          submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: "graded",
          score: 85,
          feedback: "Good work, but could improve on 3NF explanations.",
        },
        {
          id: "2",
          studentId: "s2",
          studentName: "Priya Sharma",
          submissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: "graded",
          score: 92,
          feedback: "Excellent work with clear explanations.",
        },
        {
          id: "3",
          studentId: "s3",
          studentName: "Amit Patel",
          submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          status: "submitted",
          score: null,
          feedback: null,
        },
        {
          id: "4",
          studentId: "s4",
          studentName: "Neha Singh",
          submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: "submitted",
          score: null,
          feedback: null,
        },
        {
          id: "5",
          studentId: "s5",
          studentName: "Rahul Gupta",
          submissionDate: null,
          status: "not_submitted",
          score: null,
          feedback: null,
        },
      ];
      
      setAssignment(mockAssignment);
      setSubmissions(mockSubmissions);
      setLoading(false);
    }, 1500);
  }, [assignmentId]);
  
  // Filter submissions based on search term
  const filteredSubmissions = submissions.filter(submission => 
    submission.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get statistics
  const stats = {
    submitted: submissions.filter(s => s.status === "submitted" || s.status === "graded").length,
    graded: submissions.filter(s => s.status === "graded").length,
    notSubmitted: submissions.filter(s => s.status === "not_submitted").length,
    averageScore: submissions
      .filter(s => s.score !== null)
      .reduce((sum, s) => sum + (s.score || 0), 0) / 
      (submissions.filter(s => s.score !== null).length || 1),
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
        <FileText className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-lg font-medium">Assignment Not Found</h3>
        <p className="mt-1 text-gray-500">
          The assignment you're looking for doesn't exist or has been removed.
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
  
  return (
    <div>
      <PageHeader
        title={assignment.title}
        description={`Manage ${assignment.subject} assignment and view submissions`}
        icon={FileText}
      >
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate("/assignments")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={() => navigate(`/assignments/${assignmentId}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Assignment
          </Button>
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Assignment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="bg-institute-50">
                {assignment.subject}
              </Badge>
              <Badge variant="outline" className={assignment.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-100"}>
                {assignment.status === "active" ? "Active" : "Closed"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Due Date: {format(new Date(assignment.dueDate), "PPP")}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                <span>Created: {format(new Date(assignment.createdAt), "PPP")}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FileText className="h-4 w-4 mr-2" />
                <span>Max Score: {assignment.maxScore} points</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-sm text-gray-700">{assignment.description}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Assignment Materials
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submission Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Students</span>
                <span className="font-medium">{submissions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Submitted</span>
                <span className="font-medium">{stats.submitted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Graded</span>
                <span className="font-medium">{stats.graded}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Not Submitted</span>
                <span className="font-medium">{stats.notSubmitted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Average Score</span>
                <span className="font-medium">{stats.averageScore.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="pt-4">
              <Button variant="outline" className="w-full">
                <BarChart className="mr-2 h-4 w-4" />
                View Detailed Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle className="text-lg">Student Submissions</CardTitle>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search students..."
                  className="pl-8 w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({submissions.length})</TabsTrigger>
              <TabsTrigger value="submitted">Submitted ({stats.submitted})</TabsTrigger>
              <TabsTrigger value="graded">Graded ({stats.graded})</TabsTrigger>
              <TabsTrigger value="notSubmitted">Not Submitted ({stats.notSubmitted})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Submission Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.studentName}</TableCell>
                      <TableCell>
                        {submission.submissionDate 
                          ? format(new Date(submission.submissionDate), "PPP") 
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {submission.status === "graded" && (
                          <Badge className="bg-green-50 text-green-700 hover:bg-green-100">Graded</Badge>
                        )}
                        {submission.status === "submitted" && (
                          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100">Submitted</Badge>
                        )}
                        {submission.status === "not_submitted" && (
                          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">Not Submitted</Badge>
                        )}
                      </TableCell>
                      <TableCell>{submission.score !== null ? submission.score : "-"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {submission.status !== "not_submitted" && (
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {submission.status === "submitted" && (
                            <Button variant="ghost" size="sm">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="submitted">
              {/* Similar table structure for submitted only */}
              <div className="text-center py-8 text-gray-500">
                Switch to "All" tab to see all submissions
              </div>
            </TabsContent>
            
            <TabsContent value="graded">
              {/* Similar table structure for graded only */}
              <div className="text-center py-8 text-gray-500">
                Switch to "All" tab to see all submissions
              </div>
            </TabsContent>
            
            <TabsContent value="notSubmitted">
              {/* Similar table structure for not submitted only */}
              <div className="text-center py-8 text-gray-500">
                Switch to "All" tab to see all submissions
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentDetailsPage;
