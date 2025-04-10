
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Course } from "@/types";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { courseSchema } from "@/lib/validation-rules";

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseEditFormProps {
  course: Course;
  onSuccess: () => void;
}

const CourseEditForm = ({ course, onSuccess }: CourseEditFormProps) => {
  const [isActive, setIsActive] = useState(course?.is_active);

  // Create form with validation
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: course?.name || "",
      code: course?.code || "",
      description: course?.description || "",
      credits: course?.credits || 0,
      duration: course?.duration || "",
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async (values: CourseFormValues & { is_active: boolean }) => {
      const { data, error } = await supabase
        .from("courses")
        .update({
          name: values.name,
          code: values.code,
          description: values.description,
          credits: values.credits,
          duration: values.duration,
          is_active: values.is_active,
        })
        .eq("id", course.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      onSuccess();
    },
  });

  const onSubmit = (data: CourseFormValues) => {
    updateCourseMutation.mutate({ ...data, is_active: isActive });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Details</CardTitle>
        <CardDescription>Edit basic information about the course</CardDescription>
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
                    <FormLabel>Course Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Bachelor of Computer Science" {...field} />
                    </FormControl>
                    <FormDescription>The full name of the course</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. BCS" {...field} />
                    </FormControl>
                    <FormDescription>A unique code for the course</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credits</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        placeholder="e.g. 120" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))} 
                      />
                    </FormControl>
                    <FormDescription>Total credits for the complete course</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 4 years" {...field} />
                    </FormControl>
                    <FormDescription>Duration of the course</FormDescription>
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
                      placeholder="Describe the course..."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>A brief description of the course</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <Switch
                id="course-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <label
                htmlFor="course-active"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Course Active
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full md:w-auto" 
              disabled={updateCourseMutation.isPending}
            >
              {updateCourseMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CourseEditForm;
