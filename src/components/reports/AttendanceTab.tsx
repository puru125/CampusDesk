
import { useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartContainer from "./ChartContainer";
import StatCard from "./StatCard";

interface AttendanceDataItem {
  name: string;
  present: number;
  absent: number;
  total: number;
}

interface AttendanceTabProps {
  data: AttendanceDataItem[];
  isLoading: boolean;
  onDownload: () => void;
}

const AttendanceTab = ({ data, isLoading, onDownload }: AttendanceTabProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // Calculate stats
  const calculateAverageAttendance = () => {
    if (data.length === 0) return "N/A";
    const totalPresent = data.reduce((sum, week) => sum + week.present, 0);
    const totalClasses = data.reduce((sum, week) => sum + week.total, 0);
    return totalClasses > 0 
      ? `${((totalPresent / totalClasses) * 100).toFixed(1)}%` 
      : "N/A";
  };

  const totalClassesConducted = data.reduce((sum, week) => sum + week.total, 0);
  const totalStudentsPresent = data.reduce((sum, week) => sum + week.present, 0);

  return (
    <>
      <ChartContainer 
        ref={chartRef}
        title="Attendance Report" 
        onDownload={onDownload}
        isLoading={isLoading}
        hasData={data.length > 0}
        emptyMessage="No attendance data available for the selected period"
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
              <Bar dataKey="present" stackId="a" fill="#0088FE" name="Present" />
              <Bar dataKey="absent" stackId="a" fill="#FF8042" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <StatCard 
          title="Average Attendance" 
          isLoading={isLoading} 
          value={calculateAverageAttendance()} 
        />
        <StatCard 
          title="Total Classes Conducted" 
          isLoading={isLoading} 
          value={totalClassesConducted} 
        />
        <StatCard 
          title="Students Present" 
          isLoading={isLoading} 
          value={totalStudentsPresent} 
        />
      </div>
    </>
  );
};

export default AttendanceTab;
