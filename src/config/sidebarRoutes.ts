
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
  Megaphone,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface Route {
  title: string;
  icon: LucideIcon;
  href: string;
}

export const adminRoutes: Route[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Students",
    icon: Users,
    href: "/students",
  },
  {
    title: "Teachers",
    icon: Users,
    href: "/teachers",
  },
  {
    title: "Courses",
    icon: Book,
    href: "/courses",
  },
  {
    title: "Timetable",
    icon: Calendar,
    href: "/timetable",
  },
  {
    title: "Fees",
    icon: CreditCard,
    href: "/fees",
  },
  {
    title: "Announcements",
    icon: Megaphone,
    href: "/announcements",
  },
  {
    title: "Student Feedback",
    icon: MessageSquare,
    href: "/admin/feedback",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export const teacherRoutes: Route[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "My Classes",
    icon: Book,
    href: "/my-classes",
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
    title: "Announcements",
    icon: Megaphone,
    href: "/announcements",
  },
  {
    title: "Communication",
    icon: Bell,
    href: "/teacher/communication",
  },
];

export const studentRoutes: Route[] = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/",
  },
  {
    title: "My Courses",
    icon: Book,
    href: "/student/courses",
  },
  {
    title: "Timetable",
    icon: Calendar,
    href: "/student/timetable",
  },
  {
    title: "Attendance",
    icon: ListChecks,
    href: "/student/attendance",
  },
  {
    title: "Submit Feedback",
    icon: MessageSquare,
    href: "/student/feedback",
  },
  {
    title: "Doubts",
    icon: HelpCircle,
    href: "/student/doubts",
  },
  {
    title: "Fees",
    icon: CreditCard,
    href: "/fees",
  },
  {
    title: "Announcements",
    icon: Megaphone,
    href: "/announcements",
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
