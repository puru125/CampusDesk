
import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "./AdminDashboard";
import TeacherDashboard from "./TeacherDashboard";
import StudentDashboard from "./StudentDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  // Show different dashboard based on user role
  switch (user?.role) {
    case "admin":
      return <AdminDashboard />;
    case "teacher":
      return <TeacherDashboard />;
    case "student":
      return <StudentDashboard />;
    default:
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Welcome to the Institute Management System</h1>
            <p className="text-gray-500">Please contact an administrator for role assignment.</p>
          </div>
        </div>
      );
  }
};

export default Dashboard;
