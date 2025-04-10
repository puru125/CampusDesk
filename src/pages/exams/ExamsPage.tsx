
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2,
  Edit,
  Clock,
  Calendar,
  Filter
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/ui/page-header";
import { Exam } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import YearSessionFilter from "@/components/filters/YearSessionFilter";
import { YearSessionValues } from "@/lib/validation-rules";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "scheduled":
      return "outline";
    case "ongoing":
      return "default";
    case "completed":
      return "success";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
};

const ExamsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [yearSessionFilter, setYearSessionFilter] = useState<YearSessionValues>({});

  const { data: exams, isLoading, refetch } = useQuery({
    queryKey: ["exams", statusFilter, yearSessionFilter],
    queryFn: async () => {
      try {
        let query = supabase.from('exams').select(`
          *,
          subject:subjects(
            id,
            name,
            course_id,
            course:courses(
              id,
              name
            )
          )
        `);

        if (statusFilter) {
          query = query.eq("status", statusFilter);
        }

        // Apply year filter if provided (assuming exam_date is in ISO format)
        if (yearSessionFilter.year) {
          query = query.ilike('exam_date', `${yearSessionFilter.year}%`);
        }

        // For teachers, show only exams for subjects they teach
        if (user?.role === "teacher") {
          // Get teacher_id
          const { data: teacherData } = await supabase
            .from('teachers')
            .select("id")
            .eq("user_id", user.id)
            .single();
          
          if (teacherData) {
            // Get subject IDs taught by this teacher
            const { data: teacherSubjects } = await supabase
              .from('teacher_subjects')
              .select("subject_id")
              .eq("teacher_id", teacherData.id);
            
            if (teacherSubjects && teacherSubjects.length > 0) {
              const subjectIds = teacherSubjects.map((ts: any) => ts.subject_id);
              query = query.in("subject_id", subjectIds);
            }
          }
        }
        // For students, show exams for courses they're enrolled in
        else if (user?.role === "student") {
          // This would need custom logic based on your data model
          // to fetch timetable entries for the student's classes
        }

        const { data, error } = await query.order("exam_date", { ascending: false });

        if (error) {
          console.error("Error fetching exams:", error);
          toast({
            title: "Error",
            description: "Failed to fetch exams. Please try again later.",
            variant: "destructive",
          });
          return [];
        }

        return data as Exam[];
      } catch (error) {
        console.error("Error in fetch function:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  const filteredExams = exams?.filter((exam) => {
    const query = searchQuery.toLowerCase();
    return (
      exam.title.toLowerCase().includes(query) ||
      exam.subject?.name.toLowerCase().includes(query) ||
      (exam.description?.toLowerCase().includes(query) || false)
    );
  });

  const handleDeleteExam = async (examId: string) => {
    // For now just show a toast. In a real application, we would delete the exam.
    toast({
      title: "Not implemented",
      description: "Exam deletion functionality is not implemented yet.",
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examinations"
        description="View and manage all exams"
        icon={FileText}
      >
        {(user?.role === "admin" || user?.role === "teacher") && (
          <Button onClick={() => navigate("/exams/new")}>
            <Plus className="mr-2 h-4 w-4" /> Add Exam
          </Button>
        )}
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Exam List</CardTitle>
          <CardDescription>
            Showing {filteredExams?.length || 0} exams in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search exams..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter || ""}
                onValueChange={(value) => setStatusFilter(value || null)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <YearSessionFilter 
              onFilterChange={setYearSessionFilter}
              sessions={[]}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-institute-500 border-t-transparent rounded-full"></div>
            </div>
          ) : filteredExams && filteredExams.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.title}</TableCell>
                      <TableCell>{exam.subject?.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          {format(new Date(exam.exam_date), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-500" />
                          {exam.start_time.substring(0, 5)} - {exam.end_time.substring(0, 5)}
                        </div>
                      </TableCell>
                      <TableCell>{exam.room || "TBD"}</TableCell>
                      <TableCell>
                        {exam.max_marks} (Pass: {exam.passing_marks})
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(exam.status)}>
                          {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {(user?.role === "admin" || user?.role === "teacher") && (
                          <>
                            {user?.role === "admin" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/exams/${exam.id}/results`)}
                              >
                                Results
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/exams/${exam.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExam(exam.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                        {user?.role === "student" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/exams/${exam.id}`)}
                          >
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No exams found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "No exams match your search criteria."
                  : "Get started by adding a new exam."}
              </p>
              {(user?.role === "admin" || user?.role === "teacher") && (
                <Button
                  className="mt-4"
                  onClick={() => navigate("/exams/new")}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Exam
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamsPage;
