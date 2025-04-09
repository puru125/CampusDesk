
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home,
  Users,
  BookOpen,
  Calendar,
  FileText,
  CreditCard,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  School,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  if (!user) {
    return null;
  }

  const adminLinks = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/students", icon: GraduationCap, label: "Students" },
    { path: "/teachers", icon: Users, label: "Teachers" },
    { path: "/courses", icon: BookOpen, label: "Courses" },
    { path: "/timetable", icon: Calendar, label: "Timetable" },
    { path: "/fees", icon: CreditCard, label: "Fees" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const teacherLinks = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/my-classes", icon: School, label: "My Classes" },
    { path: "/attendance", icon: FileText, label: "Attendance" },
    { path: "/assignments", icon: BookOpen, label: "Assignments" },
    { path: "/students", icon: GraduationCap, label: "Students" },
    { path: "/timetable", icon: Calendar, label: "Timetable" },
  ];

  const studentLinks = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/courses", icon: BookOpen, label: "My Courses" },
    { path: "/timetable", icon: Calendar, label: "Timetable" },
    { path: "/assignments", icon: FileText, label: "Assignments" },
    { path: "/fees", icon: CreditCard, label: "Fees" },
    { path: "/notifications", icon: Bell, label: "Notifications" },
  ];

  let links;
  switch (user.role) {
    case "admin":
      links = adminLinks;
      break;
    case "teacher":
      links = teacherLinks;
      break;
    case "student":
      links = studentLinks;
      break;
    default:
      links = [];
  }

  return (
    <aside
      className={cn(
        "bg-white border-r transition-all duration-300 flex flex-col",
        collapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      <div className="h-16 border-b flex items-center px-4 justify-between">
        {!collapsed && (
          <div className="flex items-center">
            <School className="text-institute-600 h-6 w-6 mr-2" />
            <span className="font-heading font-bold text-lg text-institute-800">
              IMS
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>
      <nav className="flex-1 py-4">
        <TooltipProvider delayDuration={0}>
          <ul className="space-y-1 px-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              
              return (
                <li key={link.path}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={link.path}
                        className={cn(
                          "flex items-center h-10 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                          isActive
                            ? "bg-institute-50 text-institute-600"
                            : "text-gray-600 hover:bg-gray-100",
                          collapsed && "justify-center"
                        )}
                      >
                        <Icon className={cn("h-5 w-5", !collapsed && "mr-2")} />
                        {!collapsed && <span>{link.label}</span>}
                      </NavLink>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">
                        <p>{link.label}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </TooltipProvider>
      </nav>
    </aside>
  );
};

export default Sidebar;
