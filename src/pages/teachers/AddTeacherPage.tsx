
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  FormDescription,
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
import { Calendar as CalendarIcon, ArrowLeft, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { teacherSchema, TeacherFormValues } from "@/lib/validation-rules";

const AddTeacherPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      department: "",
      specialization: "",
      qualification: "",
      contactNumber: "",
      joiningDate: new Date(),
    },
    mode: "onChange",
  });

  const onSubmit = async (data: TeacherFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Check if email already exists
      const { data: existingUser, error: emailCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.email)
        .maybeSingle();
      
      if (emailCheckError) {
        throw emailCheckError;
      }
      
      if (existingUser) {
        setError("Email already in use. Please use a different email.");
        setIsSubmitting(false);
        return;
      }
      
      // Step 1: Create the user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          email: data.email,
          full_name: data.fullName,
          role: 'teacher',
          is_first_login: true,
          // Use provided password instead of default
          password_hash: data.password
        })
        .select('id')
        .single();

      if (userError) {
        throw userError;
      }

      // Generate an employee ID
      const employeeId = 'T' + Date.now().toString().slice(-8);

      // Step 2: Create the teacher profile
      const { error: teacherError } = await supabase
        .from('teachers')
        .insert({
          user_id: userData.id,
          employee_id: employeeId,
          department: data.department,
          specialization: data.specialization,
          qualification: data.qualification,
          contact_number: data.contactNumber,
          joining_date: format(data.joiningDate, "yyyy-MM-dd")
        });

      if (teacherError) {
        throw teacherError;
      }

      toast({
        title: "Teacher Added",
        description: "The teacher has been added successfully.",
      });

      navigate("/teachers");
    } catch (error: any) {
      console.error("Error adding teacher:", error);
      setError(error.message || "Failed to add teacher");
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

      {error && (
        <Alert variant="destructive" className="mb-6 max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Teacher Information</CardTitle>
          <CardDescription>
            Enter the teacher's professional and contact details. The password set here will be used for portal access.
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
                      <FormLabel>Full Name<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. Jane Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Enter full name with title if applicable.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email<span className="text-destructive">*</span></FormLabel>
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-10 w-10"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        This password will be used for portal access. Teacher will be prompted to change it on first login.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department<span className="text-destructive">*</span></FormLabel>
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
                      <FormLabel>Specialization<span className="text-destructive">*</span></FormLabel>
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
                      <FormLabel>Qualification<span className="text-destructive">*</span></FormLabel>
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
                      <FormLabel>Contact Number<span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="9876543210"
                          maxLength={10}
                          {...field}
                          onChange={(e) => {
                            // Only allow digits
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription>
                        Enter a 10-digit phone number without spaces or special characters.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="joiningDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Joining Date<span className="text-destructive">*</span></FormLabel>
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
                            captionLayout="dropdown-buttons"
                            fromYear={1960}
                            toYear={new Date().getFullYear()}
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
