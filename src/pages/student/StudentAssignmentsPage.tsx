import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase, isSupabaseError, safeQueryResult } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Search,
  Clock, 
  Calendar, 
  Upload, 
  Check,
  X,
  AlertCircle,
  Loader2,
  FileUp,
  FileCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { Progress } from "@/components/ui/progress";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  created_at: string;
  status: string;
  max_score: number;
  teacher_id: string;
  subject_id: string | null;
  subjects: {
    id: string;
    name: string;
    code: string | null;
  } | null;
  teachers: {
    id: string;
    user_id: string;
    users: {
      full_name: string;
    } | null;
  } | null;
  submission?: {
    id: string;
    status: string;
    score: number | null;
    feedback: string | null;
    submitted_at: string;
    file_name: string | null;
  };
}

const StudentAssignmentsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await extendedSupabase
          .from('students')
          .select('id')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        if (data) {
          setStudentId(data.id);
        }
      } catch (error) {
        console.error("Error fetching student profile:", error);
        toast({
          title: "Error",
          description: "Could not fetch your student profile",
          variant: "destructive",
        });
      }
    };
    
    fetchStudentProfile();
  }, [user, toast]);
  
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!studentId) return;
      
      try {
        setLoading(true);
        
        // Get courses/subjects the student is enrolled in
        const enrollmentsResult = await extendedSupabase
          .from('student_course_enrollments')
          .select('course_id')
          .eq('student_id', studentId)
          .in('status', ['approved', 'active']);
          
        if (isSupabaseError(enrollmentsResult)) {
          throw enrollmentsResult.error;
        }
        
        const enrollments = enrollmentsResult.data || [];
        if (enrollments.length === 0) {
          setAssignments([]);
          setLoading(false);
          return;
        }
        
        const courseIds = enrollments.map(e => e.course_id);
        
        // Get subjects for these courses
        const subjectsResult = await extendedSupabase
          .from('subjects')
          .select('id')
          .in('course_id', courseIds);
          
        if (isSupabaseError(subjectsResult)) {
          throw subjectsResult.error;
        }
        
        const subjects = subjectsResult.data || [];
        if (subjects.length === 0) {
          setAssignments([]);
          setLoading(false);
          return;
        }
        
        const subjectIds = subjects.map(s => s.id);
        
        // Get assignments for these subjects
        const result = await extendedSupabase
          .from('assignments')
          .select(`
            id,
            title,
            description,
            due_date,
            created_at,
            status,
            max_score,
            teacher_id,
            subject_id,
            subjects (
              id,
              name,
              code
            ),
            teachers (
              id,
              user_id,
              users (
                full_name
              )
            )
          `)
          .in('subject_id', subjectIds)
          .eq('status', 'active')
          .order('due_date', { ascending: true });
          
        const assignmentsResult = safeQueryResult(result);
          
        if (assignmentsResult.error) {
          console.error("Error fetching assignments:", assignmentsResult.error);
          throw assignmentsResult.error;
        }
        
        const assignmentsData = assignmentsResult.data || [];
        
        // Get student's submissions for these assignments
        const assignmentIds = assignmentsData.map(a => a.id);
        
        if (assignmentIds.length === 0) {
          setAssignments([]);
          setLoading(false);
          return;
        }
        
        const submissionsResult = await extendedSupabase
          .from('assignment_submissions')
          .select('id, assignment_id, status, score, feedback, submitted_at, file_name')
          .eq('student_id', studentId)
          .in('assignment_id', assignmentIds);
          
        if (isSupabaseError(submissionsResult)) {
          throw submissionsResult.error;
        }
        
        const submissions = submissionsResult.data || [];
        
        // Combine assignments with submissions
        const assignmentsWithSubmissions = assignmentsData.map(assignment => {
          const submission = submissions.find(s => s.assignment_id === assignment.id);
          return {
            ...assignment,
            submission: submission || undefined
          };
        });
        
        setAssignments(assignmentsWithSubmissions);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        toast({
          title: "Error",
          description: "Failed to fetch assignments",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (studentId) {
      fetchAssignments();
    }
  }, [studentId, toast]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionFile(e.target.files[0]);
    }
  };
  
  const submitAssignment = async () => {
    if (!activeAssignment || !studentId) return;
    
    try {
      setSubmitting(true);
      setUploadProgress(0);
      
      // Create submission record
      const submission = {
        assignment_id: activeAssignment.id,
        student_id: studentId,
        submission_text: submissionText || null,
        status: 'submitted'
      };
      
      // If there's a file, upload it
      let filePath = null;
      let fileName = null;
      
      if (submissionFile) {
        const fileExt = submissionFile.name.split('.').pop();
        fileName = submissionFile.name;
        filePath = `${studentId}/${activeAssignment.id}/${Date.now()}.${fileExt}`;
        
        try {
          // Upload the file with progress tracking
          const { data: uploadData, error: uploadError } = await extendedSupabase.storage
            .from('assignments')
            .upload(filePath, submissionFile, {
              cacheControl: '3600'
            });
          
          if (uploadError) {
            console.error("Error uploading file:", uploadError);
            throw uploadError;
          }
          
          if (uploadData) {
            filePath = uploadData.path;
          }
        } catch (error) {
          console.error("Error uploading file:", error);
          throw error;
        }
      }
      
      // Create submission record
      const { error: submissionError } = await extendedSupabase
        .from('assignment_submissions')
        .insert({
          ...submission,
          file_path: filePath,
          file_name: fileName
        });
        
      if (submissionError) throw submissionError;
      
      toast({
        title: "Success",
        description: "Your assignment has been submitted",
      });
      
      // Refresh assignments to show the new submission
      const { data, error } = await extendedSupabase
        .from('assignment_submissions')
        .select('id, status, score, feedback, submitted_at, file_name')
        .eq('assignment_id', activeAssignment.id)
        .eq('student_id', studentId)
        .single();
        
      if (error) throw error;
      
      // Update the assignments state
      setAssignments(prevAssignments => 
        prevAssignments.map(assignment => 
          assignment.id === activeAssignment.id 
            ? { ...assignment, submission: data } 
            : assignment
        )
      );
      
      setActiveAssignment(null);
      setSubmissionText("");
      setSubmissionFile(null);
      
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast({
        title: "Error",
        description: "Failed to submit assignment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };
  
  const filteredAssignments = assignments.filter(assignment => 
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (assignment.subjects?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );
  
  const pendingAssignments = filteredAssignments.filter(a => 
    !a.submission && isAfter(parseISO(a.due_date), new Date())
  );
  
  const submittedAssignments = filteredAssignments.filter(a => 
    a.submission?.status === 'submitted' || a.submission?.status === 'graded'
  );
  
  const overdueAssignments = filteredAssignments.filter(a => 
    !a.submission && isBefore(parseISO(a.due_date), new Date())
  );
  
  return (
    <div>
      <PageHeader
        title="My Assignments"
        description="View and submit your assigned work"
        icon={FileText}
      />
      
      <div className="mt-6">
        <div className="relative w-full md:w-80 mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search assignments..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="pending" className="mt-4">
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              Pending ({pendingAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="submitted" className="flex items-center">
              <Check className="mr-2 h-4 w-4" />
              Submitted ({submittedAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="overdue" className="flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" />
              Overdue ({overdueAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              All ({filteredAssignments.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <AssignmentsList 
              assignments={pendingAssignments} 
              loading={loading} 
              emptyMessage="No pending assignments"
              setActiveAssignment={setActiveAssignment}
            />
          </TabsContent>
          
          <TabsContent value="submitted">
            <AssignmentsList 
              assignments={submittedAssignments} 
              loading={loading} 
              emptyMessage="No submitted assignments"
              setActiveAssignment={setActiveAssignment}
            />
          </TabsContent>
          
          <TabsContent value="overdue">
            <AssignmentsList 
              assignments={overdueAssignments} 
              loading={loading} 
              emptyMessage="No overdue assignments"
              setActiveAssignment={setActiveAssignment}
            />
          </TabsContent>
          
          <TabsContent value="all">
            <AssignmentsList 
              assignments={filteredAssignments} 
              loading={loading} 
              emptyMessage="No assignments found"
              setActiveAssignment={setActiveAssignment}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={!!activeAssignment} onOpenChange={(open) => !open && setActiveAssignment(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{activeAssignment?.title}</DialogTitle>
            <DialogDescription>
              {activeAssignment?.subjects?.name} | Due: {activeAssignment?.due_date && format(parseISO(activeAssignment.due_date), 'PPP')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Assignment Details</h4>
              <p className="text-sm">{activeAssignment?.description || "No description provided."}</p>
            </div>
            
            {activeAssignment?.submission ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Your Submission</h4>
                  <Badge variant={activeAssignment.submission.status === 'graded' ? 'default' : 'secondary'}>
                    {activeAssignment.submission.status === 'graded' ? 'Graded' : 'Submitted'}
                  </Badge>
                </div>
                
                <div className="text-sm">
                  <p className="mb-1"><strong>Submitted on:</strong> {format(parseISO(activeAssignment.submission.submitted_at), 'PPP')}</p>
                  {activeAssignment.submission.file_name && (
                    <p className="mb-1"><strong>File:</strong> {activeAssignment.submission.file_name}</p>
                  )}
                </div>
                
                {activeAssignment.submission.status === 'graded' && (
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Score</h4>
                      <div className="flex items-center">
                        <Progress 
                          className="mr-4 flex-grow"
                          value={(activeAssignment.submission.score || 0) / activeAssignment.max_score * 100} 
                        />
                        <span className="text-sm font-medium">
                          {activeAssignment.submission.score} / {activeAssignment.max_score}
                        </span>
                      </div>
                    </div>
                    
                    {activeAssignment.submission.feedback && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Feedback</h4>
                        <p className="text-sm bg-gray-50 p-3 rounded-md">{activeAssignment.submission.feedback}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Submit Your Work</h4>
                  <Textarea
                    placeholder="Enter your answer or description of your submission..."
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Attach File (Optional)</h4>
                  <div className="flex items-center">
                    <Input 
                      type="file" 
                      onChange={handleFileChange}
                      className="flex-grow"
                    />
                  </div>
                  {submissionFile && (
                    <p className="text-xs text-gray-500 mt-1">Selected: {submissionFile.name}</p>
                  )}
                </div>
                
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-1">Upload Progress</h4>
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}% complete</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setActiveAssignment(null)}
            >
              Close
            </Button>
            
            {!activeAssignment?.submission && (
              <Button 
                onClick={submitAssignment}
                disabled={submitting || (!submissionText && !submissionFile)}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Assignment
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface AssignmentsListProps {
  assignments: Assignment[];
  loading: boolean;
  emptyMessage: string;
  setActiveAssignment: (assignment: Assignment) => void;
}

const AssignmentsList = ({ assignments, loading, emptyMessage, setActiveAssignment }: AssignmentsListProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, idx) => (
          <Card key={idx} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-lg font-medium">{emptyMessage}</h3>
        <p className="mt-1 text-gray-500">
          Check the other tabs to see all your assignments.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {assignments.map(assignment => (
        <Card key={assignment.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{assignment.title}</h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <Badge variant="outline">
                      {assignment.subjects?.name || "No Subject"}
                    </Badge>
                    {assignment.submission && (
                      <Badge variant={assignment.submission.status === 'graded' ? 'default' : 'secondary'}>
                        {assignment.submission.status === 'graded' ? 'Graded' : 'Submitted'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {assignment.description || "No description provided"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Due: {format(parseISO(assignment.due_date), 'PPP')}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Points: {assignment.max_score}
                    </span>
                  </div>
                  {assignment.submission?.status === 'graded' && (
                    <div className="mt-1 flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">
                        Score: {assignment.submission.score} / {assignment.max_score}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button 
                  variant={assignment.submission ? "outline" : "default"}
                  size="sm"
                  onClick={() => setActiveAssignment(assignment)}
                >
                  {assignment.submission ? (
                    <>
                      <FileCheck className="mr-2 h-4 w-4" />
                      View Submission
                    </>
                  ) : (
                    <>
                      <FileUp className="mr-2 h-4 w-4" />
                      Submit Assignment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StudentAssignmentsPage;
