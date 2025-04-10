
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Building, Save, AlertCircle, Loader2 } from "lucide-react";
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

const EditClassroomPage = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
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

  // Fetch classroom data
  const { data: classroom, isLoading } = useQuery({
    queryKey: ["classroom", classroomId],
    queryFn: async () => {
      if (!classroomId) throw new Error("Classroom ID is required");

      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("id", classroomId)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        form.reset({
          name: data.name,
          room: data.room,
          capacity: data.capacity,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to load classroom data",
        variant: "destructive",
      });
      navigate("/classrooms");
    },
  });

  const updateClassroomMutation = useMutation({
    mutationFn: async (values: ClassroomFormValues) => {
      if (!classroomId) throw new Error("Classroom ID is required");

      const { data, error } = await supabase
        .from("classes")
        .update({
          name: values.name,
          room: values.room,
          capacity: values.capacity,
        })
        .eq("id", classroomId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Classroom updated",
        description: "The classroom has been successfully updated.",
      });
      navigate("/classrooms");
    },
    onError: (error: any) => {
      console.error("Error updating classroom:", error);
      let errorMessage = error.message || "Failed to update classroom. Please try again.";
      
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
    updateClassroomMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Classroom"
        description="Update classroom information"
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
            Update the details of the classroom
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
                  {isSubmitting ? "Saving..." : "Update Classroom"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditClassroomPage;
