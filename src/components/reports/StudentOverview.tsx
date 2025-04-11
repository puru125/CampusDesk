
import { useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface StudentPerformance {
  attendance?: {
    total: number;
    present: number;
    percentage: string;
  };
  assignments?: Array<{
    title: string;
    score: number;
    maxScore: number;
    percentage: number;
  }>;
  grades?: Array<{
    name: string;
    value: number;
  }>;
}

interface StudentOverviewProps {
  performance: StudentPerformance;
  isLoading: boolean;
  onDownload: () => void;
}

const StudentOverview = ({ performance, isLoading, onDownload }: StudentOverviewProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

  return (
    <Card ref={chartRef}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Student Performance Overview</CardTitle>
        <Button onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Attendance Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Total Classes</div>
                  <div className="text-2xl font-bold">{performance.attendance?.total || 0}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Present</div>
                  <div className="text-2xl font-bold">{performance.attendance?.present || 0}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Attendance Rate</div>
                  <div className="text-2xl font-bold">{performance.attendance?.percentage || 0}%</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Assignment Performance</h3>
              {performance.assignments?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Assignment</th>
                        <th className="text-left py-2">Score</th>
                        <th className="text-left py-2">Max Score</th>
                        <th className="text-left py-2">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performance.assignments?.map((assignment, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{assignment.title}</td>
                          <td className="py-2">{assignment.score}</td>
                          <td className="py-2">{assignment.maxScore}</td>
                          <td className="py-2">{assignment.percentage.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No assignment data available
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Grade Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performance.grades || []}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {performance.grades?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentOverview;
