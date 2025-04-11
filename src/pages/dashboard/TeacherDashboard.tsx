
import { useState, useEffect } from "react";
import { School, Users, BookOpen, Calendar, CheckSquare, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [teacherData, setTeacherData] = useState<any>(null);
  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    courses: 0,
    upcomingClasses: 0
  });
  const [loading, setLoading] = useState(true);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        if (!user) return;

        // Get teacher profile
        const { data: teacherProfile, error: teacherError } = await supabase
          .from('teachers')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (teacherError) throw teacherError;
        
        setTeacherData(teacherProfile);
        
        // Get assigned subjects
        const { data: teacherSubjects, error: subjectsError } = await supabase
          .from('teacher_subjects')
          .select(`
            subject_id,
            subjects(
              id, 
              name, 
              course_id,
              courses(id, name)
            )
          `)
          .eq('teacher_id', teacherProfile.id);
        
        if (subjectsError) throw subjectsError;
        
        // Get subject IDs
        const subjectIds = teacherSubjects?.map(ts => ts.subject_id) || [];
        
        // Get course IDs
        const courseIds = [...new Set(
          teacherSubjects?.map(ts => ts.subjects?.course_id) || []
        )].filter(Boolean);
        
        // Count students assigned to this teacher
        const { count: teacherStudentsCount, error: studentCountError } = await supabase
          .from('teacher_students')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', teacherProfile.id);
          
        if (studentCountError) throw studentCountError;
        
        // Get timetable entries
        const today = new Date();
        const currentDay = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday (0) to 7 to match our day_of_week format
        
        const { data: timetableEntries, error: timetableError } = await supabase
          .from('timetable_entries')
          .select(`
            *,
            subjects(id, name),
            classes(id, name, room, capacity)
          `)
          .eq('teacher_id', teacherProfile.id)
          .gte('day_of_week', currentDay)
          .order('day_of_week', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(3);
          
        if (timetableError) throw timetableError;
        
        // Calculate stats
        setStats({
          classes: timetableEntries?.filter(te => te.day_of_week === currentDay).length || 0,
          students: typeof teacherStudentsCount === 'number' ? teacherStudentsCount : 0, // Fix type error here
          courses: courseIds.length,
          upcomingClasses: timetableEntries?.length || 0
        });
        
        // Format upcoming classes
        setUpcomingClasses(timetableEntries?.map(entry => ({
          id: entry.id,
          subject: entry.subjects?.name || 'Unknown Subject',
          time: `${entry.start_time} - ${entry.end_time}`,
          room: entry.classes?.room || 'Unknown Room',
          students: entry.classes?.capacity || 0,
          day: getDayName(entry.day_of_week),
          today: entry.day_of_week === currentDay
        })) || []);
        
        // Fetch recent activities
        const { data: activities, error: activitiesError } = await supabase
          .from('student_course_enrollments')
          .select(`
            id,
            created_at,
            students(id, user_id, users:user_id(full_name)),
            courses(id, name)
          `)
          .in('course_id', courseIds)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (activitiesError) throw activitiesError;
        
        // Format activities
        setRecentActivities(activities?.map(activity => ({
          id: activity.id,
          title: "Student Enrollment",
          description: `${activity.students?.users?.full_name || 'A student'} enrolled in ${activity.courses?.name || 'a course'}`,
          time: format(new Date(activity.created_at), 'h:mm a'),
          date: isToday(new Date(activity.created_at)) ? 'Today' : format(new Date(activity.created_at), 'MMM d, yyyy'),
          user: "Student"
        })) || []);
        
      } catch (error) {
        console.error("Error fetching teacher data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [user, toast]);

  // Helper functions
  const getDayName = (dayNumber: number) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[dayNumber - 1] || 'Unknown';
  };
  
  const isToday = (someDate: Date) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear();
  };
  
  // Default mock activities if none are found
  if (recentActivities.length === 0) {
    setRecentActivities([
      {
        id: "1",
        title: "Assignment Submitted",
        description: "Ravi Kumar submitted Database Systems assignment",
        time: "11:45 AM",
        date: "Today",
        user: "Student",
      },
      {
        id: "2",
        title: "Attendance Recorded",
        description: "Attendance recorded for Web Development class",
        time: "Yesterday",
        date: format(new Date(Date.now() - 86400000), 'MMM d, yyyy'),
        user: "You",
      }
    ]);
  }

  // Stats cards data
  const statCards = [
    { title: "My Classes", value: stats.classes, icon: School, trendText: "Today" },
    { title: "My Students", value: stats.students, icon: Users },
    { title: "Courses", value: stats.courses, icon: BookOpen },
    { title: "Upcoming Classes", value: stats.upcomingClasses, icon: Calendar, trendText: "This Week" },
  ];
  
  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.full_name || 'Teacher'}`}
        description="Manage your classes, assignments, and students"
      >
        <Button onClick={() => navigate("/assignments/new")}>Create Assignment</Button>
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
              trendText={stat.trendText}
            />
          ))}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="border rounded-md p-4 bg-gray-50 animate-pulse h-20"></div>
                  ))}
                </div>
              ) : upcomingClasses.length > 0 ? (
                <div className="space-y-4">
                  {upcomingClasses.map((cls) => (
                    <div 
                      key={cls.id} 
                      className={`border rounded-md p-4 ${cls.today ? 'bg-institute-50 border-institute-200' : 'bg-white hover:border-institute-300'} transition-colors`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{cls.subject}</h3>
                          <div className="flex items-center mt-2 text-sm text-gray-500 space-x-3">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{cls.time}</span>
                            </div>
                            <div className="flex items-center">
                              <School className="h-3 w-3 mr-1" />
                              <span>{cls.room}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              <span>{cls.students} students</span>
                            </div>
                            <div className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                              {cls.today ? 'Today' : cls.day}
                            </div>
                          </div>
                        </div>
                        {cls.today && (
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="h-8">
                              <CheckSquare className="h-4 w-4 mr-1" />
                              Attendance
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No upcoming classes scheduled
                </div>
              )}
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/timetable")}>
                View Full Timetable
              </Button>
            </CardContent>
          </Card>
        </div>
        <div>
          <RecentActivityCard activities={recentActivities} />
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
