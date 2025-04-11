
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Loader2, DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

// Analytics types
interface EnrollmentAnalytics {
  month: string;
  count: number;
}

interface CourseAnalytics {
  course_name: string;
  student_count: number;
}

interface FeeAnalytics {
  month: string;
  amount: number;
}

interface AttendanceAnalytics {
  subject_name: string;
  percentage: number;
}

interface PerformanceAnalytics {
  subject_name: string;
  average_score: number;
}

const AnalyticsPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentAnalytics[]>([]);
  const [courseData, setCourseData] = useState<CourseAnalytics[]>([]);
  const [feeData, setFeeData] = useState<FeeAnalytics[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceAnalytics[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceAnalytics[]>([]);
  const [activeTab, setActiveTab] = useState("enrollment");

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch enrollment trends (mock data for now)
      const enrollmentSample = [
        { month: 'Jan', count: 35 },
        { month: 'Feb', count: 28 },
        { month: 'Mar', count: 43 },
        { month: 'Apr', count: 39 },
        { month: 'May', count: 52 },
        { month: 'Jun', count: 36 }
      ];
      setEnrollmentData(enrollmentSample);
      
      // Fetch course popularity (mock data)
      const courseSample = [
        { course_name: 'BTech CS', student_count: 120 },
        { course_name: 'BCA', student_count: 85 },
        { course_name: 'MTech AI', student_count: 45 },
        { course_name: 'BSc IT', student_count: 75 },
        { course_name: 'PhD CS', student_count: 15 }
      ];
      setCourseData(courseSample);

      // Fetch fee collection data (mock data)
      const feeSample = [
        { month: 'Jan', amount: 150000 },
        { month: 'Feb', amount: 120000 },
        { month: 'Mar', amount: 180000 },
        { month: 'Apr', amount: 200000 },
        { month: 'May', amount: 160000 },
        { month: 'Jun', amount: 190000 }
      ];
      setFeeData(feeSample);

      // Fetch attendance data (mock data)
      const attendanceSample = [
        { subject_name: 'Mathematics', percentage: 92 },
        { subject_name: 'Programming', percentage: 88 },
        { subject_name: 'Physics', percentage: 78 },
        { subject_name: 'AI Basics', percentage: 85 },
        { subject_name: 'Data Structures', percentage: 82 }
      ];
      setAttendanceData(attendanceSample);

      // Fetch performance data (mock data)
      const performanceSample = [
        { subject_name: 'Mathematics', average_score: 72 },
        { subject_name: 'Programming', average_score: 78 },
        { subject_name: 'Physics', average_score: 65 },
        { subject_name: 'AI Basics', average_score: 81 },
        { subject_name: 'Data Structures', average_score: 76 }
      ];
      setPerformanceData(performanceSample);

      // In a real implementation, we would fetch data from Supabase 
      // const { data: enrollmentAnalytics, error: enrollmentError } = await supabase
      //   .from('enrollment_analytics_view')
      //   .select('*');
      
      // if (enrollmentError) throw enrollmentError;
      // setEnrollmentData(enrollmentAnalytics);
      
      // Repeat similar queries for other analytics data...
      
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = () => {
    const reportDate = format(new Date(), "yyyy-MM-dd");
    alert(`Report generation would begin for ${reportDate}. In a real implementation, this would generate a PDF report of all analytics data.`);
    
    toast({
      title: "Report Generation Started",
      description: "Your report is being prepared and will be available shortly.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-institute-500" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Analytics & Reports"
        description="Comprehensive analytics dashboard for the Institute Management System"
      >
        <Button onClick={generateReport}>
          <DownloadIcon className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </PageHeader>

      <Tabs defaultValue="enrollment" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="courses">Course Analytics</TabsTrigger>
          <TabsTrigger value="finances">Fee Collection</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        {/* Enrollment Tab */}
        <TabsContent value="enrollment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Enrollment Trends</CardTitle>
              <CardDescription>Monthly enrollment statistics for the current year</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ChartContainer
                config={{
                  count: { label: "Number of Students" },
                  month: { label: "Month" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Popularity</CardTitle>
              <CardDescription>Student enrollment by course</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ChartContainer
                config={{
                  student_count: { label: "Number of Students" },
                  course_name: { label: "Course" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courseData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="student_count"
                      nameKey="course_name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {courseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finances Tab */}
        <TabsContent value="finances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fee Collection Trends</CardTitle>
              <CardDescription>Monthly fee collection in INR</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ChartContainer
                config={{
                  amount: { label: "Amount (₹)" },
                  month: { label: "Month" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={feeData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip valueSuffix="₹" />} />
                    <Line type="monotone" dataKey="amount" stroke="#82ca9d" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Analysis</CardTitle>
              <CardDescription>Average attendance percentages by subject</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ChartContainer
                config={{
                  percentage: { label: "Attendance (%)" },
                  subject_name: { label: "Subject" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={attendanceData}>
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="subject_name" type="category" width={150} />
                    <Tooltip content={<CustomTooltip valueSuffix="%" />} />
                    <Bar dataKey="percentage" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Performance</CardTitle>
              <CardDescription>Average scores by subject</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ChartContainer
                config={{
                  average_score: { label: "Average Score" },
                  subject_name: { label: "Subject" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={performanceData}>
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="subject_name" type="category" width={150} />
                    <Tooltip content={<CustomTooltip valueSuffix="/100" />} />
                    <Bar dataKey="average_score" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, valueSuffix = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border border-border rounded-md shadow-md">
        <p className="font-semibold">{payload[0].payload.subject_name || payload[0].payload.month || payload[0].payload.course_name}</p>
        <p>{`${payload[0].name}: ${payload[0].value.toLocaleString()}${valueSuffix}`}</p>
      </div>
    );
  }
  return null;
};

export default AnalyticsPage;
