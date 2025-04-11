
import {
  Home,
  LayoutDashboard,
  Settings,
  Users,
  Book,
  Calendar,
  BarChart,
  ListChecks,
  Bell,
  FileText,
  Presentation,
  LucideIcon,
  DollarSign,
  UserPlus,
  File,
  Archive,
} from "lucide-react";

export interface Route {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarRoutes {
  [key: string]: Route[];
}

export const sidebarRoutes: SidebarRoutes = {
  admin: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Manage Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Manage Students",
      href: "/admin/students",
      icon: UserPlus,
    },
    {
      title: "Manage Teachers",
      href: "/admin/teachers",
      icon: Users,
    },
    {
      title: "Manage Courses",
      href: "/admin/courses",
      icon: Book,
    },
    {
      title: "Manage Payments",
      href: "/admin/payments",
      icon: DollarSign,
    },
    {
      title: "Manage Exams",
      href: "/admin/exams",
      icon: FileText,
    },
    {
      title: "Manage Study Materials",
      href: "/admin/study-materials",
      icon: File,
    },
    {
      title: "Manage Classes",
      href: "/admin/classes",
      icon: Archive,
    },
    {
      title: "Announcements",
      href: "/admin/announcements",
      icon: Bell,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ],
  teacher: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "My Classes",
      href: "/teacher/classes",
      icon: Book,
    },
    {
      title: "Attendance",
      href: "/teacher/attendance",
      icon: ListChecks,
    },
    {
      title: "Assignments",
      href: "/teacher/assignments",
      icon: FileText,
    },
    {
      title: "Study Materials",
      href: "/teacher/study-materials",
      icon: File,
    },
    {
      title: "Exams",
      href: "/teacher/exams",
      icon: Presentation,
    },
    {
      title: "Settings",
      href: "/teacher/settings",
      icon: Settings,
    },
  ],
  student: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Courses",
      href: "/student/courses",
      icon: Book,
    },
    {
      title: "Attendance",
      href: "/student/attendance",
      icon: ListChecks,
    },
    {
      title: "Assignments",
      href: "/student/assignments",
      icon: FileText,
    },
    {
      title: "Exams",
      href: "/student/exams",
      icon: Presentation,
    },
    {
      title: "Fees",
      href: "/fees",
      icon: DollarSign,
    },
    {
      title: "Study Planner",
      href: "/student/study-planner",
      icon: Calendar,
    },
    {
      title: "Academic Progress",
      href: "/student/academic-progress",
      icon: BarChart,
    },
    {
      title: "Settings",
      href: "/student/settings",
      icon: Settings,
    },
  ],
};

// Add export aliases for backward compatibility with existing code
export const adminRoutes = sidebarRoutes.admin;
export const teacherRoutes = sidebarRoutes.teacher;
export const studentRoutes = sidebarRoutes.student;
