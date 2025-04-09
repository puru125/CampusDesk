
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar,
  AlertTriangle,
  CreditCard
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivityCard from "@/components/dashboard/RecentActivityCard";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data
const stats = [
  { title: "Total Students", value: 1256, icon: GraduationCap, trend: "up" as const, changePercentage: 12, trendText: "from last month" },
  { title: "Total Teachers", value: 84, icon: Users, trend: "up" as const, changePercentage: 4, trendText: "from last month" },
  { title: "Active Courses", value: 32, icon: BookOpen, trend: "neutral" as const, trendText: "No change" },
  { title: "Pending Enrollments", value: 47, icon: AlertTriangle, trend: "down" as const, changePercentage: 6, trendText: "from last week" },
  { title: "Upcoming Exams", value: 18, icon: Calendar, trend: "up" as const, changePercentage: 8, trendText: "from last month" },
  { title: "Fee Collection", value: "₹4.2L", icon: CreditCard, trend: "up" as const, changePercentage: 15, trendText: "from last month" },
];

const recentActivities = [
  {
    id: "1",
    title: "New Student Enrolled",
    description: "Anjali Patel enrolled in BTech Computer Science course",
    time: "10:30 AM",
    date: "Today",
    user: "Admin",
  },
  {
    id: "2",
    title: "Course Updated",
    description: "Course syllabus for MTech AI has been updated",
    time: "Yesterday",
    date: "Apr 8, 2025",
    user: "Dr. Sharma",
  },
  {
    id: "3",
    title: "Exam Results Published",
    description: "End semester results for BCA 3rd year published",
    time: "1:15 PM",
    date: "Apr 7, 2025",
    user: "Registrar",
  },
  {
    id: "4",
    title: "Fee Structure Updated",
    description: "New fee structure for 2025-26 academic year has been updated",
    time: "11:00 AM", 
    date: "Apr 5, 2025",
    user: "Finance Dept",
  },
];

const pendingTasks = [
  { id: "1", title: "Review student applications", count: 23 },
  { id: "2", title: "Approve leave requests", count: 8 },
  { id: "3", title: "Finalize exam schedule", count: 1 },
  { id: "4", title: "Review budget proposal", count: 2 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Welcome to the Institute Management System"
      >
        <Button onClick={() => navigate("/students/new")}>Add Student</Button>
        <Button onClick={() => navigate("/teachers/new")}>Add Teacher</Button>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivityCard activities={recentActivities} />
        </div>
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Pending Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-institute-400 mr-3"></div>
                      <span className="text-sm font-medium">{task.title}</span>
                    </div>
                    <div className="bg-institute-100 text-institute-600 text-xs font-semibold px-2 py-1 rounded-full">
                      {task.count}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Tasks
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
