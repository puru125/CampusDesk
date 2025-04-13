
import { useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, DollarSign, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import ChartContainer from "./ChartContainer";
import StatCard from "./StatCard";

interface FinancialReportProps {
  isLoading: boolean;
  onDownload: () => void;
  selectedYear?: string;
  selectedSession?: string;
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

const FinancialReportTab = ({ data, isLoading, onDownload, selectedYear, selectedSession }: FinancialReportProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
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

  // Use provided data or default if not available
  const reportData = data || defaultData;
  
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
          <ResponsiveContainer width="100%" height="100%">
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
                formatter={(value) => [`₹${value}`, ""]}
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
                          transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
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
