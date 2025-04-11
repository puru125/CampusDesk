
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
          <Select value={selectedYear} onValueChange={(value: string) => setSelectedYear(value)}>
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
        </Tabs>
      </div>
    </div>
  );
};

export default AnalyticsPage;
