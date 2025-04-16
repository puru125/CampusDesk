
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
import { extendedSupabase } from "@/integrations/supabase/extendedClient";

// Define the payment transaction type
interface PaymentTransaction {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  students?: {
    enrollment_number: string;
    users?: {
      full_name: string;
    };
  };
  fee_structures?: {
    fee_type: string;
    description?: string;
  };
}

const AnalyticsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const chartRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("attendance");
  const [financialData, setFinancialData] = useState<PaymentTransaction[]>([]);
  const [finDataLoading, setFinDataLoading] = useState(false);
  const [processedFinancialData, setProcessedFinancialData] = useState<{
    monthlySummary: { month: string; income: number; expenses: number }[];
    recentTransactions: { id: string; date: string; student: string; amount: number; paymentMethod: string; status: string }[];
    stats: { totalRevenue: number; pendingPayments: number; revenueGrowth: number };
  } | null>(null);
  
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

  // Fetch financial data on mount
  useEffect(() => {
    const fetchFinancialData = async () => {
      setFinDataLoading(true);
      try {
        // Use extendedSupabase to properly type the query
        const { data, error } = await extendedSupabase
          .from('payment_transactions')
          .select(`
            id,
            amount,
            payment_date,
            payment_method,
            status,
            students(
              enrollment_number,
              users(
                full_name
              )
            ),
            fee_structures(
              fee_type,
              description
            )
          `)
          .order('payment_date', { ascending: false });
          
        if (error) throw error;
        setFinancialData(data || []);
      } catch (error) {
        console.error("Error fetching financial data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch financial data",
          variant: "destructive",
        });
      } finally {
        setFinDataLoading(false);
      }
    };
    
    fetchFinancialData();
  }, [toast]);

  // Process financial data whenever it changes
  useEffect(() => {
    if (financialData && financialData.length > 0) {
      processFinancialData();
    }
  }, [financialData]);

  // Process financial data for the chart
  const processFinancialData = () => {
    if (!financialData || financialData.length === 0) return;
    
    try {
      // Group by month
      const monthlyData = new Map();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      months.forEach(month => {
        monthlyData.set(month, { month, income: 0, expenses: 0 });
      });
      
      financialData.forEach(transaction => {
        const date = new Date(transaction.payment_date);
        const monthName = months[date.getMonth()];
        
        const existing = monthlyData.get(monthName);
        existing.income += Number(transaction.amount);
        // Simulate expenses as a percentage of income for demo
        existing.expenses = existing.income * 0.65;
      });
      
      const totalRevenue = financialData.reduce((sum, transaction) => {
        return sum + Number(transaction.amount);
      }, 0);
      
      // Format recent transactions
      const recentTransactions = financialData.slice(0, 5).map(transaction => {
        return {
          id: transaction.id,
          date: new Date(transaction.payment_date).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),
          student: transaction.students?.users?.full_name || 'Unknown Student',
          amount: transaction.amount,
          paymentMethod: transaction.payment_method,
          status: transaction.status
        };
      });
      
      setProcessedFinancialData({
        monthlySummary: Array.from(monthlyData.values()),
        recentTransactions,
        stats: {
          totalRevenue,
          pendingPayments: totalRevenue * 0.15, // Mock data
          revenueGrowth: 12.5 // Mock data
        }
      });
    } catch (error) {
      console.error("Error processing financial data:", error);
    }
  };

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
      
      const doc = generateReportPDF(
        reportType,
        { name: user?.full_name || 'N/A', employeeId: teacherData?.employee_id || 'N/A' },
        courseInfo,
        studentInfo,
        attendanceData,
        assignmentData,
        undefined,
        { financialData }
      );
      
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
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
            isLoading={isLoading || finDataLoading}
            onDownload={() => handleDownloadReport('financial')}
            data={processedFinancialData || {
              monthlySummary: [],
              recentTransactions: [],
              stats: {
                totalRevenue: 0,
                pendingPayments: 0,
                revenueGrowth: 0
              }
            }}
          />
        </TabsContent>
      </ReportTabs>
    </div>
  );
};

export default AnalyticsPage;
