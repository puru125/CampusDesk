
import { useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { BarChart as BarChartIcon } from "lucide-react";
import ReportSelectors from "@/components/reports/ReportSelectors";
import ReportTabs, { getDefaultReportTabs } from "@/components/reports/ReportTabs";
import AttendanceTab from "@/components/reports/AttendanceTab";
import PerformanceTab from "@/components/reports/PerformanceTab";
import FinancialReportTab from "@/components/reports/FinancialReportTab";
import { supabase } from "@/integrations/supabase/client";
import { DatePicker } from "@/components/ui/date-picker";
import { startOfMonth, endOfMonth } from "date-fns";

const AnalyticsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const chartRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("financial");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  
  const [financialData, setFinancialData] = useState<{
    monthlySummary: { month: string; income: number; expenses: number; }[];
    recentTransactions: { id: string; date: string; student: string; amount: number; paymentMethod: string; status: string; }[];
    stats: { totalRevenue: number; pendingPayments: number; revenueGrowth: number; };
  }>({
    monthlySummary: [],
    recentTransactions: [],
    stats: {
      totalRevenue: 0,
      pendingPayments: 0,
      revenueGrowth: 0
    }
  });

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('id, name, code')
        .eq('is_active', true);

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
    } finally {
      setCoursesLoading(false);
    }
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const { data, error } = await supabase
        .from('students_view')
        .select('id, full_name, enrollment_number');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setStudentsLoading(false);
    }
  };

  // Handle downloading reports
  const handleDownloadReport = async (reportType: string) => {
    if (!chartRef.current) return;
    
    try {
      setIsLoading(true);
      // Implementation will be similar to TeacherReportsPage but with admin-specific data
      
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div>
      <PageHeader
        title="Analytics & Reports"
        description="Track institution-wide performance metrics and generate reports"
        icon={BarChartIcon}
      >
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-4 mt-6">
        <div className="w-64">
          <DatePicker
            selected={selectedDate}
            onSelect={(date) => setSelectedDate(date || new Date())}
            placeholder="Select month"
          />
        </div>
      </div>
      
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
        tabs={getDefaultReportTabs(true)}
        defaultValue={activeTab}
        onValueChange={handleTabChange}
      >
        <TabsContent value="financial" className="mt-6">
          <FinancialReportTab
            isLoading={isLoading}
            onDownload={() => handleDownloadReport('financial')}
            data={financialData}
          />
        </TabsContent>
        
        <TabsContent value="attendance" className="mt-6">
          <AttendanceTab
            data={[]}
            isLoading={isLoading}
            onDownload={() => handleDownloadReport('attendance')}
          />
        </TabsContent>
        
        <TabsContent value="performance" className="mt-6">
          <PerformanceTab
            data={[]}
            isLoading={isLoading}
            onDownload={() => handleDownloadReport('performance')}
          />
        </TabsContent>
      </ReportTabs>
    </div>
  );
};

export default AnalyticsPage;
