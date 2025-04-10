
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FileText, Save } from "lucide-react";
import { z } from "zod";
import { format } from "date-fns";

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
import { Textarea } from "@/components/ui/textarea";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import PageHeader from "@/components/ui/page-header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Subject } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const examSchema = z.object({
  title: z.string().min(3, "Exam title must be at least 3 characters"),
  subject_id: z.string({
    required_error: "Please select a subject",
  }),
  exam_date: z.date({
    required_error: "Please select a date",
  }),
  start_time: z.string({
    required_error: "Please select a start time",
  }),
  end_time: z.string({
    required_error: "Please select an end time",
  }),
  room: z.string().optional(),
  description: z.string().optional(),
  max_marks: z.number().min(1, "Maximum marks must be at least 1"),
  passing_marks: z.number().min(1, "Passing marks must be at least 1"),
});

type ExamFormValues = z.infer<typeof examSchema>;

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

const AddExamPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      subject_id: "",
      exam_date: new Date(),
      start_time: "",
      end_time: "",
      room: "",
      description: "",
      max_marks: 100,
      passing_marks: 40,
    },
  });

  // Query to fetch subjects
  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      try {
        // Making a direct request to get subjects without relying on database type definitions
        let query = supabase.from('subjects').select(`
          *,
          course:courses(
            id,
            name
          )
        `);

        // For teachers, show only subjects they teach
        if (user?.role === "teacher") {
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
              query = query.in("id", subjectIds);
            }
          }
        }

        const { data, error } = await query.order("name");

        if (error) {
          console.error("Error fetching subjects:", error);
          toast({
            title: "Error",
            description: "Failed to fetch subjects. Please try again.",
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

  const addExamMutation = useMutation({
    mutationFn: async (values: ExamFormValues) => {
      // Validate times
      if (values.start_time >= values.end_time) {
        throw new Error("End time must be after start time");
      }

      try {
        // Insert the new exam
        const { data, error } = await supabase.from('exams').insert({
          title: values.title,
          subject_id: values.subject_id,
          exam_date: values.exam_date.toISOString().split('T')[0],
          start_time: values.start_time,
          end_time: values.end_time,
          room: values.room || null,
          description: values.description || null,
          max_marks: values.max_marks,
          passing_marks: values.passing_marks,
          status: "scheduled",
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
        title: "Exam added",
        description: "The exam has been successfully scheduled.",
      });
      navigate("/exams");
    },
    onError: (error) => {
      console.error("Error adding exam:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add exam. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (values: ExamFormValues) => {
    setIsSubmitting(true);
    addExamMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule New Exam"
        description="Create a new examination"
        icon={FileText}
      >
        <Button variant="outline" onClick={() => navigate("/exams")}>
          Cancel
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
          <CardDescription>
            Enter the details for the new examination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Midterm Examination" {...field} />
                      </FormControl>
                      <FormDescription>
                        Title of the examination
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
                        Subject for this examination
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exam_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Exam Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Date when the exam will be conducted
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="room"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Examination Hall 1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Room or hall where the exam will be held
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
                        When the exam starts
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
                        When the exam ends
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_marks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Marks</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            field.onChange(isNaN(value) ? 0 : value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Total marks for this exam
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passing_marks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passing Marks</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            field.onChange(isNaN(value) ? 0 : value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum marks required to pass
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter exam description, syllabus, or instructions..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Additional details about the exam (syllabus, instructions, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/exams")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Scheduling..." : "Schedule Exam"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddExamPage;
