
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
  Book, 
  BookOpen, 
  Plus, 
  Search, 
  Trash2,
  Edit,
  Users,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import PageHeader from "@/components/ui/page-header";
import { Course } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import YearSessionFilter from "@/components/filters/YearSessionFilter";
import { YearSessionValues } from "@/lib/validation-rules";
import { useToast } from "@/hooks/use-toast";

const CoursesPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [yearSessionFilter, setYearSessionFilter] = useState<YearSessionValues>({});
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  // Fetch courses query
  const { data: courses, isLoading, refetch } = useQuery({
    queryKey: ["courses", yearSessionFilter],
    queryFn: async () => {
      let query = supabase
        .from("courses")
        .select(`
          *,
          subjects(*)
        `);

      if (yearSessionFilter.year) {
        query = query.ilike('created_at', `${yearSessionFilter.year}%`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching courses:", error);
        toast({
          title: "Error",
          description: "Failed to fetch courses",
          variant: "destructive",
        });
        return [];
      }

      return (data as any) as Course[];
    },
  });

  // Delete course mutation
  const deleteCourse = useMutation({
    mutationFn: async (courseId: string) => {
      // First check if there are teacher assignments or other dependencies
      const { data: teacherSubjects, error: checkError } = await supabase
        .from("teacher_subjects")
        .select("id")
        .eq("subject_id", courseId);
      
      if (checkError) {
        console.error("Error checking course dependencies:", checkError);
        throw new Error("Failed to check course dependencies");
      }
      
      if (teacherSubjects && teacherSubjects.length > 0) {
        throw new Error("Cannot delete course with assigned teachers. Please remove teacher assignments first.");
      }
      
      // If no dependencies, proceed with deletion
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);
      
      if (error) {
        console.error("Error deleting course:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setCourseToDelete(null);
    }
  });

  const filteredCourses = courses?.filter((course) => {
    const query = searchQuery.toLowerCase();
    return (
      course.name.toLowerCase().includes(query) ||
      (course.code?.toLowerCase().includes(query) || false) ||
      (course.description?.toLowerCase().includes(query) || false)
    );
  });

  const handleDeleteCourse = (courseId: string) => {
    setCourseToDelete(courseId);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      deleteCourse.mutate(courseToDelete);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses Management"
        description="View and manage all courses"
        icon={BookOpen}
      >
        <Button onClick={() => navigate("/courses/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Course List</CardTitle>
          <CardDescription>
            Showing {filteredCourses?.length || 0} courses in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search courses..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
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
          ) : filteredCourses && filteredCourses.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>{course.code || "-"}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>
                        {course.subjects?.length || 0} subjects
                      </TableCell>
                      <TableCell>
                        <Badge variant={course.is_active ? "default" : "secondary"}>
                          {course.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(course.created_at), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/courses/${course.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/courses/${course.id}`)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Students
                        </Button>
                        <AlertDialog open={courseToDelete === course.id} onOpenChange={(open) => !open && setCourseToDelete(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Course</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this course? This action cannot be undone.
                                All related data will be permanently deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {deleteCourse.isPending ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Book className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "No courses match your search criteria."
                  : "Get started by adding a new course."}
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate("/courses/new")}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Course
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoursesPage;
