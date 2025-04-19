
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { BarChart as BarChartIcon, Download } from "lucide-react";
import ReportSelectors from "@/components/reports/ReportSelectors";
import ReportTabs, { getDefaultReportTabs } from "@/components/reports/ReportTabs";
import { supabase } from "@/integrations/supabase/client";
import { DatePicker } from "@/components/ui/date-picker";
import { startOfMonth, endOfMonth, format } from "date-fns";
import FinancialReportTab from "@/components/reports/FinancialReportTab";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AttendanceTab from "@/components/reports/AttendanceTab";

// Simplified type definitions to avoid excessive complexity
interface Transaction {
  id: string;
  date: string;
  student: string;
  amount: number;
  paymentMethod: string;
  status: string;
}

interface FinancialSummary {
  day: string;
  income: number;
  expenses: number;
}

interface FinancialStats {
  totalRevenue: number;
  pendingPayments: number;
  revenueGrowth: number;
}

interface FinancialData {
  monthlySummary: FinancialSummary[];
  recentTransactions: Transaction[];
  stats: FinancialStats;
}

// Attendance data interfaces
interface AttendanceDataItem {
  name: string;
  present: number;
  absent: number;
  total: number;
}

const AnalyticsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("financial");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [courses, setCourses] = useState<Array<{id: string, name: string, code: string}>>([]);
  const [students, setStudents] = useState<Array<{id: string, name: string, enrollment: string}>>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  
  const [financialData, setFinancialData] = useState<FinancialData>({
    monthlySummary: [],
    recentTransactions: [],
    stats: {
      totalRevenue: 0,
      pendingPayments: 0,
      revenueGrowth: 0
    }
  });
  
  // New states for attendance data
  const [attendanceData, setAttendanceData] = useState<AttendanceDataItem[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Fetch data when component mounts
  useEffect(() => {
    fetchCourses();
    fetchStudents();
  }, []);

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
      setStudents(data ? data.map(student => ({
        id: student.id,
        name: student.full_name,
        enrollment: student.enrollment_number
      })) : []);
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

  // Fetch financial data when the date changes
  useEffect(() => {
    if (selectedDate) {
      fetchFinancialData();
    }
  }, [selectedDate, selectedCourse, selectedStudent]);
  
  // Fetch attendance data when tab changes or filters change
  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendanceData();
    }
  }, [activeTab, selectedCourse, selectedStudent, selectedDate]);

  // Fetch financial data with simplified approach
  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      
      // Define date range for the selected month
      const startDate = startOfMonth(selectedDate);
      const endDate = endOfMonth(selectedDate);
      
      // Build the query
      let query = supabase
        .from('payment_transactions')
        .select(`
          id,
          amount,
          payment_date,
          payment_method,
          status,
          students:student_id (
            enrollment_number,
            users:user_id (
              full_name
            )
          )
        `)
        .gte('payment_date', startDate.toISOString())
        .lte('payment_date', endDate.toISOString());
      
      // Add course filter if selected
      if (selectedCourse !== 'all') {
        query = query.eq('course_id', selectedCourse);
      }
      
      // Add student filter if selected
      if (selectedStudent !== 'all') {
        query = query.eq('student_id', selectedStudent);
      }
      
      // Execute query
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Process the data to create financial summary
      if (data && data.length > 0) {
        // Create a month data structure
        const monthlyData: Record<string, FinancialSummary> = {};
        
        // Initialize days data
        for (let day = 1; day <= endDate.getDate(); day++) {
          monthlyData[day.toString()] = { 
            day: day.toString(), 
            income: 0, 
            expenses: 0 
          };
        }
        
        let totalRevenue = 0;
        let pendingPayments = 0;
        
        // Process transaction data
        for (const transaction of data) {
          // Calculate revenue
          const amount = Number(transaction.amount);
          totalRevenue += amount;
          
          // Check for pending payments
          if (transaction.status === 'pending') {
            pendingPayments += amount;
          }
          
          // Update daily summary
          const date = new Date(transaction.payment_date);
          const day = date.getDate().toString();
          
          if (monthlyData[day]) {
            monthlyData[day].income += amount;
            // For expenses, estimate as a percentage of income
            monthlyData[day].expenses += amount * 0.65;
          }
        }
        
        // Format recent transactions
        const recentTransactions: Transaction[] = data.slice(0, 5).map(transaction => ({
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
        }));
        
        // Set financial data state
        setFinancialData({
          monthlySummary: Object.values(monthlyData),
          recentTransactions,
          stats: {
            totalRevenue,
            pendingPayments,
            revenueGrowth: 12.5 // Example value
          }
        });
      } else {
        // No data available for the selected period
        setFinancialData({
          monthlySummary: [],
          recentTransactions: [],
          stats: {
            totalRevenue: 0,
            pendingPayments: 0,
            revenueGrowth: 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch financial data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch attendance data with week-based grouping
  const fetchAttendanceData = async () => {
    try {
      setAttendanceLoading(true);
      
      // Define date range for the selected month
      const startDate = startOfMonth(selectedDate);
      const endDate = endOfMonth(selectedDate);
      
      // Construct query for attendance with appropriate filters
      let query = supabase
        .from('attendance_records')
        .select(`
          date,
          status
        `)
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());
      
      // Add course filter if selected
      if (selectedCourse !== 'all') {
        query = query.eq('class_id', selectedCourse);
      }
      
      // Add student filter if selected
      if (selectedStudent !== 'all') {
        query = query.eq('student_id', selectedStudent);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Process attendance data by week
        const attendanceByWeek = new Map<string, { present: number, absent: number, total: number }>();
        
        // Initialize weeks
        const weekCount = Math.ceil(endDate.getDate() / 7);
        for (let week = 1; week <= weekCount; week++) {
          attendanceByWeek.set(`Week ${week}`, { present: 0, absent: 0, total: 0 });
        }
        
        // Process attendance records
        data.forEach(record => {
          const date = new Date(record.date);
          const weekNumber = Math.ceil(date.getDate() / 7);
          const weekKey = `Week ${weekNumber}`;
          
          if (attendanceByWeek.has(weekKey)) {
            const weekData = attendanceByWeek.get(weekKey)!;
            weekData.total += 1;
            
            if (record.status === 'present') {
              weekData.present += 1;
            } else if (record.status === 'absent') {
              weekData.absent += 1;
            }
          }
        });
        
        // Convert to array for the component
        const attendanceData: AttendanceDataItem[] = Array.from(attendanceByWeek.entries())
          .map(([name, data]) => ({
            name,
            present: data.present,
            absent: data.absent,
            total: data.total
          }));
        
        setAttendanceData(attendanceData);
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance data",
        variant: "destructive",
      });
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleExportData = async () => {
    try {
      toast({
        title: "Export initiated",
        description: "Preparing your report for download...",
      });

      let exportData;
      let fileName;

      if (activeTab === 'financial') {
        exportData = financialData.monthlySummary.map(item => ({
          Day: item.day,
          Income: item.income.toFixed(2),
          Expenses: item.expenses.toFixed(2)
        }));
        fileName = `financial-report-${format(selectedDate, 'MMM-yyyy')}.csv`;
      } else {
        exportData = attendanceData.map(item => ({
          Week: item.name,
          Present: item.present,
          Absent: item.absent,
          'Total Classes': item.total
        }));
        fileName = `attendance-report-${format(selectedDate, 'MMM-yyyy')}.csv`;
      }

      // Convert data to CSV
      const headers = Object.keys(exportData[0] || {});
      
      if (headers.length === 0) {
        toast({
          title: "Export failed",
          description: "No data available to export",
          variant: "destructive"
        });
        return;
      }
      
      const csv = [
        headers.join(','),
        ...exportData.map(row => headers.map(header => 
          typeof row[header as keyof typeof row] === 'string' && row[header as keyof typeof row].includes(',')
            ? `"${row[header as keyof typeof row]}"`
            : row[header as keyof typeof row]
        ).join(','))
      ].join('\n');

      // Create and trigger download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export completed",
        description: `Your report has been downloaded as ${fileName}`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: "Failed to generate the export file",
        variant: "destructive"
      });
    }
  };

  // Handle refresh data based on active tab
  const handleRefreshData = () => {
    toast({
      title: "Refreshing data",
      description: `Fetching the latest ${activeTab} information`,
    });
    
    if (activeTab === 'financial') {
      fetchFinancialData();
    } else if (activeTab === 'attendance') {
      fetchAttendanceData();
    }
  };

  return (
    <div>
      <PageHeader
        title="Analytics & Reports"
        description="Track institution-wide performance metrics and generate reports"
        icon={BarChartIcon}
      >
        <Button variant="outline" onClick={handleRefreshData}>
          Refresh Data
        </Button>
        <Button onClick={handleExportData}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
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
        tabs={getDefaultReportTabs(true).filter(tab => tab.value !== 'performance')}
        defaultValue={activeTab}
        onValueChange={handleTabChange}
      >
        <TabsContent value="financial" className="mt-6">
          <FinancialReportTab
            data={financialData}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="attendance" className="mt-6">
          <AttendanceTab
            data={attendanceData}
            isLoading={attendanceLoading}
          />
        </TabsContent>
      </ReportTabs>
    </div>
  );
};

export default AnalyticsPage;
