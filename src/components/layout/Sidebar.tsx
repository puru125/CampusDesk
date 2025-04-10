import {
  LayoutDashboard,
  Calendar,
  Book,
  Users,
  Settings,
  HelpCircle,
  Home,
  Bell,
  MessageSquare,
  BarChart,
  ListChecks,
  FileText,
  CreditCard,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Route {
  title: string;
  icon: any;
  href: string;
}

const Sidebar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const adminRoutes: Route[] = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Courses",
      icon: Book,
      href: "/courses",
    },
    {
      title: "Users",
      icon: Users,
      href: "/users",
    },
    {
      title: "Timetable",
      icon: Calendar,
      href: "/timetable",
    },
    {
      title: "Attendance",
      icon: ListChecks,
      href: "/attendance",
    },
    {
      title: "Fees",
      icon: CreditCard,
      href: "/fees",
    },
    {
      title: "Reports",
      icon: FileText,
      href: "/reports",
    },
    {
      title: "Analytics",
      icon: BarChart,
      href: "/analytics",
    },
    {
      title: "Announcements",
      icon: Bell,
      href: "/announcements",
    },
    {
      title: "Feedback",
      icon: MessageSquare,
      href: "/feedback",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  const teacherRoutes: Route[] = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Timetable",
      icon: Calendar,
      href: "/timetable",
    },
    {
      title: "Attendance",
      icon: ListChecks,
      href: "/attendance",
    },
    {
      title: "Doubts",
      icon: HelpCircle,
      href: "/teacher/doubts",
    },
    {
      title: "Assignments",
      icon: FileText,
      href: "/assignments",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  const studentRoutes = [
    {
      title: "Dashboard",
      icon: Home, 
      href: "/dashboard",
    },
    {
      title: "Timetable",
      icon: Calendar,
      href: "/student/timetable",
    },
    {
      title: "Doubts",
      icon: HelpCircle, 
      href: "/student/doubts",
    },
    {
      title: "Courses",
      icon: Book,
      href: "/student/courses",
    },
    {
      title: "Attendance",
      icon: ListChecks,
      href: "/student/attendance",
    },
    {
      title: "Fees",
      icon: CreditCard,
      href: "/fees",
    },
    {
      title: "Notifications",
      icon: Bell,
      href: "/student/notifications",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  let routes: Route[] = [];
  if (user?.role === "admin") {
    routes = adminRoutes;
  } else if (user?.role === "teacher") {
    routes = teacherRoutes;
  } else if (user?.role === "student") {
    routes = studentRoutes;
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 border-r">
      <div className="flex items-center justify-center h-20">
        <span className="text-2xl font-bold">Institute</span>
      </div>

      <ScrollArea className="flex-1 space-y-4 p-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {routes.map((route) => (
              <NavLink
                key={route.title}
                to={route.href}
                className={({ isActive }) =>
                  `flex items-center p-2 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors ${
                    isActive
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-700"
                  }`
                }
              >
                <route.icon className="mr-2 h-4 w-4" />
                {route.title}
              </NavLink>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 space-y-4 border-t">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user?.full_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{user?.full_name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-2 text-sm font-medium rounded-md hover:bg-gray-200 text-gray-700 transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
