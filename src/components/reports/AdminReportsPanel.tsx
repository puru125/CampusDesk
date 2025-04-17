import { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import ReportTabs, { getDefaultReportTabs } from "@/components/reports/ReportTabs";
import FinancialReportTab from "@/components/reports/FinancialReportTab";
import AttendanceTab from "@/components/reports/AttendanceTab";
import PerformanceTab from "@/components/reports/PerformanceTab";
import { useToast } from "@/hooks/use-toast";
import { 
  generateFinancialData, 
  generateAttendanceData, 
  generatePerformanceData 
} from "@/utils/adminReportsDummyData";

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
  
  // State management with simpler type definitions
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
  
  // Simulate data fetching with loading states
  const fetchFinancialData = async () => {
    try {
      setFinancialLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = generateFinancialData(selectedDate);
      setFinancialData(data);
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
  
  const fetchAttendanceData = async () => {
    try {
      setAttendanceLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = generateAttendanceData();
      setAttendanceData(data);
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
  
  const fetchPerformanceData = async () => {
    try {
      setPerformanceLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = generatePerformanceData();
      setPerformanceData(data);
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
  
  // Effect to load data based on active tab
  useEffect(() => {
    if (activeTab === "financial") {
      fetchFinancialData();
    } else if (activeTab === "attendance") {
      fetchAttendanceData();
    } else if (activeTab === "performance") {
      fetchPerformanceData();
    }
  }, [activeTab, selectedDate, selectedCourse, selectedStudent]);

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
