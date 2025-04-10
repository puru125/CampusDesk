
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminProfile } from "@/types";
import PageHeader from "@/components/ui/page-header";

const AdminProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [contactNumber, setContactNumber] = useState<string>("");
  const [designation, setDesignation] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadAdminProfile();
    }
  }, [user]);

  const loadAdminProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("admin_profiles")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setAdminProfile(data);
        setContactNumber(data.contact_number || "");
        setDesignation(data.designation || "");
        setDepartment(data.department || "");
      }
    } catch (error) {
      console.error("Error loading admin profile:", error);
      toast({
        title: "Error",
        description: "Failed to load admin profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      setSaving(true);
      
      const profileData = {
        id: user.id,
        contact_number: contactNumber,
        designation: designation,
        department: department,
      };
      
      let query;
      
      if (adminProfile) {
        // Update existing profile
        query = supabase
          .from("admin_profiles")
          .update({
            contact_number: contactNumber,
            designation: designation,
            department: department,
          })
          .eq("id", user.id);
      } else {
        // Create new profile
        query = supabase
          .from("admin_profiles")
          .insert(profileData);
      }
      
      const { error } = await query;
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      loadAdminProfile();
    } catch (error) {
      console.error("Error updating admin profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Admin Profile"
        description="View and update your profile information"
      />
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input id="name" value={user?.full_name || ""} disabled />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input id="email" value={user?.email || ""} disabled />
                </div>

                <div className="space-y-2">
                  <label htmlFor="designation" className="text-sm font-medium">
                    Designation
                  </label>
                  <Input
                    id="designation"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    disabled={loading || saving}
                    placeholder="Enter your designation"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="department" className="text-sm font-medium">
                    Department
                  </label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={loading || saving}
                    placeholder="Enter your department"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="contact" className="text-sm font-medium">
                    Contact Number
                  </label>
                  <Input
                    id="contact"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    disabled={loading || saving}
                    placeholder="Enter your contact number"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleSave}
                disabled={loading || saving}
                className="w-full md:w-auto"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfilePage;
