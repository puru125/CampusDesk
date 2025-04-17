
import { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import ReportTabs, { getDefaultReportTabs } from "@/components/reports/ReportTabs";
import FinancialReportTab from "@/components/reports/FinancialReportTab";
import AttendanceTab from "@/components/reports/AttendanceTab";
import PerformanceTab from "@/components/reports/PerformanceTab";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Interfaces for financial data
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

// Database type for payments
interface PaymentTransactionData {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  students?: {
    enrollment_number?: string;
    users?: {
      full_name?: string;
    };
  } | null;
}

// Attendance data interfaces
interface AttendanceDataItem {
  name: string;
  present: number;
  absent: number;
  total: number;
}

// Performance data interfaces
interface AssignmentDataItem {
  name: string;
  average: number;
  highest: number;
  lowest: number;
  maxScore?: number;
}

interface AdminReportsPanelProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  selectedDate: Date;
  selectedCourse: string;
  selectedStudent: string;
}

const AdminReportsPanel = ({
  activeTab,
  onTabChange,
  selectedDate,
  selectedCourse,
  selectedStudent
}: AdminReportsPanelProps) => {
  const { toast } = useToast();
  
  // State for data and loading
  const [financialData, setFinancialData] = useState<FinancialData>({
    monthlySummary: [],
    recentTransactions: [],
    stats: {
      totalRevenue: 0,
      pendingPayments: 0,
      revenueGrowth: 0
    }
  });
  
  const [attendanceData, setAttendanceData] = useState<AttendanceDataItem[]>([]);
  const [performanceData, setPerformanceData] = useState<AssignmentDataItem[]>([]);
  
  const [financialLoading, setFinancialLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  
  // Load data when tab changes or filters change
  useEffect(() => {
    if (activeTab === "financial") {
      fetchFinancialData();
    } else if (activeTab === "attendance") {
      fetchAttendanceData();
    } else if (activeTab === "performance") {
      fetchPerformanceData();
    }
  }, [activeTab, selectedCourse, selectedStudent, selectedDate]);
  
  // Fetch financial data
  const fetchFinancialData = async () => {
    try {
      setFinancialLoading(true);
      
      // Define date range for the selected month
      const startDate = startOfMonth(selectedDate);
      const endDate = endOfMonth(selectedDate);
      
      // Construct query for financials with appropriate filters
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
        // Create a simple month data structure without complex type inference
        const monthlyData: Map<string, FinancialSummary> = new Map();
        
        // Initialize days data
        for (let day = 1; day <= endDate.getDate(); day++) {
          monthlyData.set(day.toString(), { 
            day: day.toString(), 
            income: 0, 
            expenses: 0 
          });
        }
        
        // Use simple typed data with explicit casting
        const transactions = data as unknown as PaymentTransactionData[];
        let totalRevenue = 0;
        let pendingPayments = 0;
        
        // Process transaction data
        for (const transaction of transactions) {
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
          
          if (monthlyData.has(day)) {
            const dayData = monthlyData.get(day)!;
            dayData.income += amount;
            // For expenses, estimate as a percentage of income
            dayData.expenses += amount * 0.65;
          }
        }
        
        // Format recent transactions
        const recentTransactions: Transaction[] = transactions.slice(0, 5).map(transaction => ({
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
          monthlySummary: Array.from(monthlyData.values()),
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
      setFinancialLoading(false);
    }
  };
  
  // Fetch attendance data
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
  
  // Fetch performance data
  const fetchPerformanceData = async () => {
    try {
      setPerformanceLoading(true);
      
      // Define date range for the selected month
      const startDate = startOfMonth(selectedDate);
      const endDate = endOfMonth(selectedDate);
      
      // Fetch assignment data
      let assignmentsQuery = supabase
        .from('assignments')
        .select(`
          id,
          title,
          max_score,
          assignment_submissions(
            score
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      // Add course filter if selected
      if (selectedCourse !== 'all') {
        assignmentsQuery = assignmentsQuery.eq('subject_id', selectedCourse);
      }
      
      const { data: assignmentsData, error: assignmentsError } = await assignmentsQuery;
      
      if (assignmentsError) throw assignmentsError;
      
      if (assignmentsData && assignmentsData.length > 0) {
        // Process performance data by assignment
        const performanceData: AssignmentDataItem[] = assignmentsData.map(assignment => {
          // Extract scores from submissions
          const scores = assignment.assignment_submissions
            .filter((sub: any) => sub.score !== null)
            .map((sub: any) => Number(sub.score));
          
          // Calculate stats
          const average = scores.length > 0 
            ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length 
            : 0;
          
          const highest = scores.length > 0 ? Math.max(...scores) : 0;
          const lowest = scores.length > 0 ? Math.min(...scores) : 0;
          
          return {
            name: assignment.title,
            average,
            highest,
            lowest,
            maxScore: assignment.max_score
          };
        });
        
        setPerformanceData(performanceData);
      } else {
        setPerformanceData([]);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch performance data",
        variant: "destructive",
      });
    } finally {
      setPerformanceLoading(false);
    }
  };
  
  // Helper function to refresh data based on active tab
  const refreshData = () => {
    if (activeTab === "financial") {
      fetchFinancialData();
    } else if (activeTab === "attendance") {
      fetchAttendanceData();
    } else if (activeTab === "performance") {
      fetchPerformanceData();
    }
  };

  return (
    <ReportTabs 
      tabs={getDefaultReportTabs(true)}
      defaultValue={activeTab}
      onValueChange={onTabChange}
    >
      <TabsContent value="financial" className="mt-6">
        <FinancialReportTab
          data={financialData}
          isLoading={financialLoading}
        />
      </TabsContent>
      
      <TabsContent value="attendance" className="mt-6">
        <AttendanceTab
          data={attendanceData}
          isLoading={attendanceLoading}
        />
      </TabsContent>
      
      <TabsContent value="performance" className="mt-6">
        <PerformanceTab
          data={performanceData}
          isLoading={performanceLoading}
        />
      </TabsContent>
    </ReportTabs>
  );
};

export default AdminReportsPanel;
