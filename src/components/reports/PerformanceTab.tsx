
import { useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartContainer from "./ChartContainer";
import StatCard from "./StatCard";

interface AssignmentDataItem {
  name: string;
  average: number;
  highest: number;
  lowest: number;
  maxScore?: number;
}

interface PerformanceTabProps {
  data: AssignmentDataItem[];
  isLoading: boolean;
  onDownload: () => void;
}

const PerformanceTab = ({ data, isLoading, onDownload }: PerformanceTabProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // Calculate stats
  const calculateAverageScore = () => {
    if (data.length === 0) return "N/A";
    const totalAvg = data.reduce((sum, item) => sum + item.average, 0);
    return `${(totalAvg / data.length).toFixed(1)}%`;
  };

  return (
    <>
      <ChartContainer
        ref={chartRef}
        title="Assignment Performance"
        onDownload={onDownload}
        isLoading={isLoading}
        hasData={data.length > 0}
        emptyMessage="No assignment data available for the selected course"
      >
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="highest" fill="#00C49F" name="Highest" />
              <Bar dataKey="average" fill="#0088FE" name="Average" />
              <Bar dataKey="lowest" fill="#FF8042" name="Lowest" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <StatCard
          title="Average Score"
          isLoading={isLoading}
          value={calculateAverageScore()}
        />
        <StatCard
          title="Assignments Evaluated"
          isLoading={isLoading}
          value={data.length}
        />
        <StatCard
          title="Pass Rate"
          isLoading={isLoading}
          value="85%"
        />
      </div>
    </>
  );
};

export default PerformanceTab;
