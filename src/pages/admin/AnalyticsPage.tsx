
import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { BarChart as BarChartIcon } from "lucide-react";
import { useTeacherReportData } from "@/hooks/reports/useTeacherReportData";
import { generateReportPDF } from "@/components/reports/ReportPDFGenerator";
import ReportSelectors from "@/components/reports/ReportSelectors";
import ReportTabs, { getDefaultReportTabs } from "@/components/reports/ReportTabs";
import AttendanceTab from "@/components/reports/AttendanceTab";
import PerformanceTab from "@/components/reports/PerformanceTab";
import FinancialReportTab from "@/components/reports/FinancialReportTab";
import ReportFilter, { ReportFilters } from "@/components/reports/ReportFilter";

const AnalyticsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const chartRef = useRef<HTMLDivElement>(null);
  const [selectedFilters, setSelectedFilters] = useState<ReportFilters>({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("financial");
  
  const {
    // Selections
    selectedCourse,
    setSelectedCourse,
    selectedStudent,
    setSelectedStudent,
    
    // Data
    teacherData,
    courses,
    students,
    attendanceData,
    assignmentData,
    
    // Loading states
    coursesLoading,
    studentsLoading,
    attendanceLoading,
    assignmentsLoading,
  } = useTeacherReportData();
  
  useEffect(() => {
    // Log data for debugging
    console.log("Admin Analytics Data:", {
      courses,
      students,
      attendanceData,
      assignmentData,
      selectedCourse,
      selectedStudent
    });
  }, [courses, students, attendanceData, assignmentData, selectedCourse, selectedStudent]);
  
  // Handle downloading the report as PDF
  const handleDownloadReport = (reportType: string) => {
    if (!chartRef.current) return;
    
    try {
      setIsLoading(true);
      // Find course and student info if selected
      const courseInfo = selectedCourse && selectedCourse !== "all" 
        ? courses.find(c => c.id === selectedCourse) 
        : null;
        
      const studentInfo = selectedStudent && selectedStudent !== "all" 
        ? students.find(s => s.id === selectedStudent) 
        : null;
      
      // Generate different reports based on report type
      let doc;
      if (reportType === 'financial') {
        doc = generateReportPDF(
          reportType,
          { name: user?.full_name || 'N/A', employeeId: teacherData?.employee_id || 'N/A' },
          courseInfo,
          studentInfo,
          undefined,
          undefined,
          undefined,
          { year: selectedFilters.year, session: selectedFilters.session }
        );
      } else {
        doc = generateReportPDF(
          reportType,
          { name: user?.full_name || 'N/A', employeeId: teacherData?.employee_id || 'N/A' },
          courseInfo,
          studentInfo,
          attendanceData,
          assignmentData
        );
      }
      
      // Save the PDF
      const fileName = `admin_${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Report Downloaded",
        description: `${reportType} report has been downloaded successfully.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the report PDF.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFilterChange = (filters: ReportFilters) => {
    console.log("Applied filters:", filters);
    setSelectedFilters(filters);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Define tabs with admin set to true to show financial reports
  const reportTabs = getDefaultReportTabs(true);
  
  return (
    <div>
      <PageHeader
        title="Analytics & Reports"
        description="Track institution performance and generate reports"
        icon={BarChartIcon}
      >
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
      </PageHeader>
      
      <ReportFilter onFilterChange={handleFilterChange} />
      
      <ReportSelectors
        courses={courses}
        students={students}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        selectedStudent={selectedStudent}
        setSelectedStudent={setSelectedStudent}
        coursesLoading={coursesLoading}
        studentsLoading={studentsLoading}
      />
      
      <ReportTabs 
        tabs={reportTabs}
        defaultValue={activeTab}
        onValueChange={handleTabChange}
      >
        <TabsContent value="attendance" className="mt-6">
          <AttendanceTab
            data={attendanceData}
            isLoading={attendanceLoading || isLoading}
            onDownload={() => handleDownloadReport('attendance')}
          />
        </TabsContent>
        
        <TabsContent value="performance" className="mt-6">
          <PerformanceTab
            data={assignmentData}
            isLoading={assignmentsLoading || isLoading}
            onDownload={() => handleDownloadReport('performance')}
          />
        </TabsContent>
        
        <TabsContent value="financial" className="mt-6">
          <FinancialReportTab
            isLoading={isLoading}
            onDownload={() => handleDownloadReport('financial')}
            selectedYear={selectedFilters.year}
            selectedSession={selectedFilters.session}
          />
        </TabsContent>
      </ReportTabs>
    </div>
  );
};

export default AnalyticsPage;
