import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calendar, Clock, CreditCard, Bell, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import StudentNotificationsList from "@/components/student/StudentNotificationsList";
import { useToast } from "@/hooks/use-toast";

interface UpcomingExam {
  id: string;
  title: string;
  subject_name: string;
  exam_type: string;
  exam_date: string;
  start_time: string;
  end_time: string;
}

interface EnrolledCourse {
  id: string;
  course_name: string;
  course_code: string;
  status: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  date: string;
  user: string;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [hasUnpaidFees, setHasUnpaidFees] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState<{ overall_percentage: number | null }>({
    overall_percentage: null
  });
  
  useEffect(() => {
    if (user) {
      Promise.all([
        fetchStudentProfile(),
        fetchUpcomingExams(),
        checkFeeStatus(),
        fetchAttendanceStats()
      ]).then((results) => {
        if (results[0]) { // If student profile was retrieved successfully
          fetchEnrolledCourses(results[0].id); // Pass the student ID
        }
        setLoading(false);
      }).catch(error => {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      });
    }
  }, [user]);
  
  const fetchStudentProfile = async () => {
    try {
      const { data, error } = await extendedSupabase
        .from('students_view')
        .select('*')
        .eq('user_id', user?.id)
        .single();
        
      if (error) throw error;
      
      setStudentProfile(data);
      
      if (data && data.enrollment_status === 'pending') {
        const { data: enrollments, error: enrollmentsError } = await extendedSupabase
          .from('student_course_enrollments')
          .select('status')
          .eq('student_id', data.id)
          .eq('status', 'approved')
          .limit(1);
          
        if (!enrollmentsError && enrollments && enrollments.length > 0) {
          await extendedSupabase
            .from('students')
            .update({ enrollment_status: 'active' })
            .eq('id', data.id);
            
          setStudentProfile({
            ...data,
            enrollment_status: 'active'
          });
        }
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching student profile:", error);
      toast({
        title: "Error",
        description: "Could not retrieve student profile information",
        variant: "destructive",
      });
      return null;
    }
  };
  
  const fetchUpcomingExams = async () => {
    try {
      const { data, error } = await extendedSupabase
        .from('exams')
        .select(`
          id,
          title,
          exam_date,
          start_time,
          end_time,
          subjects:subject_id (name)
        `)
        .gte('exam_date', new Date().toISOString().split('T')[0])
        .order('exam_date', { ascending: true })
        .limit(5);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedExams: UpcomingExam[] = data.map(exam => ({
          id: exam.id,
          title: exam.title,
          subject_name: exam.subjects?.name || 'Unknown Subject',
          exam_type: exam.title.includes('Mid') ? 'Mid-semester' : 'Final',
          exam_date: exam.exam_date,
          start_time: exam.start_time,
          end_time: exam.end_time
        }));
        
        setUpcomingExams(formattedExams);
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching upcoming exams:", error);
      return [];
    }
  };
  
  const fetchEnrolledCourses = async (studentId: string) => {
    try {
      if (!studentId) {
        console.error("Student ID is missing for fetchEnrolledCourses");
        return [];
      }
      
      console.log("Fetching enrolled courses for student ID:", studentId);
      
      const { data, error } = await extendedSupabase
        .from('student_course_enrollments')
        .select(`
          id,
          status,
          courses:course_id (
            id,
            name,
            code
          )
        `)
        .eq('student_id', studentId);
        
      if (error) {
        throw error;
      }
      
      console.log("Enrolled courses data:", data);
      
      if (data && data.length > 0) {
        const formattedCourses: EnrolledCourse[] = data.map(enrollment => ({
          id: enrollment.id,
          course_name: enrollment.courses?.name || 'Unknown Course',
          course_code: enrollment.courses?.code || 'N/A',
          status: enrollment.status
        }));
        
        console.log("Formatted courses:", formattedCourses);
        setEnrolledCourses(formattedCourses);
        return formattedCourses;
      } else {
        console.log("No enrolled courses found");
        setEnrolledCourses([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      toast({
        title: "Error",
        description: "Could not retrieve enrolled courses information",
        variant: "destructive",
      });
      setEnrolledCourses([]);
      return [];
    }
  };
  
  const fetchAttendanceStats = async () => {
    try {
      const { data: studentData, error: studentError } = await extendedSupabase
        .from('students')
        .select('id')
        .eq('user_id', user?.id)
        .single();
        
      if (studentError) throw studentError;
      
      const { data: attendanceData, error: attendanceError } = await extendedSupabase
        .from('attendance_records')
        .select('status')
        .eq('student_id', studentData.id);
        
      if (attendanceError) throw attendanceError;
      
      if (attendanceData && attendanceData.length > 0) {
        const totalRecords = attendanceData.length;
        const presentRecords = attendanceData.filter(
          record => record.status.toLowerCase() === 'present'
        ).length;
        
        const attendancePercentage = (presentRecords / totalRecords) * 100;
        
        setAttendanceStats({
          overall_percentage: parseFloat(attendancePercentage.toFixed(1))
        });
        
        return {
          overall_percentage: parseFloat(attendancePercentage.toFixed(1))
        };
      } else {
        setAttendanceStats({
          overall_percentage: null
        });
        
        return {
          overall_percentage: null
        };
      }
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
      setAttendanceStats({
        overall_percentage: null
      });
      return {
        overall_percentage: null
      };
    }
  };
  
  const checkFeeStatus = async () => {
    try {
      const { data: student, error } = await extendedSupabase
        .from('students')
        .select('fee_status, total_fees_due, total_fees_paid')
        .eq('user_id', user?.id)
        .single();
        
      if (error) throw error;
      
      if (student) {
        setHasUnpaidFees(
          student.fee_status === 'pending' || 
          student.fee_status === 'partial' ||
          (student.total_fees_due > student.total_fees_paid)
        );
      }
      
      return student;
    } catch (error) {
      console.error("Error checking fee status:", error);
      toast({
        title: "Error",
        description: "Could not retrieve fee status information",
        variant: "destructive",
      });
      return null;
    }
  };
  
  const goToFeesPage = () => {
    navigate('/fees');
  };
  
  const goToCoursesPage = () => {
    navigate('/student/courses');
  };
  
  const goToExamsPage = () => {
    navigate('/student/exams');
  };
  
  const goToAttendancePage = () => {
    navigate('/student/attendance');
  };

  const getRecentActivities = () => {
    return [];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">
                  Welcome back, {user?.full_name?.split(' ')[0]}
                </CardTitle>
                <CardDescription>
                  Here's an overview of your academic status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasUnpaidFees && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Fee Payment Pending</p>
                      <p className="text-xs text-yellow-700">
                        You have pending fee payments. Please settle your dues to avoid late fees.
                      </p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={goToFeesPage}>
                        <CreditCard className="h-4 w-4 mr-1" />
                        View & Pay Fees
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-2 py-1">
                      {studentProfile?.enrollment_number || 'Loading...'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      Status: <span className="font-medium capitalize text-gray-700">
                        {studentProfile?.enrollment_status || 'Active'}
                      </span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      Enrolled: <span className="font-medium text-gray-700">
                        {studentProfile?.enrollment_date 
                          ? new Date(studentProfile.enrollment_date).toLocaleDateString() 
                          : 'N/A'}
                      </span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          
            <Card className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">My Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-blue-500" />
                    <div className="ml-3">
                      <div className="text-2xl font-bold">{enrolledCourses.length || 0}</div>
                      <p className="text-xs text-gray-500">Enrolled courses</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={goToCoursesPage}>View</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-purple-500" />
                    <div className="ml-3">
                      <div className="text-2xl font-bold">{upcomingExams.length}</div>
                      <p className="text-xs text-gray-500">Scheduled exams</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={goToExamsPage}>View</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-green-500" />
                    <div className="ml-3">
                      <div className="text-2xl font-bold">
                        {attendanceStats.overall_percentage !== null 
                          ? `${attendanceStats.overall_percentage}%` 
                          : 'N/A'}
                      </div>
                      <p className="text-xs text-gray-500">Overall attendance</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={goToAttendancePage}>View</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Exams</CardTitle>
              <CardDescription>Your scheduled examinations</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-3 border rounded-md animate-pulse bg-gray-50 h-20"></div>
                  ))}
                </div>
              ) : upcomingExams.length > 0 ? (
                <div className="space-y-2">
                  {upcomingExams.map((exam) => (
                    <div key={exam.id} className="p-3 border rounded-md bg-white">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">{exam.subject_name}</h4>
                          <p className="text-sm text-gray-500">{exam.title}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="text-sm">
                              {new Date(exam.exam_date).toLocaleDateString()}
                            </span>
                          </div>
                          <Badge variant="outline" className="mt-1">
                            {exam.start_time} - {exam.end_time}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No upcoming exams scheduled</p>
                </div>
              )}
              
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full" onClick={goToExamsPage}>
                  View All Exams
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {activities.length > 0 ? (
            <RecentActivityCard activities={activities} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-gray-500">No recent activities</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="md:w-1/3">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-4">
                <Avatar className="h-24 w-24 mb-2">
                  <AvatarFallback className="text-lg bg-blue-100 text-blue-800">
                    {user?.full_name?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-medium text-lg">{user?.full_name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Enrollment No.</span>
                  <span className="font-medium">{studentProfile?.enrollment_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Program</span>
                  <span className="font-medium">
                    {enrolledCourses.length > 0 ? 
                      enrolledCourses[0].course_name : 
                      'No program enrolled'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Batch</span>
                  <span className="font-medium">
                    {studentProfile?.enrollment_date ? 
                      `${new Date(studentProfile.enrollment_date).getFullYear()}-${new Date(studentProfile.enrollment_date).getFullYear() + 4}` : 
                      'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Contact</span>
                  <span className="font-medium">{studentProfile?.contact_number || 'N/A'}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/student/profile')}>
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs"
                  onClick={() => navigate('/student/notifications')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <StudentNotificationsList limit={3} showViewAll={false} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
