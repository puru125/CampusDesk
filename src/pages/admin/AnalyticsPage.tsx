
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { BarChart as BarChartIcon } from "lucide-react";
import ReportSelectors from "@/components/reports/ReportSelectors";
import ReportTabs, { getDefaultReportTabs } from "@/components/reports/ReportTabs";
import { supabase } from "@/integrations/supabase/client";
import { DatePicker } from "@/components/ui/date-picker";
import { startOfMonth, endOfMonth } from "date-fns";
import FinancialReportTab from "@/components/reports/FinancialReportTab";
import { TabsContent } from "@/components/ui/tabs";

// Define types outside of component to avoid excessive type instantiation
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

const AnalyticsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("financial");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
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

  // Fetch financial data when the date changes
  useEffect(() => {
    if (selectedDate) {
      fetchFinancialData();
    }
  }, [selectedDate, selectedCourse, selectedStudent]);

  // Fetch financial data
  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      
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
        // Process for monthly chart display
        const monthlyData = new Map();
        const days = Array.from({ length: 31 }, (_, i) => i + 1);
        
        days.forEach(day => {
          if (day <= endDate.getDate()) {
            monthlyData.set(day.toString(), { day: day.toString(), income: 0, expenses: 0 });
          }
        });
        
        // Aggregate data by day
        data.forEach((transaction: any) => {
          const date = new Date(transaction.payment_date);
          const day = date.getDate().toString();
          
          if (monthlyData.has(day)) {
            const dayData = monthlyData.get(day);
            dayData.income += Number(transaction.amount);
            // For expenses, we could use actual expense data or estimate as a percentage of income
            dayData.expenses += Number(transaction.amount) * 0.65; // Example: expenses as 65% of income
          }
        });
        
        // Calculate totals for stats
        const totalRevenue = data.reduce((sum: number, transaction: any) => {
          return sum + Number(transaction.amount);
        }, 0);
        
        // Format recent transactions
        const recentTransactions = data.slice(0, 5).map((transaction: any) => {
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
        
        // Set financial data state
        setFinancialData({
          monthlySummary: Array.from(monthlyData.values()),
          recentTransactions,
          stats: {
            totalRevenue,
            pendingPayments: data.filter((t: any) => t.status === 'pending').reduce((sum: number, t: any) => sum + Number(t.amount), 0),
            revenueGrowth: 12.5 // This would typically be calculated from previous period
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div>
      <PageHeader
        title="Analytics & Reports"
        description="Track institution-wide performance metrics and generate reports"
        icon={BarChartIcon}
      />

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
        courses={courses.map(course => ({
          id: course.id,
          name: course.name,
          code: course.code
        }))}
        students={students.map(student => ({
          id: student.id,
          name: student.full_name,
          enrollment: student.enrollment_number
        }))}
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
            data={financialData}
            isLoading={isLoading}
          />
        </TabsContent>
      </ReportTabs>
    </div>
  );
};

export default AnalyticsPage;
