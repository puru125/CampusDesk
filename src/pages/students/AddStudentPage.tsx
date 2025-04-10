
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, ArrowLeft, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const studentSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "Full name must be at least 3 characters" })
    .max(100, { message: "Full name must be less than 100 characters" }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .max(100, { message: "Email must be less than 100 characters" }),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  contactNumber: z
    .string()
    .min(10, { message: "Contact number must be at least 10 digits" })
    .max(15, { message: "Contact number must be less than 15 digits" })
    .optional()
    .or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  guardianName: z.string().max(100).optional().or(z.literal("")),
  guardianContact: z.string().max(15).optional().or(z.literal("")),
});

type StudentFormValues = z.infer<typeof studentSchema>;

const AddStudentPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      fullName: "",
      email: "",
      contactNumber: "",
      address: "",
      guardianName: "",
      guardianContact: "",
    },
  });

  const onSubmit = async (data: StudentFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Instead of using RPC, create a student directly in the database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          email: data.email,
          full_name: data.fullName,
          role: 'student',
          is_first_login: true,
          // Default password will be set by database trigger
          password_hash: 'placeholder_will_be_replaced_by_trigger'
        })
        .select('id')
        .single();

      if (userError) {
        throw userError;
      }

      // Now create the student profile with the user ID
      const { error: studentError } = await supabase
        .from('students')
        .insert({
          user_id: userData.id,
          date_of_birth: format(data.dateOfBirth, "yyyy-MM-dd"),
          contact_number: data.contactNumber || null,
          address: data.address || null,
          guardian_name: data.guardianName || null,
          guardian_contact: data.guardianContact || null,
          enrollment_status: 'pending',
          enrollment_date: format(new Date(), "yyyy-MM-dd")
        });

      if (studentError) {
        throw studentError;
      }

      toast({
        title: "Student Added",
        description: "The student has been added successfully.",
      });

      navigate("/students");
    } catch (error: any) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Add New Student" description="Create a new student record">
        <Button variant="outline" onClick={() => navigate("/students")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
      </PageHeader>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
          <CardDescription>
            Enter the student's personal and contact details. Default credentials will be
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
                        <Input placeholder="John Doe" {...field} />
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
                          placeholder="john.doe@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
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
                  name="guardianName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guardian Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Parent or Guardian name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guardianContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guardian Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="Guardian's contact number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Student's residential address"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/students")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Student
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
};

export default AddStudentPage;
