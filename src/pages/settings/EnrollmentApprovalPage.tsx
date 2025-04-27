import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/ui/page-header";

const EnrollmentApprovalPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("enrollments");
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [examSubmissions, setExamSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [action, setAction] = useState<"approved" | "rejected">("approved");

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchPendingEnrollments();
      fetchPendingExams();
    }
  }, [user]);

  const fetchPendingEnrollments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("student_course_enrollments")
        .select(`
          id, 
          status, 
          academic_year, 
          semester, 
          student_id, 
          course_id,
          students:student_id(id, user_id),
          users:students(user_id(id, full_name, email)),
          courses:course_id(name, code)
        `)
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching pending enrollments:", error);
      } else {
        setEnrollments(data || []);
      }
    } catch (error) {
      console.error("Error fetching pending enrollments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingExams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("exam_submissions")
        .select(`
          id,
          score,
          submitted_at,
          status,
          exam:exams (
            id,
            title,
            max_marks,
            passing_marks
          ),
          student:students (
            id,
            users:user_id (
              full_name,
              email
            ),
            enrollment_number
          )
        `)
        .eq("status", "pending");

      if (error) {
        throw error;
      }

      setExamSubmissions(data || []);
    } catch (error) {
      console.error("Error fetching pending exam submissions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending exam submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogOpen = (item: any, actionType: "approved" | "rejected") => {
    setSelectedItem(item);
    setAction(actionType);
    setRemarks("");
    setDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedItem || !user) return;
    
    setProcessingAction(selectedItem.id);

    try {
      if (activeTab === "enrollments") {
        console.log("Processing enrollment request with params:", {
          p_admin_id: user.id,
          p_enrollment_id: selectedItem.id,
          p_status: action,
          p_admin_remarks: remarks
        });
        
        const { error } = await supabase.rpc("process_enrollment_request", {
          p_admin_id: user.id,
          p_enrollment_id: selectedItem.id,
          p_status: action,
          p_admin_remarks: remarks,
        });

        if (error) {
          console.error("Error processing enrollment:", error);
          throw error;
        }

        toast({
          title: `Enrollment ${action === "approved" ? "Approved" : "Rejected"}`,
          description: `Successfully ${action === "approved" ? "approved" : "rejected"} enrollment request`,
        });

        fetchPendingEnrollments();
      } else if (activeTab === "exams") {
        await processExam();
      }
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to process the request",
        variant: "destructive",
      });
    } finally {
      setDialogOpen(false);
      setProcessingAction(null);
    }
  };

  const processExam = async () => {
    if (!selectedItem || !user) return;
    
    setProcessingAction(selectedItem.id);
    
    try {
      const { error } = await supabase
        .from("exam_submissions")
        .update({
          status: action,
          admin_remarks: remarks,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedItem.id);

      if (error) throw error;

      setExamSubmissions(submissions => 
        submissions.filter(s => s.id !== selectedItem.id)
      );

      toast({
        title: "Success",
        description: `Exam submission ${action === "approved" ? "approved" : "rejected"} successfully`,
      });

      const notification = {
        student_id: selectedItem.student.id,
        title: `Exam ${action === "approved" ? "Approved" : "Rejected"}`,
        message: `Your exam submission for ${selectedItem.exam.title} has been ${action}${
          remarks ? `. Remarks: ${remarks}` : ''
        }`,
      };

      await supabase.from("student_notifications").insert(notification);

      setDialogOpen(false);
    } catch (error) {
      console.error(`Error ${action}ing exam submission:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} exam submission`,
        variant: "destructive",
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const renderEnrollmentRows = () => {
    if (enrollments.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
            No pending enrollment requests found
          </TableCell>
        </TableRow>
      );
    }

    return enrollments.map((enrollment) => {
      const studentName = enrollment.users?.user_id?.full_name || "Unknown";
      const studentEmail = enrollment.users?.user_id?.email || "Unknown";
      const courseName = enrollment.courses?.name || "Unknown";
      const courseCode = enrollment.courses?.code || "Unknown";

      return (
        <TableRow key={enrollment.id}>
          <TableCell>{studentName}</TableCell>
          <TableCell>{studentEmail}</TableCell>
          <TableCell>{courseName}</TableCell>
          <TableCell>{courseCode}</TableCell>
          <TableCell>{enrollment.academic_year || "N/A"}</TableCell>
          <TableCell>{enrollment.semester || "N/A"}</TableCell>
          <TableCell className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-100"
              onClick={() => handleDialogOpen(enrollment, "approved")}
              disabled={processingAction === enrollment.id}
            >
              {processingAction === enrollment.id ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-1" />
              )}
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-100"
              onClick={() => handleDialogOpen(enrollment, "rejected")}
              disabled={processingAction === enrollment.id}
            >
              {processingAction === enrollment.id ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-1" />
              )}
              Reject
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  };

  const renderExamRows = () => {
    if (examSubmissions.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
            No pending exam submissions found
          </TableCell>
        </TableRow>
      );
    }

    return examSubmissions.map((submission) => (
      <TableRow key={submission.id}>
        <TableCell>{submission.student?.users?.full_name || "Unknown"}</TableCell>
        <TableCell>{submission.student?.enrollment_number || "Unknown"}</TableCell>
        <TableCell>{submission.exam?.title || "Unknown"}</TableCell>
        <TableCell>{submission.score} / {submission.exam?.max_marks}</TableCell>
        <TableCell>{new Date(submission.submitted_at).toLocaleDateString()}</TableCell>
        <TableCell>
          <Badge variant={submission.status === "pending" ? "secondary" : "default"}>
            {submission.status}
          </Badge>
        </TableCell>
        <TableCell className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-green-600 border-green-600 hover:bg-green-100"
            onClick={() => handleDialogOpen(submission, "approved")}
            disabled={processingAction === submission.id}
          >
            {processingAction === submission.id ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-1" />
            )}
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-100"
            onClick={() => handleDialogOpen(submission, "rejected")}
            disabled={processingAction === submission.id}
          >
            {processingAction === submission.id ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4 mr-1" />
            )}
            Reject
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Approvals"
        description="Manage pending enrollment requests and exam submissions"
      />

      <Tabs defaultValue="enrollments" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="enrollments">Enrollment Requests</TabsTrigger>
          <TabsTrigger value="exams">Exam Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>Pending Enrollment Requests</CardTitle>
              <CardDescription>
                Review and process student enrollment requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Semester</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>{renderEnrollmentRows()}</TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card>
            <CardHeader>
              <CardTitle>Pending Exam Submissions</CardTitle>
              <CardDescription>
                Review and process student exam submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Enrollment Number</TableHead>
                        <TableHead>Exam Title</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Submitted Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>{renderExamRows()}</TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approved" ? "Approve" : "Reject"}{" "}
              {activeTab === "enrollments" ? "Enrollment" : "Exam Submission"}
            </DialogTitle>
            <DialogDescription>
              {action === "approved"
                ? "This will approve the request and notify the student."
                : "This will reject the request and notify the student."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {selectedItem && activeTab === "enrollments" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Student</label>
                  <p className="text-sm">
                    {selectedItem.users?.user_id?.full_name || "Unknown"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Course</label>
                  <p className="text-sm">{selectedItem.courses?.name || "Unknown"}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Remarks (Optional)</label>
              <Textarea
                placeholder="Add any additional remarks..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              variant={action === "approved" ? "default" : "destructive"}
              disabled={processingAction !== null}
            >
              {processingAction !== null ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : action === "approved" ? (
                "Approve"
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnrollmentApprovalPage;
