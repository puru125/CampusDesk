import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Home,
  Book,
  Calendar,
  Users,
  Settings,
  Bell,
  Menu,
  LogOut,
  Plus,
  LayoutDashboard,
  MessageSquare,
  DollarSign,
  ListChecks,
  UserPlus,
  LogIn,
  UserRoundCog,
  Megaphone,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import LogoLink from "@/components/LogoLink";
import UserMenu from "@/components/UserMenu";
import NotificationCounter from "@/components/notifications/NotificationCounter";

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar = ({ children }: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b bg-white dark:bg-gray-800 p-4 h-[60px] flex items-center justify-between shadow-sm">
        <LogoLink />
        <div className="flex items-center gap-2">
          <NotificationCounter />
          <UserMenu />
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 border-r bg-white dark:bg-gray-800 shadow-sm hidden md:block">
          <div className="py-6 px-4">
            <Accordion type="multiple" defaultValue={["menu"]} className="w-full">
              <AccordionItem value="menu" className="border-none">
                <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                  <div className="flex items-center text-gray-700 dark:text-gray-200">
                    <LayoutDashboard className="mr-2 h-4 w-4 text-institute-600" />
                    <span className="font-medium">Dashboard</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-0">
                  <nav className="grid gap-1">
                    <NavLink
                      to="/"
                      className={({ isActive }) => `
                        flex items-center text-sm py-2 px-3 rounded-md transition-colors
                        ${isActive ? 
                          "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                          "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }
                      `}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </NavLink>
                  </nav>
                </AccordionContent>
              </AccordionItem>

              {user?.role === "admin" && (
                <>
                  <AccordionItem value="students" className="border-none">
                    <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                      <div className="flex items-center text-gray-700 dark:text-gray-200">
                        <Users className="mr-2 h-4 w-4 text-institute-600" />
                        <span className="font-medium">Students</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-0">
                      <nav className="grid gap-1">
                        <NavLink
                          to="/students"
                          className={({ isActive }) => `
                            flex items-center text-sm py-2 px-3 rounded-md transition-colors
                            ${isActive ? 
                              "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                              "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }
                          `}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          All Students
                        </NavLink>
                        <NavLink
                          to="/students/new"
                          className={({ isActive }) => `
                            flex items-center text-sm py-2 px-3 rounded-md transition-colors
                            ${isActive ? 
                              "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                              "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }
                          `}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add New
                        </NavLink>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="teachers" className="border-none">
                    <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                      <div className="flex items-center text-gray-700 dark:text-gray-200">
                        <Users className="mr-2 h-4 w-4 text-institute-600" />
                        <span className="font-medium">Teachers</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-0">
                      <nav className="grid gap-1">
                        <NavLink
                          to="/teachers"
                          className={({ isActive }) => `
                            flex items-center text-sm py-2 px-3 rounded-md transition-colors
                            ${isActive ? 
                              "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                              "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }
                          `}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          All Teachers
                        </NavLink>
                        <NavLink
                          to="/teachers/new"
                          className={({ isActive }) => `
                            flex items-center text-sm py-2 px-3 rounded-md transition-colors
                            ${isActive ? 
                              "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                              "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }
                          `}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add New
                        </NavLink>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="courses" className="border-none">
                    <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                      <div className="flex items-center text-gray-700 dark:text-gray-200">
                        <Book className="mr-2 h-4 w-4 text-institute-600" />
                        <span className="font-medium">Courses</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-0">
                      <nav className="grid gap-1">
                        <NavLink
                          to="/courses"
                          className={({ isActive }) => `
                            flex items-center text-sm py-2 px-3 rounded-md transition-colors
                            ${isActive ? 
                              "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                              "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }
                          `}
                        >
                          <Book className="mr-2 h-4 w-4" />
                          All Courses
                        </NavLink>
                        <NavLink
                          to="/courses/new"
                          className={({ isActive }) => `
                            flex items-center text-sm py-2 px-3 rounded-md transition-colors
                            ${isActive ? 
                              "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                              "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }
                          `}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add New
                        </NavLink>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="announcements" className="border-none">
                    <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                      <div className="flex items-center text-gray-700 dark:text-gray-200">
                        <Megaphone className="mr-2 h-4 w-4 text-institute-600" />
                        <span className="font-medium">Announcements</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-0">
                      <nav className="grid gap-1">
                        <NavLink
                          to="/announcements"
                          className={({ isActive }) => `
                            flex items-center text-sm py-2 px-3 rounded-md transition-colors
                            ${isActive ? 
                              "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                              "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }
                          `}
                        >
                          <Megaphone className="mr-2 h-4 w-4" />
                          All Announcements
                        </NavLink>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="fees" className="border-none">
                    <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                      <div className="flex items-center text-gray-700 dark:text-gray-200">
                        <DollarSign className="mr-2 h-4 w-4 text-institute-600" />
                        <span className="font-medium">Fees</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-0">
                      <nav className="grid gap-1">
                        <NavLink
                          to="/fees"
                          className={({ isActive }) => `
                            flex items-center text-sm py-2 px-3 rounded-md transition-colors
                            ${isActive ? 
                              "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                              "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }
                          `}
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          Fee Management
                        </NavLink>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="settings" className="border-none">
                    <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                      <div className="flex items-center text-gray-700 dark:text-gray-200">
                        <Settings className="mr-2 h-4 w-4 text-institute-600" />
                        <span className="font-medium">Settings</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-0">
                      <nav className="grid gap-1">
                        <NavLink
                          to="/settings/roles"
                          className={({ isActive }) => `
                            flex items-center text-sm py-2 px-3 rounded-md transition-colors
                            ${isActive ? 
                              "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                              "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }
                          `}
                        >
                          <UserRoundCog className="mr-2 h-4 w-4" />
                          User Roles
                        </NavLink>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>
                </>
              )}

              {user?.role === "teacher" && (
                <>
                  <AccordionItem value="communication" className="border-none">
                    <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                      <div className="flex items-center text-gray-700 dark:text-gray-200">
                        <MessageSquare className="mr-2 h-4 w-4 text-institute-600" />
                        <span className="font-medium">Communication</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-0">
                      <nav className="grid gap-1">
                        <NavLink
                          to="/teacher/communication"
                          className={({ isActive }) => `
                            flex items-center text-sm py-2 px-3 rounded-md transition-colors
                            ${isActive ? 
                              "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                              "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }
                          `}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Communication
                        </NavLink>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>
                </>
              )}

              {(user?.role === "student" || user?.role === "teacher") && (
                <AccordionItem value="timetable" className="border-none">
                  <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <div className="flex items-center text-gray-700 dark:text-gray-200">
                      <Calendar className="mr-2 h-4 w-4 text-institute-600" />
                      <span className="font-medium">Timetable</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-0">
                    <nav className="grid gap-1">
                      <NavLink
                        to="/timetable"
                        className={({ isActive }) => `
                          flex items-center text-sm py-2 px-3 rounded-md transition-colors
                          ${isActive ? 
                            "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                            "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }
                        `}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        My Timetable
                      </NavLink>
                    </nav>
                  </AccordionContent>
                </AccordionItem>
              )}

              {user?.role === "student" && (
                <>
                  <AccordionItem value="courses" className="border-none">
                    <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                      <div className="flex items-center text-gray-700 dark:text-gray-200">
                        <Book className="mr-2 h-4 w-4 text-institute-600" />
                        <span className="font-medium">Courses</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-0">
                      <nav className="grid gap-1">
                        <NavLink
                          to="/student/courses"
                          className={({ isActive }) => `
                            flex items-center text-sm py-2 px-3 rounded-md transition-colors
                            ${isActive ? 
                              "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                              "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }
                          `}
                        >
                          <Book className="mr-2 h-4 w-4" />
                          My Courses
                        </NavLink>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="fees" className="border-none">
                    <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                      <div className="flex items-center text-gray-700 dark:text-gray-200">
                        <DollarSign className="mr-2 h-4 w-4 text-institute-600" />
                        <span className="font-medium">Fees</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-0">
                      <nav className="grid gap-1">
                        <NavLink
                          to="/fees"
                          className={({ isActive }) => `
                            flex items-center text-sm py-2 px-3 rounded-md transition-colors
                            ${isActive ? 
                              "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                              "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }
                          `}
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          Fee Payment
                        </NavLink>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>
                </>
              )}

              <AccordionItem value="logout" className="border-none">
                <div 
                  onClick={handleLogout}
                  className="flex items-center py-2 px-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors cursor-pointer group my-2"
                >
                  <LogOut className="mr-2 h-4 w-4 text-gray-500 group-hover:text-red-500" />
                  <span className="font-medium">Logout</span>
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </aside>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="md:hidden absolute top-[13px] left-2 z-10"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-white dark:bg-gray-800">
            <SheetHeader className="text-left px-4 pt-4 pb-2 border-b">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigate through the institute management system.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 px-3">
              <Accordion type="multiple" defaultValue={["menu"]} className="w-full">
                <AccordionItem value="menu" className="border-none">
                  <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                    <div className="flex items-center text-gray-700 dark:text-gray-200">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-institute-600" />
                      <span className="font-medium">Dashboard</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-0">
                    <nav className="grid gap-1">
                      <NavLink
                        to="/"
                        className={({ isActive }) => `
                          flex items-center text-sm py-2 px-3 rounded-md transition-colors
                          ${isActive ? 
                            "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                            "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }
                        `}
                        onClick={() => setOpen(false)}
                      >
                        <Home className="mr-2 h-4 w-4" />
                        Home
                      </NavLink>
                    </nav>
                  </AccordionContent>
                </AccordionItem>

                {user?.role === "admin" && (
                  <>
                    <AccordionItem value="students" className="border-none">
                      <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                        <div className="flex items-center text-gray-700 dark:text-gray-200">
                          <Users className="mr-2 h-4 w-4 text-institute-600" />
                          <span className="font-medium">Students</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-0">
                        <nav className="grid gap-1">
                          <NavLink
                            to="/students"
                            className={({ isActive }) => `
                              flex items-center text-sm py-2 px-3 rounded-md transition-colors
                              ${isActive ? 
                                "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                                "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }
                            `}
                            onClick={() => setOpen(false)}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            All Students
                          </NavLink>
                          <NavLink
                            to="/students/new"
                            className={({ isActive }) => `
                              flex items-center text-sm py-2 px-3 rounded-md transition-colors
                              ${isActive ? 
                                "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                                "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }
                            `}
                            onClick={() => setOpen(false)}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add New
                          </NavLink>
                        </nav>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="teachers" className="border-none">
                      <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                        <div className="flex items-center text-gray-700 dark:text-gray-200">
                          <Users className="mr-2 h-4 w-4 text-institute-600" />
                          <span className="font-medium">Teachers</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-0">
                        <nav className="grid gap-1">
                          <NavLink
                            to="/teachers"
                            className={({ isActive }) => `
                              flex items-center text-sm py-2 px-3 rounded-md transition-colors
                              ${isActive ? 
                                "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                                "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }
                            `}
                            onClick={() => setOpen(false)}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            All Teachers
                          </NavLink>
                          <NavLink
                            to="/teachers/new"
                            className={({ isActive }) => `
                              flex items-center text-sm py-2 px-3 rounded-md transition-colors
                              ${isActive ? 
                                "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                                "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }
                            `}
                            onClick={() => setOpen(false)}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add New
                          </NavLink>
                        </nav>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="courses" className="border-none">
                      <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                        <div className="flex items-center text-gray-700 dark:text-gray-200">
                          <Book className="mr-2 h-4 w-4 text-institute-600" />
                          <span className="font-medium">Courses</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-0">
                        <nav className="grid gap-1">
                          <NavLink
                            to="/courses"
                            className={({ isActive }) => `
                              flex items-center text-sm py-2 px-3 rounded-md transition-colors
                              ${isActive ? 
                                "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                                "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }
                            `}
                            onClick={() => setOpen(false)}
                          >
                            <Book className="mr-2 h-4 w-4" />
                            All Courses
                          </NavLink>
                          <NavLink
                            to="/courses/new"
                            className={({ isActive }) => `
                              flex items-center text-sm py-2 px-3 rounded-md transition-colors
                              ${isActive ? 
                                "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                                "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }
                            `}
                            onClick={() => setOpen(false)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add New
                          </NavLink>
                        </nav>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="announcements" className="border-none">
                      <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                        <div className="flex items-center text-gray-700 dark:text-gray-200">
                          <Megaphone className="mr-2 h-4 w-4 text-institute-600" />
                          <span className="font-medium">Announcements</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-0">
                        <nav className="grid gap-1">
                          <NavLink
                            to="/announcements"
                            className={({ isActive }) => `
                              flex items-center text-sm py-2 px-3 rounded-md transition-colors
                              ${isActive ? 
                                "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                                "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }
                            `}
                            onClick={() => setOpen(false)}
                          >
                            <Megaphone className="mr-2 h-4 w-4" />
                            All Announcements
                          </NavLink>
                        </nav>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="fees" className="border-none">
                      <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                        <div className="flex items-center text-gray-700 dark:text-gray-200">
                          <DollarSign className="mr-2 h-4 w-4 text-institute-600" />
                          <span className="font-medium">Fees</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-0">
                        <nav className="grid gap-1">
                          <NavLink
                            to="/fees"
                            className={({ isActive }) => `
                              flex items-center text-sm py-2 px-3 rounded-md transition-colors
                              ${isActive ? 
                                "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                                "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }
                            `}
                            onClick={() => setOpen(false)}
                          >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Fee Management
                          </NavLink>
                        </nav>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="settings" className="border-none">
                      <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                        <div className="flex items-center text-gray-700 dark:text-gray-200">
                          <Settings className="mr-2 h-4 w-4 text-institute-600" />
                          <span className="font-medium">Settings</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-0">
                        <nav className="grid gap-1">
                          <NavLink
                            to="/settings/roles"
                            className={({ isActive }) => `
                              flex items-center text-sm py-2 px-3 rounded-md transition-colors
                              ${isActive ? 
                                "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                                "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }
                            `}
                            onClick={() => setOpen(false)}
                          >
                            <UserRoundCog className="mr-2 h-4 w-4" />
                            User Roles
                          </NavLink>
                        </nav>
                      </AccordionContent>
                    </AccordionItem>
                  </>
                )}

                {user?.role === "teacher" && (
                  <>
                    <AccordionItem value="communication" className="border-none">
                      <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                        <div className="flex items-center text-gray-700 dark:text-gray-200">
                          <MessageSquare className="mr-2 h-4 w-4 text-institute-600" />
                          <span className="font-medium">Communication</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-0">
                        <nav className="grid gap-1">
                          <NavLink
                            to="/teacher/communication"
                            className={({ isActive }) => `
                              flex items-center text-sm py-2 px-3 rounded-md transition-colors
                              ${isActive ? 
                                "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                                "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }
                            `}
                            onClick={() => setOpen(false)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Communication
                          </NavLink>
                        </nav>
                      </AccordionContent>
                    </AccordionItem>
                  </>
                )}

                {(user?.role === "student" || user?.role === "teacher") && (
                  <AccordionItem value="timetable" className="border-none">
                    <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                      <div className="flex items-center text-gray-700 dark:text-gray-200">
                        <Calendar className="mr-2 h-4 w-4 text-institute-600" />
                        <span className="font-medium">Timetable</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-0">
                      <nav className="grid gap-1">
                        <NavLink
                          to="/timetable"
                          className={({ isActive }) => `
                            flex items-center text-sm py-2 px-3 rounded-md transition-colors
                            ${isActive ? 
                              "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                              "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }
                          `}
                          onClick={() => setOpen(false)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          My Timetable
                        </NavLink>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {user?.role === "student" && (
                  <>
                    <AccordionItem value="courses" className="border-none">
                      <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                        <div className="flex items-center text-gray-700 dark:text-gray-200">
                          <Book className="mr-2 h-4 w-4 text-institute-600" />
                          <span className="font-medium">Courses</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-0">
                        <nav className="grid gap-1">
                          <NavLink
                            to="/student/courses"
                            className={({ isActive }) => `
                              flex items-center text-sm py-2 px-3 rounded-md transition-colors
                              ${isActive ? 
                                "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                                "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }
                            `}
                            onClick={() => setOpen(false)}
                          >
                            <Book className="mr-2 h-4 w-4" />
                            My Courses
                          </NavLink>
                        </nav>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="fees" className="border-none">
                      <AccordionTrigger className="group py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                        <div className="flex items-center text-gray-700 dark:text-gray-200">
                          <DollarSign className="mr-2 h-4 w-4 text-institute-600" />
                          <span className="font-medium">Fees</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-0">
                        <nav className="grid gap-1">
                          <NavLink
                            to="/fees"
                            className={({ isActive }) => `
                              flex items-center text-sm py-2 px-3 rounded-md transition-colors
                              ${isActive ? 
                                "bg-institute-50 text-institute-600 dark:bg-institute-900/20 dark:text-institute-400 font-medium" : 
                                "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }
                            `}
                            onClick={() => setOpen(false)}
                          >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Fee Payment
                          </NavLink>
                        </nav>
                      </AccordionContent>
                    </AccordionItem>
                  </>
                )}

                <AccordionItem value="logout" className="border-none">
                  <div 
                    onClick={handleLogout}
                    className="flex items-center py-2 px-3 rounded-md text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors cursor-pointer group my-2"
                  >
                    <LogOut className="mr-2 h-4 w-4 text-gray-500 group-hover:text-red-500" />
                    <span className="font-medium">Logout</span>
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
