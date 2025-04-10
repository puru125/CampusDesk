
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { extendedSupabase, generateReportData } from "@/integrations/supabase/extendedClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const TeacherReportsPage = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<"week" | "month" | "semester">("semester");

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user) return;

      try {
        const { data, error } = await extendedSupabase
          .from("teacher_subject_assignments")
          .select("id, subject_id, subject:subjects(id, name)")
          .eq("teacher_id", user.id);

        if (error) {
          console.error("Error fetching subjects:", error);
          return;
        }

        if (data && data.length > 0) {
          setSubjects(data);
          setSelectedSubject(data[0].subject_id);
        }
      } catch (error) {
        console.error("Unexpected error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, [user]);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!user || !selectedSubject) return;

      setLoading(true);
      try {
        // In a real app, this would fetch real data from the database
        const data = await generateReportData(user.id, selectedSubject, timeframe);
        setReportData(data);
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [user, selectedSubject, timeframe]);

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
  };

  const handleTimeframeChange = (newTimeframe: "week" | "month" | "semester") => {
    setTimeframe(newTimeframe);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-institute-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">
          View performance and attendance reports for your classes
        </p>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="mr-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
              value={selectedSubject || ""}
              onChange={(e) => handleSubjectChange(e.target.value)}
            >
              {subjects.map((item) => (
                <option key={item.subject_id} value={item.subject_id}>
                  {item.subject?.name || "Unknown Subject"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timeframe
            </label>
            <div className="flex gap-2">
              <Button
                variant={timeframe === "week" ? "institute" : "outline"}
                size="sm"
                onClick={() => handleTimeframeChange("week")}
              >
                Week
              </Button>
              <Button
                variant={timeframe === "month" ? "institute" : "outline"}
                size="sm"
                onClick={() => handleTimeframeChange("month")}
              >
                Month
              </Button>
              <Button
                variant={timeframe === "semester" ? "institute" : "outline"}
                size="sm"
                onClick={() => handleTimeframeChange("semester")}
              >
                Semester
              </Button>
            </div>
          </div>
        </div>
      </div>

      {reportData ? (
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="grades">Grade Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
                <CardDescription>
                  Average attendance rate: {reportData.attendance.average}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.attendance.weeks.map((week: string, index: number) => ({
                        week,
                        attendance: reportData.attendance.trend[index]
                      }))}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="attendance"
                        name="Attendance %"
                        fill="#0088FE"
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Highest</p>
                    <p className="text-2xl font-semibold">
                      {reportData.attendance.highest}%
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Average</p>
                    <p className="text-2xl font-semibold">
                      {reportData.attendance.average}%
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Lowest</p>
                    <p className="text-2xl font-semibold">
                      {reportData.attendance.lowest}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>
                  Average performance score: {reportData.performance.average}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.performance.assessments}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="average" name="Average Score" fill="#00C49F" />
                      <Bar dataKey="highest" name="Highest Score" fill="#0088FE" />
                      <Bar dataKey="lowest" name="Lowest Score" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Highest</p>
                    <p className="text-2xl font-semibold">
                      {reportData.performance.highest}%
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Average</p>
                    <p className="text-2xl font-semibold">
                      {reportData.performance.average}%
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Lowest</p>
                    <p className="text-2xl font-semibold">
                      {reportData.performance.lowest}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="grades" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>
                  Class average: {reportData.grades.average}%, Median grade: {reportData.grades.median}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/2 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.grades.distribution}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData.grades.distribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 mt-6 md:mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Average</p>
                      <p className="text-2xl font-semibold">
                        {reportData.grades.average}%
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Median</p>
                      <p className="text-2xl font-semibold">
                        {reportData.grades.median}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Highest</p>
                      <p className="text-2xl font-semibold">
                        {reportData.grades.highestGrade}%
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">Lowest</p>
                      <p className="text-2xl font-semibold">
                        {reportData.grades.lowestGrade}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Grade Distribution</h3>
                    <div className="space-y-2">
                      {reportData.grades.distribution.map((item: any) => (
                        <div key={item.name} className="flex items-center">
                          <div
                            className="w-4 h-4 mr-2 rounded-full"
                            style={{
                              backgroundColor: COLORS[
                                reportData.grades.distribution.findIndex(
                                  (d: any) => d.name === item.name
                                ) % COLORS.length
                              ],
                            }}
                          ></div>
                          <span className="text-sm">
                            Grade {item.name}: {item.value} students
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-6">
            <p>No data available for the selected subject and timeframe.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherReportsPage;
