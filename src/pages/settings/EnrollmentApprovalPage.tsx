
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const EnrollmentApprovalPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [pendingFeedback, setPendingFeedback] = useState([]);
  const [remarks, setRemarks] = useState({});

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchPendingEnrollments();
      fetchPendingFeedback();
    }
  }, [user]);

  const fetchPendingEnrollments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('student_course_enrollments')
        .select(`
          id,
          status,
          academic_year,
          semester,
          student_id,
          course_id,
          students:student_id(id, user_id),
          students_view:student_id(full_name, enrollment_number, email),
          courses:course_id(name, code)
        `)
        .eq('status', 'pending');

      if (error) throw error;
      setPendingEnrollments(data || []);
    } catch (error) {
      console.error("Error fetching pending enrollments:", error);
      toast({
        title: "Error",
        description: "Failed to load pending enrollments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingFeedback = async () => {
    try {
      setIsLoading(true);
      // This is a placeholder for actual feedback data
      // In a real app, you would fetch from a feedback table
      const { data, error } = await supabase
        .from('student_notifications')
        .select(`
          id,
          title,
          message,
          created_at,
          students:student_id(
            users:user_id(full_name),
            enrollment_number
          )
        `)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      setPendingFeedback(data || []);
    } catch (error) {
      console.error("Error fetching pending feedback:", error);
      toast({
        title: "Error",
        description: "Failed to load pending feedback",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemarkChange = (id, value) => {
    setRemarks({
      ...remarks,
      [id]: value
    });
  };

  const handleApproveEnrollment = async (enrollmentId, studentId, courseId) => {
    try {
      const { error } = await supabase.rpc('process_enrollment_request', {
        p_admin_id: user.id,
        p_enrollment_id: enrollmentId,
        p_status: 'approved',
        p_admin_remarks: remarks[enrollmentId] || null
      });
      
      if (error) throw error;
      
      toast({
        title: "Enrollment Approved",
        description: "The student enrollment has been approved",
      });
      
      // Refresh the list
      fetchPendingEnrollments();
    } catch (error) {
      console.error("Error approving enrollment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve enrollment",
        variant: "destructive",
      });
    }
  };

  const handleRejectEnrollment = async (enrollmentId) => {
    if (!remarks[enrollmentId]) {
      toast({
        title: "Remarks Required",
        description: "Please provide remarks explaining the rejection",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase.rpc('process_enrollment_request', {
        p_admin_id: user.id,
        p_enrollment_id: enrollmentId,
        p_status: 'rejected',
        p_admin_remarks: remarks[enrollmentId]
      });
      
      if (error) throw error;
      
      toast({
        title: "Enrollment Rejected",
        description: "The student enrollment has been rejected",
      });
      
      // Refresh the list
      fetchPendingEnrollments();
    } catch (error) {
      console.error("Error rejecting enrollment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject enrollment",
        variant: "destructive",
      });
    }
  };

  const handleResolveFeedback = async (feedbackId) => {
    try {
      const { error } = await supabase
        .from('student_notifications')
        .update({ is_read: true })
        .eq('id', feedbackId);
        
      if (error) throw error;
      
      toast({
        title: "Feedback Resolved",
        description: "The feedback has been marked as resolved",
      });
      
      // Refresh the list
      fetchPendingFeedback();
    } catch (error) {
      console.error("Error resolving feedback:", error);
      toast({
        title: "Error",
        description: "Failed to resolve feedback",
        variant: "destructive",
      });
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Only admin users can access this page.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader 
        title="Approval Center" 
        description="Manage student enrollments and feedback requests" 
      />

      <div className="container mx-auto max-w-5xl">
        <Tabs defaultValue="enrollments" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enrollments">Enrollment Requests</TabsTrigger>
            <TabsTrigger value="feedback">Feedback Requests</TabsTrigger>
          </TabsList>
          
          {/* Enrollments Tab */}
          <TabsContent value="enrollments">
            <Card>
              <CardHeader>
                <CardTitle>Pending Enrollment Requests</CardTitle>
                <CardDescription>
                  Review and approve student enrollment requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : pendingEnrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending enrollment requests.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingEnrollments.map((enrollment) => (
                      <Card key={enrollment.id} className="overflow-hidden">
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {enrollment.students_view?.full_name?.charAt(0) || "S"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">{enrollment.students_view?.full_name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {enrollment.students_view?.email} | {enrollment.students_view?.enrollment_number}
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                              Pending
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="text-sm font-semibold">Course</h4>
                              <p className="text-sm">
                                {enrollment.courses?.name} ({enrollment.courses?.code})
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold">Academic Details</h4>
                              <p className="text-sm">
                                Year: {enrollment.academic_year} | Semester: {enrollment.semester}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <Label htmlFor={`remarks-${enrollment.id}`}>Admin Remarks</Label>
                            <Textarea
                              id={`remarks-${enrollment.id}`}
                              placeholder="Add remarks or reason for approval/rejection"
                              className="mt-1"
                              value={remarks[enrollment.id] || ""}
                              onChange={(e) => handleRemarkChange(enrollment.id, e.target.value)}
                            />
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => handleRejectEnrollment(enrollment.id)}
                              className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </Button>
                            <Button 
                              onClick={() => handleApproveEnrollment(
                                enrollment.id, 
                                enrollment.student_id, 
                                enrollment.course_id
                              )}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Requests</CardTitle>
                <CardDescription>
                  Review and respond to student and teacher feedback.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : pendingFeedback.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No pending feedback to review.</p>
                      <p className="text-xs text-muted-foreground">
                        When students or teachers submit feedback, it will appear here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingFeedback.map((feedback) => (
                      <Card key={feedback.id} className="overflow-hidden">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{feedback.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                From: {feedback.students?.users?.full_name || "Unknown"} 
                                {feedback.students?.enrollment_number ? ` (${feedback.students.enrollment_number})` : ""}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Received: {new Date(feedback.created_at).toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              New
                            </Badge>
                          </div>
                          
                          <div className="mb-4 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm">{feedback.message}</p>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button 
                              onClick={() => handleResolveFeedback(feedback.id)}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Mark as Resolved
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default EnrollmentApprovalPage;
