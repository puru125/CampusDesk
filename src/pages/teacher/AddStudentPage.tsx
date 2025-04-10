
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Loader2, CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const studentSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  address: z.string().optional(),
  guardianName: z.string().min(3, "Guardian name must be at least 3 characters"),
  guardianContact: z.string().min(10, "Guardian contact must be at least 10 digits"),
});

type StudentFormValues = z.infer<typeof studentSchema>;

const AddStudentPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
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
      setSubmitting(true);
      
      if (!user) return;
      
      // Get teacher profile
      const { data: teacherProfile, error: teacherError } = await extendedSupabase
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (teacherError) throw teacherError;
      
      // Call Supabase function to add student
      const { data: newUser, error: userError } = await extendedSupabase
        .rpc('add_student', {
          p_email: data.email,
          p_full_name: data.fullName,
          p_date_of_birth: format(data.dateOfBirth, 'yyyy-MM-dd'),
          p_contact_number: data.contactNumber,
          p_address: data.address || null,
          p_guardian_name: data.guardianName,
          p_guardian_contact: data.guardianContact
        });
        
      if (userError) throw userError;
      
      // Get the newly created student
      const { data: studentData, error: studentError } = await extendedSupabase
        .from('students')
        .select('id')
        .eq('user_id', newUser)
        .single();
        
      if (studentError) throw studentError;
      
      // Link student to teacher
      const { error: linkError } = await extendedSupabase
        .from('teacher_students')
        .insert({
          teacher_id: teacherProfile.id,
          student_id: studentData.id
        });
        
      if (linkError) throw linkError;
      
      toast({
        title: "Student Added",
        description: "The student has been successfully added and linked to your profile.",
      });
      
      navigate("/teacher/students");
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Add New Student"
        description="Register a new student and link them to your profile"
        icon={UserPlus}
      />
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Student Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                {...form.register("fullName")}
              />
              {form.formState.errors.fullName && (
                <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.getValues("dateOfBirth") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.getValues("dateOfBirth") ? (
                      format(form.getValues("dateOfBirth"), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.getValues("dateOfBirth")}
                    onSelect={(date) => form.setValue("dateOfBirth", date as Date)}
                    initialFocus
                    captionLayout="dropdown-buttons"
                    fromYear={1990}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.dateOfBirth && (
                <p className="text-sm text-red-500">{form.formState.errors.dateOfBirth.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                placeholder="9876543210"
                {...form.register("contactNumber")}
              />
              {form.formState.errors.contactNumber && (
                <p className="text-sm text-red-500">{form.formState.errors.contactNumber.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                placeholder="123 Main St, City"
                {...form.register("address")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input
                id="guardianName"
                placeholder="Parent/Guardian Name"
                {...form.register("guardianName")}
              />
              {form.formState.errors.guardianName && (
                <p className="text-sm text-red-500">{form.formState.errors.guardianName.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="guardianContact">Guardian Contact</Label>
              <Input
                id="guardianContact"
                placeholder="Guardian's Contact Number"
                {...form.register("guardianContact")}
              />
              {form.formState.errors.guardianContact && (
                <p className="text-sm text-red-500">{form.formState.errors.guardianContact.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="button" variant="outline" className="mr-2" onClick={() => navigate("/teacher/students")}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Student...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Student
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default AddStudentPage;
