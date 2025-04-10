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
      <div className="border-b p-4 h-[60px] flex items-center justify-between">
        <LogoLink />
        <div className="flex items-center gap-2">
          <NotificationCounter />
          <UserMenu />
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 border-r hidden md:block">
          <div className="py-4 px-3">
            <Accordion type="multiple" defaultValue={["menu"]} className="w-full">
              <AccordionItem value="menu">
                <AccordionTrigger className="group">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </AccordionTrigger>
                <AccordionContent>
                  <nav className="grid gap-1">
                    <NavLink
                      to="/"
                      className={`flex items-center text-sm ${
                        isActive("/")
                          ? "font-medium text-institute-600"
                          : "text-gray-500 hover:text-gray-700"
                      } py-2 px-3 rounded-md`}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </NavLink>
                  </nav>
                </AccordionContent>
              </AccordionItem>

              {user?.role === "admin" && (
                <>
                  <AccordionItem value="students">
                    <AccordionTrigger className="group">
                      <Users className="mr-2 h-4 w-4" />
                      Students
                    </AccordionTrigger>
                    <AccordionContent>
                      <nav className="grid gap-1">
                        <NavLink
                          to="/students"
                          className={`flex items-center text-sm ${
                            isActive("/students")
                              ? "font-medium text-institute-600"
                              : "text-gray-500 hover:text-gray-700"
                          } py-2 px-3 rounded-md`}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          All Students
                        </NavLink>
                        <NavLink
                          to="/students/new"
                          className={`flex items-center text-sm ${
                            isActive("/students/new")
                              ? "font-medium text-institute-600"
                              : "text-gray-500 hover:text-gray-700"
                          } py-2 px-3 rounded-md`}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add New
                        </NavLink>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="teachers">
                    <AccordionTrigger className="group">
                      <Users className="mr-2 h-4 w-4" />
                      Teachers
                    </AccordionTrigger>
                    <AccordionContent>
                      <nav className="grid gap-1">
                        <NavLink
                          to="/teachers"
                          className={`flex items-center text-sm ${
                            isActive("/teachers")
                              ? "font-medium text-institute-600"
                              : "text-gray-500 hover:text-gray-700"
                          } py-2 px-3 rounded-md`}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          All Teachers
                        </NavLink>
                        <NavLink
                          to="/teachers/new"
                          className={`flex items-center text-sm ${
                            isActive("/teachers/new")
                              ? "font-medium text-institute-600"
                              : "text-gray-500 hover:text-gray-700"
                          } py-2 px-3 rounded-md`}
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add New
                        </NavLink>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="courses">
                    <AccordionTrigger className="group">
                      <Book className="mr-2 h-4 w-4" />
                      Courses
                    </AccordionTrigger>
                    <AccordionContent>
                      <nav className="grid gap-1">
                        <NavLink
                          to="/courses"
                          className={`flex items-center text-sm ${
                            isActive("/courses")
                              ? "font-medium text-institute-600"
                              : "text-gray-500 hover:text-gray-700"
                          } py-2 px-3 rounded-md`}
                        >
                          <Book className="mr-2 h-4 w-4" />
                          All Courses
                        </NavLink>
                        <NavLink
                          to="/courses/new"
                          className={`flex items-center text-sm ${
                            isActive("/courses/new")
                              ? "font-medium text-institute-600"
                              : "text-gray-500 hover:text-gray-700"
                          } py-2 px-3 rounded-md`}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add New
                        </NavLink>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="announcements">
                    <AccordionTrigger className="group">
                      <Megaphone className="mr-2 h-4 w-4" />
                      Announcements
                    </AccordionTrigger>
                    <AccordionContent>
                      <nav className="grid gap-1">
                        <NavLink
                          to="/announcements"
                          className={`flex items-center text-sm ${
                            isActive("/announcements")
                              ? "font-medium text-institute-600"
                              : "text-gray-500 hover:text-gray-700"
                          } py-2 px-3 rounded-md`}
                        >
                          <Megaphone className="mr-2 h-4 w-4" />
                          All Announcements
                        </NavLink>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="fees">
                    <AccordionTrigger className="group">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Fees
                    </AccordionTrigger>
                    <AccordionContent>
                      <nav className="grid gap-1">
                        <NavLink
                          to="/fees"
                          className={`flex items-center text-sm ${
                            isActive("/fees")
                              ? "font-medium text-institute-600"
                              : "text-gray-500 hover:text-gray-700"
                          } py-2 px-3 rounded-md`}
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          Fee Management
                        </NavLink>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="settings">
                    <AccordionTrigger className="group">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </AccordionTrigger>
                    <AccordionContent>
                      <nav className="grid gap-1">
                        <NavLink
                          to="/settings/roles"
                          className={`flex items-center text-sm ${
                            isActive("/settings/roles")
                              ? "font-medium text-institute-600"
                              : "text-gray-500 hover:text-gray-700"
                          } py-2 px-3 rounded-md`}
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
                  <AccordionItem value="communication">
                    <AccordionTrigger className="group">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Communication
                    </AccordionTrigger>
                    <AccordionContent>
                      <nav className="grid gap-1">
                        <NavLink
                          to="/teacher/communication"
                          className={`flex items-center text-sm ${
                            isActive("/teacher/communication")
                              ? "font-medium text-institute-600"
                              : "text-gray-500 hover:text-gray-700"
                          } py-2 px-3 rounded-md`}
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
                <AccordionItem value="timetable">
                  <AccordionTrigger className="group">
                    <Calendar className="mr-2 h-4 w-4" />
                    Timetable
                  </AccordionTrigger>
                  <AccordionContent>
                    <nav className="grid gap-1">
                      <NavLink
                        to="/timetable"
                        className={`flex items-center text-sm ${
                          isActive("/timetable")
                            ? "font-medium text-institute-600"
                            : "text-gray-500 hover:text-gray-700"
                        } py-2 px-3 rounded-md`}
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
                  <AccordionItem value="courses">
                    <AccordionTrigger className="group">
                      <Book className="mr-2 h-4 w-4" />
                      Courses
                    </AccordionTrigger>
                    <AccordionContent>
                      <nav className="grid gap-1">
                        <NavLink
                          to="/student/courses"
                          className={`flex items-center text-sm ${
                            isActive("/student/courses")
                              ? "font-medium text-institute-600"
                              : "text-gray-500 hover:text-gray-700"
                          } py-2 px-3 rounded-md`}
                        >
                          <Book className="mr-2 h-4 w-4" />
                          My Courses
                        </NavLink>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="fees">
                    <AccordionTrigger className="group">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Fees
                    </AccordionTrigger>
                    <AccordionContent>
                      <nav className="grid gap-1">
                        <NavLink
                          to="/fees"
                          className={`flex items-center text-sm ${
                            isActive("/fees")
                              ? "font-medium text-institute-600"
                              : "text-gray-500 hover:text-gray-700"
                          } py-2 px-3 rounded-md`}
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          Fee Payment
                        </NavLink>
                      </nav>
                    </AccordionContent>
                  </AccordionItem>
                </>
              )}

              <AccordionItem value="logout">
                <AccordionTrigger
                  onClick={handleLogout}
                  className="group cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </AccordionTrigger>
              </AccordionItem>
            </Accordion>
          </div>
        </aside>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="md:hidden absolute top-2 left-2"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="text-left px-4 pt-4 pb-2">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigate through the institute management system.
              </SheetDescription>
            </SheetHeader>
            <div className="py-4 px-3">
              <Accordion type="multiple" defaultValue={["menu"]} className="w-full">
                <AccordionItem value="menu">
                  <AccordionTrigger className="group">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </AccordionTrigger>
                  <AccordionContent>
                    <nav className="grid gap-1">
                      <NavLink
                        to="/"
                        className={`flex items-center text-sm ${
                          isActive("/")
                            ? "font-medium text-institute-600"
                            : "text-gray-500 hover:text-gray-700"
                        } py-2 px-3 rounded-md`}
                      >
                        <Home className="mr-2 h-4 w-4" />
                        Home
                      </NavLink>
                    </nav>
                  </AccordionContent>
                </AccordionItem>

                {user?.role === "admin" && (
                  <>
                    <AccordionItem value="students">
                      <AccordionTrigger className="group">
                        <Users className="mr-2 h-4 w-4" />
                        Students
                      </AccordionTrigger>
                      <AccordionContent>
                        <nav className="grid gap-1">
                          <NavLink
                            to="/students"
                            className={`flex items-center text-sm ${
                              isActive("/students")
                                ? "font-medium text-institute-600"
                                : "text-gray-500 hover:text-gray-700"
                            } py-2 px-3 rounded-md`}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            All Students
                          </NavLink>
                          <NavLink
                            to="/students/new"
                            className={`flex items-center text-sm ${
                              isActive("/students/new")
                                ? "font-medium text-institute-600"
                                : "text-gray-500 hover:text-gray-700"
                            } py-2 px-3 rounded-md`}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add New
                          </NavLink>
                        </nav>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="teachers">
                      <AccordionTrigger className="group">
                        <Users className="mr-2 h-4 w-4" />
                        Teachers
                      </AccordionTrigger>
                      <AccordionContent>
                        <nav className="grid gap-1">
                          <NavLink
                            to="/teachers"
                            className={`flex items-center text-sm ${
                              isActive("/teachers")
                                ? "font-medium text-institute-600"
                                : "text-gray-500 hover:text-gray-700"
                            } py-2 px-3 rounded-md`}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            All Teachers
                          </NavLink>
                          <NavLink
                            to="/teachers/new"
                            className={`flex items-center text-sm ${
                              isActive("/teachers/new")
                                ? "font-medium text-institute-600"
                                : "text-gray-500 hover:text-gray-700"
                            } py-2 px-3 rounded-md`}
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add New
                          </NavLink>
                        </nav>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="courses">
                      <AccordionTrigger className="group">
                        <Book className="mr-2 h-4 w-4" />
                        Courses
                      </AccordionTrigger>
                      <AccordionContent>
                        <nav className="grid gap-1">
                          <NavLink
                            to="/courses"
                            className={`flex items-center text-sm ${
                              isActive("/courses")
                                ? "font-medium text-institute-600"
                                : "text-gray-500 hover:text-gray-700"
                            } py-2 px-3 rounded-md`}
                          >
                            <Book className="mr-2 h-4 w-4" />
                            All Courses
                          </NavLink>
                          <NavLink
                            to="/courses/new"
                            className={`flex items-center text-sm ${
                              isActive("/courses/new")
                                ? "font-medium text-institute-600"
                                : "text-gray-500 hover:text-gray-700"
                            } py-2 px-3 rounded-md`}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add New
                          </NavLink>
                        </nav>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="announcements">
                      <AccordionTrigger className="group">
                        <Megaphone className="mr-2 h-4 w-4" />
                        Announcements
                      </AccordionTrigger>
                      <AccordionContent>
                        <nav className="grid gap-1">
                          <NavLink
                            to="/announcements"
                            className={`flex items-center text-sm ${
                              isActive("/announcements")
                                ? "font-medium text-institute-600"
                                : "text-gray-500 hover:text-gray-700"
                            } py-2 px-3 rounded-md`}
                          >
                            <Megaphone className="mr-2 h-4 w-4" />
                            All Announcements
                          </NavLink>
                        </nav>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="fees">
                      <AccordionTrigger className="group">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Fees
                      </AccordionTrigger>
                      <AccordionContent>
                        <nav className="grid gap-1">
                          <NavLink
                            to="/fees"
                            className={`flex items-center text-sm ${
                              isActive("/fees")
                                ? "font-medium text-institute-600"
                                : "text-gray-500 hover:text-gray-700"
                            } py-2 px-3 rounded-md`}
                          >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Fee Management
                          </NavLink>
                        </nav>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="settings">
                      <AccordionTrigger className="group">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </AccordionTrigger>
                      <AccordionContent>
                        <nav className="grid gap-1">
                          <NavLink
                            to="/settings/roles"
                            className={`flex items-center text-sm ${
                              isActive("/settings/roles")
                                ? "font-medium text-institute-600"
                                : "text-gray-500 hover:text-gray-700"
                            } py-2 px-3 rounded-md`}
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
                    <AccordionItem value="communication">
                      <AccordionTrigger className="group">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Communication
                      </AccordionTrigger>
                      <AccordionContent>
                        <nav className="grid gap-1">
                          <NavLink
                            to="/teacher/communication"
                            className={`flex items-center text-sm ${
                              isActive("/teacher/communication")
                                ? "font-medium text-institute-600"
                                : "text-gray-500 hover:text-gray-700"
                            } py-2 px-3 rounded-md`}
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
                  <AccordionItem value="timetable">
                    <AccordionTrigger className="group">
                      <Calendar className="mr-2 h-4 w-4" />
                      Timetable
                    </AccordionTrigger>
                    <AccordionContent>
                      <nav className="grid gap-1">
                        <NavLink
                          to="/timetable"
                          className={`flex items-center text-sm ${
                            isActive("/timetable")
                              ? "font-medium text-institute-600"
                              : "text-gray-500 hover:text-gray-700"
                          } py-2 px-3 rounded-md`}
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
                    <AccordionItem value="courses">
                      <AccordionTrigger className="group">
                        <Book className="mr-2 h-4 w-4" />
                        Courses
                      </AccordionTrigger>
                      <AccordionContent>
                        <nav className="grid gap-1">
                          <NavLink
                            to="/student/courses"
                            className={`flex items-center text-sm ${
                              isActive("/student/courses")
                                ? "font-medium text-institute-600"
                                : "text-gray-500 hover:text-gray-700"
                            } py-2 px-3 rounded-md`}
                          >
                            <Book className="mr-2 h-4 w-4" />
                            My Courses
                          </NavLink>
                        </nav>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="fees">
                      <AccordionTrigger className="group">
                        <DollarSign className="mr-2 h-4 w-4" />
                        Fees
                      </AccordionTrigger>
                      <AccordionContent>
                        <nav className="grid gap-1">
                          <NavLink
                            to="/fees"
                            className={`flex items-center text-sm ${
                              isActive("/fees")
                                ? "font-medium text-institute-600"
                                : "text-gray-500 hover:text-gray-700"
                            } py-2 px-3 rounded-md`}
                          >
                            <DollarSign className="mr-2 h-4 w-4" />
                            Fee Payment
                          </NavLink>
                        </nav>
                      </AccordionContent>
                    </AccordionItem>
                  </>
                )}

                <AccordionItem value="logout">
                  <AccordionTrigger
                    onClick={handleLogout}
                    className="group cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </AccordionTrigger>
                </AccordionItem>
              </Accordion>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex-1 overflow-auto">
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
