import React, { useState, useEffect } from "react";
import PageHeader from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from "lucide-react";
import ReportFilter from "@/components/reports/ReportFilter";
import { BarChart as ReBarChart, LineChart as ReLineChart, PieChart as RePieChart, Cell, Legend, Tooltip as ReTooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Bar, Line, Pie } from "recharts";
import { addDays, subDays, format, startOfWeek, startOfMonth, startOfQuarter, startOfYear } from "date-fns";
import ChartContainer from "@/components/reports/ChartContainer";

interface SimpleAnalyticsData {
  id: string;
  name: string;
  value: number;
}

const AnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [enrollmentData, setEnrollmentData] = useState<SimpleAnalyticsData[]>([]);
  const [feeCollectionData, setFeeCollectionData] = useState<SimpleAnalyticsData[]>([]);
  const [attendanceData, setAttendanceData] = useState<SimpleAnalyticsData[]>([]);

  useEffect(() => {
    const filteredEnrollmentData = getFilteredEnrollmentData(selectedDepartment);
    setEnrollmentData(filteredEnrollmentData);
    
    const filteredFeeData = getFilteredFeeData(selectedPeriod);
    setFeeCollectionData(filteredFeeData);
    
    setAttendanceData([
      { id: "1", name: "Present", value: 85 },
      { id: "2", name: "Absent", value: 15 }
    ]);
  }, [selectedPeriod, selectedDepartment]);

  const getFilteredEnrollmentData = (department: string): SimpleAnalyticsData[] => {
    const allData = [
      { id: "1", name: "Computer Science", value: 120 },
      { id: "2", name: "Business Administration", value: 85 },
      { id: "3", name: "Mechanical Engineering", value: 65 },
      { id: "4", name: "Electrical Engineering", value: 45 }
    ];
    
    if (department === "all") {
      return allData;
    }
    
    const departmentMap: Record<string, SimpleAnalyticsData[]> = {
      cs: [{ id: "1", name: "Computer Science", value: 120 }],
      bus: [{ id: "2", name: "Business Administration", value: 85 }],
      eng: [
        { id: "3", name: "Mechanical Engineering", value: 65 },
        { id: "4", name: "Electrical Engineering", value: 45 }
      ],
      edu: [{ id: "5", name: "Education", value: 55 }]
    };
    
    return departmentMap[department] || allData;
  };
  
  const getFilteredFeeData = (period: string): SimpleAnalyticsData[] => {
    switch (period) {
      case "week":
        return [
          { id: "1", name: "Mon", value: 5000 },
          { id: "2", name: "Tue", value: 8000 },
          { id: "3", name: "Wed", value: 6000 },
          { id: "4", name: "Thu", value: 12000 },
          { id: "5", name: "Fri", value: 9000 }
        ];
      case "month":
        return [
          { id: "1", name: "Week 1", value: 25000 },
          { id: "2", name: "Week 2", value: 35000 },
          { id: "3", name: "Week 3", value: 28000 },
          { id: "4", name: "Week 4", value: 32000 }
        ];
      case "quarter":
        return [
          { id: "1", name: "Jan", value: 95000 },
          { id: "2", name: "Feb", value: 85000 },
          { id: "3", name: "Mar", value: 110000 }
        ];
      case "year":
        return [
          { id: "1", name: "Q1", value: 290000 },
          { id: "2", name: "Q2", value: 320000 },
          { id: "3", name: "Q3", value: 280000 },
          { id: "4", name: "Q4", value: 350000 }
        ];
      default:
        return [
          { id: "1", name: "Jan", value: 25000 },
          { id: "2", name: "Feb", value: 35000 },
          { id: "3", name: "Mar", value: 28000 },
          { id: "4", name: "Apr", value: 32000 }
        ];
    }
  };

  const COLORS = ['#0088FE', '#FF8042'];

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
        <ReportFilter 
          onFilterChange={handleFilterChange} 
          initialPeriod={selectedPeriod}
          initialDepartment={selectedDepartment}
        />
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
            <ChartContainer title="Enrollment by Department">
              <ReBarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ReTooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </ReBarChart>
            </ChartContainer>
            
            <ChartContainer title="Enrollment Trends">
              <ReLineChart data={feeCollectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ReTooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </ReLineChart>
            </ChartContainer>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Fee Collection">
              <ReBarChart data={feeCollectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ReTooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </ReBarChart>
            </ChartContainer>
          </div>
        </TabsContent>

        <TabsContent value="academic" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Academic Performance">
              <ReLineChart data={feeCollectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ReTooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#82ca9d" />
              </ReLineChart>
            </ChartContainer>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Attendance Overview">
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
            </ChartContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
