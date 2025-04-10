
import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  UserPlus,
  UserCog,
  CheckCircle,
  Megaphone,
  Building
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
    { path: "/classrooms", icon: Building, label: "Classrooms" },
    { path: "/timetable", icon: Calendar, label: "Timetable" },
    { path: "/fees", icon: CreditCard, label: "Fees" },
    { path: "/exams", icon: FileText, label: "Exams" },
    { path: "/announcements", icon: Megaphone, label: "Announcements" },
    { path: "/settings", icon: CheckCircle, label: "Approvals" },
  ];

  const teacherLinks = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/my-classes", icon: School, label: "My Classes" },
    { path: "/attendance", icon: FileText, label: "Attendance" },
    { path: "/assignments", icon: BookOpen, label: "Assignments" },
    { path: "/students", icon: GraduationCap, label: "Students" },
    { path: "/timetable", icon: Calendar, label: "Timetable" },
    { path: "/exams", icon: FileText, label: "Exams" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const studentLinks = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/courses", icon: BookOpen, label: "My Courses" },
    { path: "/timetable", icon: Calendar, label: "Timetable" },
    { path: "/assignments", icon: FileText, label: "Assignments" },
    { path: "/fees", icon: CreditCard, label: "Fees" },
    { path: "/exams", icon: FileText, label: "Exams" },
    { path: "/notifications", icon: Bell, label: "Notifications" },
    { path: "/settings", icon: Settings, label: "Settings" },
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

  const handleProfileClick = () => {
    if (user.role === "admin") {
      navigate("/admin/profile");
    } else {
      navigate("/settings");
    }
  };

  const userInitials = user.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("")
    : "U";

  return (
    <aside
      className={cn(
        "bg-white border-r transition-all duration-300 flex flex-col h-full",
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
      <nav className="flex-1 py-4 overflow-y-auto">
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
      <div className="p-4 border-t">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full flex items-center justify-start p-2 rounded-md",
                  collapsed && "justify-center"
                )}
                onClick={handleProfileClick}
              >
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback className="bg-institute-600 text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="text-left flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{user.full_name}</p>
                    <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
                  </div>
                )}
                {!collapsed && (
                  <UserCog className="h-4 w-4 text-gray-500 ml-2" />
                )}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                <p>{user.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
};

export default Sidebar;
