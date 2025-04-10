
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building, Plus, Search, Edit, Trash2, Info } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ClassroomsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch classrooms
  const { data: classrooms, isLoading } = useQuery({
    queryKey: ["classrooms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching classrooms:", error);
        throw error;
      }

      return data || [];
    },
  });

  // Delete classroom mutation
  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      // Check if classroom is being used in timetable
      const { data: timetableEntries, error: checkError } = await supabase
        .from("timetable_entries")
        .select("id")
        .eq("class_id", classId)
        .limit(1);

      if (checkError) throw checkError;

      if (timetableEntries && timetableEntries.length > 0) {
        throw new Error("Cannot delete classroom as it is being used in timetable schedules");
      }

      // Delete the classroom
      const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", classId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      toast({
        title: "Classroom deleted",
        description: "The classroom has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete classroom",
        variant: "destructive",
      });
    },
  });

  // Filter classrooms based on search query
  const filteredClassrooms = classrooms?.filter((classroom) => {
    const query = searchQuery.toLowerCase();
    return (
      classroom.name.toLowerCase().includes(query) ||
      classroom.room.toLowerCase().includes(query)
    );
  });

  const handleDeleteClassroom = (classId: string) => {
    deleteClassMutation.mutate(classId);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classrooms"
        description="Manage classroom information"
        icon={Building}
      >
        <Button onClick={() => navigate("/classrooms/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Classroom
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>All Classrooms</CardTitle>
          <CardDescription>View and manage classroom details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search classrooms..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredClassrooms && filteredClassrooms.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Classroom Name</TableHead>
                    <TableHead>Room Number</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClassrooms.map((classroom) => (
                    <TableRow key={classroom.id}>
                      <TableCell className="font-medium">{classroom.name}</TableCell>
                      <TableCell>{classroom.room}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{classroom.capacity} seats</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/classrooms/${classroom.id}/edit`)}
                          >
                            <Edit className="h-4 w-4 text-gray-500" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Classroom</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this classroom? This action cannot be undone.
                                  If this classroom is being used in any timetable, you won't be able to delete it.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteClassroom(classroom.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Building className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No classrooms found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery
                  ? "No classrooms match your search criteria."
                  : "Get started by adding a new classroom."}
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate("/classrooms/new")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Classroom
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassroomsPage;
