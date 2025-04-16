
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
  data: {
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
  const [chartKey, setChartKey] = useState(0);
  
  useEffect(() => {
    setChartKey(prevKey => prevKey + 1);
  }, [selectedYear, selectedSession, data]);
  
  const formatCurrency = (value: number) => {
    return `₹${(value/1000).toFixed(1)}K`;
  };

  const filterMessage = (selectedYear || selectedSession) 
    ? `Showing data for ${selectedYear || 'All Years'}${selectedSession ? ` - ${selectedSession}` : ''}`
    : "";

  return (
    <div className="space-y-6">
      {filterMessage && (
        <div className="text-sm text-muted-foreground mb-4">
          {filterMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Total Revenue"
          value={formatCurrency(data.stats.totalRevenue)}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard 
          title="Pending Payments" 
          value={formatCurrency(data.stats.pendingPayments)}
          icon={<CreditCard className="h-4 w-4" />}
        />
        <StatCard 
          title="Revenue Growth" 
          value={`${data.stats.revenueGrowth}%`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>
      
      <ChartContainer
        ref={chartRef}
        title="Monthly Financial Summary"
        onDownload={onDownload}
        isLoading={isLoading}
        hasData={data.monthlySummary.length > 0}
      >
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%" key={`chart-${chartKey}`}>
            <BarChart
              data={data.monthlySummary}
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
                  {data.recentTransactions.map((transaction) => (
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
