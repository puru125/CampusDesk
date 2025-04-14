
import { useRef, useState } from "react";
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
import GradesTab from "@/components/reports/GradesTab";
import StudentOverview from "@/components/reports/StudentOverview";

const TeacherReportsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const chartRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState("attendance");
  
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
    studentPerformance,
    
    // Loading states
    coursesLoading,
    studentsLoading,
    attendanceLoading,
    assignmentsLoading,
    studentDataLoading,
    
    // Helper functions
    getOverallGradeDistribution
  } = useTeacherReportData();
  
  // Check if a specific student is selected
  const isStudentSelected = !!selectedStudent && selectedStudent !== "all";
  
  // Handle downloading the report as PDF
  const handleDownloadReport = (reportType: string) => {
    if (!chartRef.current) return;
    
    try {
      // Find course and student info if selected
      const courseInfo = selectedCourse && selectedCourse !== "all" 
        ? courses.find(c => c.id === selectedCourse) 
        : null;
        
      const studentInfo = selectedStudent && selectedStudent !== "all" 
        ? students.find(s => s.id === selectedStudent) 
        : null;
      
      const doc = generateReportPDF(
        reportType,
        { name: user?.full_name || 'N/A', employeeId: teacherData?.employee_id || 'N/A' },
        courseInfo,
        studentInfo,
        attendanceData,
        assignmentData,
        studentPerformance
      );
      
      // Save the PDF
      const fileName = `teacher_${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
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
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Track student performance and generate reports"
        icon={BarChartIcon}
      >
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
      </PageHeader>
      
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
        tabs={getDefaultReportTabs(false, isStudentSelected)}
        defaultValue={activeTab}
        onValueChange={handleTabChange}
      >
        <TabsContent value="attendance" className="mt-6">
          <AttendanceTab
            data={attendanceData}
            isLoading={attendanceLoading}
            onDownload={() => handleDownloadReport('attendance')}
          />
        </TabsContent>
        
        <TabsContent value="performance" className="mt-6">
          <PerformanceTab
            data={assignmentData}
            isLoading={assignmentsLoading}
            onDownload={() => handleDownloadReport('performance')}
          />
        </TabsContent>
        
        <TabsContent value="grades" className="mt-6">
          <GradesTab
            data={selectedStudent && selectedStudent !== "all" 
              ? studentPerformance.grades || [] 
              : getOverallGradeDistribution()}
            isLoading={assignmentsLoading}
            onDownload={() => handleDownloadReport('grades')}
          />
        </TabsContent>
        
        {isStudentSelected && (
          <TabsContent value="student" className="mt-6">
            <StudentOverview
              performance={studentPerformance}
              isLoading={studentDataLoading}
              onDownload={() => handleDownloadReport('student')}
            />
          </TabsContent>
        )}
      </ReportTabs>
    </div>
  );
};

export default TeacherReportsPage;
