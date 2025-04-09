
import { BookOpen, Calendar, FileText, CreditCard, Clock, School } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Mock data
const stats = [
  { title: "My Courses", value: 5, icon: BookOpen },
  { title: "Attendance", value: "92%", icon: Calendar, trend: "up" as const, changePercentage: 2, trendText: "from last month" },
  { title: "Assignments", value: "7/8", icon: FileText, trendText: "Completed" },
  { title: "Fees Due", value: "₹12,500", icon: CreditCard, trendText: "Due April 15" },
];

const recentActivities = [
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
    date: "Apr 8, 2025",
    user: "Admin",
  },
  {
    id: "3",
    title: "Assignment Graded",
    description: "You received 85/100 for your Web Development assignment",
    time: "10:15 AM",
    date: "Apr 5, 2025",
    user: "Teacher",
  },
];

const todayClasses = [
  { 
    id: "1", 
    subject: "Data Structures", 
    time: "10:00 AM - 11:30 AM", 
    room: "Classroom 105",
    teacher: "Dr. Sanjay Gupta",
    status: "completed"
  },
  { 
    id: "2", 
    subject: "Web Development", 
    time: "1:00 PM - 2:30 PM", 
    room: "Lab 204",
    teacher: "Prof. Priya Sharma", 
    status: "current"
  },
  { 
    id: "3", 
    subject: "Computer Networks", 
    time: "3:00 PM - 4:30 PM", 
    room: "Classroom 302",
    teacher: "Dr. Amit Verma",
    status: "upcoming"
  },
];

const pendingAssignments = [
  { 
    id: "1", 
    title: "Database Normalization", 
    subject: "Database Systems",
    dueDate: "Apr 15, 2025",
    progress: 0
  },
  { 
    id: "2", 
    title: "Responsive Design Project", 
    subject: "Web Development",
    dueDate: "Apr 20, 2025",
    progress: 65
  },
];

const StudentDashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <PageHeader
        title="Student Dashboard"
        description="Track your courses, assignments, and schedule"
      >
        <Button onClick={() => navigate("/courses/enroll")}>Enroll in Course</Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Classes</CardTitle>
          </CardHeader>
          <CardContent>
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
