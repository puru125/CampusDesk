import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart as BarChartIcon, 
  PieChart as PieChartIcon, 
  Download, 
  Users, 
  BookOpen, 
  CreditCard, 
  Calendar,
  TrendingUp
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import jsPDF from "jspdf";

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const chartRef = useRef<HTMLDivElement>(null);

  // Fetch enrollment data by month
  const { data: enrollmentData = [], isLoading: enrollmentLoading } = useQuery({
    queryKey: ['enrollmentData', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_course_enrollments')
        .select('created_at, status')
        .gte('created_at', `${selectedYear}-01-01`)
        .lte('created_at', `${selectedYear}-12-31`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Process data by month
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        name: months[i],
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0
      }));
      
      data.forEach(item => {
        const date = new Date(item.created_at);
        const month = date.getMonth();
        
        monthlyData[month].total += 1;
        monthlyData[month][item.status] += 1;
      });
      
      return monthlyData;
    }
  });

  // Fetch course popularity data
  const { data: courseData = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['coursePopularity', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_course_enrollments')
        .select(`
          course_id,
          courses(id, name, code),
          status
        `)
        .eq('status', 'approved')
        .gte('created_at', `${selectedYear}-01-01`)
        .lte('created_at', `${selectedYear}-12-31`);
      
      if (error) throw error;
      
      // Count enrollments by course
      const courseCount = {};
      
      data.forEach(item => {
        const courseName = item.courses?.name || 'Unknown';
        if (!courseCount[courseName]) {
          courseCount[courseName] = { name: courseName, students: 0 };
        }
        courseCount[courseName].students += 1;
      });
      
      return Object.values(courseCount).sort((a: any, b: any) => b.students - a.students);
    }
  });

  // Fetch fee collection data
  const { data: feeData = [], isLoading: feeLoading } = useQuery({
    queryKey: ['feeCollection', selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('amount, payment_date, status')
        .eq('status', 'completed')
        .gte('payment_date', `${selectedYear}-01-01`)
        .lte('payment_date', `${selectedYear}-12-31`)
        .order('payment_date', { ascending: true });
      
      if (error) throw error;
      
      // Process data by month
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        name: months[i],
        amount: 0
      }));
      
      data.forEach(item => {
        const date = new Date(item.payment_date);
        const month = date.getMonth();
        
        monthlyData[month].amount += parseFloat(item.amount);
      });
      
      return monthlyData;
    }
  });

  // Mock data for attendance trends (to be replaced with real data)
  const attendanceData = [
    { name: 'Week 1', attendance: 95 },
    { name: 'Week 2', attendance: 88 },
    { name: 'Week 3', attendance: 92 },
    { name: 'Week 4', attendance: 85 },
    { name: 'Week 5', attendance: 90 },
    { name: 'Week 6', attendance: 88 },
    { name: 'Week 7', attendance: 82 },
    { name: 'Week 8', attendance: 89 },
  ];

  // Mock data for performance comparison (to be replaced with real data)
  const performanceData = [
    { name: 'Assignments', avgScore: 72, completionRate: 85 },
    { name: 'Quizzes', avgScore: 68, completionRate: 92 },
    { name: 'Mid-Term', avgScore: 65, completionRate: 98 },
    { name: 'Projects', avgScore: 78, completionRate: 70 },
    { name: 'Final Exam', avgScore: 70, completionRate: 95 },
  ];

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];

  // Handle downloading reports as PDFs
  const handleDownloadReport = (reportType) => {
    if (!chartRef.current) return;
    
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title
      doc.setFontSize(18);
      doc.text(`Admin Analytics Report: ${reportType}`, 20, 20);
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      doc.text(`Year: ${selectedYear}`, 20, 40);
      
      // Add report data based on type
      const yStart = 50;
      
      if (reportType === 'enrollment') {
        doc.text('Monthly Enrollment Data:', 20, yStart);
        
        enrollmentData.forEach((month, index) => {
          if (month.total > 0) {
            doc.text(`${month.name}: Total: ${month.total}, Approved: ${month.approved}, Pending: ${month.pending}, Rejected: ${month.rejected}`, 
              20, yStart + 10 + (index * 10));
          }
        });
        
        // Add total
        const totalEnrollments = enrollmentData.reduce((sum, month) => sum + month.total, 0);
        const approvedEnrollments = enrollmentData.reduce((sum, month) => sum + month.approved, 0);
        
        doc.text(`Total Enrollments: ${totalEnrollments}`, 20, yStart + 130);
        doc.text(`Approved Enrollments: ${approvedEnrollments}`, 20, yStart + 140);
        doc.text(`Approval Rate: ${totalEnrollments > 0 ? ((approvedEnrollments / totalEnrollments) * 100).toFixed(1) : 0}%`, 20, yStart + 150);
        
      } else if (reportType === 'course') {
        doc.text('Course Popularity:', 20, yStart);
        
        courseData.forEach((course: any, index) => {
          doc.text(`${course.name}: ${course.students} students`, 20, yStart + 10 + (index * 10));
        });
        
        // Add total
        const totalEnrollments = courseData.reduce((sum: number, course: any) => sum + course.students, 0);
        doc.text(`Total Course Enrollments: ${totalEnrollments}`, 20, yStart + 120);
        
      } else if (reportType === 'fee') {
        doc.text('Fee Collection by Month:', 20, yStart);
        
        feeData.forEach((month, index) => {
          if (month.amount > 0) {
            doc.text(`${month.name}: ₹${month.amount.toLocaleString('en-IN')}`, 20, yStart + 10 + (index * 10));
          }
        });
        
        // Add total
        const totalCollection = feeData.reduce((sum, month) => sum + month.amount, 0);
        doc.text(`Total Collection: ₹${totalCollection.toLocaleString('en-IN')}`, 20, yStart + 130);
        
      } else if (reportType === 'attendance') {
        doc.text('Attendance Trends:', 20, yStart);
        
        attendanceData.forEach((week, index) => {
          doc.text(`${week.name}: ${week.attendance}%`, 20, yStart + 10 + (index * 10));
        });
        
        // Add average
        const avgAttendance = attendanceData.reduce((sum, week) => sum + week.attendance, 0) / attendanceData.length;
        doc.text(`Average Attendance: ${avgAttendance.toFixed(1)}%`, 20, yStart + 100);
        
      } else if (reportType === 'performance') {
        doc.text('Academic Performance:', 20, yStart);
        
        performanceData.forEach((item, index) => {
          doc.text(`${item.name}: Average Score: ${item.avgScore}%, Completion Rate: ${item.completionRate}%`, 
            20, yStart + 10 + (index * 10));
        });
        
        // Add averages
        const avgScore = performanceData.reduce((sum, item) => sum + item.avgScore, 0) / performanceData.length;
        const avgCompletion = performanceData.reduce((sum, item) => sum + item.completionRate, 0) / performanceData.length;
        
        doc.text(`Overall Average Score: ${avgScore.toFixed(1)}%`, 20, yStart + 70);
        doc.text(`Overall Completion Rate: ${avgCompletion.toFixed(1)}%`, 20, yStart + 80);
      }
      
      // Save the PDF
      const fileName = `admin_${reportType}_report_${selectedYear}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "Report Downloaded",
        description: `${reportType} report has been downloaded successfully.`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the report PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <PageHeader
        title="Analytics Dashboard"
        description="Comprehensive analytics and reporting"
        icon={BarChartIcon}
      >
        <Button variant="outline" onClick={() => navigate("/")}>
          Back to Dashboard
        </Button>
      </PageHeader>
      
      <div className="flex items-center justify-between mt-6 mb-6">
        <div className="w-64">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025].map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div ref={chartRef}>
        <Tabs defaultValue="enrollment" className="mt-6">
          <TabsList>
            <TabsTrigger value="enrollment" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Enrollment Trends
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Course Popularity
            </TabsTrigger>
            <TabsTrigger value="fees" className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              Fee Collection
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Attendance Trends
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Academic Performance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="enrollment" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Monthly Enrollment Trends</CardTitle>
                <Button onClick={() => handleDownloadReport('enrollment')}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardHeader>
              <CardContent>
                {enrollmentLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={enrollmentData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="approved" name="Approved" fill="#0088FE" />
                        <Bar dataKey="pending" name="Pending" fill="#FFBB28" />
                        <Bar dataKey="rejected" name="Rejected" fill="#FF8042" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Enrollments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {enrollmentLoading ? (
                      <div className="w-6 h-6 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
                    ) : (
                      enrollmentData.reduce((sum, month) => sum + month.total, 0)
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Approval Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {enrollmentLoading ? (
                      <div className="w-6 h-6 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
                    ) : (
                      (() => {
                        const total = enrollmentData.reduce((sum, month) => sum + month.total, 0);
                        const approved = enrollmentData.reduce((sum, month) => sum + month.approved, 0);
                        return total > 0 ? `${((approved / total) * 100).toFixed(1)}%` : "0%";
                      })()
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Monthly Average</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {enrollmentLoading ? (
                      <div className="w-6 h-6 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
                    ) : (
                      (() => {
                        const total = enrollmentData.reduce((sum, month) => sum + month.total, 0);
                        return (total / 12).toFixed(1);
                      })()
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="courses" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Course Popularity</CardTitle>
                <Button onClick={() => handleDownloadReport('course')}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardHeader>
              <CardContent>
                {coursesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin"></div>
                  </div>
                ) : courseData.length > 0 ? (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={courseData.slice(0, 10)}
                        layout="vertical"
                        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={80} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="students" name="Students Enrolled" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No course enrollment data available for selected period
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {coursesLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <CardTitle className="text-sm">Loading...</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="w-6 h-6 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : courseData.slice(0, 4).map((course: any, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-sm">{course.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-center">{course.students}</div>
                    <div className="text-center text-xs text-gray-500">students enrolled</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="fees" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Fee Collection - {selectedYear}</CardTitle>
                <Button onClick={() => handleDownloadReport('fee')}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardHeader>
              <CardContent>
                {feeLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={feeData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']} />
                        <Legend />
                        <Line type="monotone" dataKey="amount" name="Fee Collection" stroke="#0088FE" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Collection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {feeLoading ? (
                      <div className="w-6 h-6 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
                    ) : (
                      `₹${feeData.reduce((sum, month) => sum + month.amount, 0).toLocaleString('en-IN')}`
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Highest Collection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {feeLoading ? (
                      <div className="w-6 h-6 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
                    ) : (
                      (() => {
                        const maxMonth = feeData.reduce((max, month) => 
                          month.amount > max.amount ? month : max, { amount: 0, name: 'None' });
                        return `₹${maxMonth.amount.toLocaleString('en-IN')}`;
                      })()
                    )}
                  </div>
                  <div className="text-center text-xs text-gray-500">
                    {feeLoading ? "" : 
                      (() => {
                        const maxMonth = feeData.reduce((max, month) => 
                          month.amount > max.amount ? month : max, { amount: 0, name: 'None' });
                        return maxMonth.name;
                      })()
                    }
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Monthly Average</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {feeLoading ? (
                      <div className="w-6 h-6 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto"></div>
                    ) : (
                      `₹${(feeData.reduce((sum, month) => sum + month.amount, 0) / 12).toLocaleString('en-IN', { 
                        maximumFractionDigits: 0 
                      })}`
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="attendance" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Attendance Trends</CardTitle>
                <Button onClick={() => handleDownloadReport('attendance')}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={attendanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="attendance" 
                        name="Attendance Rate" 
                        stroke="#0088FE" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Average Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {`${(attendanceData.reduce((sum, week) => sum + week.attendance, 0) / attendanceData.length).toFixed(1)}%`}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Highest Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {`${Math.max(...attendanceData.map(week => week.attendance))}%`}
                  </div>
                  <div className="text-center text-xs text-gray-500">
                    {(() => {
                      const maxWeek = attendanceData.reduce((max, week) => 
                        week.attendance > max.attendance ? week : max, { attendance: 0, name: 'None' });
                      return maxWeek.name;
                    })()}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Lowest Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {`${Math.min(...attendanceData.map(week => week.attendance))}%`}
                  </div>
                  <div className="text-center text-xs text-gray-500">
                    {(() => {
                      const minWeek = attendanceData.reduce((min, week) => 
                        week.attendance < min.attendance ? week : min, { attendance: 100, name: 'None' });
                      return minWeek.name;
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Academic Performance Analysis</CardTitle>
                <Button onClick={() => handleDownloadReport('performance')}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={performanceData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, '']} />
                      <Legend />
                      <Bar dataKey="avgScore" name="Average Score" fill="#0088FE" />
                      <Bar dataKey="completionRate" name="Completion Rate" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Overall Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {`${(performanceData.reduce((sum, item) => sum + item.avgScore, 0) / performanceData.length).toFixed(1)}%`}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Overall Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {`${(performanceData.reduce((sum, item) => sum + item.completionRate, 0) / performanceData.length).toFixed(1)}%`}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Highest Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {`${Math.max(...performanceData.map(item => item.avgScore))}%`}
                  </div>
                  <div className="text-center text-xs text-gray-500">
                    {(() => {
                      const maxItem = performanceData.reduce((max, item) => 
                        item.avgScore > max.avgScore ? item : max, { avgScore: 0, name: 'None' });
                      return maxItem.name;
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsPage;
