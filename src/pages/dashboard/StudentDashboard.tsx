
import { useState, useEffect } from "react";
import { BookOpen, Calendar, FileText, CreditCard, Clock, School } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    courses: 0,
    attendance: "0%",
    assignments: "0/0",
    feesDue: "₹0"
  });
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        if (!user) return;

        // Get student profile
        const { data: studentProfile, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (studentError) throw studentError;
        
        setStudentData(studentProfile);
        
        // Get enrolled courses
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('student_course_enrollments')
          .select(`
            id, 
            course_id,
            courses(
              id, 
              name,
              subjects(
                id,
                name
              )
            )
          `)
          .eq('student_id', studentProfile.id)
          .eq('status', 'approved');
        
        if (enrollmentsError) throw enrollmentsError;
        
        // Get course IDs and subject IDs
        const courseIds = enrollments?.map(e => e.course_id) || [];
        
        // Flatten the subjects array from all courses
        const allSubjects = enrollments?.flatMap(e => 
          e.courses?.subjects?.map(s => ({...s, course_name: e.courses.name})) || []
        ) || [];
        
        const subjectIds = allSubjects.map(s => s.id);
        
        // Get timetable entries for today's classes
        const today = new Date();
        const currentDay = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday (0) to 7 to match our day_of_week format
        
        const { data: timetableEntries, error: timetableError } = await supabase
          .from('timetable_entries')
          .select(`
            *,
            subjects(id, name),
            classes(id, name, room, capacity),
            teachers:teacher_id(
              id,
              users:user_id(full_name)
            )
          `)
          .in('subject_id', subjectIds)
          .eq('day_of_week', currentDay)
          .order('start_time', { ascending: true });
          
        if (timetableError) throw timetableError;
        
        // Get current time to determine class status
        const currentTime = today.getHours() * 100 + today.getMinutes();
        
        // Format today's classes
        const formattedClasses = timetableEntries?.map(entry => {
          // Parse start and end times (assuming format like "10:00 AM")
          const startParts = entry.start_time.match(/(\d+):(\d+)\s*(AM|PM)/i);
          const endParts = entry.end_time.match(/(\d+):(\d+)\s*(AM|PM)/i);
          
          let startHour = parseInt(startParts?.[1] || "0");
          let endHour = parseInt(endParts?.[1] || "0");
          
          if (startParts?.[3]?.toUpperCase() === "PM" && startHour < 12) startHour += 12;
          if (endParts?.[3]?.toUpperCase() === "PM" && endHour < 12) endHour += 12;
          
          const startMinutes = parseInt(startParts?.[2] || "0");
          const endMinutes = parseInt(endParts?.[2] || "0");
          
          const startTimeValue = startHour * 100 + startMinutes;
          const endTimeValue = endHour * 100 + endMinutes;
          
          let status = "upcoming";
          if (currentTime >= startTimeValue && currentTime < endTimeValue) {
            status = "current";
          } else if (currentTime >= endTimeValue) {
            status = "completed";
          }
          
          return {
            id: entry.id,
            subject: entry.subjects?.name || 'Unknown Subject',
            time: `${entry.start_time} - ${entry.end_time}`,
            room: entry.classes?.room || 'Unknown Room',
            teacher: entry.teachers?.users?.full_name || 'Unknown Teacher',
            status
          };
        }) || [];
        
        setTodayClasses(formattedClasses);
        
        // Get student fees information
        const feesDue = studentProfile.total_fees_due - studentProfile.total_fees_paid;
        
        // Calculate stats
        setStats({
          courses: courseIds.length,
          attendance: "92%", // Mock data, would need actual attendance records
          assignments: "7/8", // Mock data, would need actual assignment records
          feesDue: `₹${feesDue.toLocaleString()}`
        });
        
        // Mock data for pending assignments
        setPendingAssignments([
          { 
            id: "1", 
            title: "Database Normalization", 
            subject: "Database Systems",
            dueDate: format(new Date(Date.now() + 7 * 86400000), 'MMM d, yyyy'),
            progress: 0
          },
          { 
            id: "2", 
            title: "Responsive Design Project", 
            subject: "Web Development",
            dueDate: format(new Date(Date.now() + 10 * 86400000), 'MMM d, yyyy'),
            progress: 65
          },
        ]);
        
        // Fetch recent activities/announcements
        const { data: announcements, error: announcementsError } = await supabase
          .from('announcements')
          .select(`
            id,
            title,
            content,
            created_at,
            created_by,
            users:created_by(full_name)
          `)
          .in('target_role', ['student', 'all'])
          .is('is_active', true)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (announcementsError) throw announcementsError;
        
        // Format activities from announcements
        const formattedActivities = announcements?.map(announcement => ({
          id: announcement.id,
          title: announcement.title,
          description: announcement.content,
          time: format(new Date(announcement.created_at), 'h:mm a'),
          date: isToday(new Date(announcement.created_at)) ? 'Today' : format(new Date(announcement.created_at), 'MMM d, yyyy'),
          user: announcement.users?.full_name || "Admin"
        })) || [];
        
        setRecentActivities(formattedActivities);
        
      } catch (error) {
        console.error("Error fetching student data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user, toast]);

  // Helper function to check if a date is today
  const isToday = (someDate: Date) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear();
  };
  
  // If no activities are found, use mock data
  if (recentActivities.length === 0) {
    setRecentActivities([
      {
        id: "1",
        title: "New Assignment",
        description: "Database Normalization assignment posted by Prof. Sharma",
        time: "11:30 AM",
        date: "Today",
        user: "Teacher",
      },
      {
        id: "2",
        title: "Exam Scheduled",
        description: "Mid-term exam for Data Structures scheduled on April 20",
        time: "Yesterday",
        date: format(new Date(Date.now() - 86400000), 'MMM d, yyyy'),
        user: "Admin",
      }
    ]);
  }

  // Stats cards data
  const statCards = [
    { title: "My Courses", value: stats.courses, icon: BookOpen },
    { title: "Attendance", value: stats.attendance, icon: Calendar, trend: "up" as const, changePercentage: 2, trendText: "from last month" },
    { title: "Assignments", value: stats.assignments, icon: FileText, trendText: "Completed" },
    { title: "Fees Due", value: stats.feesDue, icon: CreditCard, trendText: studentData?.fee_status === "paid" ? "All Paid" : "Due Soon" },
  ];
  
  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.full_name || 'Student'}`}
        description="Track your courses, assignments, and schedule"
      >
        <Button onClick={() => navigate("/courses/enroll")}>Enroll in Course</Button>
      </PageHeader>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="h-28 animate-pulse">
              <CardContent className="p-6">
                <div className="h-full bg-gray-200 rounded-md"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {statCards.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              changePercentage={stat.changePercentage}
              trendText={stat.trendText}
            />
          ))}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Classes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="border rounded-md p-4 bg-gray-50 animate-pulse h-20"></div>
                ))}
              </div>
            ) : todayClasses.length > 0 ? (
              <div className="space-y-4">
                {todayClasses.map((cls) => (
                  <div 
                    key={cls.id} 
                    className={`border rounded-md p-4 transition-colors ${
                      cls.status === 'completed' 
                        ? 'bg-gray-50 border-gray-200' 
                        : cls.status === 'current' 
                        ? 'bg-institute-50 border-institute-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium">{cls.subject}</h3>
                          {cls.status === 'current' && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-institute-100 text-institute-700 rounded-full">
                              In Progress
                            </span>
                          )}
                          {cls.status === 'completed' && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                        <div className="flex items-center mt-2 text-sm text-gray-500 space-x-3">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{cls.time}</span>
                          </div>
                          <div className="flex items-center">
                            <School className="h-3 w-3 mr-1" />
                            <span>{cls.room}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Teacher: {cls.teacher}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No classes scheduled for today
              </div>
            )}
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/timetable")}>
              View Full Timetable
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="border rounded-md p-4 bg-gray-50 animate-pulse h-20"></div>
                ))}
              </div>
            ) : pendingAssignments.length > 0 ? (
              <div className="space-y-4">
                {pendingAssignments.map((assignment) => (
                  <div key={assignment.id} className="border rounded-md p-4 bg-white">
                    <h3 className="font-medium">{assignment.title}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {assignment.subject} • Due: {assignment.dueDate}
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{assignment.progress}%</span>
                      </div>
                      <Progress value={assignment.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No pending assignments
              </div>
            )}
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/assignments")}>
              View All Assignments
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <RecentActivityCard activities={recentActivities} />
    </div>
  );
};

export default StudentDashboard;
