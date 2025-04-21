import React, { useState } from "react";
import PageHeader from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from "lucide-react";
import ReportFilter from "@/components/reports/ReportFilter";
import ChartContainer from "@/components/reports/ChartContainer";

// Simplified analytics data type that avoids deep nesting
type SimpleAnalyticsData = {
  id: string;
  name: string;
  value: number;
};

const AnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  // Sample data that won't cause type instantiation issues
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

  return (
    <div>
      <PageHeader
        title="Analytics & Reports"
        description="Comprehensive insights into institutional performance"
        icon={BarChart}
      />

      <div className="mt-6">
        <ReportFilter
          onPeriodChange={setSelectedPeriod}
          onDepartmentChange={setSelectedDepartment}
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enrollment by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer 
                  chartType="bar"
                  data={enrollmentData}
                  xAxis="name"
                  yAxis="value"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Enrollment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer 
                  chartType="line"
                  data={feeCollectionData}
                  xAxis="name"
                  yAxis="value"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          {/* Similar structure for financial tab */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fee Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer 
                  chartType="bar"
                  data={feeCollectionData}
                  xAxis="name"
                  yAxis="value"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academic" className="mt-6">
          {/* Similar structure for academic tab */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Academic Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer 
                  chartType="line"
                  data={feeCollectionData}
                  xAxis="name"
                  yAxis="value"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          {/* Similar structure for attendance tab */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer 
                  chartType="pie"
                  data={attendanceData}
                  nameKey="name"
                  valueKey="value"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
