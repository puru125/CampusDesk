
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Building, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
import { Classroom } from '@/types';

interface ClassroomManagementProps {
  courseId: string;
  subjects: any[];
  onSuccess: () => void;
}

interface AssignedClassroom {
  id: string;
  subject_id: string;
  classroom_id: string;
  subject_name?: string;
  classroom_name?: string;
  classroom_room?: string;
  classroom_capacity?: number;
}

const ClassroomManagement = ({ courseId, subjects, onSuccess }: ClassroomManagementProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [assignmentIdToDelete, setAssignmentIdToDelete] = useState<string | null>(null);
  
  // Fetch classrooms
  const { data: classrooms, isLoading: classroomsLoading } = useQuery({
    queryKey: ['classrooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching classrooms:', error);
        throw error;
      }
      
      return data as Classroom[];
    }
  });
  
  // Fetch assigned classrooms for this course
  const { 
    data: assignedClassrooms, 
    isLoading: assignmentsLoading,
    refetch: refetchAssignments 
  } = useQuery({
    queryKey: ['course-classrooms', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_classrooms')
        .select(`
          id,
          subject_id,
          classroom_id,
          subjects!inner(name),
          classes!inner(name, room, capacity)
        `)
        .eq('course_id', courseId);
        
      if (error) {
        console.error('Error fetching classroom assignments:', error);
        throw error;
      }
      
      const formattedData = data.map(item => ({
        id: item.id,
        subject_id: item.subject_id,
        classroom_id: item.classroom_id,
        subject_name: item.subjects?.name,
        classroom_name: item.classes?.name,
        classroom_room: item.classes?.room,
        classroom_capacity: item.classes?.capacity
      }));
      
      return formattedData as AssignedClassroom[];
    }
  });
  
  // Add classroom assignment mutation
  const assignClassroomMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSubject || !selectedClassroom) {
        throw new Error("Subject and classroom must be selected");
      }
      
      // Check if this subject already has a classroom assigned
      const existingAssignment = assignedClassrooms?.find(
        assignment => assignment.subject_id === selectedSubject
      );
      
      if (existingAssignment) {
        // Update existing assignment
        const { data, error } = await supabase
          .from('course_classrooms')
          .update({ classroom_id: selectedClassroom })
          .eq('id', existingAssignment.id)
          .select();
          
        if (error) throw error;
        return data;
      } else {
        // Create new assignment
        const { data, error } = await supabase
          .from('course_classrooms')
          .insert({
            course_id: courseId,
            subject_id: selectedSubject,
            classroom_id: selectedClassroom
          })
          .select();
          
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Classroom assigned successfully",
      });
      setSelectedSubject('');
      setSelectedClassroom('');
      refetchAssignments();
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ['course-classrooms', courseId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign classroom",
        variant: "destructive",
      });
    }
  });
  
  // Delete classroom assignment mutation
  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('course_classrooms')
        .delete()
        .eq('id', assignmentId);
        
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Classroom assignment removed successfully",
      });
      refetchAssignments();
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ['course-classrooms', courseId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove classroom assignment",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setAssignmentIdToDelete(null);
    }
  });
  
  const handleAssignClassroom = () => {
    assignClassroomMutation.mutate();
  };
  
  const confirmDeleteAssignment = () => {
    if (assignmentIdToDelete) {
      deleteAssignmentMutation.mutate(assignmentIdToDelete);
    }
  };
  
  const isLoading = classroomsLoading || assignmentsLoading;
  const isSubmitting = assignClassroomMutation.isPending;
  const isDeleting = deleteAssignmentMutation.isPending;
  
  // Filter out subjects that already have assignments
  const assignedSubjectIds = assignedClassrooms?.map(item => item.subject_id) || [];
  const availableSubjects = subjects.filter(subject => 
    !assignedSubjectIds.includes(subject.id) || selectedSubject === subject.id
  );
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Classrooms</CardTitle>
          <CardDescription>
            Assign classrooms to subjects for this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <Select 
                value={selectedSubject} 
                onValueChange={setSelectedSubject}
                disabled={isSubmitting || subjects.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Classroom
              </label>
              <Select 
                value={selectedClassroom} 
                onValueChange={setSelectedClassroom}
                disabled={isSubmitting || !selectedSubject || !classrooms || classrooms.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms?.map(classroom => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name} ({classroom.room}) - Capacity: {classroom.capacity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleAssignClassroom}
              disabled={isSubmitting || !selectedSubject || !selectedClassroom}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Assign Classroom
                </>
              )}
            </Button>
          </div>
          
          {!classrooms || classrooms.length === 0 && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-700 text-sm">
                No classrooms available. <Button variant="link" className="p-0 h-auto text-amber-700 font-medium" onClick={() => navigate('/classrooms/new')}>Add classrooms</Button> first.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Assigned Classrooms</CardTitle>
          <CardDescription>
            Current classroom assignments for this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : assignedClassrooms && assignedClassrooms.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Classroom</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedClassrooms.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.subject_name}</TableCell>
                      <TableCell>{assignment.classroom_name}</TableCell>
                      <TableCell>{assignment.classroom_room}</TableCell>
                      <TableCell>{assignment.classroom_capacity}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog open={assignmentIdToDelete === assignment.id} onOpenChange={(open) => !open && setAssignmentIdToDelete(null)}>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setAssignmentIdToDelete(assignment.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Classroom Assignment</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this classroom assignment? 
                                This will not delete the classroom, only its assignment to this subject.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={confirmDeleteAssignment}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {isDeleting ? "Removing..." : "Remove"}
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
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Building className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No classrooms assigned</h3>
              <p className="mt-1 text-sm text-gray-500">
                Assign classrooms to subjects using the form above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassroomManagement;
