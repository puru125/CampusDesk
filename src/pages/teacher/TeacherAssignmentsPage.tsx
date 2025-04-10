
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  PlusCircle, 
  Search, 
  Clock, 
  Calendar, 
  CheckCircle, 
  Users, 
  BookOpen, 
  Loader2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, parseISO, isBefore, addDays } from "date-fns";

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
  submission_count: number;
}

const TeacherAssignmentsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjects, setSubjects] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        if (!user) return;
        
        // Get teacher profile
        const { data: teacherProfile, error: teacherError } = await supabase
          .from('teachers')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (teacherError) throw teacherError;
        
        // Get teacher's subjects
        const { data: teacherSubjects, error: subjectsError } = await supabase
          .from('teacher_subjects')
          .select('subject_id, subjects(id, name, code)')
          .eq('teacher_id', teacherProfile.id);
          
        if (subjectsError) throw subjectsError;
        
        const formattedSubjects = teacherSubjects?.map(ts => ({
          id: ts.subjects?.id || '',
          name: ts.subjects?.name || 'Unknown Subject',
          code: ts.subjects?.code || null
        })).filter(s => s.id) || [];
        
        setSubjects(formattedSubjects);
        
        // Get assignments with submission count
        const { data, error } = await supabase
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
            subjects(id, name, code)
          `)
          .eq('teacher_id', teacherProfile.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Get submission counts for each assignment
        const assignmentsWithCounts = await Promise.all((data || []).map(async (assignment) => {
          const { count, error: countError } = await supabase
            .from('assignment_submissions')
            .select('*', { count: 'exact', head: true })
            .eq('assignment_id', assignment.id);
            
          if (countError) throw countError;
          
          return {
            ...assignment,
            submission_count: count || 0
          };
        }));
        
        setAssignments(assignmentsWithCounts);
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
    
    fetchAssignments();
  }, [user, toast]);
  
  // Filter assignments based on search term and selected subject
  const filteredAssignments = assignments.filter(assignment => 
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedSubject === "" || assignment.subject_id === selectedSubject)
  );
  
  // Group assignments by status
  const upcomingAssignments = filteredAssignments.filter(a => 
    isAfter(parseISO(a.due_date), new Date()) && a.status === 'active'
  );
  
  const overdueAssignments = filteredAssignments.filter(a => 
    isBefore(parseISO(a.due_date), new Date()) && a.status === 'active'
  );
  
  const recentlyCreated = filteredAssignments.filter(a => 
    isAfter(parseISO(a.created_at), addDays(new Date(), -7))
  );
  
  return (
    <div>
      <PageHeader
        title="Assignments"
        description="Create and manage student assignments"
        icon={FileText}
      >
        <Button onClick={() => navigate("/teacher/assignments/new")}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </PageHeader>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search assignments..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={selectedSubject === "" ? "default" : "outline"} 
            className="flex items-center" 
            onClick={() => setSelectedSubject("")}
          >
            <FileText className="mr-2 h-4 w-4" />
            All Subjects
          </Button>
          
          {subjects.map(subject => (
            <Button
              key={subject.id}
              variant={selectedSubject === subject.id ? "default" : "outline"}
              className="hidden md:flex items-center"
              onClick={() => setSelectedSubject(subject.id === selectedSubject ? "" : subject.id)}
            >
              {subject.name}
            </Button>
          ))}
        </div>
      </div>
      
      <Tabs defaultValue="all" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            All ({filteredAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Upcoming ({upcomingAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Past Due ({overdueAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center">
            <CheckCircle className="mr-2 h-4 w-4" />
            Recently Created ({recentlyCreated.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <AssignmentsList 
            assignments={filteredAssignments} 
            loading={loading} 
            emptyMessage="No assignments found"
          />
        </TabsContent>
        
        <TabsContent value="upcoming">
          <AssignmentsList 
            assignments={upcomingAssignments} 
            loading={loading} 
            emptyMessage="No upcoming assignments"
          />
        </TabsContent>
        
        <TabsContent value="overdue">
          <AssignmentsList 
            assignments={overdueAssignments} 
            loading={loading} 
            emptyMessage="No past due assignments"
          />
        </TabsContent>
        
        <TabsContent value="recent">
          <AssignmentsList 
            assignments={recentlyCreated} 
            loading={loading} 
            emptyMessage="No recently created assignments"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface AssignmentsListProps {
  assignments: Assignment[];
  loading: boolean;
  emptyMessage: string;
}

const AssignmentsList = ({ assignments, loading, emptyMessage }: AssignmentsListProps) => {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-lg font-medium">{emptyMessage}</h3>
        <p className="mt-1 text-gray-500">
          Try adjusting your filters or create a new assignment.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {assignments.map(assignment => (
        <Card key={assignment.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-0">
            <Link to={`/teacher/assignments/${assignment.id}`} className="block p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{assignment.title}</h3>
                  {assignment.subjects && (
                    <Badge variant="outline" className="mt-1">
                      {assignment.subjects.name}
                    </Badge>
                  )}
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
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {assignment.submission_count} submissions
                    </span>
                  </div>
                  <div className="mt-1 flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Max Score: {assignment.max_score}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TeacherAssignmentsPage;
