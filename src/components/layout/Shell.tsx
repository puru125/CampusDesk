
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import { 
  LogOut, 
  User
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import NotificationCounter from "@/components/notifications/NotificationCounter";

interface ShellProps {
  children: ReactNode;
  className?: string;
}

const Shell = ({ children, className }: ShellProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const navigateToNotifications = () => {
    if (user?.role === 'admin') {
      navigate("/admin/notifications");
    } else if (user?.role === 'teacher') {
      navigate("/teacher/notifications");
    } else if (user?.role === 'student') {
      navigate("/student/notifications");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar>
        {children}
      </Sidebar>
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-16 border-b bg-white dark:bg-gray-900 shadow-sm flex items-center justify-between px-6 transition-all duration-200">
          <div className="flex items-center">
            <h1 className="text-xl font-heading font-semibold text-institute-500 dark:text-institute-400 bg-clip-text text-transparent bg-gradient-to-r from-institute-500 to-institute-700 dark:from-institute-400 dark:to-institute-600">
              Institute Management System
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationCounter onClick={navigateToNotifications} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                  <Avatar className="border-2 border-primary/20 hover:border-primary/40 transition-colors duration-200">
                    <AvatarFallback className="bg-institute-100 text-institute-800 dark:bg-institute-900 dark:text-institute-300">
                      {user ? getInitials(user.full_name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg bg-white dark:bg-gray-900">
                <DropdownMenuLabel className="font-heading text-sm text-gray-500 dark:text-gray-400">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200">
                  <User className="mr-2 h-4 w-4 text-institute-500 dark:text-institute-400" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500 dark:text-red-400 rounded-md transition-colors duration-200">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main
          className={cn(
            "flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-200",
            className
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Shell;
