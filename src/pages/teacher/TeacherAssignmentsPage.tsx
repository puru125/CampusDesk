
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Plus, Clock, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const TeacherAssignmentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    // For now, let's mock the data until we create the assignments table
    const mockAssignments = [
      {
        id: "1",
        title: "Database Normalization",
        subject: "Database Systems",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: "active",
        totalSubmissions: 28,
        pendingGrading: 12,
        maxScore: 100,
      },
      {
        id: "2",
        title: "Algorithm Analysis",
        subject: "Data Structures",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: "active",
        totalSubmissions: 35,
        pendingGrading: 35,
        maxScore: 50,
      },
      {
        id: "3",
        title: "HTML/CSS Project",
        subject: "Web Development",
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: "closed",
        totalSubmissions: 42,
        pendingGrading: 0,
        maxScore: 100,
      },
    ];
    
    setAssignments(mockAssignments);
    setLoading(false);
  }, []);
  
  // Filter assignments based on search term
  const filteredAssignments = assignments.filter(assignment => 
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Split assignments by status
  const activeAssignments = filteredAssignments.filter(a => a.status === "active");
  const closedAssignments = filteredAssignments.filter(a => a.status === "closed");
  
  return (
    <div>
      <PageHeader
        title="Assignments"
        description="Create and manage assignments for your courses"
        icon={FileText}
      >
        <Button onClick={() => navigate("/assignments/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </PageHeader>
      
      <div className="flex items-center justify-between mt-6 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search assignments..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="active" className="mt-6">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center">
            <CheckCircle className="mr-2 h-4 w-4" />
            Active Assignments
          </TabsTrigger>
          <TabsTrigger value="closed" className="flex items-center">
            <XCircle className="mr-2 h-4 w-4" />
            Closed Assignments
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeAssignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAssignments.map((assignment) => (
                <Card 
                  key={assignment.id} 
                  className="hover:shadow-md cursor-pointer transition-shadow"
                  onClick={() => navigate(`/assignments/${assignment.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="mb-4">{assignment.subject}</Badge>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Due Date:</span>
                        </div>
                        <span className="font-medium">{format(assignment.dueDate, "PPP")}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center text-gray-500">
                          <FileText className="h-4 w-4 mr-1" />
                          <span>Submissions:</span>
                        </div>
                        <span className="font-medium">{assignment.totalSubmissions}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Pending Grading:</span>
                        </div>
                        <span className="font-medium">{assignment.pendingGrading}</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full mt-4">
                      View Submissions
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No Active Assignments</h3>
              <p className="mt-1 text-gray-500">
                You don't have any active assignments at the moment.
              </p>
              <Button onClick={() => navigate("/assignments/new")} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="closed" className="mt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
            </div>
          ) : closedAssignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {closedAssignments.map((assignment) => (
                <Card 
                  key={assignment.id} 
                  className="hover:shadow-md cursor-pointer transition-shadow"
                  onClick={() => navigate(`/assignments/${assignment.id}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="mb-4">{assignment.subject}</Badge>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Due Date:</span>
                        </div>
                        <span className="font-medium">{format(assignment.dueDate, "PPP")}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center text-gray-500">
                          <FileText className="h-4 w-4 mr-1" />
                          <span>Submissions:</span>
                        </div>
                        <span className="font-medium">{assignment.totalSubmissions}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center text-gray-500">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span>Status:</span>
                        </div>
                        <Badge variant="outline" className="ml-2 bg-gray-100">Closed</Badge>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full mt-4">
                      View Submissions
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No Closed Assignments</h3>
              <p className="mt-1 text-gray-500">
                You don't have any closed assignments yet.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherAssignmentsPage;
