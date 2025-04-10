
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { extendedSupabase } from "@/integrations/supabase/extendedClient";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Calendar, Clock, CreditCard, Bell, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import StudentNotificationsList from "@/components/student/StudentNotificationsList";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [hasUnpaidFees, setHasUnpaidFees] = useState(false);
  const [studentProfile, setStudentProfile] = useState(null);
  
  // Placeholder for demo - would be replaced with actual data fetch
  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
    
    // Check for unpaid fees
    if (user) {
      checkFeeStatus();
      fetchStudentProfile();
    }
  }, [user]);
  
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
    } catch (error) {
      console.error("Error checking fee status:", error);
    }
  };
  
  const fetchStudentProfile = async () => {
    try {
      const { data, error } = await extendedSupabase
        .from('students_view')
        .select('*')
        .eq('user_id', user?.id)
        .single();
        
      if (error) throw error;
      
      setStudentProfile(data);
    } catch (error) {
      console.error("Error fetching student profile:", error);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main content - 2/3 width on medium screens and up */}
        <div className="md:w-2/3 space-y-6">
          {/* Welcome and quick stats */}
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
                      <div className="text-2xl font-bold">3</div>
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
                      <div className="text-2xl font-bold">2</div>
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
                      <div className="text-2xl font-bold">92%</div>
                      <p className="text-xs text-gray-500">Overall attendance</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={goToAttendancePage}>View</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Upcoming exams section */}
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
              ) : (
                <div className="space-y-2">
                  <div className="p-3 border rounded-md bg-white">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">Data Structures & Algorithms</h4>
                        <p className="text-sm text-gray-500">Mid-semester exam</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          <span className="text-sm">Oct 15, 2023</span>
                        </div>
                        <Badge variant="outline" className="mt-1">10:00 AM - 12:00 PM</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md bg-white">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">Operating Systems</h4>
                        <p className="text-sm text-gray-500">Quiz 2</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          <span className="text-sm">Oct 18, 2023</span>
                        </div>
                        <Badge variant="outline" className="mt-1">2:00 PM - 3:00 PM</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full" onClick={goToExamsPage}>
                  View All Exams
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent activity section */}
          <RecentActivityCard />
        </div>
        
        {/* Sidebar content - 1/3 width on medium screens and up */}
        <div className="md:w-1/3">
          {/* Student profile card */}
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
                  <span className="font-medium">Bachelor of Computer Science</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Batch</span>
                  <span className="font-medium">2022-2026</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Contact</span>
                  <span className="font-medium">{studentProfile?.contact_number || 'N/A'}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Notifications card */}
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
