
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
  UserCircle,
  IdCard,
  CheckCircle,
  BookOpen,
  BarChart3
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
    title: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
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
    title: "Approvals",
    icon: CheckCircle,
    href: "/approvals",
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
  {
    title: "My Profile",
    icon: UserCircle,
    href: "/teacher/profile",
  },
  {
    title: "ID Card",
    icon: IdCard,
    href: "/teacher/id-card",
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
    title: "Assignments",
    icon: FileText,
    href: "/student/assignments",
  },
  {
    title: "Study Materials",
    icon: BookOpen,
    href: "/student/study-materials",
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
];
