
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Building, Save, AlertCircle } from "lucide-react";
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
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PageHeader from "@/components/ui/page-header";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Validation schema for classroom form
const classroomSchema = z.object({
  name: z.string().min(1, "Classroom name is required"),
  room: z.string().min(1, "Room number is required"),
  capacity: z.number().min(1, "Capacity must be at least 1")
    .max(500, "Capacity cannot exceed 500"),
});

type ClassroomFormValues = z.infer<typeof classroomSchema>;

const AddClassroomPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ClassroomFormValues>({
    resolver: zodResolver(classroomSchema),
    defaultValues: {
      name: "",
      room: "",
      capacity: 30,
    },
  });

  const addClassroomMutation = useMutation({
    mutationFn: async (values: ClassroomFormValues) => {
      const { data, error } = await supabase.from("classes").insert({
        name: values.name,
        room: values.room,
        capacity: values.capacity,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Classroom added",
        description: "The classroom has been successfully added.",
      });
      navigate("/classrooms");
    },
    onError: (error: any) => {
      console.error("Error adding classroom:", error);
      let errorMessage = error.message || "Failed to add classroom. Please try again.";
      
      if (error.code === "23505") {
        errorMessage = "A classroom with this name or room number already exists.";
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (values: ClassroomFormValues) => {
    setIsSubmitting(true);
    setError(null);
    addClassroomMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Classroom"
        description="Create a new classroom in the system"
        icon={Building}
      >
        <Button variant="outline" onClick={() => navigate("/classrooms")}>
          Cancel
        </Button>
      </PageHeader>

      {error && (
        <Alert variant="destructive" className="max-w-4xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Classroom Information</CardTitle>
          <CardDescription>
            Enter the details of the new classroom
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classroom Name<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Computer Lab" {...field} />
                      </FormControl>
                      <FormDescription>
                        Descriptive name for the classroom
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
                      <FormLabel>Room Number<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. B101" {...field} />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for the room
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={500}
                          placeholder="30"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            field.onChange(
                              isNaN(value) ? 30 : Math.max(1, Math.min(500, value))
                            );
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of students (1-500)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <CardFooter className="flex justify-end space-x-4 px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/classrooms")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Classroom"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddClassroomPage;
