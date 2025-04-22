
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/ui/page-header";
import { IdCard, Download, Printer, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const StudentIDCardPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [teacherData, setTeacherData] = useState<any>(null);
  const idCardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !studentId) return;
        
        // Get teacher profile
        const { data: teacherProfile, error: teacherError } = await extendedSupabase
          .from('teachers')
          .select(`
            *,
            users:user_id(
              full_name
            )
          `)
          .eq('user_id', user.id)
          .single();
          
        if (teacherError) throw teacherError;
        
        setTeacherData(teacherProfile);
        
        // Get student data
        const { data: student, error: studentError } = await extendedSupabase
          .from('students')
          .select(`
            *,
            users:user_id(
              full_name,
              email
            )
          `)
          .eq('id', studentId)
          .single();
          
        if (studentError) throw studentError;
        
        setStudentData(student);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch student data",
          variant: "destructive",
        });
        navigate("/teacher/students");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, studentId, toast, navigate]);
  
  const printIDCard = async () => {
    if (!idCardRef.current) return;
    
    try {
      setPrinting(true);
      
      // Use html2canvas to capture the ID card as an image
      const canvas = await html2canvas(idCardRef.current, {
        scale: 2, // Increase quality
        useCORS: true,
        allowTaint: true,
      });
      
      // Open print dialog
      const dataUrl = canvas.toDataURL("image/png");
      const windowContent = `
        <html>
          <head>
            <style>
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
              img {
                max-width: 100%;
                max-height: 100%;
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" />
          </body>
        </html>
      `;
      
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast({
          title: "Error",
          description: "Please allow pop-ups to print the ID card",
          variant: "destructive",
        });
        return;
      }
      
      printWindow.document.write(windowContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Wait for the image to load before printing
      printWindow.onload = function() {
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      console.error("Error printing ID card:", error);
      toast({
        title: "Error",
        description: "Failed to print ID card",
        variant: "destructive",
      });
    } finally {
      setPrinting(false);
    }
  };
  
  const downloadAsPDF = async () => {
    if (!idCardRef.current) return;
    
    try {
      setPrinting(true);
      
      // Use html2canvas to capture the ID card as an image
      const canvas = await html2canvas(idCardRef.current, {
        scale: 2, // Increase quality
        useCORS: true,
        allowTaint: true,
      });
      
      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [86, 54] // Standard ID card size
      });
      
      // Add image to PDF (centered and with proper dimensions)
      const imgWidth = 80;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 3, 2, imgWidth, imgHeight);
      
      // Download PDF
      pdf.save(`${studentData?.users?.full_name || 'Student'}_ID_Card.pdf`);
      
      toast({
        title: "Success",
        description: "ID card downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading ID card:", error);
      toast({
        title: "Error",
        description: "Failed to download ID card",
        variant: "destructive",
      });
    } finally {
      setPrinting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
      </div>
    );
  }
  
  if (!studentData) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Student not found</h3>
        <Button className="mt-4" onClick={() => navigate("/teacher/students")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <PageHeader
        title="Student ID Card"
        description="Generate and print student ID card"
        icon={IdCard}
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/teacher/students")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" onClick={printIDCard} disabled={printing}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={downloadAsPDF} disabled={printing}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </PageHeader>
      
      <div className="flex justify-center mt-8">
        <div className="w-full max-w-md">
          <Card className="border-2 border-gray-300">
            <CardContent className="p-0">
              <div 
                ref={idCardRef}
                className="bg-white rounded-lg overflow-hidden"
                style={{ width: '100%', aspectRatio: '1.586' }}
              >
                {/* ID Card Header */}
                <div className="bg-institute-600 text-white p-3 text-center">
                  <h2 className="text-lg font-semibold">INSTITUTE MANAGEMENT SYSTEM</h2>
                  <p className="text-xs">Student Identification Card</p>
                </div>
                
                {/* ID Card Body */}
                <div className="p-3 flex">
                  {/* Left Side - Photo */}
                  <div className="w-1/3 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center border-2 border-institute-500">
                      {studentData?.users?.full_name?.charAt(0) || 'S'}
                    </div>
                    <div className="text-center mt-1">
                      <p className="text-xs font-semibold text-institute-700">
                        {studentData?.enrollment_number}
                      </p>
                    </div>
                  </div>
                  
                  {/* Right Side - Student Info */}
                  <div className="w-2/3 pl-3">
                    <h3 className="font-semibold text-sm">
                      {studentData?.users?.full_name}
                    </h3>
                    <div className="mt-1 space-y-1">
                      <p className="text-xs">
                        <span className="font-semibold">DoB:</span> {studentData?.date_of_birth ? format(new Date(studentData.date_of_birth), 'dd/MM/yyyy') : 'N/A'}
                      </p>
                      <p className="text-xs">
                        <span className="font-semibold">Email:</span> {studentData?.users?.email}
                      </p>
                      <p className="text-xs">
                        <span className="font-semibold">Contact:</span> {studentData?.contact_number || 'N/A'}
                      </p>
                      <p className="text-xs">
                        <span className="font-semibold">Issue Date:</span> {format(new Date(), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* ID Card Footer */}
                <div className="border-t border-gray-300 flex items-center justify-between px-3 py-2">
                  <div className="text-xs">
                    <p className="font-semibold text-institute-700">Authorized By:</p>
                    <p>{teacherData?.users?.full_name}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-semibold text-institute-700">Valid Until:</p>
                    <p>{format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), 'dd/MM/yyyy')}</p>
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

export default StudentIDCardPage;
