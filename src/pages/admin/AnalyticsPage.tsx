
import React, { useState } from "react";
import PageHeader from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from "lucide-react";
import ReportFilter from "@/components/reports/ReportFilter";
import { BarChart as ReBarChart, LineChart as ReLineChart, PieChart as RePieChart, Cell, Legend, Tooltip as ReTooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Bar, Line, Pie } from "recharts";

// Simple data type to avoid deep nesting
interface SimpleAnalyticsData {
  id: string;
  name: string;
  value: number;
}

// Custom chart container component to simplify rendering
const SimpleChartContainer = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

const AnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  // Sample data for charts
  const enrollmentData: SimpleAnalyticsData[] = [
    { id: "1", name: "Computer Science", value: 120 },
    { id: "2", name: "Business Administration", value: 85 },
    { id: "3", name: "Mechanical Engineering", value: 65 },
    { id: "4", name: "Electrical Engineering", value: 45 }
  ];

  const feeCollectionData: SimpleAnalyticsData[] = [
    { id: "1", name: "Jan", value: 25000 },
    { id: "2", name: "Feb", value: 35000 },
    { id: "3", name: "Mar", value: 28000 },
    { id: "4", name: "Apr", value: 32000 }
  ];

  const attendanceData: SimpleAnalyticsData[] = [
    { id: "1", name: "Present", value: 85 },
    { id: "2", name: "Absent", value: 15 }
  ];

  // Colors for pie chart
  const COLORS = ['#0088FE', '#FF8042'];
  
  // Handle filter changes
  const handleFilterChange = (period: string, department: string) => {
    setSelectedPeriod(period);
    setSelectedDepartment(department);
  };

  return (
    <div>
      <PageHeader
        title="Analytics & Reports"
        description="Comprehensive insights into institutional performance"
        icon={BarChart}
      />

      <div className="mt-6">
        <ReportFilter onFilterChange={handleFilterChange} />
      </div>

      <Tabs defaultValue="enrollment" className="mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleChartContainer title="Enrollment by Department">
              <ReBarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ReTooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </ReBarChart>
            </SimpleChartContainer>
            
            <SimpleChartContainer title="Enrollment Trends">
              <ReLineChart data={feeCollectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ReTooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </ReLineChart>
            </SimpleChartContainer>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleChartContainer title="Fee Collection">
              <ReBarChart data={feeCollectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ReTooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </ReBarChart>
            </SimpleChartContainer>
          </div>
        </TabsContent>

        <TabsContent value="academic" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleChartContainer title="Academic Performance">
              <ReLineChart data={feeCollectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ReTooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#82ca9d" />
              </ReLineChart>
            </SimpleChartContainer>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleChartContainer title="Attendance Overview">
              <RePieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <ReTooltip />
              </RePieChart>
            </SimpleChartContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
