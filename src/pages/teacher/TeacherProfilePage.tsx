
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, IdCard, KeyRound, Mail } from "lucide-react";

const TeacherProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [formData, setFormData] = useState({
    employee_id: "",
    department: "",
    specialization: "",
    qualifications: "",
    experience_years: "",
    contact_number: "",
    address: "",
    bio: "",
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user) return;
        
        // Get teacher profile
        const { data: teacherProfile, error: teacherError } = await extendedSupabase
          .from('teachers')
          .select(`
            *,
            users:user_id(
              full_name,
              email
            )
          `)
          .eq('user_id', user.id)
          .single();
          
        if (teacherError) throw teacherError;
        
        setTeacherData(teacherProfile);
        
        // Set form data
        setFormData({
          employee_id: teacherProfile.employee_id || "",
          department: teacherProfile.department || "",
          specialization: teacherProfile.specialization || "",
          qualifications: teacherProfile.qualifications || "",
          experience_years: teacherProfile.experience_years?.toString() || "",
          contact_number: teacherProfile.contact_number || "",
          address: teacherProfile.address || "",
          bio: teacherProfile.bio || "",
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const { error } = await extendedSupabase
        .from('teachers')
        .update({
          employee_id: formData.employee_id,
          department: formData.department,
          specialization: formData.specialization,
          qualifications: formData.qualifications,
          experience_years: parseInt(formData.experience_years) || null,
          contact_number: formData.contact_number,
          address: formData.address,
          bio: formData.bio,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      // Refresh teacher data
      const { data: updatedTeacher } = await extendedSupabase
        .from('teachers')
        .select(`
          *,
          users:user_id(
            full_name,
            email
          )
        `)
        .eq('user_id', user?.id)
        .single();
        
      setTeacherData(updatedTeacher);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
        title="Teacher Profile"
        description="View and manage your profile information"
        icon={User}
      >
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link to="/teacher/id-card">
              <IdCard className="mr-2 h-4 w-4" />
              View ID Card
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/reset-password">
              <KeyRound className="mr-2 h-4 w-4" />
              Change Password
            </Link>
          </Button>
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Profile Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
            <CardDescription>Your basic information</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-24 h-24 bg-institute-100 rounded-full flex items-center justify-center text-institute-600 text-2xl font-bold mb-4">
              {teacherData?.users?.full_name?.charAt(0) || "T"}
            </div>
            <h3 className="text-xl font-bold">{teacherData?.users?.full_name}</h3>
            <p className="text-gray-500 flex items-center mt-1">
              <Mail className="h-4 w-4 mr-1" />
              {teacherData?.users?.email}
            </p>
            <div className="mt-4 w-full">
              <div className="bg-gray-100 p-3 rounded-md mb-2">
                <p className="text-xs text-gray-500">Employee ID</p>
                <p className="font-medium">{teacherData?.employee_id || "Not set"}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-md mb-2">
                <p className="text-xs text-gray-500">Department</p>
                <p className="font-medium">{teacherData?.department || "Not set"}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="text-xs text-gray-500">Specialization</p>
                <p className="font-medium">{teacherData?.specialization || "Not set"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Profile Edit Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal">
              <TabsList className="mb-4">
                <TabsTrigger value="personal">Personal Information</TabsTrigger>
                <TabsTrigger value="professional">Professional Details</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit}>
                <TabsContent value="personal">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_number">Contact Number</Label>
                      <Input
                        id="contact_number"
                        name="contact_number"
                        value={formData.contact_number}
                        onChange={handleInputChange}
                        placeholder="Your contact number"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="employee_id">Employee ID</Label>
                      <Input
                        id="employee_id"
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={handleInputChange}
                        placeholder="Your employee ID"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Your address"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Brief bio"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="professional">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        placeholder="Your department"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="specialization">Specialization</Label>
                      <Input
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        placeholder="Your specialization"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="qualifications">Qualifications</Label>
                      <Input
                        id="qualifications"
                        name="qualifications"
                        value={formData.qualifications}
                        onChange={handleInputChange}
                        placeholder="Your qualifications"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="experience_years">Years of Experience</Label>
                      <Input
                        id="experience_years"
                        name="experience_years"
                        type="number"
                        value={formData.experience_years}
                        onChange={handleInputChange}
                        placeholder="Years of experience"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <Separator className="my-4" />
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherProfilePage;
