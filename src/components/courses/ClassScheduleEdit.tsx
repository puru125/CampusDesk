
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar, Clock, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { Subject, TeacherView, Class, TimetableEntry } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { DAYS_OF_WEEK, TIME_SLOTS } from "@/components/timetable/TimetableFormConstants";

// Timetable entry form validation schema
const timetableEntrySchema = z.object({
  class_id: z.string({
    required_error: "Class is required",
  }),
  subject_id: z.string({
    required_error: "Subject is required",
  }),
  teacher_id: z.string({
    required_error: "Teacher is required",
  }),
  day_of_week: z.number({
    required_error: "Day of week is required",
  }),
  start_time: z.string({
    required_error: "Start time is required",
  }),
  end_time: z.string({
    required_error: "End time is required",
  }),
}).refine(data => data.start_time < data.end_time, {
  message: "End time must be after start time",
  path: ["end_time"],
});

type TimetableFormValues = z.infer<typeof timetableEntrySchema>;

interface ClassScheduleEditProps {
  courseId: string;
  subjects: Subject[];
  onSuccess: () => void;
}

const ClassScheduleEdit = ({ courseId, subjects, onSuccess }: ClassScheduleEditProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Create form
  const form = useForm<TimetableFormValues>({
    resolver: zodResolver(timetableEntrySchema),
    defaultValues: {
      class_id: "",
      subject_id: "",
      teacher_id: "",
      day_of_week: 1,
      start_time: "",
      end_time: "",
    },
  });

  // Get the selected subject and teacher for conditional rendering
  const selectedSubjectId = form.watch("subject_id");

  // Reset teacher selection when subject changes
  const handleSubjectChange = (subjectId: string) => {
    form.setValue("subject_id", subjectId);
    form.setValue("teacher_id", "");
  };

  // Fetch classes
  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Class[];
    },
  });

  // Fetch teachers for subject
  const { data: subjectTeachers, isLoading: teachersLoading } = useQuery({
    queryKey: ["subject-teachers", selectedSubjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teacher_subjects")
        .select(`
          teacher_id,
          teacher:teacher_id(
            id, 
            full_name, 
            specialization, 
            department
          )
        `)
        .eq("subject_id", selectedSubjectId);

      if (error) throw error;
      
      // Extract the teacher data from the nested structure
      return data.map(item => item.teacher);
    },
    enabled: !!selectedSubjectId,
  });

  // Fetch timetable entries
  const { data: timetableEntries, isLoading: entriesLoading } = useQuery({
    queryKey: ["timetable-entries", courseId],
    queryFn: async () => {
      const subjectIds = subjects.map(subject => subject.id);
      
      const { data, error } = await supabase
        .from("timetable_entries")
        .select(`
          *,
          class:class_id(id, name, room),
          subject:subject_id(id, name, code),
          teacher:teacher_id(id, full_name, specialization)
        `)
        .in("subject_id", subjectIds);

      if (error) throw error;
      return data as any[];
    },
    enabled: subjects && subjects.length > 0,
  });

  // Add timetable entry mutation
  const addEntryMutation = useMutation({
    mutationFn: async (values: TimetableFormValues) => {
      // Check for conflicts
      const { data: existingEntries, error: conflictError } = await supabase
        .from("timetable_entries")
        .select("*")
        .eq("class_id", values.class_id)
        .eq("day_of_week", values.day_of_week)
        .or(`start_time.lte.${values.end_time},end_time.gte.${values.start_time}`);

      if (conflictError) throw conflictError;

      if (existingEntries && existingEntries.length > 0) {
        throw new Error("There is already a class scheduled at this time for this room");
      }

      // Check for teacher availability
      const { data: teacherConflicts, error: teacherConflictError } = await supabase
        .from("timetable_entries")
        .select("*")
        .eq("teacher_id", values.teacher_id)
        .eq("day_of_week", values.day_of_week)
        .or(`start_time.lte.${values.end_time},end_time.gte.${values.start_time}`);

      if (teacherConflictError) throw teacherConflictError;

      if (teacherConflicts && teacherConflicts.length > 0) {
        throw new Error("The selected teacher already has a class scheduled at this time");
      }

      // Insert the entry
      const { data, error } = await supabase
        .from("timetable_entries")
        .insert({
          class_id: values.class_id,
          subject_id: values.subject_id,
          teacher_id: values.teacher_id,
          day_of_week: values.day_of_week,
          start_time: values.start_time,
          end_time: values.end_time,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable-entries", courseId] });
      onSuccess();
      setIsAddDialogOpen(false);
      form.reset();
    },
  });

  // Delete timetable entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const { data, error } = await supabase
        .from("timetable_entries")
        .delete()
        .eq("id", entryId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable-entries", courseId] });
      onSuccess();
    },
  });

  // Handle adding a timetable entry
  const onSubmit = (data: TimetableFormValues) => {
    addEntryMutation.mutate(data);
  };

  // Handle deleting a timetable entry
  const handleDeleteEntry = (entryId: string) => {
    deleteEntryMutation.mutate(entryId);
  };

  // Filter timetable entries based on search query
  const filteredEntries = timetableEntries?.filter((entry) => {
    const query = searchQuery.toLowerCase();
    return (
      entry.class?.name?.toLowerCase().includes(query) ||
      entry.subject?.name?.toLowerCase().includes(query) ||
      entry.subject?.code?.toLowerCase().includes(query) ||
      entry.teacher?.full_name?.toLowerCase().includes(query) ||
      DAYS_OF_WEEK.find(day => day.value === entry.day_of_week)?.label.toLowerCase().includes(query)
    );
  });

  const isLoading = classesLoading || entriesLoading;

  // Format day of week for display
  const getDayName = (dayValue: number) => {
    const day = DAYS_OF_WEEK.find(day => day.value === dayValue);
    return day ? day.label : "Unknown";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Class Schedule</CardTitle>
          <CardDescription>Manage class schedules for this course</CardDescription>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add Class Schedule</DialogTitle>
              <DialogDescription>
                Create a new class schedule entry. Make sure to avoid scheduling conflicts.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="class_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Classroom</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select classroom" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classes?.map((classItem) => (
                              <SelectItem key={classItem.id} value={classItem.id}>
                                {classItem.name} (Room: {classItem.room})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select
                          onValueChange={handleSubjectChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjects?.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name} ({subject.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="teacher_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!selectedSubjectId || teachersLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              {teachersLoading ? (
                                <div className="flex items-center">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Loading...
                                </div>
                              ) : (
                                <SelectValue placeholder="Select teacher" />
                              )}
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {!selectedSubjectId ? (
                              <SelectItem value="select-subject" disabled>
                                Select a subject first
                              </SelectItem>
                            ) : subjectTeachers && subjectTeachers.length > 0 ? (
                              subjectTeachers.map((teacher: any) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                  {teacher.full_name} {teacher.specialization && `(${teacher.specialization})`}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-teachers" disabled>
                                No teachers assigned to this subject
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {selectedSubjectId && subjectTeachers && subjectTeachers.length === 0 && (
                          <FormDescription className="text-yellow-500">
                            No teachers are assigned to this subject yet
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="day_of_week"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Day of Week</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DAYS_OF_WEEK.map((day) => (
                              <SelectItem key={day.value} value={day.value.toString()}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select start time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={`start-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select end time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TIME_SLOTS.map((time) => (
                              <SelectItem key={`end-${time}`} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={addEntryMutation.isPending}
                  >
                    {addEntryMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        Save Schedule
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search schedules..."
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
        ) : filteredEntries && filteredEntries.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Classroom</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{entry.subject?.name}</span>
                        <div>
                          <Badge variant="outline" className="mt-1">{entry.subject?.code}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{entry.teacher?.full_name}</TableCell>
                    <TableCell>{entry.class?.name} (Room: {entry.class?.room})</TableCell>
                    <TableCell>{getDayName(entry.day_of_week)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-gray-500" />
                        {entry.start_time} - {entry.end_time}
                      </div>
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
                            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this class schedule? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
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
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No schedules found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery
                ? "No schedules match your search criteria."
                : "Get started by adding a new class schedule."}
            </p>
            <Button
              className="mt-4"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add First Schedule
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassScheduleEdit;
