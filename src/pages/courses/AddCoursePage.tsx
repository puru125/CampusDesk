
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { BookPlus, Save, AlertCircle } from "lucide-react";

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
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PageHeader from "@/components/ui/page-header";
import { courseSchema, CourseFormValues } from "@/lib/validation-rules";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AddCoursePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: "",
      code: "",
      credits: 3,
      description: "",
      departmentId: "none",
      duration: "",
    },
  });

  const addCourseMutation = useMutation({
    mutationFn: async (values: CourseFormValues) => {
      // Ensure departmentId is either a valid UUID or null, never an empty string or numeric string
      const departmentId = values.departmentId && values.departmentId !== "none" ? values.departmentId : null;
      
      console.log("Submitting with departmentId:", departmentId);
      
      // Validate UUID format if not null
      if (departmentId !== null) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(departmentId)) {
          throw new Error("Invalid department ID format. Please select a valid department.");
        }
      }
      
      const { data, error } = await supabase.from("courses").insert({
        name: values.name,
        code: values.code,
        credits: values.credits,
        description: values.description,
        department_id: departmentId,
        is_active: true,
        duration: values.duration,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Course added",
        description: "The course has been successfully added.",
      });
      navigate("/courses");
    },
    onError: (error: any) => {
      console.error("Error adding course:", error);
      let errorMessage = error.message || "Failed to add course. Please try again.";
      
      // Provide a more helpful error message for UUID format issues
      if (error.code === "22P02" && error.message.includes("uuid")) {
        errorMessage = "Invalid department ID format. Please select a valid department or 'None'.";
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

  const onSubmit = (values: CourseFormValues) => {
    setIsSubmitting(true);
    setError(null);
    addCourseMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Course"
        description="Create a new course in the system"
        icon={BookPlus}
      >
        <Button variant="outline" onClick={() => navigate("/courses")}>
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
          <CardTitle>Course Information</CardTitle>
          <CardDescription>
            Enter the details of the new course
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
                      <FormLabel>Course Name<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Computer Science" {...field} />
                      </FormControl>
                      <FormDescription>
                        Full name of the course
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. CS101" {...field} />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for the course
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credits<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          placeholder="3"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            field.onChange(
                              isNaN(value) ? "" : Math.max(1, Math.min(10, value))
                            );
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of credits for this course (1-10)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {/* Using valid UUIDs for department IDs */}
                          <SelectItem value="da9e2e7c-cdb3-4c9f-a247-a3a0becdedff">Computer Science</SelectItem>
                          <SelectItem value="05de01aa-9fd6-4858-998c-5f7f76ac5020">Engineering</SelectItem>
                          <SelectItem value="b1d9a5ca-6131-4e8e-83a4-4aba97a9c3d0">Mathematics</SelectItem>
                          <SelectItem value="ef9c6c06-6c21-498e-9b20-48dddbfcf9c3">Physics</SelectItem>
                          <SelectItem value="ff6b412f-6e01-4b23-9cae-1edae3e7fe14">Chemistry</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Department offering this course
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 4 years" {...field} />
                      </FormControl>
                      <FormDescription>
                        Duration of the course
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
                        placeholder="Enter course description..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed description of the course content and objectives
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="flex justify-end space-x-4 px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/courses")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Course"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCoursePage;
