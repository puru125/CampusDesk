
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Plus, Search, Trash2, Users, UserPlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TeacherView, Subject } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface TeacherSubjectAssignment {
  id: string;
  teacher_id: string;
  subject_id: string;
  teacher?: TeacherView;
  subject?: Subject;
}

interface TeacherAssignmentFormProps {
  courseId: string;
  subjects: Subject[];
  onSuccess: () => void;
}

const TeacherAssignmentForm = ({ courseId, subjects, onSuccess }: TeacherAssignmentFormProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch teachers
  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers_view")
        .select("*");

      if (error) throw error;
      return data as TeacherView[];
    },
  });

  // Fetch existing teacher-subject assignments
  const { data: teacherSubjects, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["teacher-subjects", courseId],
    queryFn: async () => {
      const subjectIds = subjects.map(subject => subject.id);
      
      // Modified query to fetch all needed subject fields
      const { data, error } = await supabase
        .from("teacher_subjects")
        .select(`
          id,
          teacher_id,
          subject_id,
          created_at,
          updated_at,
          subject:subject_id(id, name, code, credits, course_id, created_at, updated_at)
        `)
        .in("subject_id", subjectIds);

      if (error) throw error;
      
      // Now fetch the teacher information separately for each assignment
      const assignmentsWithTeachers = await Promise.all(
        data.map(async (assignment) => {
          const { data: teacherData, error: teacherError } = await supabase
            .from("teachers_view")
            .select("*")
            .eq("id", assignment.teacher_id)
            .single();
            
          if (teacherError) {
            console.error("Error fetching teacher:", teacherError);
            return {
              ...assignment,
              teacher: undefined,
            };
          }
          
          return {
            ...assignment,
            teacher: teacherData,
          };
        })
      );
      
      return assignmentsWithTeachers as TeacherSubjectAssignment[];
    },
    enabled: subjects && subjects.length > 0,
  });

  // Mutation for assigning a teacher to a subject
  const assignTeacherMutation = useMutation({
    mutationFn: async ({ teacherId, subjectId }: { teacherId: string; subjectId: string }) => {
      // Check if assignment already exists
      const { data: existingAssignment } = await supabase
        .from("teacher_subjects")
        .select("*")
        .eq("teacher_id", teacherId)
        .eq("subject_id", subjectId)
        .maybeSingle();

      if (existingAssignment) {
        throw new Error("This teacher is already assigned to this subject");
      }

      // Create new assignment
      const { data, error } = await supabase
        .from("teacher_subjects")
        .insert({
          teacher_id: teacherId,
          subject_id: subjectId,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-subjects", courseId] });
      onSuccess();
      setIsAssignDialogOpen(false);
      setSelectedSubject("");
      setSelectedTeacher("");
    },
  });

  // Mutation for removing a teacher assignment
  const removeAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { data, error } = await supabase
        .from("teacher_subjects")
        .delete()
        .eq("id", assignmentId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-subjects", courseId] });
      onSuccess();
    },
  });

  // Handle assigning a teacher to a subject
  const handleAssignTeacher = () => {
    if (selectedTeacher && selectedSubject) {
      assignTeacherMutation.mutate({
        teacherId: selectedTeacher,
        subjectId: selectedSubject,
      });
    }
  };

  // Handle removing a teacher assignment
  const handleRemoveAssignment = (assignmentId: string) => {
    removeAssignmentMutation.mutate(assignmentId);
  };

  // Filter assignments based on search query
  const filteredAssignments = teacherSubjects?.filter((assignment) => {
    const query = searchQuery.toLowerCase();
    return (
      assignment.teacher?.full_name?.toLowerCase().includes(query) ||
      assignment.subject?.name?.toLowerCase().includes(query) ||
      assignment.subject?.code?.toLowerCase().includes(query) ||
      assignment.teacher?.specialization?.toLowerCase().includes(query) ||
      assignment.teacher?.department?.toLowerCase().includes(query)
    );
  });

  const isLoading = teachersLoading || assignmentsLoading;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Teacher Assignments</CardTitle>
          <CardDescription>Manage which teachers are assigned to which subjects</CardDescription>
        </div>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Assign Teacher to Subject</DialogTitle>
              <DialogDescription>
                Select a subject and a teacher to create an assignment
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="teacher">Teacher</Label>
                <Select
                  value={selectedTeacher}
                  onValueChange={setSelectedTeacher}
                >
                  <SelectTrigger id="teacher">
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers?.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.full_name} {teacher.specialization && `(${teacher.specialization})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleAssignTeacher} 
                disabled={!selectedSubject || !selectedTeacher || assignTeacherMutation.isPending}
              >
                {assignTeacherMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Assign Teacher
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search assignments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-institute-500" />
          </div>
        ) : filteredAssignments && filteredAssignments.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Subject Code</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.teacher?.full_name}</TableCell>
                    <TableCell>{assignment.teacher?.specialization || "-"}</TableCell>
                    <TableCell>{assignment.teacher?.department || "-"}</TableCell>
                    <TableCell>{assignment.subject?.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{assignment.subject?.code || "-"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Assignment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove this teacher from this subject? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleRemoveAssignment(assignment.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Remove
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
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No assignments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery
                ? "No assignments match your search criteria."
                : "Get started by assigning teachers to subjects."}
            </p>
            <Button
              className="mt-4"
              onClick={() => setIsAssignDialogOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Assign Teacher
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherAssignmentForm;
