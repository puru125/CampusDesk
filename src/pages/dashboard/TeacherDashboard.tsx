
import { School, Users, BookOpen, Calendar, CheckSquare, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data
const stats = [
  { title: "My Classes", value: 8, icon: School },
  { title: "My Students", value: 126, icon: Users },
  { title: "Courses", value: 4, icon: BookOpen },
  { title: "Upcoming Classes", value: 3, icon: Calendar, trendText: "Today" },
];

const recentActivities = [
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
    date: "Apr 8, 2025",
    user: "You",
  },
  {
    id: "3",
    title: "Doubt Asked",
    description: "Neha Singh asked a question about Java inheritance",
    time: "10:30 AM",
    date: "Apr 7, 2025",
    user: "Student",
  },
];

const upcomingClasses = [
  { 
    id: "1", 
    subject: "Database Systems", 
    time: "10:00 AM - 11:30 AM", 
    room: "Lab 204",
    students: 34
  },
  { 
    id: "2", 
    subject: "Data Structures", 
    time: "1:00 PM - 2:30 PM", 
    room: "Classroom 105",
    students: 42
  },
  { 
    id: "3", 
    subject: "Computer Networks", 
    time: "3:00 PM - 4:30 PM", 
    room: "Lab 302",
    students: 38
  },
];

const TeacherDashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <PageHeader
        title="Teacher Dashboard"
        description="Manage your classes, assignments, and students"
      >
        <Button onClick={() => navigate("/assignments/new")}>Create Assignment</Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trendText={stat.trendText}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingClasses.map((cls) => (
                  <div key={cls.id} className="border rounded-md p-4 bg-white hover:border-institute-300 transition-colors">
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
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="h-8">
                          <CheckSquare className="h-4 w-4 mr-1" />
                          Attendance
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
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
