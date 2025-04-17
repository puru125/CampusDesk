
import { useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { BarChart as BarChartIcon } from "lucide-react";
import { useTeacherReportData } from "@/hooks/reports/useTeacherReportData";
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
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Define a no-op function for onDownload since we've removed PDF functionality
  const handleDownload = () => {
    toast({
      title: "PDF export is disabled",
      description: "This feature is currently unavailable.",
    });
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
          />
        </TabsContent>
        
        <TabsContent value="performance" className="mt-6">
          <PerformanceTab
            data={assignmentData}
            isLoading={assignmentsLoading}
          />
        </TabsContent>
        
        <TabsContent value="grades" className="mt-6">
          <GradesTab
            data={selectedStudent && selectedStudent !== "all" 
              ? studentPerformance.grades || [] 
              : getOverallGradeDistribution()}
            isLoading={assignmentsLoading}
          />
        </TabsContent>
        
        {isStudentSelected && (
          <TabsContent value="student" className="mt-6">
            <StudentOverview
              performance={studentPerformance}
              isLoading={studentDataLoading}
              onDownload={handleDownload}
            />
          </TabsContent>
        )}
      </ReportTabs>
    </div>
  );
};

export default TeacherReportsPage;
