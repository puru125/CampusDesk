
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  Book, 
  Calendar, 
  Users, 
  Settings, 
  Bell, 
  LogOut,
  ListChecks,
  DollarSign,
  IdCard
} from "lucide-react";

interface SimpleSidebarProps {
  children: React.ReactNode;
}

const SimpleSidebar = ({ children }: SimpleSidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getNavItems = () => {
    const commonItems = [
      { name: "Dashboard", path: "/", icon: <Home className="w-5 h-5" /> },
      { name: "Timetable", path: "/timetable", icon: <Calendar className="w-5 h-5" /> },
    ];

    if (user?.role === "admin") {
      return [
        ...commonItems,
        { name: "Students", path: "/students", icon: <Users className="w-5 h-5" /> },
        { name: "Teachers", path: "/teachers", icon: <Users className="w-5 h-5" /> },
        { name: "Courses", path: "/courses", icon: <Book className="w-5 h-5" /> },
        { name: "Fees", path: "/fees", icon: <DollarSign className="w-5 h-5" /> },
        { name: "Notifications", path: "/notifications", icon: <Bell className="w-5 h-5" /> },
        { name: "Settings", path: "/settings", icon: <Settings className="w-5 h-5" /> },
      ];
    } else if (user?.role === "teacher") {
      return [
        ...commonItems,
        { name: "Doubts", path: "/teacher/doubts", icon: <Users className="w-5 h-5" /> },
        { name: "Courses", path: "/teacher/classes", icon: <Book className="w-5 h-5" /> },
        { name: "Attendance", path: "/teacher/attendance", icon: <ListChecks className="w-5 h-5" /> },
        { name: "Notifications", path: "/teacher/notifications", icon: <Bell className="w-5 h-5" /> },
        { name: "ID Card", path: "/teacher/id-card", icon: <IdCard className="w-5 h-5" /> },
        { name: "Settings", path: "/teacher/profile", icon: <Settings className="w-5 h-5" /> },
      ];
    } else if (user?.role === "student") {
      return [
        ...commonItems,
        { name: "Doubts", path: "/student/doubts", icon: <Users className="w-5 h-5" /> },
        { name: "Courses", path: "/student/courses", icon: <Book className="w-5 h-5" /> },
        { name: "Attendance", path: "/student/attendance", icon: <ListChecks className="w-5 h-5" /> },
        { name: "Fees", path: "/fees", icon: <DollarSign className="w-5 h-5" /> },
        { name: "Notifications", path: "/student/notifications", icon: <Bell className="w-5 h-5" /> },
        { name: "Settings", path: "/student/profile", icon: <Settings className="w-5 h-5" /> },
      ];
    }

    return commonItems;
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Institute</h1>
        </div>
        <nav className="mt-4 px-4">
          {getNavItems().map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-md transition-colors mb-1
                ${isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        {user && (
          <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                {user.full_name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-medium">{user.full_name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <h1 className="text-xl font-bold text-blue-600">Institute Management System</h1>
          <div className="ml-auto flex items-center gap-2">
            {user && (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                {user.full_name?.substring(0, 2).toUpperCase() || "U"}
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SimpleSidebar;
