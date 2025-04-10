
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

import PageHeader from "@/components/ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, User, UserRound, School, IdCard, AlertCircle } from "lucide-react";
import StudentIDCard from "@/components/student/StudentIDCard";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define form schema for student profile with improved validation
const studentProfileSchema = z.object({
  full_name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  contact_number: z.string()
    .min(10, { message: "Contact number must be exactly 10 digits" })
    .max(10, { message: "Contact number must be exactly 10 digits" })
    .regex(/^\d+$/, { message: "Contact number must contain only digits" })
    .nonempty({ message: "Contact number is required" }),
  date_of_birth: z.date({ required_error: "Date of birth is required" }),
  address: z.string().min(5, { message: "Address is required" }).nonempty({ message: "Address is required" }),
  guardian_name: z.string().min(2, { message: "Guardian name is required" }).nonempty({ message: "Guardian name is required" }),
  guardian_contact: z.string()
    .min(10, { message: "Guardian contact must be exactly 10 digits" })
    .max(10, { message: "Guardian contact must be exactly 10 digits" })
    .regex(/^\d+$/, { message: "Guardian contact must contain only digits" })
    .nonempty({ message: "Guardian contact is required" }),
});

type StudentProfileFormValues = z.infer<typeof studentProfileSchema>;

interface StudentProfile {
  id?: string;
  email?: string;
  full_name?: string;
  enrollment_number?: string;
  contact_number?: string;
  date_of_birth?: string;
  address?: string;
  guardian_name?: string;
  guardian_contact?: string;
  enrollment_status?: string;
  enrollment_date?: string;
  fee_status?: string;
  total_fees_due?: number;
  total_fees_paid?: number;
  user_id?: string;
}

const StudentProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [validationError, setValidationError] = useState<string | null>(null);

  const form = useForm<StudentProfileFormValues>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      full_name: "",
      contact_number: "",
      date_of_birth: undefined,
      address: "",
      guardian_name: "",
      guardian_contact: "",
    },
  });

  useEffect(() => {
    if (user) {
      fetchStudentProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profileData && !isEditing) {
      // Reset form with profile data
      form.reset({
        full_name: profileData.full_name || "",
        contact_number: profileData.contact_number || "",
        date_of_birth: profileData.date_of_birth ? new Date(profileData.date_of_birth) : undefined,
        address: profileData.address || "",
        guardian_name: profileData.guardian_name || "",
        guardian_contact: profileData.guardian_contact || "",
      });
    }
  }, [profileData, isEditing]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('students_view')
        .select('*')
        .eq('user_id', user?.id)
        .single();
        
      if (error) throw error;
      
      // If no fees are set but student exists, set default fee for MCA students
      if (data && (!data.total_fees_due || data.total_fees_due === 0)) {
        // Check if student is in MCA program based on enrollment number
        const isMCAStudent = data.enrollment_number?.startsWith('S') || false;
        
        if (isMCAStudent) {
          const { error: updateError } = await supabase
            .from('students')
            .update({ total_fees_due: 45000 })
            .eq('id', data.id);
            
          if (!updateError) {
            data.total_fees_due = 45000;
            data.fee_status = 'pending';
          }
        }
      }
      
      setProfileData(data);
      
    } catch (error) {
      console.error("Error fetching student profile:", error);
      toast({
        title: "Error",
        description: "Failed to load your profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setValidationError(null);
    if (!isEditing) {
      // Entering edit mode
      form.reset({
        full_name: profileData?.full_name || "",
        contact_number: profileData?.contact_number || "",
        date_of_birth: profileData?.date_of_birth ? new Date(profileData.date_of_birth) : undefined,
        address: profileData?.address || "",
        guardian_name: profileData?.guardian_name || "",
        guardian_contact: profileData?.guardian_contact || "",
      });
    }
  };

  const onSubmit = async (values: StudentProfileFormValues) => {
    if (!user?.id) return;
    
    setIsSaving(true);
    setValidationError(null);
    try {
      const { error } = await supabase.rpc('update_profile', {
        p_user_id: user.id,
        p_profile_data: {
          ...values,
          date_of_birth: values.date_of_birth ? format(values.date_of_birth, 'yyyy-MM-dd') : null,
        }
      });
      
      if (error) throw error;
      
      // Refresh profile data
      await fetchStudentProfile();
      
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Your profile has been updated",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setValidationError("Failed to update profile. Please check all required fields.");
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-institute-500" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Student Profile"
        description="View and manage your profile information"
      >
        <Button 
          variant={isEditing ? "outline" : "default"} 
          onClick={handleEditToggle}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </PageHeader>

      <div className="space-y-6">
        <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full max-w-md mb-6">
            <TabsTrigger value="personal" className="flex-1">
              <UserRound className="w-4 h-4 mr-2" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="academic" className="flex-1">
              <School className="w-4 h-4 mr-2" />
              Academic Info
            </TabsTrigger>
            <TabsTrigger value="id-card" className="flex-1">
              <IdCard className="w-4 h-4 mr-2" />
              ID Card
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {validationError && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{validationError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="full_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                Full Name <span className="text-red-500 ml-1">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="contact_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                Contact Number <span className="text-red-500 ml-1">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="10-digit number" 
                                  {...field} 
                                  maxLength={10}
                                  onChange={(e) => {
                                    // Only allow digits
                                    const value = e.target.value.replace(/\D/g, '');
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                Must be exactly 10 digits with no spaces or special characters
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="date_of_birth"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="flex items-center">
                                Date of Birth <span className="text-red-500 ml-1">*</span>
                              </FormLabel>
                              <DatePicker
                                selected={field.value}
                                onSelect={field.onChange}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                Address <span className="text-red-500 ml-1">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="guardian_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                Guardian Name <span className="text-red-500 ml-1">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Enter guardian's name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="guardian_contact"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                Guardian Contact <span className="text-red-500 ml-1">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="10-digit number" 
                                  {...field} 
                                  maxLength={10}
                                  onChange={(e) => {
                                    // Only allow digits
                                    const value = e.target.value.replace(/\D/g, '');
                                    field.onChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                Must be exactly 10 digits with no spaces or special characters
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                      <p className="text-base">{profileData?.full_name || "Not provided"}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-500">Email</h4>
                      <p className="text-base">{profileData?.email || "Not provided"}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-500">Contact Number</h4>
                      <p className="text-base">{profileData?.contact_number || "Not provided"}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-500">Date of Birth</h4>
                      <p className="text-base">
                        {profileData?.date_of_birth 
                          ? format(new Date(profileData.date_of_birth), 'PPP') 
                          : "Not provided"}
                      </p>
                    </div>
                    
                    <div className="space-y-1 md:col-span-2">
                      <h4 className="text-sm font-medium text-gray-500">Address</h4>
                      <p className="text-base">{profileData?.address || "Not provided"}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-500">Guardian Name</h4>
                      <p className="text-base">{profileData?.guardian_name || "Not provided"}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-gray-500">Guardian Contact</h4>
                      <p className="text-base">{profileData?.guardian_contact || "Not provided"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="academic">
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>
                  Your enrollment and fee details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-500">Enrollment Number</h4>
                    <p className="text-base">{profileData?.enrollment_number || "Not available"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-500">Enrollment Status</h4>
                    <p className="text-base capitalize">
                      {profileData?.enrollment_status || "Not available"}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-500">Enrollment Date</h4>
                    <p className="text-base">
                      {profileData?.enrollment_date 
                        ? format(new Date(profileData.enrollment_date), 'PPP') 
                        : "Not available"}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-500">Fee Status</h4>
                    <p className="text-base capitalize">{profileData?.fee_status || "pending"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-500">Total Fees Due</h4>
                    <p className="text-base">
                      {profileData?.total_fees_due !== undefined
                        ? `₹${profileData.total_fees_due.toLocaleString()}`
                        : "₹45,000"} {/* Default for MCA */}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-500">Total Fees Paid</h4>
                    <p className="text-base">
                      {profileData?.total_fees_paid !== undefined
                        ? `₹${profileData.total_fees_paid.toLocaleString()}`
                        : "₹0"}
                    </p>
                  </div>
                  
                  <div className="space-y-1 md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Remaining Balance</h4>
                    <p className="text-base font-medium">
                      ₹{((profileData?.total_fees_due || 45000) - (profileData?.total_fees_paid || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t flex justify-end">
                <Button 
                  variant="outline" 
                  className="bg-white"
                  onClick={() => window.location.href = "/fees/make-payment"}
                >
                  Make Fee Payment
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="id-card">
            <Card>
              <CardContent className="pt-6">
                <StudentIDCard studentData={profileData} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default StudentProfilePage;
