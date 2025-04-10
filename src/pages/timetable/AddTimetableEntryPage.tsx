
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Calendar, Clock, FileText, Save, User, BookOpen } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Class, Subject, TeacherView } from "@/types";

const timetableSchema = z.object({
  class_id: z.string({
    required_error: "Please select a class",
  }),
  subject_id: z.string({
    required_error: "Please select a subject",
  }),
  teacher_id: z.string({
    required_error: "Please select a teacher",
  }),
  day_of_week: z.number({
    required_error: "Please select a day",
  }).min(1, "Please select a day"),
  start_time: z.string({
    required_error: "Please select a start time",
  }),
  end_time: z.string({
    required_error: "Please select an end time",
  }),
});

type TimetableFormValues = z.infer<typeof timetableSchema>;

const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

const AddTimetableEntryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TimetableFormValues>({
    resolver: zodResolver(timetableSchema),
    defaultValues: {
      class_id: "",
      subject_id: "",
      teacher_id: "",
      day_of_week: 1,
      start_time: "",
      end_time: "",
    },
  });

  // Query to fetch available classes
  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select("*")
          .order("name");

        if (error) {
          console.error("Error fetching classes:", error);
          toast({
            title: "Error",
            description: "Failed to fetch classes",
            variant: "destructive",
          });
          return [];
        }

        return data as Class[];
      } catch (error) {
        console.error("Error in fetch function:", error);
        return [];
      }
    },
  });

  // Query to fetch available subjects
  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select(`
          *,
          course:courses(id, name)
        `)
          .order("name");

        if (error) {
          console.error("Error fetching subjects:", error);
          toast({
            title: "Error",
            description: "Failed to fetch subjects",
            variant: "destructive",
          });
          return [];
        }

        return data as Subject[];
      } catch (error) {
        console.error("Error in fetch function:", error);
        return [];
      }
    },
  });

  // Query to fetch available teachers
  const { data: teachers } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("teachers_view")
          .select("*")
          .order("full_name");

        if (error) {
          console.error("Error fetching teachers:", error);
          toast({
            title: "Error",
            description: "Failed to fetch teachers",
            variant: "destructive",
          });
          return [];
        }

        return data as TeacherView[];
      } catch (error) {
        console.error("Error in fetch function:", error);
        return [];
      }
    },
  });

  // Mutation to add a new timetable entry
  const addTimetableEntryMutation = useMutation({
    mutationFn: async (values: TimetableFormValues) => {
      try {
        // First check if there's a conflict
        const { data: existingEntries } = await supabase
          .from('timetable_entries')
          .select("*")
          .eq("class_id", values.class_id)
          .eq("day_of_week", values.day_of_week)
          .or(`start_time.lte.${values.end_time},end_time.gte.${values.start_time}`);

        if (existingEntries && existingEntries.length > 0) {
          throw new Error("There is already a class scheduled at this time");
        }

        // Insert the new timetable entry
        const { data, error } = await supabase.from('timetable_entries').insert({
          class_id: values.class_id,
          subject_id: values.subject_id,
          teacher_id: values.teacher_id,
          day_of_week: values.day_of_week,
          start_time: values.start_time,
          end_time: values.end_time,
        });

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error in mutation function:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Timetable entry added successfully",
      });
      navigate("/timetable");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add timetable entry",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (values: TimetableFormValues) => {
    setIsSubmitting(true);
    addTimetableEntryMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Timetable Entry"
        description="Create a new timetable entry"
        icon={Calendar}
      >
        <Button variant="outline" onClick={() => navigate("/timetable")}>
          Cancel
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Timetable Details</CardTitle>
          <CardDescription>
            Enter the details for the new timetable entry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="class_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes?.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Class for this timetable entry
                      </FormDescription>
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
                        onValueChange={field.onChange}
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
                              {subject.name} {subject.course && `(${subject.course.name})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Subject for this timetable entry
                      </FormDescription>
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
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select teacher" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teachers?.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Teacher for this timetable entry
                      </FormDescription>
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
                        onValueChange={(value) => {
                          const parsedValue = parseInt(value, 10);
                          field.onChange(isNaN(parsedValue) ? undefined : parsedValue);
                        }}
                        defaultValue={field.value?.toString()}
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
                      <FormDescription>
                        Day of the week for this timetable entry
                      </FormDescription>
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
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        When the class starts
                      </FormDescription>
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
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        When the class ends
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/timetable")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Adding..." : "Add Timetable Entry"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddTimetableEntryPage;
