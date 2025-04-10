
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, SaveIcon, ArrowLeft } from "lucide-react";

interface Course {
  id: string;
  name: string;
  code: string;
}

const feeStructureSchema = z.object({
  fee_type: z.string({
    required_error: "Fee type is required",
  }),
  amount: z.coerce.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number",
  }).positive("Amount must be positive"),
  academic_year: z.string({
    required_error: "Academic year is required",
  }),
  semester: z.string().optional(),
  course_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FeeStructureFormValues = z.infer<typeof feeStructureSchema>;

const AddFeeStructurePage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const form = useForm<FeeStructureFormValues>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: {
      fee_type: "",
      amount: undefined,
      academic_year: "",
      semester: "",
      course_id: "",
      is_active: true,
    },
  });

  useEffect(() => {
    fetchCourses();
    if (isEditing) {
      fetchFeeStructure();
    }
  }, [isEditing, id]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code')
        .order('name');

      if (error) throw error;
      
      if (data) {
        setCourses(data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Could not fetch courses",
        variant: "destructive",
      });
    }
  };

  const fetchFeeStructure = async () => {
    try {
      setInitialLoading(true);
      
      const { data, error } = await supabase
        .from('fee_structures')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        form.reset({
          fee_type: data.fee_type,
          amount: data.amount,
          academic_year: data.academic_year,
          semester: data.semester?.toString() || "",
          course_id: data.course_id || "",
          is_active: data.is_active,
        });
      }
    } catch (error) {
      console.error("Error fetching fee structure:", error);
      toast({
        title: "Error",
        description: "Could not fetch fee structure details",
        variant: "destructive",
      });
      navigate("/fees");
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (values: FeeStructureFormValues) => {
    setLoading(true);
    try {
      const feeData = {
        fee_type: values.fee_type,
        amount: values.amount,
        academic_year: values.academic_year,
        semester: values.semester ? parseInt(values.semester) : null,
        course_id: values.course_id || null,
        is_active: values.is_active,
      };

      let result;
      
      if (isEditing) {
        result = await supabase
          .from('fee_structures')
          .update(feeData)
          .eq('id', id);
      } else {
        result = await supabase
          .from('fee_structures')
          .insert(feeData);
      }

      if (result.error) throw result.error;
      
      toast({
        title: "Success",
        description: isEditing 
          ? "Fee structure updated successfully" 
          : "Fee structure created successfully",
      });
      
      navigate("/fees");
    } catch (error) {
      console.error("Error saving fee structure:", error);
      toast({
        title: "Error",
        description: "Failed to save fee structure",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-institute-500" />
      </div>
    );
  }

  const academicYears = ["2023-2024", "2024-2025", "2025-2026"];
  const feeTypes = ["Tuition", "Examination", "Library", "Laboratory", "Miscellaneous"];
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];

  return (
    <>
      <PageHeader 
        title={isEditing ? "Edit Fee Structure" : "Create New Fee Structure"} 
        description={isEditing 
          ? "Update the fee structure details" 
          : "Define a new fee structure for students"
        }
      >
        <Button variant="outline" onClick={() => navigate("/fees")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Fees
        </Button>
      </PageHeader>

      <div className="mx-auto max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white p-6 rounded-md shadow">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="fee_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fee type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {feeTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Type of fee to be collected
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Fee amount in Indian Rupees
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="academic_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Academic Year</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select academic year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {academicYears.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Academic year this fee applies to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semester (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="All semesters" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem key="all-semesters" value="all">All Semesters</SelectItem>
                            {semesters.map((semester) => (
                              <SelectItem key={semester} value={semester}>
                                Semester {semester}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Leave blank to apply to all semesters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="course_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="All courses" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem key="all-courses" value="all">All Courses</SelectItem>
                            {courses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                {course.name} ({course.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Leave blank to apply to all courses
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Only active fee structures will be applied to students
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/fees")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <SaveIcon className="mr-2 h-4 w-4" />
                {isEditing ? "Update" : "Create"} Fee Structure
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default AddFeeStructurePage;
