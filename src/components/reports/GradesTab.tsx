
import { useRef } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import ChartContainer from "./ChartContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GradeItem {
  name: string;
  value: number;
}

interface GradesTabProps {
  data: GradeItem[];
  isLoading: boolean;
}

const GradesTab = ({ data, isLoading }: GradesTabProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartContainer
        ref={chartRef}
        title="Grade Distribution"
        isLoading={isLoading}
        hasData={data.length > 0}
      >
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Grade Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Grade</th>
                    <th className="text-left py-2">Range</th>
                    <th className="text-left py-2">Students</th>
                    <th className="text-left py-2">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">A</td>
                    <td className="py-2">90-100</td>
                    <td className="py-2">15</td>
                    <td className="py-2">15%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">B</td>
                    <td className="py-2">80-89</td>
                    <td className="py-2">25</td>
                    <td className="py-2">25%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">C</td>
                    <td className="py-2">70-79</td>
                    <td className="py-2">30</td>
                    <td className="py-2">30%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">D</td>
                    <td className="py-2">60-69</td>
                    <td className="py-2">20</td>
                    <td className="py-2">20%</td>
                  </tr>
                  <tr>
                    <td className="py-2">F</td>
                    <td className="py-2">0-59</td>
                    <td className="py-2">10</td>
                    <td className="py-2">10%</td>
                  </tr>
                </tbody>
              </table>
              
              <div className="pt-4">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Class Average:</span>
                  <span>75.3%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Median Grade:</span>
                  <span>C</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Highest Grade:</span>
                  <span>98%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Lowest Grade:</span>
                  <span>35%</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GradesTab;
