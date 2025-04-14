
import { useRef, useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, DollarSign, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import ChartContainer from "./ChartContainer";
import StatCard from "./StatCard";

export interface FinancialTransaction {
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

export interface FinancialReportProps {
  isLoading: boolean;
  onDownload: () => void;
  selectedYear?: string;
  selectedSession?: string;
  financialData?: FinancialTransaction[];
  data?: {
    monthlySummary: {
      month: string;
      income: number;
      expenses: number;
    }[];
    recentTransactions: {
      id: string;
      date: string;
      student: string;
      amount: number;
      paymentMethod: string;
      status: string;
    }[];
    stats: {
      totalRevenue: number;
      pendingPayments: number;
      revenueGrowth: number;
    };
  };
}

const FinancialReportTab = ({ data, isLoading, onDownload, selectedYear, selectedSession, financialData = [] }: FinancialReportProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartKey, setChartKey] = useState(0);
  const [processedData, setProcessedData] = useState<any>(null);
  
  // Force recharts to re-render when component mounts or filters change
  useEffect(() => {
    setChartKey(prevKey => prevKey + 1);
    
    // Process real financial data if available
    if (financialData && financialData.length > 0) {
      processFinancialData();
    }
  }, [selectedYear, selectedSession, financialData]);
  
  // Process financial data into chart format
  const processFinancialData = () => {
    if (!financialData || financialData.length === 0) return;
    
    try {
      // Group by month for monthly summary
      const monthlyData = new Map();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Initialize months with zero values
      months.forEach(month => {
        monthlyData.set(month, { month, income: 0, expenses: 0 });
      });
      
      // Aggregate real data by month
      financialData.forEach(transaction => {
        if (transaction.status === 'completed') {
          const date = new Date(transaction.payment_date);
          const monthName = months[date.getMonth()];
          
          const existing = monthlyData.get(monthName);
          existing.income += Number(transaction.amount);
        }
      });
      
      // Calculate total revenue
      const totalRevenue = financialData.reduce((sum, transaction) => {
        return sum + Number(transaction.amount);
      }, 0);
      
      // Add some mock data for expenses (since we don't have real expense data)
      monthlyData.forEach(data => {
        data.expenses = data.income * 0.65; // Simulate expenses as 65% of income
      });
      
      // Format transactions for the table
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
      
      // Set the processed data
      setProcessedData({
        monthlySummary: Array.from(monthlyData.values()),
        recentTransactions,
        stats: {
          totalRevenue,
          pendingPayments: totalRevenue * 0.15, // Mock data - 15% of revenue as pending
          revenueGrowth: 12.5 // Mock data
        }
      });
    } catch (error) {
      console.error("Error processing financial data:", error);
    }
  };

  // Default data for demonstration if no data is provided
  const defaultData = {
    monthlySummary: [
      { month: "Jan", income: 50000, expenses: 35000 },
      { month: "Feb", income: 55000, expenses: 32000 },
      { month: "Mar", income: 60000, expenses: 38000 },
      { month: "Apr", income: 58000, expenses: 30000 },
      { month: "May", income: 63000, expenses: 34000 },
      { month: "Jun", income: 68000, expenses: 36000 }
    ],
    recentTransactions: [
      { id: "TX001", date: "13 Apr 2025", student: "Anjali Patel", amount: 12500, paymentMethod: "Credit Card", status: "Completed" },
      { id: "TX002", date: "12 Apr 2025", student: "Rahul Shah", amount: 18000, paymentMethod: "Bank Transfer", status: "Completed" },
      { id: "TX003", date: "11 Apr 2025", student: "Priya Kumar", amount: 15000, paymentMethod: "UPI", status: "Pending" },
      { id: "TX004", date: "10 Apr 2025", student: "Vikram Singh", amount: 22000, paymentMethod: "Credit Card", status: "Completed" },
      { id: "TX005", date: "09 Apr 2025", student: "Neha Gupta", amount: 8500, paymentMethod: "Debit Card", status: "Failed" }
    ],
    stats: {
      totalRevenue: 354000,
      pendingPayments: 42500,
      revenueGrowth: 12.5
    }
  };

  // Use processed data from real financial data if available, otherwise use data prop or default
  const reportData = processedData || data || defaultData;
  
  const formatCurrency = (value: number) => {
    return `₹${(value/1000).toFixed(1)}K`;
  };

  // Filter message to show selected filters
  const filterMessage = (selectedYear || selectedSession) 
    ? `Showing data for ${selectedYear || 'All Years'}${selectedSession ? ` - ${selectedSession}` : ''}`
    : "";

  return (
    <div className="space-y-6">
      {/* Filter message */}
      {filterMessage && (
        <div className="text-sm text-muted-foreground mb-4">
          {filterMessage}
        </div>
      )}
      
      {/* Financial Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Revenue"
          value={formatCurrency(reportData.stats.totalRevenue)}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard 
          title="Pending Payments" 
          value={formatCurrency(reportData.stats.pendingPayments)}
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard 
          title="Revenue Growth" 
          value={`${reportData.stats.revenueGrowth}%`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>
      
      {/* Monthly Revenue Chart */}
      <ChartContainer
        ref={chartRef}
        title="Monthly Financial Summary"
        onDownload={onDownload}
        isLoading={isLoading}
        hasData={reportData.monthlySummary.length > 0}
      >
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%" key={`chart-${chartKey}`}>
            <BarChart
              data={reportData.monthlySummary}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₹${value/1000}K`} />
              <Tooltip 
                formatter={(value: any) => [`₹${value}`, ""]}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}
              />
              <Legend />
              <Bar dataKey="income" name="Revenue" fill="#4CAF50" />
              <Bar dataKey="expenses" name="Expenses" fill="#FF5722" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
      
      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>{transaction.student}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'Completed' || transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'Pending' || transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReportTab;
