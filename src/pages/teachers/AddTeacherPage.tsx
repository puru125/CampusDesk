
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/ui/page-header";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ArrowLeft, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const teacherSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters" })
    .max(100, { message: "Full name must be less than 100 characters" }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .max(100, { message: "Email must be less than 100 characters" }),
  department: z
    .string()
    .min(2, { message: "Department must be at least 2 characters" })
    .max(100, { message: "Department must be less than 100 characters" }),
  specialization: z
    .string()
    .min(2, { message: "Specialization must be at least 2 characters" })
    .max(100, { message: "Specialization must be less than 100 characters" }),
  qualification: z
    .string()
    .min(2, { message: "Qualification must be at least 2 characters" })
    .max(100, { message: "Qualification must be less than 100 characters" }),
  joiningDate: z.date({
    required_error: "Joining date is required",
  }),
  contactNumber: z
    .string()
    .min(10, { message: "Contact number must be at least 10 digits" })
    .max(15, { message: "Contact number must be less than 15 digits" })
    .optional()
    .or(z.literal("")),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

const AddTeacherPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      fullName: "",
      email: "",
      department: "",
      specialization: "",
      qualification: "",
      contactNumber: "",
      joiningDate: new Date(),
    },
  });

  const onSubmit = async (data: TeacherFormValues) => {
    try {
      setIsSubmitting(true);
      
      const { data: result, error } = await supabase.rpc("add_teacher", {
        p_email: data.email,
        p_full_name: data.fullName,
        p_department: data.department,
        p_specialization: data.specialization,
        p_qualification: data.qualification,
        p_contact_number: data.contactNumber || null,
        p_joining_date: format(data.joiningDate, "yyyy-MM-dd"),
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Teacher Added",
        description: "The teacher has been added successfully.",
      });

      navigate("/teachers");
    } catch (error: any) {
      console.error("Error adding teacher:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add teacher",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Add New Teacher" description="Create a new teacher record">
        <Button variant="outline" onClick={() => navigate("/teachers")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teachers
        </Button>
      </PageHeader>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Teacher Information</CardTitle>
          <CardDescription>
            Enter the teacher's professional and contact details. Default credentials will be
            generated automatically.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Jane Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="jane.smith@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="Computer Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <FormControl>
                        <Input placeholder="Machine Learning" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input placeholder="Ph.D. in Computer Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="joiningDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Joining Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/teachers")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Teacher
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
};

export default AddTeacherPage;
