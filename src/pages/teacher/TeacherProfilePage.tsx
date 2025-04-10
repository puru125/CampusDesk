
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Calendar, Phone, BookOpen, Building, Loader2, IdCard } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

const profileSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  department: z.string().min(2, "Department is required"),
  specialization: z.string().min(2, "Specialization is required"),
  qualification: z.string().min(2, "Qualification is required"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  joiningDate: z.date(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const TeacherProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacherData, setTeacherData] = useState<any>(null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
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

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      try {
        if (!user) return;
        
        const { data, error } = await supabase
          .from('teachers')
          .select(`
            *,
            users:user_id (
              email,
              full_name
            )
          `)
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        setTeacherData(data);
        
        // Update form with fetched data
        form.reset({
          fullName: data.users.full_name,
          email: data.users.email,
          department: data.department || "",
          specialization: data.specialization || "",
          qualification: data.qualification || "",
          contactNumber: data.contact_number || "",
          joiningDate: data.joining_date ? new Date(data.joining_date) : new Date(),
        });
      } catch (error) {
        console.error("Error fetching teacher profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeacherProfile();
  }, [user, toast, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setSaving(true);
      
      if (!user || !teacherData) return;
      
      // Update teacher profile
      const { error } = await supabase
        .from('teachers')
        .update({
          department: data.department,
          specialization: data.specialization,
          qualification: data.qualification,
          contact_number: data.contactNumber,
          joining_date: format(data.joiningDate, 'yyyy-MM-dd'),
        })
        .eq('id', teacherData.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const generateTeacherIDCard = () => {
    // In a real implementation, this would generate a PDF or open a printable view
    toast({
      title: "ID Card Generator",
      description: "Your ID card is being generated...",
    });
    
    // For now, redirect to a demo page that would show the ID card
    navigate("/teacher/id-card");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Personal Details"
        description="View and update your profile information"
        icon={User}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-3">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and professional information
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Dr. Jane Smith"
                    {...form.register("fullName")}
                    disabled
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
                    placeholder="jane.smith@example.com"
                    {...form.register("email")}
                    disabled
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="Computer Science"
                    {...form.register("department")}
                  />
                  {form.formState.errors.department && (
                    <p className="text-sm text-red-500">{form.formState.errors.department.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    placeholder="Machine Learning"
                    {...form.register("specialization")}
                  />
                  {form.formState.errors.specialization && (
                    <p className="text-sm text-red-500">{form.formState.errors.specialization.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    placeholder="Ph.D. in Computer Science"
                    {...form.register("qualification")}
                  />
                  {form.formState.errors.qualification && (
                    <p className="text-sm text-red-500">{form.formState.errors.qualification.message}</p>
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
                  <Label>Joining Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.getValues("joiningDate") && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {form.getValues("joiningDate") ? (
                          format(form.getValues("joiningDate"), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    {/* Calendar control would go here */}
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <Input value={teacherData?.employee_id || "Not assigned"} disabled />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ID Card Tools</CardTitle>
              <CardDescription>Generate and print ID cards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate("/teacher/students")}
              >
                <IdCard className="mr-2 h-4 w-4" />
                Generate Student ID Cards
              </Button>
              
              <Button 
                className="w-full" 
                variant="default"
                onClick={generateTeacherIDCard}
              >
                <IdCard className="mr-2 h-4 w-4" />
                Generate My ID Card
              </Button>
              
              <p className="text-sm text-gray-500">
                You can generate ID cards for yourself or for any student from the students list.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfilePage;
