
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PageHeader from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart as BarChartIcon, PieChart as PieChartIcon, Download, FileText, Users, BookOpen, Calendar, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TeacherReportsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  
  // Mock data for reports
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [gradeDistribution, setGradeDistribution] = useState<any[]>([]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];
  
  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      // Courses
      const mockCourses = [
        { id: "1", name: "Database Systems", code: "CS301" },
        { id: "2", name: "Web Development", code: "CS302" },
        { id: "3", name: "Data Structures", code: "CS201" },
      ];
      
      // Attendance data
      const mockAttendanceData = [
        { name: 'Week 1', present: 85, absent: 15, total: 100 },
        { name: 'Week 2', present: 80, absent: 20, total: 100 },
        { name: 'Week 3', present: 90, absent: 10, total: 100 },
        { name: 'Week 4', present: 70, absent: 30, total: 100 },
        { name: 'Week 5', present: 75, absent: 25, total: 100 },
        { name: 'Week 6', present: 85, absent: 15, total: 100 },
      ];
      
      // Performance data
      const mockPerformanceData = [
        { name: 'Assignment 1', average: 75, highest: 95, lowest: 45 },
        { name: 'Assignment 2', average: 72, highest: 98, lowest: 40 },
        { name: 'Quiz 1', average: 68, highest: 90, lowest: 35 },
        { name: 'Midterm', average: 70, highest: 95, lowest: 42 },
        { name: 'Assignment 3', average: 78, highest: 100, lowest: 50 },
      ];
      
      // Grade distribution
      const mockGradeDistribution = [
        { name: 'A', value: 15 },
        { name: 'B', value: 25 },
        { name: 'C', value: 30 },
        { name: 'D', value: 20 },
        { name: 'F', value: 10 },
      ];
      
      setCourses(mockCourses);
      setAttendanceData(mockAttendanceData);
      setPerformanceData(mockPerformanceData);
      setGradeDistribution(mockGradeDistribution);
      setSelectedCourse(mockCourses[0].id);
      setLoading(false);
    }, 1500);
  }, []);
  
  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Track student performance and generate reports"
        icon={BarChartIcon}
      >
        <Button variant="institute">
          <Download className="mr-2 h-4 w-4" />
          Export Reports
        </Button>
      </PageHeader>
      
      <div className="flex items-center mt-6 mb-6">
        <div className="w-64">
          <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name} ({course.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
        </TabsList>
        
        <TabsContent value="attendance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Attendance Report</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-institute-600 mx-auto" />
                  ) : (
                    "80.8%"
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Highest Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-institute-600 mx-auto" />
                  ) : (
                    "90%"
                  )}
                </div>
                <div className="text-center text-xs text-gray-500">Week 3</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Lowest Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-institute-600 mx-auto" />
                  ) : (
                    "70%"
                  )}
                </div>
                <div className="text-center text-xs text-gray-500">Week 4</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assessment Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={performanceData}
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
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-institute-600 mx-auto" />
                  ) : (
                    "72.6%"
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Highest Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-institute-600 mx-auto" />
                  ) : (
                    "100%"
                  )}
                </div>
                <div className="text-center text-xs text-gray-500">Assignment 3</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center">
                  {loading ? (
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
              <CardHeader>
                <CardTitle className="text-lg">Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-institute-600" />
                  </div>
                ) : (
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={gradeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {gradeDistribution.map((entry, index) => (
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
                {loading ? (
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
      </Tabs>
    </div>
  );
};

export default TeacherReportsPage;
