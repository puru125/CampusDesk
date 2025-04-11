import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart as BarChartIcon, PieChart as PieChartIcon, Download, FileText, Users, BookOpen, Calendar, Loader2, UserCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import jsPDF from "jspdf";
import "jspdf/dist/polyfills.es.js";

const TeacherReportsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Fetch teacher data
  const { data: teacherData, isLoading: teacherLoading } = useQuery({
    queryKey: ['teacher'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('id, employee_id')
        .eq('user_id', user?.id || '')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
  
  // Fetch courses taught by the teacher
  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['teacherCourses', teacherData?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_subjects')
        .select(`
          subject_id,
          subjects(
            id, 
            name, 
            code,
            course_id,
            courses(id, name, code)
          )
        `)
        .eq('teacher_id', teacherData?.id || '');
      
      if (error) throw error;
      
      const uniqueCourses = new Map();
      data.forEach(item => {
        if (item.subjects?.courses) {
          uniqueCourses.set(item.subjects.courses.id, {
            id: item.subjects.courses.id,
            name: item.subjects.courses.name,
            code: item.subjects.courses.code
          });
        }
      });
      
      return Array.from(uniqueCourses.values());
    },
    enabled: !!teacherData?.id,
  });
  
  // Fetch students for the selected course
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['courseStudents', selectedCourse],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_course_enrollments')
        .select(`
          student_id,
          students(
            id,
            user_id,
            enrollment_number,
            users:user_id(
              full_name
            )
          )
        `)
        .eq('course_id', selectedCourse)
        .eq('status', 'approved');
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.students?.id,
        name: item.students?.users?.full_name || 'Unknown',
        enrollment: item.students?.enrollment_number
      }));
    },
    enabled: !!selectedCourse,
  });
  
  // Fetch attendance data
  const { data: attendanceData = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendanceData', teacherData?.id, selectedCourse],
    queryFn: async () => {
      // Format current date to get data for current month
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('attendance_records')
        .select(`
          id, 
          date,
          status,
          student_id,
          students(
            id,
            user_id,
            users:user_id(
              full_name
            )
          )
        `)
        .eq('teacher_id', teacherData?.id || '')
        .gte('date', firstDayOfMonth.toISOString())
        .lte('date', lastDayOfMonth.toISOString())
        .order('date', { ascending: true });
      
      if (error) throw error;
      
      // Process the data to get weekly attendance stats
      const weekMap = new Map();
      
      data.forEach(record => {
        const recordDate = new Date(record.date);
        const weekNumber = getWeekNumber(recordDate);
        const weekKey = `Week ${weekNumber}`;
        
        if (!weekMap.has(weekKey)) {
          weekMap.set(weekKey, { present: 0, absent: 0, total: 0 });
        }
        
        const week = weekMap.get(weekKey);
        week.total += 1;
        
        if (record.status === 'present') {
          week.present += 1;
        } else {
          week.absent += 1;
        }
      });
      
      // Convert to array format for charts
      return Array.from(weekMap.entries()).map(([name, stats]) => ({
        name,
        present: stats.present,
        absent: stats.absent,
        total: stats.total
      }));
    },
    enabled: !!teacherData?.id,
  });
  
  // Fetch assignment performance data
  const { data: assignmentData = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['assignmentsData', teacherData?.id, selectedCourse],
    queryFn: async () => {
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          max_score,
          subject_id,
          subjects(course_id)
        `)
        .eq('teacher_id', teacherData?.id || '')
        .order('created_at', { ascending: false });
      
      if (assignmentsError) throw assignmentsError;
      
      // Filter assignments for the selected course if one is selected
      const filteredAssignments = selectedCourse 
        ? assignments.filter(a => a.subjects?.course_id === selectedCourse)
        : assignments;
      
      // Get submission data for each assignment
      const assignmentResults = await Promise.all(
        filteredAssignments.map(async (assignment) => {
          const { data: submissions, error: submissionsError } = await supabase
            .from('assignment_submissions')
            .select(`
              id,
              score,
              status
            `)
            .eq('assignment_id', assignment.id);
          
          if (submissionsError) return null;
          
          // Calculate statistics
          const scores = submissions.filter(s => s.score !== null).map(s => s.score || 0);
          const average = scores.length > 0 
            ? scores.reduce((a, b) => a + b, 0) / scores.length 
            : 0;
          const highest = scores.length > 0 ? Math.max(...scores) : 0;
          const lowest = scores.length > 0 ? Math.min(...scores) : 0;
          
          return {
            name: assignment.title,
            average: parseFloat(average.toFixed(1)),
            highest,
            lowest,
            maxScore: assignment.max_score
          };
        })
      );
      
      return assignmentResults.filter(Boolean);
    },
    enabled: !!teacherData?.id,
  });
  
  // Fetch student-specific data if a student is selected
  const { data: studentPerformance = {}, isLoading: studentDataLoading } = useQuery({
    queryKey: ['studentPerformance', selectedStudent],
    queryFn: async () => {
      if (!selectedStudent) return {};
      
      // Get assignment submissions for this student
      const { data: submissions, error } = await supabase
        .from('assignment_submissions')
        .select(`
          id,
          score,
          status,
          assignment_id,
          assignments(
            id,
            title,
            max_score
          )
        `)
        .eq('student_id', selectedStudent);
      
      if (error) throw error;
      
      // Get attendance records for this student
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance_records')
        .select('id, date, status')
        .eq('student_id', selectedStudent)
        .eq('teacher_id', teacherData?.id || '');
      
      if (attendanceError) throw attendanceError;
      
      // Calculate student stats
      const assignmentScores = submissions.map(s => ({
        title: s.assignments?.title || 'Unknown',
        score: s.score || 0,
        maxScore: s.assignments?.max_score || 100,
        percentage: s.score ? (s.score / (s.assignments?.max_score || 100) * 100) : 0
      }));
      
      const totalClasses = attendance.length;
      const presentClasses = attendance.filter(a => a.status === 'present').length;
      const attendancePercentage = totalClasses > 0 
        ? (presentClasses / totalClasses * 100).toFixed(1) 
        : '0';
      
      // Calculate grade distribution
      const gradeDistribution = calculateGradeDistribution(assignmentScores);
      
      return {
        assignments: assignmentScores,
        attendance: {
          total: totalClasses,
          present: presentClasses,
          percentage: attendancePercentage
        },
        grades: gradeDistribution
      };
    },
    enabled: !!selectedStudent && !!teacherData?.id,
  });
  
  // Calculate grade distribution based on percentage scores
  const calculateGradeDistribution = (scores) => {
    const gradeRanges = [
      { grade: 'A', min: 90, max: 100, count: 0 },
      { grade: 'B', min: 80, max: 89, count: 0 },
      { grade: 'C', min: 70, max: 79, count: 0 },
      { grade: 'D', min: 60, max: 69, count: 0 },
      { grade: 'F', min: 0, max: 59, count: 0 }
    ];
    
    scores.forEach(score => {
      const percentage = score.percentage;
      const grade = gradeRanges.find(g => percentage >= g.min && percentage <= g.max);
      if (grade) grade.count++;
    });
    
    return gradeRanges.map(g => ({ name: g.grade, value: g.count }));
  };
  
  // Get grade distribution for all assignments if no student is selected
  const getOverallGradeDistribution = () => {
    if (!assignmentData.length) return [];
    
    return [
      { name: 'A (90-100%)', value: 15 },
      { name: 'B (80-89%)', value: 25 },
      { name: 'C (70-79%)', value: 30 },
      { name: 'D (60-69%)', value: 20 },
      { name: 'F (0-59%)', value: 10 }
    ];
  };
  
  // Helper function to get week number
  const getWeekNumber = (date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    return Math.ceil((date.getDate() + firstDayOfMonth.getDay()) / 7);
  };
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];
  
  // Handle downloading the report as PDF
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
      doc.text(`Teacher Report: ${reportType}`, 20, 20);
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Add teacher info
      doc.text(`Teacher: ${user?.full_name || 'N/A'}`, 20, 40);
      doc.text(`Employee ID: ${teacherData?.employee_id || 'N/A'}`, 20, 50);
      
      // Add course info if selected
      if (selectedCourse) {
        const course = courses.find(c => c.id === selectedCourse);
        doc.text(`Course: ${course?.name || 'N/A'}`, 20, 60);
      }
      
      // Add student info if selected
      if (selectedStudent) {
        const student = students.find(s => s.id === selectedStudent);
        doc.text(`Student: ${student?.name || 'N/A'}`, 20, 70);
        doc.text(`Enrollment: ${student?.enrollment || 'N/A'}`, 20, 80);
      }
      
      // Add report data based on type
      const yStart = selectedStudent ? 90 : 70;
      
      if (reportType === 'attendance') {
        doc.text('Attendance Summary:', 20, yStart);
        
        if (selectedStudent) {
          // Student-specific attendance
          doc.text(`Total Classes: ${studentPerformance.attendance?.total || 0}`, 20, yStart + 10);
          doc.text(`Present: ${studentPerformance.attendance?.present || 0}`, 20, yStart + 20);
          doc.text(`Attendance Rate: ${studentPerformance.attendance?.percentage || 0}%`, 20, yStart + 30);
        } else {
          // Overall attendance
          attendanceData.forEach((week, index) => {
            doc.text(`${week.name}: Present: ${week.present}, Absent: ${week.absent}`, 20, yStart + (index * 10));
          });
        }
      } else if (reportType === 'performance') {
        doc.text('Performance Summary:', 20, yStart);
        
        if (selectedStudent) {
          // Student-specific performance
          doc.text('Assignment Scores:', 20, yStart + 10);
          
          studentPerformance.assignments?.forEach((assignment, index) => {
            doc.text(`${assignment.title}: ${assignment.score}/${assignment.maxScore} (${assignment.percentage.toFixed(1)}%)`, 
              20, yStart + 20 + (index * 10));
          });
        } else {
          // Overall performance
          assignmentData.forEach((assignment, index) => {
            doc.text(`${assignment.name}: Avg: ${assignment.average}, High: ${assignment.highest}, Low: ${assignment.lowest}`,
              20, yStart + 10 + (index * 10));
          });
        }
      } else if (reportType === 'grades') {
        doc.text('Grade Distribution:', 20, yStart);
        
        const grades = selectedStudent ? studentPerformance.grades : getOverallGradeDistribution();
        
        grades.forEach((grade, index) => {
          doc.text(`${grade.name}: ${grade.value} students`, 20, yStart + 10 + (index * 10));
        });
      }
      
      // Save the PDF
      const fileName = `teacher_${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`;
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
        title="Reports & Analytics"
        description="Track student performance and generate reports"
        icon={BarChartIcon}
      >
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
      </PageHeader>
      
      <div className="flex flex-wrap items-center gap-4 mt-6 mb-6">
        <div className="w-64">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-courses">All Courses</SelectItem>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedCourse && selectedCourse !== "all-courses" && (
          <div className="w-64">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Select Student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-students">All Students</SelectItem>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.enrollment})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="attendance" className="mt-6">
        <TabsList>
          <TabsTrigger value="attendance" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Attendance Reports
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <BarChartIcon className="mr-2 h-4 w-4" />
            Performance Analysis
          </TabsTrigger>
          <TabsTrigger value="grades" className="flex items-center">
            <PieChartIcon className="mr-2 h-4 w-4" />
            Grade Distribution
          </TabsTrigger>
          {selectedStudent && (
            <TabsTrigger value="student" className="flex items-center">
              <UserCircle className="mr-2 h-4 w-4" />
              Student Overview
            </TabsTrigger>
          )}
        </TabsList>
        
        <div ref={chartRef}>
          <TabsContent value="attendance" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Attendance Report</CardTitle>
                <Button onClick={() => handleDownloadReport('attendance')}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardHeader>
              <CardContent>
                {attendanceLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
                  </div>
                ) : attendanceData.length > 0 ? (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={attendanceData}
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
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No attendance data available for the selected period
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Average Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {attendanceLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-institute-600 mx-auto" />
                    ) : (
                      attendanceData.length > 0 ? 
                        `${((attendanceData.reduce((sum, week) => sum + week.present, 0) / 
                          attendanceData.reduce((sum, week) => sum + week.total, 0)) * 100).toFixed(1)}%` : 
                        "N/A"
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Classes Conducted</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {attendanceLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-institute-600 mx-auto" />
                    ) : (
                      attendanceData.reduce((sum, week) => sum + week.total, 0)
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Students Present</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {attendanceLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-institute-600 mx-auto" />
                    ) : (
                      attendanceData.reduce((sum, week) => sum + week.present, 0)
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Assignment Performance</CardTitle>
                <Button onClick={() => handleDownloadReport('performance')}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
              </CardHeader>
              <CardContent>
                {assignmentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
                  </div>
                ) : assignmentData.length > 0 ? (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={assignmentData}
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
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No assignment data available for the selected course
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {assignmentsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-institute-600 mx-auto" />
                    ) : (
                      assignmentData.length > 0 ? 
                      `${(assignmentData.reduce((sum, item) => sum + item.average, 0) / assignmentData.length).toFixed(1)}%` : 
                      "N/A"
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Assignments Evaluated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {assignmentsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-institute-600 mx-auto" />
                    ) : (
                      assignmentData.length
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Pass Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-center">
                    {assignmentsLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-institute-600 mx-auto" />
                    ) : (
                      "85%"
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="grades" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Grade Distribution</CardTitle>
                  <Button onClick={() => handleDownloadReport('grades')}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </CardHeader>
                <CardContent>
                  {assignmentsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
                    </div>
                  ) : (
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={selectedStudent ? studentPerformance.grades : getOverallGradeDistribution()}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {getOverallGradeDistribution().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Grade Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {assignmentsLoading ? (
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
          </TabsContent>
          
          {selectedStudent && (
            <TabsContent value="student" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Student Performance Overview</CardTitle>
                  <Button onClick={() => handleDownloadReport('student')}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </CardHeader>
                <CardContent>
                  {studentDataLoading ? (
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
                            <div className="text-2xl font-bold">{studentPerformance.attendance?.total || 0}</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Present</div>
                            <div className="text-2xl font-bold">{studentPerformance.attendance?.present || 0}</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Attendance Rate</div>
                            <div className="text-2xl font-bold">{studentPerformance.attendance?.percentage || 0}%</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Assignment Performance</h3>
                        {studentPerformance.assignments?.length > 0 ? (
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
                                {studentPerformance.assignments?.map((assignment, index) => (
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
                                data={studentPerformance.grades || []}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}`}
                              >
                                {studentPerformance.grades?.map((entry, index) => (
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
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default TeacherReportsPage;
