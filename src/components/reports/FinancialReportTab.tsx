
import { useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartContainer from "./ChartContainer";
import StatCard from "./StatCard";

interface FinancialData {
  monthlySummary: { day: string; income: number; expenses: number; }[];
  recentTransactions: { id: string; date: string; student: string; amount: number; paymentMethod: string; status: string; }[];
  stats: { totalRevenue: number; pendingPayments: number; revenueGrowth: number; };
}

interface FinancialReportTabProps {
  data: FinancialData;
  isLoading: boolean;
}

const FinancialReportTab = ({ data, isLoading }: FinancialReportTabProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-6">
      <ChartContainer
        ref={chartRef}
        title="Monthly Financial Summary"
        isLoading={isLoading}
        hasData={data.monthlySummary.length > 0}
        emptyMessage="No financial data available for the selected period"
      >
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.monthlySummary}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#0088FE" name="Income" />
              <Bar dataKey="expenses" fill="#FF8042" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${data.stats.totalRevenue.toLocaleString('en-IN')}`}
          isLoading={isLoading}
        />
        <StatCard
          title="Pending Payments"
          value={`₹${data.stats.pendingPayments.toLocaleString('en-IN')}`}
          isLoading={isLoading}
        />
        <StatCard
          title="Revenue Growth"
          value={`${data.stats.revenueGrowth}%`}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default FinancialReportTab;
