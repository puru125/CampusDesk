
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import PageHeader from "@/components/ui/page-header";
import { IdCard, Download, Printer, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const TeacherIDCardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        if (!user) return;

        // Fetch teacher data
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
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        toast({
          title: "Error",
          description: "Failed to load teacher data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [user, toast]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real implementation, this would generate a PDF file for download
    toast({
      title: "Download Started",
      description: "Your ID card PDF is being generated for download",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-institute-600"></div>
      </div>
    );
  }

  if (!teacherData) {
    return (
      <div className="p-6">
        <PageHeader
          title="Teacher ID Card"
          description="Generate your ID card"
          icon={IdCard}
        />
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <p className="text-lg text-gray-600 mb-4">Teacher data not found</p>
          <Button onClick={() => navigate('/teacher/profile')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Teacher ID Card"
        description="Generate your ID card"
        icon={IdCard}
      />

      <div className="flex justify-end space-x-4 mb-6">
        <Button
          variant="outline"
          onClick={() => navigate('/teacher/profile')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>
        <Button 
          variant="outline" 
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        <Button 
          onClick={handlePrint}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md print:scale-100">
          {/* ID Card Container */}
          <Card className="w-full overflow-hidden border-2 border-institute-600 print:border-none">
            <div className="bg-institute-600 text-white text-center py-3">
              <h2 className="text-xl font-bold">Institute Name</h2>
              <p className="text-sm">Faculty Identification Card</p>
            </div>

            <CardContent className="p-6">
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0">
                  <Avatar className="h-28 w-28 border-2 border-institute-300">
                    <AvatarFallback className="text-2xl bg-institute-100 text-institute-800">
                      {teacherData.users.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold">{teacherData.users.full_name}</h3>
                  <p className="text-sm uppercase font-semibold text-institute-800 mb-1">Faculty</p>
                  <p className="text-sm font-medium text-gray-700">
                    ID: {teacherData.employee_id || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Dept: {teacherData.department || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Joined: {teacherData.joining_date ? format(new Date(teacherData.joining_date), "MMM dd, yyyy") : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Contact:</div>
                  <div>{teacherData.contact_number || "N/A"}</div>
                  
                  <div className="font-medium">Email:</div>
                  <div className="truncate">{teacherData.users.email}</div>
                  
                  <div className="font-medium">Qualification:</div>
                  <div>{teacherData.qualification || "N/A"}</div>
                  
                  <div className="font-medium">Specialization:</div>
                  <div>{teacherData.specialization || "N/A"}</div>
                </div>
              </div>

              <div className="mt-6 border-t pt-4 text-center">
                <p className="text-xs text-gray-500">This card is the property of the Institute. If found, please return to the Administration Office.</p>
                <div className="mt-4">
                  <div className="border-t border-dashed border-gray-300 pt-2">
                    <p className="text-sm font-medium">Principal's Signature</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherIDCardPage;
