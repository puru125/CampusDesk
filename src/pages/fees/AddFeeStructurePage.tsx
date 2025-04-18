
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2, SaveIcon, ArrowLeft } from "lucide-react";
import FeeStructureFormFields from "@/components/fees/FeeStructureFormFields";

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
          .insert([feeData]);
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
              <FeeStructureFormFields form={form} courses={courses} />
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
