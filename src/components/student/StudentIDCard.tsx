
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Printer } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface StudentIDCardProps {
  studentData: any;
}

const StudentIDCard = ({ studentData }: StudentIDCardProps) => {
  const { user } = useAuth();
  const [adminName, setAdminName] = useState("Institute Administration");
  const [feeStatus, setFeeStatus] = useState<string>("pending");
  const idCardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Fetch admin name from database
    const fetchAdminName = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('role', 'admin')
          .limit(1)
          .single();
          
        if (!error && data) {
          setAdminName(data.full_name);
        }
      } catch (error) {
        console.error("Error fetching admin info:", error);
      }
    };
    
    // Fetch student fee status
    const fetchFeeStatus = async () => {
      if (!studentData?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('students')
          .select('fee_status')
          .eq('id', studentData.id)
          .single();
          
        if (!error && data) {
          setFeeStatus(data.fee_status);
        }
      } catch (error) {
        console.error("Error fetching fee status:", error);
      }
    };
    
    fetchAdminName();
    fetchFeeStatus();
  }, [studentData]);
  
  const printIDCard = async () => {
    if (!idCardRef.current) return;
    
    try {
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
        console.error("Please allow pop-ups to print the ID card");
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
    }
  };
  
  const downloadAsPDF = async () => {
    if (!idCardRef.current) return;
    
    try {
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
      pdf.save(`${studentData?.full_name || 'Student'}_ID_Card.pdf`);
    } catch (error) {
      console.error("Error downloading ID card:", error);
    }
  };
  
  if (!studentData) {
    return <div className="text-center p-4">Student data is loading...</div>;
  }
  
  // Only show ID card if fees are paid (status is "paid" or "partial")
  if (feeStatus !== "paid" && feeStatus !== "partial") {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">ID Card Not Available</h3>
        <p className="text-yellow-700">Your ID card will be available after your fee payment has been approved.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.href = "/fees/make-payment"}
        >
          Make Fee Payment
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Student ID Card</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={printIDCard}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button size="sm" onClick={downloadAsPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
      
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
                  {studentData?.full_name?.charAt(0) || 'S'}
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
                  {studentData?.full_name}
                </h3>
                <div className="mt-1 space-y-1">
                  <p className="text-xs">
                    <span className="font-semibold">DoB:</span> {studentData?.date_of_birth ? format(new Date(studentData.date_of_birth), 'dd/MM/yyyy') : 'N/A'}
                  </p>
                  <p className="text-xs">
                    <span className="font-semibold">Email:</span> {studentData?.email}
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
                <p>{adminName}</p>
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
  );
};

export default StudentIDCard;
